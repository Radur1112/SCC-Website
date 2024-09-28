const db = require('../utils/db.js');
const moment = require('moment');

const { create_fijos_planilla_usuario } = require('../utils/triggers.js')

var nombreTabla = 'planillausuarioanotacion';

module.exports.getHistorialAnotacionesByidPlanilla = async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT pu.salarioBase,
        pua.id, pua.descripcion, pua.monto, pua.fecha,
        a.descripcion AS anotacionDescripcion, a.fijo, a.valor, a.valorHoras,
        a.idTipoAnotacion, ta.descripcion AS tipoAnotacionDescripcion,
        u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario,
        pu.idPlanilla, 
        u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM ${nombreTabla} pua
      INNER JOIN anotacion a ON a.id = pua.idAnotacion
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion
      INNER JOIN planillausuario pu ON pu.id = pua.idPlanillaUsuario
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      LEFT JOIN usuario u2 ON u2.id = pua.idUsuario
      WHERE pl.estado != 0 AND u.estado != 0 AND pl.id = ?
      ORDER BY pua.fecha DESC, pua.id DESC;`, [id]);

    if(data) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: data[0]
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'No se encontraron datos',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error al obtener datos',
      error: error
    })
  }
}

module.exports.getHistorialAnotacionesByidPlanillaIdSupervisor = async(req, res, next) => {
  try {
    const idPlanilla = req.params.idPlanilla;
    const idSupervisor = req.params.idSupervisor;
    if (!idPlanilla || !idSupervisor) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT pu.salarioBase,
        pua.id, pua.descripcion, pua.monto, pua.fecha,
        a.descripcion AS anotacionDescripcion, a.fijo, a.valor, a.valorHoras,
        a.idTipoAnotacion, ta.descripcion AS tipoAnotacionDescripcion,
        u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario,
        pu.idPlanilla, 
        u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM ${nombreTabla} pua
      INNER JOIN anotacion a ON a.id = pua.idAnotacion
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion
      INNER JOIN planillausuario pu ON pu.id = pua.idPlanillaUsuario
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN usuariosupervisor us ON u.id = us.idUsuario
      LEFT JOIN usuario u2 ON u2.id = pua.idUsuario
      WHERE pl.estado != 0 AND u.estado != 0 AND pl.id = ? AND us.idSupervisor = ?
      ORDER BY pua.fecha DESC, pua.id DESC;`, [idPlanilla, idSupervisor]);

    if(data) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: data[0]
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'No se encontraron datos',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error al obtener datos',
      error: error
    })
  }
}

module.exports.getActiva = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT pu.salarioBase,
        pua.id, pua.idPlanillaUsuario, pua.descripcion, pua.monto, pua.fecha,
        a.id AS anotacionId, a.descripcion AS anotacionDescripcion, a.fijo, a.valor, a.valorHoras,
        a.idTipoAnotacion, ta.descripcion AS tipoAnotacionDescripcion,
        u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario, u.idTipoContrato AS usuarioIdTipoContrato,
        pu.idPlanilla,
        u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM ${nombreTabla} pua
      INNER JOIN anotacion a ON a.id = pua.idAnotacion
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion
      INNER JOIN planillausuario pu ON pu.id = pua.idPlanillaUsuario
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      LEFT JOIN usuario u2 ON u2.id = pua.idUsuario
      WHERE pl.estado = 1 AND u.estado != 0 AND a.estado != 0
      ORDER BY pua.fecha DESC, pua.id DESC;`);

    if(data) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: data[0]
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'No se encontraron datos',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error al obtener datos',
      error: error
    })
  }
}

module.exports.getActivaByIdSupervisor = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT pu.salarioBase,
        pua.id, pua.idPlanillaUsuario, pua.descripcion, pua.monto, pua.fecha,
        a.id AS anotacionId, a.descripcion AS anotacionDescripcion, a.fijo, a.valor, a.valorHoras,
        a.idTipoAnotacion, ta.descripcion AS tipoAnotacionDescripcion,
        u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario, u.idTipoContrato AS usuarioIdTipoContrato,
        pu.idPlanilla,
        u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM ${nombreTabla} pua
      INNER JOIN anotacion a ON a.id = pua.idAnotacion
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion
      INNER JOIN planillausuario pu ON pu.id = pua.idPlanillaUsuario
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN usuariosupervisor us ON u.id = us.idUsuario
      LEFT JOIN usuario u2 ON u2.id = pua.idUsuario
      WHERE pl.estado = 1 AND u.estado != 0 != 0 AND a.estado != 0 AND us.idSupervisor = ?
      ORDER BY pua.fecha DESC, pua.id DESC;`, [id]);

    if(data) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: data[0]
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'No se encontraron datos',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error al obtener datos',
      error: error
    })
  }
}

