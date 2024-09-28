const db = require('../utils/db.js');
const xlsx = require('xlsx');
const path = require('path');
const exceljs = require('exceljs');
const fs = require('fs');
const moment = require('moment');

const { enviarCorreoComprobante } = require('../utils/emailService');

const { create_fijos_planilla_usuario, insert_notificacion } = require('../utils/triggers.js')

var nombreTabla = 'planillausuario';


module.exports.getByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT pu.*, pl.fechaInicio, pl.fechaFinal, u.nombre AS usuarioNombre
      FROM  ${nombreTabla} pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      WHERE pl.estado != 0 AND u.estado != 0 AND pu.idUsuario = ?
      ORDER BY pl.fechaInicio DESC`, [id]);
      
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

module.exports.getByIdPlanilla = async(req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT
        pu.*,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.correo AS usuarioCorreo, u.idTipoContrato AS usuarioIdTipoContrato,
        p.descripcion AS puestoDescripcion,
        tc.descripcion AS tipoContratoDescripcion
      FROM ${nombreTabla} pu 
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN puesto p ON p.id = u.idPuesto
      INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato 
      WHERE u.estado != 0 AND pl.id = ?`, [id]);
      
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

module.exports.getByIdPlanillaByIdSupervisor = async(req, res, next) => {
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
      SELECT
        pu.*,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.correo AS usuarioCorreo, u.idTipoContrato AS usuarioIdTipoContrato,
        p.descripcion AS puestoDescripcion,
        tc.descripcion AS tipoContratoDescripcion
      FROM ${nombreTabla} pu 
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      INNER JOIN puesto p ON p.id = u.idPuesto
      INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato 
      WHERE u.estado != 0 AND pl.id = ? AND us.idSupervisor = ?`, [idPlanilla, idSupervisor]);

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

/*module.exports.getActivaByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
        SELECT 
        pl.fechaInicio, pl.fechaFinal, 
        pu.salarioBase, pu.salarioBruto, pu.totalDeducciones, pu.subTotal, pu.salarioNeto, pu.totalDeposito,
        u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, u.idTipoContrato AS usuarioIdTipoContrato, 
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'tipoAnotacionDescripcion', ta.descripcion,
                'anotacionId', ta.id,
                'anotacionDescripcion', a.descripcion,
                'anotacionFijo', a.valorHoras,
                'anotacionValor', a.valorHoras,
                'anotacionValorHoras', a.valorHoras,
                'descripcion', pua.descripcion,
                'monto', pua.monto
              )
            )
          FROM planillausuarioanotacion pua
          INNER JOIN anotacion a ON a.id = pua.idAnotacion 
          INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion 
          WHERE pua.idPlanillaUsuario = pu.id AND a.estado != 0
        ) AS anotaciones
        FROM ${nombreTabla} pu
        INNER JOIN planilla pl ON pl.id = pu.idPlanilla
        INNER JOIN usuario u ON u.id = pu.idUsuario
        WHERE pl.estado = 1 AND u.estado != 0 AND pu.idUsuario = ?
        GROUP BY pu.id, pu.salarioBase`, [id]);
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
}*/

