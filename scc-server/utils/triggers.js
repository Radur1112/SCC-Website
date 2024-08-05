const db = require('./db.js');
const moment = require('moment-timezone');

const create_planilla_insert_usuario = async (idUsuario) => {
  try {
    let fecha_inicio, fecha_final;

    const [planilla] = await db.query(`SELECT fechaInicio, fechaFinal FROM planilla WHERE estado = 1 ORDER BY fechaInicio DESC LIMIT 1;`);

    if (planilla.length > 0) {
      fecha_inicio = moment(planilla[0].fechaInicio).tz('America/Costa_Rica').format('YYYY-MM-DD');
      fecha_final = moment(planilla[0].fechaFinal).tz('America/Costa_Rica').format('YYYY-MM-DD');
    } else {
      fecha_inicio = moment().tz('America/Costa_Rica').format('YYYY-MM-DD');
      fecha_final = moment().tz('America/Costa_Rica').add(15, 'days').format('YYYY-MM-DD');
    }

    const data = await db.query(`
      INSERT INTO planilla (idUsuario, fechaInicio, fechaFinal) 
      VALUES (?, ?, ?)`, [idUsuario, fecha_inicio, fecha_final]);

    if (data) {
      create_pagos_insert_planilla(data[0].insertId)
    } else {
      console.log('Error en INSERT')
    }
  } catch (error) {
    console.log(error)
  }
};

const create_planilla_update_planilla = async (oldPlanilla, idNewPlanilla) => {
  try {
    const [newPlanilla] = await db.query(`SELECT * FROM planilla WHERE id = ${idNewPlanilla}`);

    if (oldPlanilla.estado == 1 && newPlanilla[0].estado == 2) {
      const fecha_inicio = moment(newPlanilla[0].fechaFinal).tz('America/Costa_Rica').add(1, 'days').format('YYYY-MM-DD');
      const fecha_final = moment(newPlanilla[0].fechaFinal).tz('America/Costa_Rica').add(16, 'days').format('YYYY-MM-DD');

      const data = await db.query(`
        INSERT INTO planilla (idUsuario, fechaInicio, fechaFinal) 
        VALUES (?, ?, ?)`, [newPlanilla[0].idUsuario, fecha_inicio, fecha_final]);
  
      if (data) {
        create_pagos_insert_planilla(data[0].insertId)
      } else {
        console.log('Error en INSERT')
      }
    }
  } catch (error) {
    console.log(error)
  }
};

const create_pagos_insert_planilla = async (idPlanilla) => {
  try {
    let result;

    result = await db.query(`SELECT * FROM planilla WHERE id = ${idPlanilla}`);
    const planilla = result[0][0];

    result = await db.query(`SELECT salario, idTipoContrato FROM usuario WHERE id = ${planilla.idUsuario}`);
    const salario_base = result[0][0].salario;
    const idTipoContrato = result[0][0].idTipoContrato;

    const [tipoAumentos] = await db.query(`SELECT id, sp, fijo, valor FROM tipoaumento WHERE fijo > 0`);
    const [tipoDeducciones] = await db.query(`SELECT id, sp, fijo, valor FROM tipodeduccion WHERE fijo > 0`);
    const [tipoOtrosPagos] = await db.query(`SELECT id, sp, fijo, valor FROM tipootropago WHERE fijo > 0`);

    const insertQueries = [];

    tipoAumentos.forEach(tipo => {
      if ((tipo.sp === 0 && idTipoContrato === 1) || (tipo.sp === 1 && idTipoContrato === 2)) {
        const monto = tipo.fijo == 1 ? tipo.valor : tipo.fijo == 2 ? salario_base * tipo.valor / 100 : salario_base;
        const descripcion = tipo.fijo == 1 ? 'Aumento fijo absoluto' : tipo.fijo == 2 ? 'Aumento fijo porcentual' : 'Aumento fijo salario base';
        insertQueries.push(db.query(`INSERT INTO aumento (idPlanilla, idTipoAumento, descripcion, monto) VALUES (?, ?, ?, ?)`, [planilla.id, tipo.id, descripcion, monto]));
      }
    });

    tipoDeducciones.forEach(tipo => {
      if ((tipo.sp === 0 && idTipoContrato === 1) || (tipo.sp === 1 && idTipoContrato === 2)) {
        const monto = tipo.fijo == 1 ? tipo.valor : tipo.fijo == 2 ? salario_base * tipo.valor / 100 : salario_base;
        const descripcion = tipo.fijo == 1 ? 'Deducción fijo absoluto' : tipo.fijo == 2 ? 'Deducción fijo porcentual' : 'Deducción fijo salario base';
        insertQueries.push(db.query(`INSERT INTO deduccion (idPlanilla, idTipoDeduccion, descripcion, monto) VALUES (?, ?, ?, ?)`, [planilla.id, tipo.id, descripcion, monto]));
      }
    });

    tipoOtrosPagos.forEach(tipo => {
      if ((tipo.sp === 0 && idTipoContrato === 1) || (tipo.sp === 1 && idTipoContrato === 2)) {
        const monto = tipo.fijo == 1 ? tipo.valor : tipo.fijo == 2 ? salario_base * tipo.valor / 100 : salario_base;
        const descripcion = tipo.fijo == 1 ? 'Otros pagos fijo absoluto' : tipo.fijo == 2 ? 'Otros pagos fijo porcentual' : 'Otros pagos fijo salario base';
        insertQueries.push(db.query(`INSERT INTO otropago (idPlanilla, idTipoOtroPago, descripcion, monto) VALUES (?, ?, ?, ?)`, [planilla.id, tipo.id, descripcion, monto]));
      }
    });

    Promise.all(insertQueries)
      .then((results) => {
        update_planilla_after_anotacion(planilla.id)
      })
      .catch((error) => {
        console.log(error);
      });

  } catch (error) {
    console.log(error)
  }
};

