const db = require('./db.js');
const moment = require('moment-timezone');

const create_planilla_insert_usuario = async (idUsuario) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    let data;
    let idPlanillaUsuario;

    const [planilla] = await connection.query(`SELECT * FROM planilla WHERE estado = 1`);

    if (planilla.length > 0) {
      const [usuario] = await connection.query(`SELECT salario FROM usuario WHERE estado != 0 AND idPuesto NOT IN (1, 2) AND id = ?`, [idUsuario]);

      if (usuario.length > 0) {
        const salario_base = parseFloat(usuario[0].salario) / 2;

        const [planillaUsuario] = await connection.query(`
          SELECT pu.* 
          FROM planillaUsuario pu
          INNER JOIN planilla pl ON pl.id = pu.idPlanilla
          WHERE pl.estado = 1 AND pu.idUsuario = ?`, [idUsuario]);
  
        if (planillaUsuario.length > 0) {
          idPlanillaUsuario = planillaUsuario[0].id;
      
          data = await connection.query(`
            UPDATE planillausuario SET salarioBase = ? WHERE id = ?`, [salario_base, idPlanillaUsuario]);
        } else {
          const idPlanilla = planilla[0].id;
      
          data = await connection.query(`
            INSERT INTO planillausuario (idPlanilla, idUsuario, salarioBase) 
            VALUES (?, ?, ?)`, [idPlanilla, idUsuario, salario_base]);
  
          idPlanillaUsuario = data[0].insertId;
        }
      }
  
      await connection.commit();

      if (data) {
        create_fijos_planilla_usuario(idPlanillaUsuario)
      } else {
        console.log('Error en INSERT')
      }
    }

  } catch (error) {
    await connection.rollback();
    console.log(error)
  } finally {
    connection.release();
  }
};

/*const create_planilla_update_planilla = async (oldPlanilla, idNewPlanilla) => {
  try {
    const [newPlanilla] = await db.query(`
      SELECT pl.*, u.salario AS usuarioSalario
      FROM planilla pl 
      INNER JOIN usuario u ON u.id = pl.idUsuario AND u.idPuesto != 1 AND u.idPuesto != 2 AND u.estado != 0
      WHERE pl.id = ${idNewPlanilla}`);

    if (oldPlanilla.estado == 1 && newPlanilla[0].estado == 2) {
      const fecha_inicio = moment(newPlanilla[0].fechaFinal).tz('America/Costa_Rica').add(1, 'days').format('YYYY-MM-DD');
      const fecha_final = moment(newPlanilla[0].fechaFinal).tz('America/Costa_Rica').add(16, 'days').format('YYYY-MM-DD');
      const salario_base = parseFloat(newPlanilla[0].usuarioSalario) / 2;

      const data = await db.query(`
        INSERT INTO planilla (idUsuario, fechaInicio, fechaFinal, salarioBase) 
        VALUES (?, ?, ?, ?)`, [newPlanilla[0].idUsuario, fecha_inicio, fecha_final, salario_base]);
  
      if (data) {
        create_pagos_insert_planilla(data[0].insertId)
      } else {
        console.log('Error en INSERT')
      }
    }
  } catch (error) {
    console.log(error)
  }
};*/