module.exports.getComprobanteByIdPlanillaUsuario = async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT 
        pl.id AS planillaId, pl.fechaInicio, pl.fechaFinal, pl.estado,
        pu.id, pu.salarioBase, pu.salarioBruto, pu.totalDeducciones, pu.subTotal, pu.salarioNeto, pu.totalDeposito,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, u.correo AS usuarioCorreo, 
        u.idTipoContrato AS usuarioIdTipoContrato, tc.descripcion AS usuarioTipoContratoDescripcion, p.descripcion AS usuarioPuestoDescripcion,
        cp.ubicacion AS comprobanteUbicacion,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'monto', IFNULL(subquery.montoSum, 0)
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM anotacion a
            LEFT JOIN planillausuarioanotacion pua ON a.id = pua.idAnotacion AND pua.idPlanillaUsuario = pu.id
            WHERE a.estado != 0 AND a.idTipoContrato = u.idTipoContrato AND a.idTipoAnotacion = 1
            GROUP BY a.id
          ) AS subquery
        ) AS aumentos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'monto', IFNULL(subquery.montoSum, 0)
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM anotacion a
            LEFT JOIN planillausuarioanotacion pua ON a.id = pua.idAnotacion AND pua.idPlanillaUsuario = pu.id
            WHERE a.estado != 0 AND a.idTipoContrato = u.idTipoContrato AND a.idTipoAnotacion = 2
            GROUP BY a.id
          ) AS subquery
        ) AS deducciones,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'monto', IFNULL(subquery.montoSum, 0)
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM anotacion a
            LEFT JOIN planillausuarioanotacion pua ON a.id = pua.idAnotacion AND pua.idPlanillaUsuario = pu.id
            WHERE a.estado != 0 AND a.idTipoContrato = u.idTipoContrato AND a.idTipoAnotacion = 3
            GROUP BY a.id
          ) AS subquery
        ) AS otrosPagos
      FROM ${nombreTabla} pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato
      INNER JOIN puesto p ON p.id = u.idPuesto
      LEFT JOIN comprobanteplanilla cp ON cp.idPlanillaUsuario = pu.id
      WHERE pl.estado != 0 AND u.estado != 0 AND pu.id = ?`, [id]);

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
};

module.exports.exportarComprobanteActualByIdPlanillaUsuario = async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT 
        pl.id AS planillaId, pl.fechaInicio, pl.fechaFinal, pl.estado,
        pu.id, pu.salarioBase, pu.salarioBruto, pu.totalDeducciones, pu.subTotal, pu.salarioNeto, pu.totalDeposito,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, u.correo AS usuarioCorreo, 
        u.idTipoContrato AS usuarioIdTipoContrato, tc.descripcion AS usuarioTipoContratoDescripcion, p.descripcion AS usuarioPuestoDescripcion,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 1 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS aumentos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 2 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS deducciones,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 3 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS otrosPagos
      FROM ${nombreTabla} pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato
      INNER JOIN puesto p ON p.id = u.idPuesto
      WHERE pl.estado != 0 AND u.estado != 0 AND pu.id = ?`, [id]);

    if(data) {
      const planilla = data[0][0];

      const workbook = await crearComprobanteExcel(planilla);
      const nombre = `comprobante_${formatearNombre(planilla.usuarioNombre)}_${moment(new Date(planilla.fechaInicio)).format('YYYYMMDD')}_${moment(new Date(planilla.fechaFinal)).format('YYYYMMDD')}.xlsx`;
      
      workbook.xlsx.writeBuffer()
        .then(buffer => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
          res.send(buffer);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send({
            success: false,
            message: 'Error al generar el achivo de Excel',
          });
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
};

module.exports.exportarResumenByIdPlanilla = async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT 
        pl.id AS planillaId, pl.fechaInicio, pl.fechaFinal, pl.estado,
        pu.id, pu.salarioBase, pu.salarioBruto, pu.totalDeducciones, pu.subTotal, pu.salarioNeto, pu.totalDeposito,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, u.correo AS usuarioCorreo, 
        u.idTipoContrato AS usuarioIdTipoContrato, tc.descripcion AS usuarioTipoContratoDescripcion, p.descripcion AS usuarioPuestoDescripcion,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 1 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS aumentos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 2 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS deducciones,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 3 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS otrosPagos
      FROM ${nombreTabla} pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato
      INNER JOIN puesto p ON p.id = u.idPuesto
      WHERE u.estado != 0 AND pl.id = ?`, [id]);

    if(data) {
      const planillas = data[0];

      const workbook = await crearRespaldoExcel(planillas);
      const nombre = `resumen_planilla_${moment(new Date(planillas[0].fechaInicio)).format('YYYYMMDD')}_${moment(new Date(planillas[0].fechaFinal)).format('YYYYMMDD')}.xlsx`;
      
      workbook.xlsx.writeBuffer()
        .then(buffer => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
          res.send(buffer);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send({
            success: false,
            message: 'Error al generar el achivo de Excel',
          });
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
};

module.exports.actualizarSalarioBase = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;

    const salarioBase = datos.salarioBase;

    const data = await db.query(`UPDATE ${nombreTabla} SET salarioBase = ? WHERE id = ?`, [salarioBase, id]);
    if (data) {
      await create_fijos_planilla_usuario(id);

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
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error en actualizar ${nombreTabla}`,
      error: error
    });
  }
};

module.exports.completarByIdPlanilla = async (req, res, next) => {
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

    const [planillas] = await db.query(`
      SELECT 
        pl.id AS planillaId, pl.fechaInicio, pl.fechaFinal, pl.estado,
        pu.id, pu.salarioBase, pu.salarioBruto, pu.totalDeducciones, pu.subTotal, pu.salarioNeto, pu.totalDeposito,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, u.correo AS usuarioCorreo, 
        u.idTipoContrato AS usuarioIdTipoContrato, tc.descripcion AS usuarioTipoContratoDescripcion, p.descripcion AS usuarioPuestoDescripcion,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 1 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS aumentos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 2 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS deducciones,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'anotacionId', subquery.id,
                'descripcion', subquery.descripcion,
                'fijo', subquery.fijo,
                'valor', subquery.valor,
                'montoTotal', subquery.montoSum
              )
            )
          FROM (
            SELECT 
              a.id,
              a.descripcion,
              a.fijo,
              a.valor,
              SUM(pua.monto) AS montoSum
            FROM planillausuarioanotacion pua
            INNER JOIN anotacion a ON a.id = pua.idAnotacion
            WHERE pua.idPlanillaUsuario = pu.id AND a.idTipoAnotacion = 3 AND a.estado != 0
            GROUP BY pua.idAnotacion
          ) AS subquery
        ) AS otrosPagos
      FROM ${nombreTabla} pu
      INNER JOIN planilla pl ON pl.id = pu.idPlanilla
      INNER JOIN usuario u ON u.id = pu.idUsuario
      INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato
      INNER JOIN puesto p ON p.id = u.idPuesto
      WHERE pl.estado = 1 AND u.estado != 0 AND pl.id = ?`, [id]);

    if (planillas) {
      
      await crearRespaldo(req, planillas);
      const newPlanillas = await crearComprobantes(req, planillas);

      await connection.query(`UPDATE planilla SET estado = 2 WHERE id = ?`, [id]);

      await connection.commit();
      res.status(201).json({
        success: true,
        message: `${nombreTabla} creados`,
      });
      enviarCorreos(newPlanillas);
    }
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

function formatearNumero(valor) {
  if (!valor) return '0.00';
  let formateado = parseFloat(valor.toString().replace(/[^\d.-]/g, ''));
  
  if (isNaN(formateado)) {
    return '0.00';
  }

  const parts = formateado.toFixed(2).split('.');
  let integerPart = parts[0];
  let decimalPart = parts.length > 1 ? parts[1] : '';

  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return `${integerPart},${decimalPart}`;
}

function formatearNombre(nombre) {
  const especiales = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'ü': 'u', 'ñ': 'n'
  };

  let corregido = nombre.toLowerCase().replace(/\s+/g, '');
  corregido = corregido.replace(/[áéíóúÁÉÍÓÚüÜñÑ]/g, letra => especiales[letra] || letra);

  return corregido;
}