const update_planilla_after_anotacion = async (idPlanilla) => {
  try {
    let result;

    result = await db.query(`SELECT * FROM planilla WHERE id = ${idPlanilla}`);
    const planilla = result[0][0];

    result = await db.query(`SELECT salario, idTipoContrato FROM usuario WHERE id = ${planilla.idUsuario}`);
    const idTipoContrato = result[0][0].idTipoContrato;
    const salario_base = parseFloat(result[0][0].salario);


    result = await db.query(`
      SELECT a.id, ta.valor 
      FROM aumento a 
      INNER JOIN tipoaumento ta ON ta.id = a.idTipoAumento AND ta.fijo = 2
      WHERE a.idPlanilla = ${idPlanilla}`);
      
    const updateAumentoQueries = result[0].map(aumento => {
      
      const monto = salario_base * parseFloat(aumento.valor) / 100;
      return db.query(`UPDATE aumento SET monto = ? WHERE id = ?`, [monto, aumento.id]);
    });

    await Promise.all(updateAumentoQueries);

    result = await db.query(`SELECT SUM(monto) AS total FROM aumento WHERE idPlanilla = ${idPlanilla}`);
    const aumentos_total = parseFloat(result[0][0].total) || 0;


    let otrosPagos_total = 0;
    if (idTipoContrato == 2) {
      result = await db.query(`
        SELECT op.id, top.valor 
        FROM otropago op 
        INNER JOIN tipootropago top ON top.id = op.idTipoOtroPago AND top.fijo = 2
        WHERE op.idPlanilla = ${idPlanilla}`);
        
      const updateOtroQueries = result[0].map(otroPago => {
        const monto = aumentos_total * parseFloat(otroPago.valor) / 100;
        return db.query(`UPDATE otropago SET monto = ? WHERE id = ?`, [monto, otroPago.id]);
      });
  
      await Promise.all(updateOtroQueries);

      result = await db.query(`SELECT SUM(monto) as total FROM otropago WHERE idPlanilla = ${idPlanilla}`);
      otrosPagos_total = parseFloat(result[0][0].total) || 0;
    }

    const salario_bruto = (idTipoContrato != 2 ? salario_base : 0) + aumentos_total + otrosPagos_total;

    result = await db.query(`
      SELECT d.id, td.valor 
      FROM deduccion d 
      INNER JOIN tipodeduccion td ON td.id = d.idTipoDeduccion AND td.fijo = 2
      WHERE d.idPlanilla = ${idPlanilla}`);
      
    const updateDeduccionQueries = result[0].map(deduccion => {
      const monto = salario_bruto * parseFloat(deduccion.valor) / 100;
      return db.query(`UPDATE deduccion SET monto = ? WHERE id = ?`, [monto, deduccion.id]);
    });

    await Promise.all(updateDeduccionQueries);

    result = await db.query(`SELECT SUM(monto) as total FROM deduccion WHERE idPlanilla = ${idPlanilla}`);
    const deducciones_total = parseFloat(result[0][0].total) || 0;

    await db.query('UPDATE planilla SET salarioBruto = ?, salarioNeto = ? WHERE id = ?', [
      salario_bruto,
      salario_bruto - deducciones_total,
      planilla.id
    ]);
  } catch (error) {
    console.log(error)
  }
};