const create_fijos_planilla_usuario = async (idPlanillaUsuario) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [planillaResult] = await connection.query('SELECT * FROM planillausuario WHERE id = ?', [idPlanillaUsuario]);
    const planilla = planillaResult[0];
    const salario_base = parseFloat(planilla.salarioBase);

    const [usuarioResult] = await connection.query('SELECT idTipoContrato FROM usuario WHERE id = ?', [planilla.idUsuario]);
    const idTipoContrato = usuarioResult[0].idTipoContrato;

    const [aumentosFijos] = await connection.query(`
      SELECT id, idTipoAnotacion, idTipoContrato, fijo, valor
      FROM anotacion 
      WHERE fijo > 0 AND idTipoContrato = ? AND estado != 0 AND idTipoAnotacion = 1`, [idTipoContrato]);

    const [deduccionesFijos] = await connection.query(`
      SELECT id, idTipoAnotacion, idTipoContrato, fijo, valor 
      FROM anotacion 
      WHERE fijo > 0 AND idTipoContrato = ? AND estado != 0 AND idTipoAnotacion = 2`, [idTipoContrato]);

    const [otrosPagosFijos] = await connection.query(`
      SELECT id, idTipoAnotacion, idTipoContrato, fijo, valor 
      FROM anotacion 
      WHERE fijo > 0 AND idTipoContrato = ? AND estado != 0 AND idTipoAnotacion = 3`, [idTipoContrato]);


    const [anotacionesExistentes] = await connection.query(`
      SELECT idAnotacion 
      FROM planillausuarioanotacion 
      WHERE idPlanillaUsuario = ?`, [idPlanillaUsuario]);

    const mapExistentes = new Map(anotacionesExistentes.map(f => [f.idAnotacion, f.monto]));

    const aumentoQueries = aumentosFijos.map((anotacion) => {
      let monto = anotacion.valor * (anotacion.fijo === 1 || anotacion.fijo === 3? salario_base / 100 : 1);
      let descripcion = `Aumento fijo ${anotacion.fijo === 1 || anotacion.fijo === 3? 'porcentual' : 'absoluto'}`;
      
      return upsertPlanillaAnotacionFijos(mapExistentes, connection, idPlanillaUsuario, anotacion, descripcion, monto);
    });

    await Promise.all(aumentoQueries);

    const [aumentoResult] = await connection.query(`
      SELECT SUM(pua.monto) AS total 
      FROM planillausuarioanotacion pua 
      INNER JOIN anotacion a ON a.id = pua.idAnotacion 
      WHERE a.idTipoContrato = ? AND pua.idPlanillaUsuario = ? AND a.idTipoAnotacion = 1`, [idTipoContrato, idPlanillaUsuario]);
    const aumentos_total = parseFloat(aumentoResult[0].total) || 0;


    let otrosPagos_total = 0;
    let deducciones_total = 0;

    let salario_bruto = 0;
    let total_deducciones = 0;
    let sub_total = 0;
    let salario_neto = 0;
    let total_deposito = 0;

    //Modificaciones de servicios profesionales
    if (idTipoContrato == 2) {
      salario_bruto = aumentos_total;
      
      //Otros pagos
      const otroPagoQueries = otrosPagosFijos.map((anotacion) => {
        let monto = anotacion.valor * (anotacion.fijo === 1 || anotacion.fijo === 3? salario_bruto / 100 : 1);
        let descripcion = `Otro pago fijo ${anotacion.fijo === 1 || anotacion.fijo === 3? 'porcentual' : 'absoluto'}`;
      
        return upsertPlanillaAnotacionFijos(mapExistentes, connection, idPlanillaUsuario, anotacion, descripcion, monto);
      });
  
      await Promise.all(otroPagoQueries);

      const [otroPagoResult] = await connection.query(`
        SELECT SUM(pua.monto) AS total 
        FROM planillausuarioanotacion pua 
        INNER JOIN anotacion a ON a.id = pua.idAnotacion 
        WHERE a.idTipoContrato = ? AND pua.idPlanillaUsuario = ? AND a.idTipoAnotacion = 3`, [idTipoContrato, idPlanillaUsuario]);
      otrosPagos_total = parseFloat(otroPagoResult[0].total) || 0;

      sub_total = salario_bruto + otrosPagos_total;
      

      //Deducción
      const deduccionQueries = deduccionesFijos.map((anotacion) => {
        let monto = anotacion.valor * (anotacion.fijo === 1 || anotacion.fijo === 3? sub_total / 100 : 1);
        let descripcion = `Deducción fija ${anotacion.fijo === 1 || anotacion.fijo === 3? 'porcentual' : 'absoluto'}`;
      
        return upsertPlanillaAnotacionFijos(mapExistentes, connection, idPlanillaUsuario, anotacion, descripcion, monto);
      });
  
      await Promise.all(deduccionQueries);

      const [deduccionResult] = await connection.query(`
        SELECT SUM(pua.monto) AS total 
        FROM planillausuarioanotacion pua 
        INNER JOIN anotacion a ON a.id = pua.idAnotacion 
        WHERE a.idTipoContrato = ? AND pua.idPlanillaUsuario = ? AND a.idTipoAnotacion = 2`, [idTipoContrato, idPlanillaUsuario]);
      deducciones_total = parseFloat(deduccionResult[0].total) || 0;

      total_deducciones = deducciones_total;
      salario_neto = sub_total - total_deducciones;
      total_deposito = salario_neto;


    //Modificaciones de asalariados
    } else {
      salario_bruto = salario_base + aumentos_total;

      //Deducción
      const deduccionQueries = deduccionesFijos.map((anotacion) => {
        let monto = anotacion.valor * (anotacion.fijo === 1 || anotacion.fijo === 3? salario_bruto / 100 : 1);
        let descripcion = `Deducción fija ${anotacion.fijo === 1 || anotacion.fijo === 3? 'porcentual' : 'absoluto'}`;
      
        return upsertPlanillaAnotacionFijos(mapExistentes, connection, idPlanillaUsuario, anotacion, descripcion, monto);
      });
  
      await Promise.all(deduccionQueries);

      const [deduccionResult] = await connection.query(`
        SELECT SUM(pua.monto) AS total 
        FROM planillausuarioanotacion pua 
        INNER JOIN anotacion a ON a.id = pua.idAnotacion 
        WHERE a.idTipoContrato = ? AND pua.idPlanillaUsuario = ? AND a.idTipoAnotacion = 2`, [idTipoContrato, idPlanillaUsuario]);
      deducciones_total = parseFloat(deduccionResult[0].total) || 0;

      total_deducciones = deducciones_total;
      salario_neto = salario_bruto - total_deducciones;
      

      //Otros pagos
      const otroPagoQueries = otrosPagosFijos.map((anotacion) => {
        let monto = anotacion.valor * (anotacion.fijo === 1 || anotacion.fijo === 3? salario_neto / 100 : 1);
        let descripcion = `Otro pago fijo ${anotacion.fijo === 1 || anotacion.fijo === 3? 'porcentual' : 'absoluto'}`;
      
        return upsertPlanillaAnotacionFijos(mapExistentes, connection, idPlanillaUsuario, anotacion, descripcion, monto);
      });
  
      await Promise.all(otroPagoQueries);

      const [otroPagoResult] = await connection.query(`
        SELECT SUM(pua.monto) AS total 
        FROM planillausuarioanotacion pua 
        INNER JOIN anotacion a ON a.id = pua.idAnotacion 
        WHERE a.idTipoContrato = ? AND pua.idPlanillaUsuario = ? AND a.idTipoAnotacion = 3`, [idTipoContrato, idPlanillaUsuario]);
      otrosPagos_total = parseFloat(otroPagoResult[0].total) || 0;

      total_deposito = salario_neto + otrosPagos_total;
    }

    await connection.query(`
      UPDATE planillausuario SET 
      salarioBruto = ?, totalDeducciones = ?, subTotal = ?, salarioNeto = ?, totalDeposito = ? 
      WHERE id = ?`, [salario_bruto, total_deducciones, sub_total, salario_neto, total_deposito, idPlanillaUsuario]);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error)
  } finally {
    connection.release();
  }
};