async function crearComprobantes(req, planillas) {
  const newPlanillas = [];

  for (const planilla of planillas) {
    try {
      const workbook = await crearComprobanteExcel(planilla);
      
      const fechas = moment(new Date(planilla.fechaInicio)).format('YYYY-MM-DD') + '_' + moment(new Date(planilla.fechaFinal)).format('YYYY-MM-DD');

      const relativePath = `/uploads/planilla/${fechas}/comprobantes`;
      const file = `comprobante_${formatearNombre(planilla.usuarioNombre)}_${moment(new Date(planilla.fechaInicio)).format('YYYYMMDD')}_${moment(new Date(planilla.fechaFinal)).format('YYYYMMDD')}.xlsx`;
      const dirPath = path.join('.', relativePath);
      const filePath = path.resolve(dirPath, file);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      await workbook.xlsx.writeFile(filePath)
      .then(() => {
        planilla.filePath = filePath;
        newPlanillas.push(planilla)
        guardarUbicacionComprobante(req, relativePath, file, planilla.id);
        enviarNotificacion(planilla.usuarioId)
      })
      .catch((error) => {
        console.error(`Error saving workbook: ${error.message}`);
      });
    } catch (error) {
      console.error(`Error processing planilla: ${error.message}`);
    }
  }

  return newPlanillas;
}

