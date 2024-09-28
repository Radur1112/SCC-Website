const db = require('../utils/db.js');
const moment = require('moment-timezone');

const { create_fijos_planilla_usuario } = require('../utils/triggers.js')

var nombreTabla = 'planilla';

module.exports.getActual = async(req, res, next) => {
  try {
    const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado = 1 LIMIT 1`);
    if(data) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: data[0][0]
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

module.exports.getFechas = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT MIN(fechaInicio) AS fechaInicio, MAX(fechaFinal) AS fechaFinal 
      FROM ${nombreTabla}
      WHERE estado = 2`);
    if(data) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: data[0][0]
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

module.exports.getHistorial = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT pl.*, ph.ubicacion
      FROM ${nombreTabla} pl
      LEFT JOIN planillahistorial ph ON ph.idPlanilla = pl.id
      WHERE pl.estado != 0
      ORDER BY pl.fechaInicio DESC`);

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

    let idPlanilla;
    const [planillaActiva] = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado = 1`);

    if (planillaActiva.length === 0) {
      const [planillaPreviaResult] = await connection.query(`SELECT * FROM ${nombreTabla} WHERE estado = 2 ORDER BY fechaFinal DESC LIMIT 1;`);
      const planillaPrevia = planillaPreviaResult[0] || null;

      const fecha_inicio = planillaPrevia ? moment(planillaPrevia.fechaFinal).tz('America/Costa_Rica').add(1, 'days').format('YYYY-MM-DD') : moment().tz('America/Costa_Rica').format('YYYY-MM-DD');
      const fecha_final = moment(fecha_inicio).tz('America/Costa_Rica').add(15, 'days').format('YYYY-MM-DD');
      
      const [planillaResult] = await connection.query(`INSERT INTO ${nombreTabla} (fechaInicio, fechaFinal) VALUES (?, ?)`, [fecha_inicio, fecha_final]);
      idPlanilla = planillaResult.insertId;
    } else {
      idPlanilla = planillaActiva[0].id
    }

    const [usuarios] = await connection.query(`
      SELECT u.id, u.salario
      FROM usuario u 
      LEFT JOIN planillausuario pu ON pu.idUsuario = u.id AND pu.idPlanilla = ?
      WHERE u.estado != 0 AND u.idPuesto NOT IN (1, 2) AND pu.idPlanilla IS NULL
      GROUP BY u.id`, [idPlanilla]);

    const idsPlanilaUsuario = [];
    const planillasPromises = usuarios.map(async (usuario) => {
      const salario = parseFloat(usuario.salario) / 2;

      const [data] = await connection.query(`
        INSERT INTO planillausuario (idPlanilla, idUsuario, salarioBase)
        VALUES (?, ?, ?)`, [idPlanilla, usuario.id, salario]);
        idsPlanilaUsuario.push(data.insertId);

      return data;
    });

    const results = await Promise.all(planillasPromises);

    await connection.commit();

    for (let id of idsPlanilaUsuario) {
      await create_fijos_planilla_usuario(id);
    }

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
    })
  } finally {
    connection.release();
  }
};

module.exports.actualizar = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const datos = req.body;

    const fechas = {
      fechaInicio: datos.fechaInicio,
      fechaFinal: datos.fechaFinal,
    }
    
    const data = await db.query(`UPDATE ${nombreTabla} SET fechaInicio = ?, fechaFinal = ?`, [fechas.fechaInicio, fechas.fechaFinal]);
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
      message: `Error en actualizar ${nombreTabla}`,
      error: error
    });
  }
};