const upsertPlanillaAnotacionFijos = async (mapExistentes, connection, idPlanillaUsuario, anotacion, descripcion, monto) => {
  if (mapExistentes.has(anotacion.id)) {
    return connection.query(`
      UPDATE planillausuarioanotacion 
      SET monto = ?
      WHERE idPlanillaUsuario = ? AND idAnotacion = ? AND idUsuario IS NULL`, 
      [monto, idPlanillaUsuario, anotacion.id]);
  } else {
    return connection.query(`
      INSERT INTO planillausuarioanotacion (idPlanillaUsuario, idAnotacion, descripcion, monto)
      VALUES (?, ?, ?, ?)`, 
      [idPlanillaUsuario, anotacion.id, descripcion, monto]);
  }
};

const update_usuario_after_vacacion = async (idVacacion, restar) => {
  try {
    const [vacacion] = await db.query(`SELECT * FROM vacacion WHERE id = ${idVacacion}`);

    const fechaInicio = new Date(vacacion[0].fechaInicio);
    const fechaFinal = new Date(vacacion[0].fechaFinal);

    const horaEntrada = 8;
    const horaSalida = 17;
    const almuerzoEntrada = 12;
    const almuerzoSalida = 13;
    const horasTrabajadas = horaSalida - horaEntrada - (almuerzoSalida - almuerzoEntrada);

    const fechaInicioSinHoras = new Date(fechaInicio);
    fechaInicioSinHoras.setHours(0, 0, 0, 0);
    const fechaFinalSinHoras = new Date(fechaFinal);
    fechaFinalSinHoras.setHours(0, 0, 0, 0);
    let currentDateSinHoras = new Date(fechaInicioSinHoras);
    
    let totalHoras = 0;

    while (currentDateSinHoras <= fechaFinalSinHoras) {
      if (currentDateSinHoras.getDay() !== 0) {
        totalHoras += horasTrabajadas;

        if (currentDateSinHoras.getTime() == fechaInicioSinHoras.getTime()) {
          let horas = fechaInicio.getHours() - horaEntrada;
          if (fechaInicio.getHours() > almuerzoEntrada) {
            horas--;
          }

          totalHoras -= horas + (fechaInicio.getMinutes() / 60);
        } 
        
        if (currentDateSinHoras.getTime() == fechaFinalSinHoras.getTime()) {
          let horas = horaSalida - fechaFinal.getHours();
          if (fechaFinal.getHours() < almuerzoSalida) {
            horas--;
          }

          totalHoras -= horas - (1 - (60 - fechaFinal.getMinutes()) / 60);
        } 
      }
      currentDateSinHoras.setDate(currentDateSinHoras.getDate() + 1);
    }
    const totalDias = totalHoras / 8;

    let query = ``;
    if (restar) {
      query = `UPDATE usuario SET vacacion = vacacion - ? WHERE id = ?`
    } else {
      query = `UPDATE usuario SET vacacion = vacacion + ? WHERE id = ?`
    }

    const data = await db.query(query, [totalDias.toFixed(2), vacacion[0].idUsuario]);

    if (data) {
      
    } else {
      console.log('Error en INSERT')
    }
  } catch (error) {
    console.log(error)
  }
};