const update_usuario_after_vacacion = async (idVacacion, restar) => {
  try {
    const [vacacion] = await db.query(`SELECT * FROM vacacion WHERE id = ${idVacacion}`);

    const fechaInicio = new Date(vacacion[0].fechaInicio);
    const fechaFinal = new Date(vacacion[0].fechaFinal);

    const fechaInicioSinHoras = new Date(fechaInicio);
    fechaInicioSinHoras.setHours(0, 0, 0, 0);
    const fechaFinalSinHoras = new Date(fechaFinal);
    fechaFinalSinHoras.setHours(0, 0, 0, 0);

    const horaEntrada = 8;
    const horaSalida = 17;
    const horaAlmuerzo = 12;
    const horasTrabajadas = 8;
    
    let currentDateSinHoras = new Date(fechaInicioSinHoras);

    let totalHoras = 0;

    while (currentDateSinHoras <= fechaFinalSinHoras) {
      const dia = currentDateSinHoras.getDay();
      
      if (dia !== 0 && dia !== 6) {
        totalHoras += horasTrabajadas;

        if (currentDateSinHoras.getTime() == fechaInicioSinHoras.getTime()) {
          let horaInicio = fechaInicio.getHours();
          let minutoInicio = fechaInicio.getMinutes();

          let horas = horaInicio - horaEntrada;
          if (horaInicio > horaAlmuerzo) {
            horas--;
          }

          if (minutoInicio != 0) {
            horas += minutoInicio / 60;
          }

          totalHoras -= horas;
        } 
        
        if (currentDateSinHoras.getTime() == fechaFinalSinHoras.getTime()) {
          let horaFinal = fechaFinal.getHours();
          let minutoFinal = fechaFinal.getMinutes();

          let horas = horaSalida - horaFinal;
          if (horaFinal < horaAlmuerzo + 1) {
            horas--;
          }

          if (minutoFinal != 0) {
            horas -= 1 - ((60 - minutoFinal) / 60);
          }

          totalHoras -= horas;
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

//sus
const create_deduccion_update_incapacidad = async (idIncapacidad, aceptado) => {
  try {
    const diasPagados = 3;
    const porcentajePagado = 0.5;
    const milisDia = 24 * 60 * 60 * 1000;

    const [incapacidad] = await db.query(`SELECT * FROM incapacidad WHERE id = ${idIncapacidad}`);
    const [usuario] = await db.query(`SELECT * FROM usuario WHERE id = ${incapacidad[0].idUsuario}`);
    const [planilla] = await db.query(`SELECT * FROM planilla WHERE idUsuario = ${usuario[0].id} ORDER BY fechaInicio DESC LIMIT 1`);

    const fechaInicioIncapacidad = new Date(incapacidad[0].fechaInicio);
    const fechaFinalIncapacidad = new Date(incapacidad[0].fechaFinal); 

    const fechaInicioPlanilla = new Date(planilla[0].fechaInicio);
    const fechaFinalPlanilla = new Date(planilla[0].fechaFinal); 

    let diasIncapacidad = (fechaFinalIncapacidad.getTime() - fechaInicioIncapacidad.getTime()) / milisDia;
    let diasPlanilla = (fechaFinalPlanilla.getTime() - fechaInicioPlanilla.getTime()) / milisDia;

    diasIncapacidad = Math.max(diasIncapacidad, 0);
    diasPlanilla = Math.max(diasPlanilla, 0);

    let salarioDia = usuario[0].salario / diasPlanilla;

    let rebajoSalario = 0;
    let contDias = 0;

    while (diasIncapacidad > 0 && contDias < diasPagados) {
      rebajoSalario += salarioDia * porcentajePagado;
      contDias++;
      diasIncapacidad--;
    }

    rebajoSalario += salarioDia * diasIncapacidad;

    console.log(rebajoSalario);

    let datos = {
      idPlanilla: planilla[0].id,
      idTipoDeduccion: 5,
      descripcion: `Rebajo de ${diasIncapacidad + contDias} de incapacidad`,
      monto: rebajoSalario
    }

    const data = await db.query(`INSERT INTO deduccion SET ?`, [datos]);

    if (data) {
      
    } else {
      console.log('Error en INSERT')
    }
  } catch (error) {
    console.log(error)
  }
};


module.exports = {
  create_planilla_insert_usuario,
  create_planilla_update_planilla,
  create_pagos_insert_planilla,
  update_planilla_after_anotacion,
  update_usuario_after_vacacion
};