async function crearComprobanteExcel(planilla) {
  try {
    const [tipoAumentos] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 1 AND idTipoContrato = ? AND estado != 0', [planilla.usuarioIdTipoContrato]);
    const [tipoDeducciones] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 2 AND idTipoContrato = ? AND estado != 0', [planilla.usuarioIdTipoContrato]);
    const [tipoOtrosPagos] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 3 AND idTipoContrato = ? AND estado != 0', [planilla.usuarioIdTipoContrato]);

    let rowAumento = 0;
    let rowDeduccion = 0;
    let rowOtroPago = 0;

    const nombreComprobante = planilla.usuarioIdTipoContrato == 1 ? 'Asalariado' : 'SP';

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet(nombreComprobante);

    //Se le ponen a todas estas celdas el fondo blanco y un font definido
    let startRow = 1;
    let endRow = 99; 
    let startCol = 1;
    let endCol = 30; 

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getCell(row, col);
        cell.font = { name: 'Gadugi', size: 13 };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFFFFF' }
        };
      }
    }


    //Planilla de asalariados
    if (planilla.usuarioIdTipoContrato == 1) {
      worksheet.getColumn('B').width = 31;
      worksheet.getColumn('C').width = 31;
      worksheet.getColumn('D').width = 5;
      worksheet.getColumn('E').width = 31;
      worksheet.getColumn('F').width = 31;

      //Logo de la empresa
      worksheet.mergeCells('B2:F5');
      const logoPath = path.resolve(__dirname, '../utils/logoExcelSinFondo.png');
      const logoImage = workbook.addImage({
        filename: logoPath,
        extension: 'png',
      });
      worksheet.addImage(logoImage, {
        tl: { col: 2, row: 1 },
        ext: { width: 441, height: 88 }
      });

      worksheet.getCell('B2').border = {
        top: { style: 'medium', color: { argb: 'A6A6A6'}},
        left: { style: 'medium', color: { argb: 'A6A6A6'}},
        bottom: { style:'medium', color: { argb: 'A6A6A6'}},
        right: { style: 'medium', color: { argb: 'A6A6A6'}},
      };


      //Nombre del usuario de la planilla
      worksheet.mergeCells('B6:F6');
      worksheet.getCell('B6').value = planilla.usuarioNombre;
      worksheet.getCell('B6').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('B6').font = { bold: true, size: 20, color: { argb: 'FFFFFF' }, name: 'Gadugi' };
      worksheet.getCell('B6').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0B3040' },
      };
      worksheet.getCell('B6').border = {
        top: { style: 'medium', color: { argb: 'A6A6A6'}},
        left: { style: 'medium', color: { argb: 'A6A6A6'}},
        bottom: { style:'medium', color: { argb: 'A6A6A6'}},
        right: { style: 'medium', color: { argb: 'A6A6A6'}},
      };
      

      //Salario base
      worksheet.getCell('B8').value = 'Salario Base';
      worksheet.getCell('C8').value = formatearNumero(planilla.salarioBase);
      worksheet.getCell('B8').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell('C8').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell(`C8`).alignment = {
        horizontal: 'right',
      };

      //Titulo de las deducciones
      worksheet.getCell('E8').value = 'Menos:';
      worksheet.getCell('E8').font = { bold: true, name: 'Gadugi', size: 13 };
      worksheet.getCell('E8').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell('F8').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      

      //Iteracion de los aumentos y deducciones
      const salto = 9;

      tipoAumentos.forEach((tipo, index) => {
        rowAumento = index + salto;

        let tipoValue = planilla.aumentos ? planilla.aumentos.find(anotacion => anotacion.anotacionId == tipo.id) || null : null;

        worksheet.getCell(`B${rowAumento}`).value = tipo.descripcion;
        worksheet.getCell(`C${rowAumento}`).value = formatearNumero(tipoValue ? tipoValue.montoTotal : '0.00');
        worksheet.getCell(`B${rowAumento}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DAE9F8' },
        };
        worksheet.getCell(`C${rowAumento}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DAE9F8' },
        };
        worksheet.getCell(`C${rowAumento}`).alignment = {
          horizontal: 'right',
        };
      });

      tipoDeducciones.forEach((tipo, index) => {
        rowDeduccion = index + salto;

        let tipoValue = planilla.deducciones ? planilla.deducciones.find(anotacion => anotacion.anotacionId == tipo.id) || null : null;

        worksheet.getCell(`E${rowDeduccion}`).value = tipo.descripcion;
        worksheet.getCell(`F${rowDeduccion}`).value = formatearNumero(tipoValue ? tipoValue.montoTotal : '0.00');
        worksheet.getCell(`E${rowDeduccion}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DAE9F8' },
        };
        worksheet.getCell(`F${rowDeduccion}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'DAE9F8' },
        };
        worksheet.getCell(`F${rowDeduccion}`).alignment = {
          horizontal: 'right',
        };
      });

      let nextRow = Math.max(rowAumento, rowDeduccion - 1);


      //Salario bruto
      worksheet.getCell(`B${++nextRow}`).value = 'SALARIO BRUTO';
      worksheet.getCell(`C${nextRow}`).value = formatearNumero(planilla.salarioBruto);
      worksheet.getCell(`B${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13 };
      worksheet.getCell(`C${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13 };
      worksheet.getCell(`B${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell(`C${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell(`C${nextRow}`).alignment = {
        horizontal: 'right',
      };

      //Salario neto
      worksheet.getCell(`B${++nextRow}`).value = 'SALARIO NETO';
      worksheet.getCell(`C${nextRow}`).value = formatearNumero(planilla.salarioNeto);
      worksheet.getCell(`B${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`C${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`B${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0B3040' },
      };
      worksheet.getCell(`C${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0B3040' },
      };
      worksheet.getCell(`C${nextRow}`).alignment = {
        horizontal: 'right',
      };


      //Total deducciones
      worksheet.getCell(`E${nextRow}`).value = 'TOTAL DEDUCCIONES';
      worksheet.getCell(`F${nextRow}`).value = formatearNumero(planilla.totalDeducciones);
      worksheet.getCell(`E${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`F${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`E${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0B3040' },
      };
      worksheet.getCell(`F${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0B3040' },
      };
      worksheet.getCell(`F${nextRow++}`).alignment = {
        horizontal: 'right',
      };
      
      //Borde a toda la seccion del salario neto
      startRow = salto - 1;
      endRow = nextRow - 1;
      startCol = 'B';
      endCol = 'C';
      for (let row = startRow; row <= endRow; row++) {
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
          const cellAddress = `${String.fromCharCode(colCode)}${row}`;
          const cell = worksheet.getCell(cellAddress);
      
          const isTopEdge = row === startRow;
          const isBottomEdge = row === endRow;
          const isLeftEdge = colCode === startCol.charCodeAt(0);
          const isRightEdge = colCode === endCol.charCodeAt(0);
      
          cell.border = {
            top: { style: (isTopEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            left: { style: (isLeftEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            bottom: { style: (isBottomEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            right: { style: (isRightEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
          };
        }
      } 
      
      //Borde a toda la seccion de las deducciones
      startRow = salto - 1;
      endRow = nextRow - 1;
      startCol = 'E';
      endCol = 'F';
      for (let row = startRow; row <= endRow; row++) {
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
          const cellAddress = `${String.fromCharCode(colCode)}${row}`;
          const cell = worksheet.getCell(cellAddress);
      
          const isTopEdge = row === startRow;
          const isBottomEdge = row === endRow;
          const isLeftEdge = colCode === startCol.charCodeAt(0);
          const isRightEdge = colCode === endCol.charCodeAt(0);
      
          cell.border = {
            top: { style: (isTopEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            left: { style: (isLeftEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            bottom: { style: (isBottomEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            right: { style: (isRightEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
          };
        }
      } 


      //Otros pagos
      nextRow++;

      if (planilla.otrosPagos) {
        planilla.otrosPagos.forEach((tipo, index) => {
          rowOtroPago = nextRow + index;

          let tipoValue = tipoOtrosPagos ? tipoOtrosPagos.find(anotacion => anotacion.id == tipo.anotacionId) || null : null;

          if (tipoValue) {
            worksheet.getCell(`B${rowOtroPago}`).value = `Otros Pagos: ${tipo.descripcion}`;
            worksheet.getCell(`C${rowOtroPago}`).value = formatearNumero(tipo.montoTotal);
            worksheet.getCell(`C${rowOtroPago}`).alignment = {
              horizontal: 'right',
            };
          } else {
            worksheet.getCell(`B${nextRow}`).value = `Otros Pagos:`;
            worksheet.getCell(`C${nextRow}`).value = '';
            worksheet.getCell(`C${nextRow}`).alignment = {
              horizontal: 'right',
            };
          }
        });
      } else {
        worksheet.getCell(`B${nextRow}`).value = `Otros Pagos:`;
        worksheet.getCell(`C${nextRow}`).value = '';
        worksheet.getCell(`C${nextRow}`).alignment = {
          horizontal: 'right',
        };
      }

      //Vacaciones
      worksheet.getCell(`E${nextRow}`).value = 'Vacaciones';
      worksheet.getCell(`F${nextRow}`).value = formatearNumero(planilla.usuarioVacacion);
      worksheet.getCell(`F${nextRow}`).alignment = {
        horizontal: 'right',
      };

      nextRow = Math.max(rowOtroPago, nextRow);

      //Total deposito
      worksheet.getCell(`B${++nextRow}`).value = 'Total Deposito';
      worksheet.getCell(`C${nextRow}`).value = formatearNumero(planilla.totalDeposito);
      worksheet.getCell(`B${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`C${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`B${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`C${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`D${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`C${nextRow}`).alignment = {
        horizontal: 'right',
      };

      //Fecha
      worksheet.getCell(`E${nextRow}`).value = 'Fecha:';
      worksheet.getCell(`F${nextRow}`).value = moment(new Date(planilla.fechaInicio)).format('DD/MM/YYYY') + ' - ' + moment(new Date(planilla.fechaFinal)).format('DD/MM/YYYY');
      worksheet.getCell(`E${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`F${nextRow}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`E${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`F${nextRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`F${nextRow}`).alignment = {
        horizontal: 'right',
      };

      //Borde a la seccion de total deposito
      startRow = nextRow - 1;
      endRow = nextRow;
      startCol = 'B';
      endCol = 'F';
      for (let row = startRow; row <= endRow; row++) {
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
          const cellAddress = `${String.fromCharCode(colCode)}${row}`;
          const cell = worksheet.getCell(cellAddress);
      
          const isTopEdge = row === startRow;
          const isBottomEdge = row === endRow;
          const isLeftEdge = colCode === startCol.charCodeAt(0);
          const isRightEdge = colCode === endCol.charCodeAt(0);
      
          cell.border = {
            top: { style: (isTopEdge ? 'medium' : 'none'), color: { argb: 'A6A6A6'}},
            left: { style: (isLeftEdge ? 'medium' : 'none'), color: { argb: 'A6A6A6'}},
            bottom: { style: (isBottomEdge ? 'medium' : 'none'), color: { argb: 'A6A6A6'}},
            right: { style: (isRightEdge ? 'medium' : 'none'), color: { argb: 'A6A6A6'}},
          };
        }
      } 


    //Planilla de servicios profesionales
    } else {
      worksheet.getColumn('B').width = 45.75;
      worksheet.getColumn('C').width = 45.75;

      //Logo de la empresa
      worksheet.mergeCells('B2:C5');
      const logoPath = path.resolve(__dirname, '../utils/logoExcel2SinFondo.png');
      const logoImage = workbook.addImage({
        filename: logoPath,
        extension: 'png',
      });
      worksheet.addImage(logoImage, {
        tl: { col: 1, row: 1 },
        ext: { width: 640, height: 88 }
      });

      worksheet.getCell('B2').border = {
        top: { style: 'medium', color: { argb: 'A6A6A6'}},
        left: { style: 'medium', color: { argb: 'A6A6A6'}},
        bottom: { style:'medium', color: { argb: 'A6A6A6'}},
        right: { style: 'medium', color: { argb: 'A6A6A6'}},
      };


      //Nombre del usuario de la planilla
      worksheet.mergeCells('B6:C6');
      worksheet.getCell('B6').value = planilla.usuarioNombre;
      worksheet.getCell('B6').alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getCell('B6').font = { bold: true, size: 20, color: { argb: 'FFFFFF' }, name: 'Gadugi' };
      worksheet.getCell('B6').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '0B3040' },
      };
      worksheet.getCell('B6').border = {
        top: { style: 'medium', color: { argb: 'A6A6A6'}},
        left: { style: 'medium', color: { argb: 'A6A6A6'}},
        bottom: { style:'medium', color: { argb: 'A6A6A6'}},
        right: { style: 'medium', color: { argb: 'A6A6A6'}},
      };
      

      //Fechas de la planilla
      worksheet.getCell('B8').value = 'FECHA';
      worksheet.getCell('B8').font = { bold: true, size: 13, color: { argb: '000000' }, name: 'Gadugi' };
      worksheet.getCell('C8').value = moment(new Date(planilla.fechaInicio)).format('DD/MM/YYYY') + ' - ' + moment(new Date(planilla.fechaFinal)).format('DD/MM/YYYY');
      worksheet.getCell('B8').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell('C8').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DAE9F8' },
      };
      worksheet.getCell(`C8`).alignment = {
        horizontal: 'right',
      };
      worksheet.getCell('B8').border = {
        top: { style: 'medium', color: { argb: 'A6A6A6'}},
        left: { style: 'medium', color: { argb: 'A6A6A6'}},
        bottom: { style:'medium', color: { argb: 'A6A6A6'}},
      };
      worksheet.getCell('C8').border = {
        top: { style: 'medium', color: { argb: 'A6A6A6'}},
        bottom: { style:'medium', color: { argb: 'A6A6A6'}},
        right: { style: 'medium', color: { argb: 'A6A6A6'}},
      };
      

      //Iteracion de los aumentos
      const salto = 10;

      tipoAumentos.forEach((tipo, index) => {
        rowAumento = index + salto;

        let tipoValue = planilla.aumentos ? planilla.aumentos.find(anotacion => anotacion.anotacionId == tipo.id) || null : null;

        worksheet.getCell(`B${rowAumento}`).value = tipo.descripcion;
        worksheet.getCell(`C${rowAumento}`).value = formatearNumero(tipoValue ? tipoValue.montoTotal : '0.00');
        worksheet.getCell(`C${rowAumento}`).alignment = {
          horizontal: 'right',
        };
      });

      //Borde de los aumentos
      startRow = salto;
      endRow = rowAumento;
      startCol = 'B';
      endCol = 'C';
      for (let row = startRow; row <= endRow; row++) {
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
          const cellAddress = `${String.fromCharCode(colCode)}${row}`;
          const cell = worksheet.getCell(cellAddress);
      
          const isTopEdge = row === startRow;
          const isBottomEdge = row === endRow;
          const isLeftEdge = colCode === startCol.charCodeAt(0);
          const isRightEdge = colCode === endCol.charCodeAt(0);
      
          cell.border = {
            top: { style: (isTopEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            left: { style: (isLeftEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            bottom: { style: (isBottomEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            right: { style: (isRightEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
          };
        }
      } 

      
      //Base facturacion
      worksheet.getCell(`B${++rowAumento}`).value = 'BASE FACTURACION';
      worksheet.getCell(`C${rowAumento}`).value = formatearNumero(planilla.salarioBruto ?? 0.00);
      worksheet.getCell(`B${rowAumento}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`C${rowAumento}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`B${rowAumento}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`C${rowAumento}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`C${rowAumento}`).alignment = {
        horizontal: 'right',
      };


      //Iteracion de otros pagos
      tipoOtrosPagos.forEach((tipo, index) => {
        rowOtroPago = index + rowAumento + 1;

        let tipoValue = planilla.otrosPagos ? planilla.otrosPagos.find(anotacion => anotacion.anotacionId == tipo.id) || null : null;

        worksheet.getCell(`B${rowOtroPago}`).value = tipo.descripcion;
        worksheet.getCell(`C${rowOtroPago}`).value = formatearNumero(tipoValue ? tipoValue.montoTotal : '0.00');
        worksheet.getCell(`C${rowOtroPago}`).alignment = {
          horizontal: 'right',
        };
      });

      //Borde otros pagos
      startRow = rowAumento + 1;
      endRow = rowOtroPago;
      startCol = 'B';
      endCol = 'C';
      for (let row = startRow; row <= endRow; row++) {
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
          const cellAddress = `${String.fromCharCode(colCode)}${row}`;
          const cell = worksheet.getCell(cellAddress);
      
          const isTopEdge = row === startRow;
          const isBottomEdge = row === endRow;
          const isLeftEdge = colCode === startCol.charCodeAt(0);
          const isRightEdge = colCode === endCol.charCodeAt(0);
      
          cell.border = {
            top: { style: (isTopEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            left: { style: (isLeftEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            bottom: { style: (isBottomEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            right: { style: (isRightEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
          };
        }
      } 

      
      //Subtotal
      worksheet.getCell(`B${++rowOtroPago}`).value = 'SUBTOTAL';
      worksheet.getCell(`C${rowOtroPago}`).value = formatearNumero(planilla.subTotal);
      worksheet.getCell(`B${rowOtroPago}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`C${rowOtroPago}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`B${rowOtroPago}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`C${rowOtroPago}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '215C98' },
      };
      worksheet.getCell(`C${rowOtroPago}`).alignment = {
        horizontal: 'right',
      };


      //Iteracion de deducciones
      tipoDeducciones.forEach((tipo, index) => {
        rowDeduccion = index + rowOtroPago + 1;

        let tipoValue = planilla.deducciones ? planilla.deducciones.find(anotacion => anotacion.anotacionId == tipo.id) || null : null;

        worksheet.getCell(`B${rowDeduccion}`).value = tipo.descripcion;
        worksheet.getCell(`C${rowDeduccion}`).value = formatearNumero(tipoValue ? tipoValue.montoTotal : '0.00');
        worksheet.getCell(`C${rowDeduccion}`).alignment = {
          horizontal: 'right',
        };
      });

      //Borde de deducciones
      startRow = rowOtroPago + 1;
      endRow = rowDeduccion;
      startCol = 'B';
      endCol = 'C';
      for (let row = startRow; row <= endRow; row++) {
        for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
          const cellAddress = `${String.fromCharCode(colCode)}${row}`;
          const cell = worksheet.getCell(cellAddress);
      
          
          const isTopEdge = row === startRow;
          const isBottomEdge = row === endRow;
          const isLeftEdge = colCode === startCol.charCodeAt(0);
          const isRightEdge = colCode === endCol.charCodeAt(0);
      
          cell.border = {
            top: { style: (isTopEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            left: { style: (isLeftEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            bottom: { style: (isBottomEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
            right: { style: (isRightEdge ? 'thin' : 'none'), color: { argb: 'A6A6A6'}},
          };
        }
      } 


      //Total desembolso
      worksheet.getCell(`B${++rowDeduccion}`).value = 'TOTAL DESEMBOLSO';
      worksheet.getCell(`C${rowDeduccion}`).value = formatearNumero(planilla.totalDeposito);
      worksheet.getCell(`B${rowDeduccion}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`C${rowDeduccion}`).font = { bold: true, name: 'Gadugi', size: 13, color: { argb: 'FFFFFF' } };
      worksheet.getCell(`B${rowDeduccion}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '153D64' },
      };
      worksheet.getCell(`C${rowDeduccion}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '153D64' },
      };
      worksheet.getCell(`C${rowDeduccion}`).alignment = {
        horizontal: 'right',
      };
    }

    return workbook;
  } catch (error) {
    console.error(`Error creando excel: ${error.message}`);
  }
}

async function guardarUbicacionComprobante(req, ubicacion, archivo, idPlanillaUsuario) {
  try {
    const preHost = `${req.protocol}://${req.get('host')}`;
    const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost

    let crearDatos = {
      idPlanillaUsuario: idPlanillaUsuario,
      ubicacion: `${host}${ubicacion.replace(/\\/g, '/')}/${archivo}`
    }

    const data = await db.query(`INSERT INTO comprobanteplanilla SET ?`, [crearDatos]);

    if(data) {
      
    }
  } catch (error) {
    console.log(error)
  }
}

async function crearRespaldo(req, planillas) {
  try {
    let workbook = await crearRespaldoExcel(planillas);

    const fechas = moment(new Date(planillas[0].fechaInicio)).format('YYYY-MM-DD') + '_' + moment(new Date(planillas[0].fechaFinal)).format('YYYY-MM-DD');

    const relativePath = `/uploads/planilla/${fechas}`;
    const file = `resumen_planilla_${moment(new Date(planillas[0].fechaInicio)).format('YYYYMMDD')}_${moment(new Date(planillas[0].fechaFinal)).format('YYYYMMDD')}.xlsx`;
    const dirPath = path.join('.', relativePath);
    const filePath = path.resolve(dirPath, file);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    await workbook.xlsx.writeFile(filePath)
    .then(() => {
      guardarUbicacionPlanilla(req, relativePath, file, planillas[0].planillaId);
    })
    .catch((error) => {
      console.error(`Error saving workbook: ${error.message}`);
    });
  } catch (error) {
    console.error('Error creating Excel file:', error);
  }
}

async function crearRespaldoExcel(planillas) {
  try {
    const [tipoAumentosAsalariado] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 1 AND idTipoContrato = 1 AND estado != 0');
    const [tipoDeduccionesAsalariado] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 2 AND idTipoContrato = 1 AND estado != 0');
    const [tipoOtrosPagosAsalariado] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 3 AND idTipoContrato = 1 AND estado != 0');
    
    const [tipoAumentosSP] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 1 AND idTipoContrato = 2 AND estado != 0');
    const [tipoDeduccionesSP] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 2 AND idTipoContrato = 2 AND estado != 0');
    const [tipoOtrosPagosSP] = await db.query('SELECT * FROM anotacion WHERE idTipoAnotacion = 3 AND idTipoContrato = 2 AND estado != 0');

    let workbook = new exceljs.Workbook();
    const hojaAsalariado = workbook.addWorksheet('Asalariado');
    const hojaSP = workbook.addWorksheet('SP');

    const configurarHoja = (worksheet, planillas, headers, isAsalariado) => {
      worksheet.columns = headers.map(header => ({ header: header, width: 20 }));
      worksheet.getRow(1).font = { bold: true };

      planillas.forEach(planilla => {
        let row = [];

        if (isAsalariado) {
          row = [
            planilla.usuarioIdentificacion,
            planilla.usuarioNombre,
            planilla.usuarioPuestoDescripcion,
            planilla.usuarioTipoContratoDescripcion,
            formatearNumero(planilla.salarioBase)
          ];
  
          const tiposAumentos = tipoAumentosAsalariado;
          const tiposDeducciones = tipoDeduccionesAsalariado;
          const tiposOtrosPagos = tipoOtrosPagosAsalariado;
  
          tiposAumentos.forEach(tipo => {
            const tipoValue = planilla.aumentos ? planilla.aumentos.find(p => p.anotacionId == tipo.id) : null;
            row.push(tipoValue ? formatearNumero(tipoValue.montoTotal) : '0,00');
          });
  
          row.push(formatearNumero(planilla.salarioBruto));
  
          tiposDeducciones.forEach(tipo => {
            const tipoValue = planilla.deducciones ? planilla.deducciones.find(p => p.anotacionId == tipo.id) : null;
            row.push(tipoValue ? formatearNumero(tipoValue.montoTotal) : '0,00');
          });
  
          row.push(formatearNumero(planilla.totalDeducciones));
          row.push(formatearNumero(planilla.salarioNeto));
  
          tiposOtrosPagos.forEach(tipo => {
            const tipoValue = planilla.otrosPagos ? planilla.otrosPagos.find(p => p.anotacionId == tipo.id) : null;
            row.push(tipoValue ? formatearNumero(tipoValue.montoTotal) : '0,00');
          });
  
          row.push(formatearNumero(planilla.totalDeposito));
        } else {
          row = [
            planilla.usuarioIdentificacion,
            planilla.usuarioNombre,
            planilla.usuarioPuestoDescripcion,
            planilla.usuarioTipoContratoDescripcion
          ];
  
          const tiposAumentos = tipoAumentosSP;
          const tiposDeducciones = tipoDeduccionesSP;
          const tiposOtrosPagos = tipoOtrosPagosSP;
  
          tiposAumentos.forEach(tipo => {
            const tipoValue = planilla.aumentos ? planilla.aumentos.find(p => p.anotacionId == tipo.id) : null;
            row.push(tipoValue ? formatearNumero(tipoValue.montoTotal) : '0,00');
          });
  
          row.push(formatearNumero(planilla.salarioBruto));
  
          tiposOtrosPagos.forEach(tipo => {
            const tipoValue = planilla.otrosPagos ? planilla.otrosPagos.find(p => p.anotacionId == tipo.id) : null;
            row.push(tipoValue ? formatearNumero(tipoValue.montoTotal) : '0,00');
          });
  
          row.push(formatearNumero(planilla.subTotal));

          tiposDeducciones.forEach(tipo => {
            const tipoValue = planilla.deducciones ? planilla.deducciones.find(p => p.anotacionId == tipo.id) : null;
            row.push(tipoValue ? formatearNumero(tipoValue.montoTotal) : '0,00');
          });
  
          row.push(formatearNumero(planilla.salarioNeto));
        }

        worksheet.addRow(row);
      });
    };

    const planillasAsalariado = planillas.filter(p => p.usuarioIdTipoContrato == 1);
    const planillasSP = planillas.filter(p => p.usuarioIdTipoContrato == 2);

    const headersAsalariado = getHeaderAsalariado(tipoAumentosAsalariado, tipoDeduccionesAsalariado, tipoOtrosPagosAsalariado);
    const headersSP = getHeaderSP(tipoAumentosSP, tipoDeduccionesSP, tipoOtrosPagosSP);

    configurarHoja(hojaAsalariado, planillasAsalariado, headersAsalariado, true);
    configurarHoja(hojaSP, planillasSP, headersSP, false);

    return workbook;
  } catch (error) {
    console.error('Error creating Excel file:', error);
  }
}

function getHeaderAsalariado(tipoAumentos, tipoDeducciones, tipoOtrosPagos) {
  const headers = ['Identificación', 'Nombre', 'Puesto', 'Tipo Contrato', 'Salario Base'];
  tipoAumentos.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Salario Bruto');
  tipoDeducciones.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Total Deducciones', 'Salario Neto');
  tipoOtrosPagos.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Total Deposito');
  return headers;
}

function getHeaderSP(tipoAumentos, tipoDeducciones, tipoOtrosPagos) {
  const headers = ['Identificación', 'Nombre', 'Puesto', 'Tipo Contrato'];
  tipoAumentos.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Base Facturación');
  tipoOtrosPagos.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Subtotal');
  tipoDeducciones.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Total Desembolso');
  return headers;
}

async function guardarUbicacionPlanilla(req, ubicacion, archivo, idPlanilla) {
  try {
    const preHost = `${req.protocol}://${req.get('host')}`;
    const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost

    let crearDatos = {
      idPlanilla: idPlanilla,
      ubicacion: `${host}${ubicacion.replace(/\\/g, '/')}/${archivo}`
    }

    const data = await db.query(`INSERT INTO planillahistorial SET ?`, [crearDatos]);

    if(data) {
      
    }
  } catch (error) {
    console.log(error)
  }
}

async function enviarCorreos(planillas) {
  for (let planilla of planillas) {
    enviarCorreoComprobante(planilla, planilla.filePath);
    console.log(planilla.usuarioCorreo)
    await sleep(5000);
  }
  console.log('listo xd')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enviarNotificacion(idUsuario) {
  let datos = {
    idUsuario: idUsuario,
    titulo: 'Comprobante creado',
    descripcion: 'El comprobante de esta quincena ha sido completado',
    destino: `/comprobante/${idUsuario}`,
    color: 1
  };

  insert_notificacion(datos);
}