const update_usuario_modulo_progreso = async (idUsuario = null, idModulo = null, idVideo = null) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let query = `SELECT um.* FROM usuariomodulo um`;
    let values = [];
    
    if (idModulo && idVideo) {
      query += `
        LEFT JOIN modulovideo mv ON mv.idModulo = um.idModulo
        WHERE um.idModulo = ? AND mv.idVideo = ?`;
      values = [idModulo, idVideo];
    } else if (idModulo) {
      query += `
      WHERE um.idModulo = ?`;
      values = [idModulo];
    } else if (idVideo) {
      query += `
        LEFT JOIN modulovideo mv ON mv.idModulo = um.idModulo
        WHERE mv.idVideo = ?`;
      values = [idVideo];
    }
    if (idUsuario) {
      query += (values.length ? ` AND` : ` WHERE`) + ` um.idUsuario = ?`;
      values.push(idUsuario);
    }

    const [usuarioModulos] = await connection.query(query, values);
    
    for (let usuarioModulo of usuarioModulos) {
      const [moduloVideos] = await connection.query(
        `SELECT v.requerido, IFNULL(uv.progreso, 0) as progreso
         FROM modulovideo mv
         LEFT JOIN usuariovideo uv ON uv.idVideo = mv.idVideo AND uv.idUsuario = ?
         INNER JOIN video v ON v.id = mv.idVideo
         WHERE mv.idModulo = ?`, [usuarioModulo.idUsuario, usuarioModulo.idModulo]
      );

      let videosRequeridosTotal = 0;
      let videosRequeridosProgreso = 0;

      for (let moduloVideo of moduloVideos) {
        if (moduloVideo.requerido == 1) {
          videosRequeridosTotal++;
          videosRequeridosProgreso += parseFloat(moduloVideo.progreso);
        }
      }
      
      let progresoTotal;
      if (videosRequeridosTotal > 0) {
        progresoTotal = (videosRequeridosProgreso / videosRequeridosTotal);
      } else {
        progresoTotal = 100;
      }
  
      await connection.query('UPDATE usuariomodulo SET progreso = ? WHERE id = ?', [progresoTotal, usuarioModulo.id]);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error)
  } finally {
    connection.release();
  }
};