module.exports.crear = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;

    const [planilla] = await connection.query(`
      SELECT pl.estado 
      FROM planillausuario pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      WHERE pu.id = ?`, [datos.idPlanillaUsuario]);

    if (planilla[0].estado != 1) {
      throw new Error('completada')
    }
    
    let crearDatos = {
      idPlanillaUsuario: datos.idPlanillaUsuario,
      idAnotacion: datos.idAnotacion,
      descripcion: datos.descripcion,
      monto: datos.monto,
      idUsuario: datos.idUsuario ?? null
    }

    const data = await connection.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    if (data) {
      await connection.commit();

      await create_fijos_planilla_usuario(datos.idPlanillaUsuario);
      res.status(201).json({
          status: true,
          message: `${nombreTabla} creado`,
          data: data[0],
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Error en INSERT',
      });
    }
  } catch (error) {
    await connection.rollback();

    if (error.message = 'completada') {
      res.status(401).json({
        success: false,
        message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
        id: error.message
      });
    } else {
      console.log(error);
      res.status(500).send({
      success: false,
      message: `Error en registrar ${nombreTabla}`,
      error: error
      });
    }
  } finally {
    connection.release();
  }
};

module.exports.crearMultiples = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;
    let idPlanillaUsuario;

    const anotacionesPromises = datos.map(async (dato) => {
      idPlanillaUsuario = dato.idPlanillaUsuario;

      const [planilla] = await connection.query(`
        SELECT pl.estado 
        FROM planillausuario pu
        INNER JOIN planilla pl ON pl.id = pu.idPlanilla
        WHERE pu.id = ?`, [idPlanillaUsuario]);
  
      if (planilla[0].estado != 1) {
        throw new Error('completada')
      }
    
      let crearDatos = {
        idPlanillaUsuario: idPlanillaUsuario,
        idAnotacion: dato.idAnotacion,
        descripcion: dato.descripcion,
        monto: dato.monto,
        idUsuario: dato.idUsuario ?? null
      }

      const data = await connection.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
      return data[0];
    });

    const results = await Promise.all(anotacionesPromises);

    await connection.commit();

    await create_fijos_planilla_usuario(idPlanillaUsuario);

    res.status(201).json({
      success: true,
      message: `${nombreTabla} creados`,
      data: results,
    });
    
  } catch (error) {
    await connection.rollback();
    
    console.log(error);
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    });
  } finally {
    connection.release();
  }
};

module.exports.actualizar = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;
  
    const [planilla] = await connection.query(`
      SELECT pl.estado 
      FROM planillausuario pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      WHERE pu.id = ?`, [datos.idPlanillaUsuario]);

    if (planilla[0].estado != 1) {
      throw new Error('completada')
    }


    let actualizarDatos = {
      idPlanillaUsuario: datos.idPlanillaUsuario,
      idAnotacion: datos.idAnotacion,
      descripcion: datos.descripcion,
      monto: datos.monto,
      fecha: moment().tz('America/Costa_Rica').format('YYYY-MM-DD HH:mm:ss'),
      idUsuario: datos.idUsuario ?? null
    }


    const data = await connection.query(`UPDATE ${nombreTabla} SET ? WHERE id = ?`, [actualizarDatos, id]);
    if (data) {
      await connection.commit();

      await create_fijos_planilla_usuario(datos.idPlanillaUsuario);
      res.status(201).json({
          status: true,
          message: `${nombreTabla} actualizado`
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Error en UPDATE',
      });
    }
  } catch (error) {
    await connection.rollback();

    if (error.message = 'completada') {
      res.status(401).json({
        success: false,
        message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
        id: error.message
      });
    } else {
      console.log(error);
      res.status(500).send({
        success: false,
        message: `Error en actualizar ${nombreTabla}`,
        error: error
      });
    }
  } finally {
    connection.release();
  }
};

module.exports.borrar = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

      const id = req.params.id;
      if (!id) {
        return res.status(404).send({
          success: false,
          message: 'Id inválido',
        });
      }
  
      const [anotacion] = await connection.query(`
        SELECT pua.*, pl.estado AS planillaEstado 
        FROM ${nombreTabla} pua 
        INNER JOIN planillausuario pu ON pu.id = pua.idPlanillaUsuario
        INNER JOIN planilla pl ON pl.id = pu.idPlanilla
        WHERE pua.id = ${id}`);

      if (anotacion[0].planillaEstado != 1) {
        throw new Error('completada')
      }

      await connection.query(`DELETE FROM ${nombreTabla} WHERE id = ?`, [id]);

      await connection.commit();
      
      if (anotacion.length > 0) {
        await create_fijos_planilla_usuario(anotacion[0].idPlanillaUsuario);
      }

      res.status(201).json({
          status: true,
          message: `${nombreTabla} borrado`
      });
    } catch (error) {
      await connection.rollback();
      if (error.message = 'completada') {
        res.status(401).json({
          success: false,
          message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
          id: error.message
        });
      } else {
        console.log(error);
        res.status(500).send({
          success: false,
          message: `Error en borrar ${nombreTabla}`,
          error: error
        });
      }
    } finally {
      connection.release();
    }
  };