const insert_notificacion = async (datos) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let createDatos = {
      idUsuario: datos.idUsuario,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      color: datos.color,
      destino: datos.destino ?? null
    };

    await connection.query(`INSERT INTO notificacion SET ?`, createDatos);

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error)
  } finally {
    connection.release();
  }
};

const update_usuarioQuiz_after_respuestas = async (idUsuarioQuiz) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [preguntas] = await connection.query(`
      SELECT 
        qp.id AS idQuizPregunta, 
        qp.puntos,
        qp.idTipoPregunta,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', qr.id,
                'correcta', qr.correcta
              )
            )
          FROM quizrespuesta qr
          WHERE qr.idQuizPregunta = qp.id AND qr.estado != 0
        ) AS respuestas,
        (
          SELECT 
            JSON_ARRAYAGG(uqr.idQuizRespuesta)
          FROM usuarioquizrespuesta uqr
          WHERE uqr.idQuizPregunta = qp.id AND uqr.idUsuarioQuiz = uq.id
        ) AS respondido
      FROM quizpregunta qp
      JOIN usuarioquiz uq ON uq.idQuiz = qp.idQuiz
      WHERE uq.id = ? AND qp.estado != 0 AND qp.puntos != 0
    `, [idUsuarioQuiz]);

    let nota = 0;

    for (let pregunta of preguntas) {
      const respuestas = pregunta.respuestas;
      const respondido = pregunta.respondido;
      
      if (pregunta.idTipoPregunta === 1) {
        const respuestasCorrectas = respuestas.filter(r => r.correcta === 1);
        if (respuestasCorrectas.some(respuesta => respuesta.id === respondido[0])) {
          nota += pregunta.puntos;
        }
      } else if (pregunta.idTipoPregunta === 2) {
        const respuestasCorrectas = respuestas.filter(r => r.correcta === 1).map(r => r.id);
        const respuestasUsuario = Array.isArray(respondido) ? respondido : [respondido];
        
        if (respuestasCorrectas.every(id => respuestasUsuario.includes(id)) && 
        respuestasUsuario.every(id => respuestasCorrectas.includes(id))) {
          nota += pregunta.puntos;
        }
      }
    }

    const [updateResult] = await connection.query(
      'UPDATE usuarioquiz SET nota = ? WHERE id = ?',
      [nota, idUsuarioQuiz]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('Update failed');
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error)
  } finally {
    connection.release();
  }
};

const update_usuarioQuiz_after_quizes = async (idQuiz = null, idUsuario = null) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let query = 'SELECT id FROM usuarioquiz WHERE ';
    let values = []
    if (idQuiz) {
      query += 'idQuiz = ?';
      values.push(idQuiz);
      if (idUsuario) {
        query += 'AND idUsuario = ?';
        values.push(idUsuario);
      }
    } else if (idUsuario) {
      query += 'idUsuario = ?';
      values.push(idUsuario);
    }
    const [usuarioQuizEntries] = await connection.query(query, values);

    for (let entry of usuarioQuizEntries) {
      const idUsuarioQuiz = entry.id;
      update_usuarioQuiz_after_respuestas(idUsuarioQuiz);
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.log(error)
  } finally {
    connection.release();
  }
};

module.exports = {
  create_planilla_insert_usuario,
  create_fijos_planilla_usuario,
  update_usuario_after_vacacion,
  update_usuario_modulo_progreso,
  insert_notificacion,
  update_usuarioQuiz_after_respuestas,
  update_usuarioQuiz_after_quizes
};