const db = require('../utils/db.js');
const xlsx = require('xlsx');
const path = require('path');
const exceljs = require('exceljs');
const fs = require('fs');
const moment = require('moment');

const { enviarCorreoComprobante } = require('../utils/emailService');

const { create_pagos_insert_planilla, create_planilla_update_planilla, update_planilla_after_anotacion, insert_notificacion } = require('../utils/triggers.js')

var nombreTabla = 'planilla';

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
        SELECT 
        pl.id, pl.fechaInicio, pl.fechaFinal, pl.salarioBase,
        pl.salarioBruto, pl.salarioNeto, (pl.salarioBruto - pl.salarioNeto) AS totalDeducciones, (pl.salarioBruto - SUM(otpa.monto)) AS baseFacturacion,
        u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, u.idTipoContrato AS usuarioIdTipoContrato, 
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'aumentoDescripcion', a.descripcion,
                'aumentoMonto', a.monto,
                'tipoAumentoId', ta.id,
                'tipoAumentoDescripcion', ta.descripcion,
                'tipoValorHoras', ta.valorHoras
              )
            )
          FROM aumento a
          LEFT JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
          WHERE a.idPlanilla = pl.id 
        ) AS aumentos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'deduccionDescripcion', d.descripcion,
                'deduccionMonto', d.monto,
                'tipoDeduccionId', td.id,
                'tipoDeduccionDescripcion', td.descripcion,
                'tipoValorHoras', td.valorHoras
              )
            )
          FROM deduccion d
          LEFT JOIN tipodeduccion td ON td.id = d.idTipoDeduccion
          WHERE d.idPlanilla = pl.id 
        ) AS deducciones,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'otroPagoDescripcion', op.descripcion,
                'otroPagoMonto', op.monto,
                'tipoOtroPagoId', top.id,
                'tipoOtroPagoDescripcion', top.descripcion,
                'tipoValorHoras', top.valorHoras
              )
            )
          FROM otropago op
          LEFT JOIN tipootropago top ON top.id = op.idTipoOtroPago
          WHERE op.idPlanilla = pl.id 
        ) AS otrosPagos
        FROM ${nombreTabla} pl
        INNER JOIN usuario u ON u.id = ? AND u.estado != 0
        LEFT JOIN otropago otpa ON otpa.idPlanilla = pl.id
        WHERE pl.estado = 1 AND pl.idUsuario = ?
        GROUP BY pl.id, pl.fechaInicio, pl.fechaFinal, pl.salarioBase
        ORDER BY pl.fechaFinal DESC
        LIMIT 1;`, [id, id]);
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

module.exports.getTipos = async(req, res, next) => {
  try {
    const tipoAumentoQuery = 'SELECT * FROM tipoaumento';
    const tipoDeduccionQuery = 'SELECT * FROM tipodeduccion';
    const tipoOtroPagoQuery = 'SELECT * FROM tipootropago';
    
    const [tipoAumentos] = await db.query(tipoAumentoQuery);
    const [tipoDeducciones] = await db.query(tipoDeduccionQuery);
    const [tipoOtrosPagos] = await db.query(tipoOtroPagoQuery);

    const tipos = [
      {
        tipo: 'Aumentos',
        lista: tipoAumentos
      },
      {
        tipo: 'Deducciones',
        lista: tipoDeducciones
      },
      {
        tipo: 'Otros Pagos',
        lista: tipoOtrosPagos
      }
    ]
    
    if(tipos) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: tipos
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

module.exports.getTiposAsalariado = async(req, res, next) => {
  try {
    const tipoAumentoQuery = 'SELECT * FROM tipoaumento WHERE sp = 0';
    const tipoDeduccionQuery = 'SELECT * FROM tipodeduccion WHERE sp = 0';
    const tipoOtroPagoQuery = 'SELECT * FROM tipootropago WHERE sp = 0';
    
    const [tipoAumentos] = await db.query(tipoAumentoQuery);
    const [tipoDeducciones] = await db.query(tipoDeduccionQuery);
    const [tipoOtrosPagos] = await db.query(tipoOtroPagoQuery);

    const tipos = [
      {
        tipo: 'Aumentos',
        lista: tipoAumentos
      },
      {
        tipo: 'Deducciones',
        lista: tipoDeducciones
      },
      {
        tipo: 'Otros Pagos',
        lista: tipoOtrosPagos
      }
    ]
    
    if(tipos) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: tipos
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

module.exports.getTiposSP = async(req, res, next) => {
  try {
    const tipoAumentoQuery = 'SELECT * FROM tipoaumento WHERE sp = 1';
    const tipoDeduccionQuery = 'SELECT * FROM tipodeduccion WHERE sp = 1';
    const tipoOtroPagoQuery = 'SELECT * FROM tipootropago WHERE sp = 1';
    
    const [tipoAumentos] = await db.query(tipoAumentoQuery);
    const [tipoDeducciones] = await db.query(tipoDeduccionQuery);
    const [tipoOtrosPagos] = await db.query(tipoOtroPagoQuery);

    const tipos = [
      {
        tipo: 'Aumentos',
        lista: tipoAumentos
      },
      {
        tipo: 'Deducciones',
        lista: tipoDeducciones
      },
      {
        tipo: 'Otros Pagos',
        lista: tipoOtrosPagos
      }
    ]
    
    if(tipos) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: tipos
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

module.exports.getFechaActual = async(req, res, next) => {
  try {
    const data = await db.query(`SELECT fechaInicio, fechaFinal FROM ${nombreTabla} WHERE estado = 1 LIMIT 1`);
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
      SELECT MIN(pl.fechaInicio) AS fechaInicio, MAX(pl.fechaFinal) AS fechaFinal 
      FROM ${nombreTabla} pl 
      INNER JOIN usuario u ON u.id = pl.idUsuario 
      WHERE u.estado != 0 AND pl.estado = 2`);
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

module.exports.getHistorialAnotaciones = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT p.salarioBase,
          'Aumento' AS tipo, a.id, a.fecha, a.monto,  a.descripcion, a.idTipoAumento AS idTipo,
          u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario,
          ta.descripcion AS tipoDescripcion, ta.fijo, ta.valorHoras,
          a.idPlanilla, 
          u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM aumento a
      JOIN tipoaumento ta ON a.idTipoAumento = ta.id
      JOIN planilla p ON a.idPlanilla = p.id AND p.estado = 1
      JOIN usuario u ON p.idUsuario = u.id AND u.estado != 0
      LEFT JOIN usuario u2 ON a.idUsuario = u2.id AND u2.estado != 0

      UNION ALL

      SELECT p.salarioBase,
        'Deduccion' AS tipo, d.id, d.fecha, d.monto,  d.descripcion, d.idTipoDeduccion AS idTipo,
          u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario,
          td.descripcion AS tipoDescripcion, td.fijo, td.valorHoras,
          d.idPlanilla,  
          u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM deduccion d
      JOIN tipodeduccion td ON d.idTipoDeduccion = td.id
      JOIN planilla p ON d.idPlanilla = p.id AND p.estado = 1
      JOIN usuario u ON p.idUsuario = u.id AND u.estado != 0
      LEFT JOIN usuario u2 ON d.idUsuario = u2.id AND u2.estado != 0

      UNION ALL

      SELECT p.salarioBase,
          'Otro Pago' AS tipo, op.id, op.fecha, op.monto, op.descripcion, op.idTipoOtroPago AS idTipo,
          u.id AS usuarioId, u.nombre AS usuarioNombre,  u.salario AS usuarioSalario,
          top.descripcion AS tipoDescripcion, top.fijo, top.valorHoras,
          op.idPlanilla, 
          u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM otropago op
      JOIN tipootropago top ON op.idTipoOtroPago = top.id
      JOIN planilla p ON op.idPlanilla = p.id AND p.estado = 1
      JOIN usuario u ON p.idUsuario = u.id AND u.estado != 0
      LEFT JOIN usuario u2 ON op.idUsuario = u2.id AND u2.estado != 0

      ORDER BY fecha DESC, id DESC;`);

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

module.exports.getHistorialAnotacionesBySupervisor = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT p.salarioBase,
          'Aumento' AS tipo, a.id, a.fecha, a.monto,  a.descripcion, a.idTipoAumento AS idTipo,
          u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario,
          ta.descripcion AS tipoDescripcion, ta.fijo, ta.valorHoras,
          a.idPlanilla, 
          u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM aumento a
      JOIN tipoaumento ta ON a.idTipoAumento = ta.id
      JOIN planilla p ON a.idPlanilla = p.id AND p.estado = 1
      JOIN usuario u ON p.idUsuario = u.id AND u.estado != 0
      JOIN usuariosupervisor us ON u.id = us.idUsuario AND us.idSupervisor = ?
      LEFT JOIN usuario u2 ON a.idUsuario = u2.id AND u2.estado != 0

      UNION ALL

      SELECT p.salarioBase,
        'Deduccion' AS tipo, d.id, d.fecha, d.monto,  d.descripcion, d.idTipoDeduccion AS idTipo,
          u.id AS usuarioId, u.nombre AS usuarioNombre, u.salario AS usuarioSalario,
          td.descripcion AS tipoDescripcion, td.fijo, td.valorHoras,
          d.idPlanilla,  
          u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM deduccion d
      JOIN tipodeduccion td ON d.idTipoDeduccion = td.id
      JOIN planilla p ON d.idPlanilla = p.id AND p.estado = 1
      JOIN usuario u ON p.idUsuario = u.id AND u.estado != 0
      JOIN usuariosupervisor us ON u.id = us.idUsuario AND us.idSupervisor = ?
      LEFT JOIN usuario u2 ON d.idUsuario = u2.id AND u2.estado != 0

      UNION ALL

      SELECT p.salarioBase,
          'Otro Pago' AS tipo, op.id, op.fecha, op.monto, op.descripcion, op.idTipoOtroPago AS idTipo,
          u.id AS usuarioId, u.nombre AS usuarioNombre,  u.salario AS usuarioSalario,
          top.descripcion AS tipoDescripcion, top.fijo, top.valorHoras,
          op.idPlanilla, 
          u2.id AS usuarioModId, u2.nombre AS creadoPor
      FROM otropago op
      JOIN tipootropago top ON op.idTipoOtroPago = top.id
      JOIN planilla p ON op.idPlanilla = p.id AND p.estado = 1
      JOIN usuario u ON p.idUsuario = u.id AND u.estado != 0
      JOIN usuariosupervisor us ON u.id = us.idUsuario AND us.idSupervisor = ?
      LEFT JOIN usuario u2 ON op.idUsuario = u2.id AND u2.estado != 0

      ORDER BY fecha DESC, id DESC;`, [id, id, id]);

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

module.exports.getComprobantesByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT cp.*, p.*, u.nombre AS usuarioNombre
      FROM comprobanteplanilla cp
      INNER JOIN planilla p ON p.id = cp.idPlanilla AND p.estado != 0
      INNER JOIN usuario u ON u.id = p.idUsuario AND u.estado != 0
      WHERE p.idUsuario = ?
      ORDER BY p.fechaInicio DESC`, [id]);
      
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

module.exports.getHistorial = async(req, res, next) => {
  try {
    const data = await db.query(`SELECT * FROM planillahistorial ORDER BY fechaInicio DESC`);

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

module.exports.getUsuarios = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT
        u.*,
        p.descripcion AS puestoDescripcion,
        tc.descripcion AS tipoContratoDescripcion
      FROM usuario u 
      INNER JOIN puesto p ON p.id = u.idPuesto
      LEFT JOIN tipocontrato tc ON u.idTipoContrato = tc.id 
      INNER JOIN planilla pl ON pl.idUsuario = u.id AND pl.estado = 1
      WHERE u.estado != 0`);

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

module.exports.getUsuariosByIdSupervisor = async(req, res, next) => {
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
        u.*,
        p.descripcion AS puestoDescripcion,
        tc.descripcion AS tipoContratoDescripcion
      FROM usuariosupervisor us
      INNER JOIN usuario u ON u.id = us.idUsuario AND u.estado != 0
      INNER JOIN puesto p ON p.id = u.idPuesto
      LEFT JOIN tipocontrato tc ON u.idTipoContrato = tc.id 
      INNER JOIN planilla pl ON pl.idUsuario = u.id AND pl.estado = 1
      WHERE us.idSupervisor = ?`, [id]);

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
  try {
    const datos = req.body;

    let crearDatos = {
      idUsuario: datos.idUsuario,
      fechaInicio: datos.fechaInicio ?? 'CURDATE()',
      fechaFinal: datos.fechaFinal ?? 'DATE_ADD(CURDATE(), INTERVAL 15 DAY)',
      salarioBase: datos.salarioBase
    }

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    if (data) {
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
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
  }
};

module.exports.crearTodos = async (req, res, next) => {
  try {
    const [usuarios] = await db.query(`
      SELECT u.id, u.salario
      FROM usuario u 
      LEFT JOIN planilla p ON p.idUsuario = u.id AND p.estado = 1
      WHERE u.estado != 0 AND u.idPuesto != 1 AND u.idPuesto != 2 AND p.id IS NULL`);

    const fechaInicio = 'CURDATE()';
    const fechaFinal = 'DATE_ADD(CURDATE(), INTERVAL 15 DAY)';

    const planillasPromises = usuarios.map(async (usuario) => {
      const query = `
        INSERT INTO ${nombreTabla} (idUsuario, fechaInicio, fechaFinal, salarioBase)
        VALUES (?, ${fechaInicio}, ${fechaFinal}, ${parseFloat(usuario.salario) / 2})
      `;

      const [data] = await db.query(query, [usuario.id]);
      await create_pagos_insert_planilla(data.insertId);
      return data;
    });

    Promise.all(planillasPromises)
      .then((results) => {
        res.status(201).json({
          success: true,
          message: `${nombreTabla} creados`,
          data: results,
        });
      })
      .catch((error) => {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
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

    let actualizarDatos = {
      idUsuario: datos.idUsuario,
      fechaInicio: datos.fechaInicio,
      fechaFinal: datos.fechaFinal,
      salarioBruto: datos.salarioBruto,
      salarioNeto: datos.salarioNeto,
      estado: datos.estado
    }


    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE id = ?`, [actualizarDatos, id]);
    if (data) {
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
      update_planilla_after_anotacion(id);

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

module.exports.actualizarFechas = async (req, res, next) => {
  try {
    const datos = req.body;

    const fechas = {
      fechaInicio: datos.fechaInicio,
      fechaFinal: datos.fechaFinal,
    }
    
    const data = await db.query(`UPDATE ${nombreTabla} SET fechaInicio = ?, fechaFinal = ? WHERE estado = 1`, [fechas.fechaInicio, fechas.fechaFinal]);
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

module.exports.completarTodos = async (req, res, next) => {
  try {
    const [planillas] = await db.query(`
        SELECT 
        pl.id, pl.fechaInicio, pl.fechaFinal, pl.estado,
        pl.salarioBase, pl.salarioBruto, pl.salarioNeto, 
        (pl.salarioBruto - pl.salarioNeto) AS totalDeducciones, 
        (pl.salarioBruto - SUM(otpa.monto)) AS baseFacturacion,
        u.id AS usuarioId, u.identificacion AS usuarioIdentificacion, u.nombre AS usuarioNombre, u.vacacion AS usuarioVacacion, 
        u.correo AS usuarioCorreo, 
        u.idTipoContrato AS usuarioIdTipoContrato, tc.descripcion AS usuarioTipoContratoDescripcion, pu.descripcion AS usuarioPuestoDescripcion,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'tipoAumentoId', subquery.tipoAumentoId,
                'tipoAumentoDescripcion', subquery.tipoAumentoDescripcion,
                'totalAumentoMonto', subquery.totalAumentoMonto
              )
            ) AS result
          FROM (
            SELECT 
              ta.id AS tipoAumentoId,
              ta.descripcion AS tipoAumentoDescripcion,
              SUM(a.monto) AS totalAumentoMonto
            FROM aumento a
            INNER JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
            WHERE a.idPlanilla = pl.id 
            GROUP BY ta.id, ta.descripcion
            ORDER BY ta.id
          ) AS subquery
        ) AS aumentos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'tipoDeduccionId', subquery.tipoDeduccionId,
                'tipoDeduccionDescripcion', subquery.tipoDeduccionDescripcion,
                'totalDeduccionMonto', subquery.totalDeduccionMonto
              )
            ) AS result
          FROM (
            SELECT 
              td.id AS tipoDeduccionId,
              td.descripcion AS tipoDeduccionDescripcion,
              SUM(d.monto) AS totalDeduccionMonto
            FROM deduccion d
            INNER JOIN tipodeduccion td ON td.id = d.idTipoDeduccion
            WHERE d.idPlanilla = pl.id 
            GROUP BY td.id, td.descripcion
            ORDER BY td.id
          ) AS subquery
        ) AS deducciones,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'tipoOtroPagoId', subquery.tipoOtroPagoId,
                'tipoOtroPagoDescripcion', subquery.tipoOtroPagoDescripcion,
                'totalOtroPagoMonto', subquery.totalOtroPagoMonto
              )
            ) AS result
          FROM (
            SELECT 
              top.id AS tipoOtroPagoId,
              top.descripcion AS tipoOtroPagoDescripcion,
              SUM(op.monto) AS totalOtroPagoMonto
            FROM otropago op
            INNER JOIN tipootropago top ON top.id = op.idTipoOtroPago
            WHERE op.idPlanilla = pl.id 
            GROUP BY top.id, top.descripcion
            ORDER BY top.id
          ) AS subquery
        ) AS otrosPagos
        FROM ${nombreTabla} pl
        INNER JOIN usuario u ON u.id = pl.idUsuario AND u.estado != 0
        INNER JOIN tipocontrato tc ON tc.id = u.idTipoContrato
        INNER JOIN puesto pu ON pu.id = u.idPuesto
        LEFT JOIN otropago otpa ON otpa.idPlanilla = pl.id
        WHERE pl.estado = 1 
        GROUP BY pl.id, pl.fechaInicio, pl.fechaFinal, pl.salarioBase
        ORDER BY pl.fechaFinal DESC`);

    const planillasPromises = planillas.map(async (planilla) => {
      const data = await db.query(`UPDATE ${nombreTabla} SET estado = 2 WHERE id = ?`, [planilla.id]);
      create_planilla_update_planilla(planilla, planilla.id);
      return data[0];
    });

    Promise.all(planillasPromises)
      .then(async (results) => {
        if (planillas) {
          await crearComprobantes(req, planillas);
          await crearRespaldo(req, planillas);
        }
        res.status(201).json({
          success: true,
          message: `${nombreTabla} creados`,
        });
      })
      .catch((error) => {
        console.log(error);
        res.status(400).json({
          success: false,
          message: error.message,
        });
      });
  } catch (error) {
    console.log(error);
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
  }
};

async function crearComprobantes(req, planillas) {
  for (const planilla of planillas) {
    try {
      const [tipoAumentos] = await db.query('SELECT * FROM tipoaumento WHERE sp = ?', [planilla.usuarioIdTipoContrato - 1]);
      const [tipoDeducciones] = await db.query('SELECT * FROM tipodeduccion WHERE sp = ?', [planilla.usuarioIdTipoContrato - 1]);
      const [tipoOtrosPagos] = await db.query('SELECT * FROM tipootropago WHERE sp = ?', [planilla.usuarioIdTipoContrato - 1]);

      let rowAumento = 0;
      let rowDeduccion = 0;
      let rowOtroPago = 0;

      const nombreComprobante = planilla.usuarioIdTipoContrato == 1 ? 'Asalariado' : 'SP';

      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet(nombreComprobante);

      
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



      if (planilla.usuarioIdTipoContrato == 1) {
        worksheet.getColumn('B').width = 29;
        worksheet.getColumn('C').width = 29;
        worksheet.getColumn('D').width = 5;
        worksheet.getColumn('E').width = 29;
        worksheet.getColumn('F').width = 29;
    
    
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
    
    
        // Merge cells for headers
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
        
    
    
        // Adding the main content
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
        
    
        const salto = 9;
    
        tipoAumentos.forEach((tipo, index) => {
          rowAumento = index + salto;
    
          let tipoValue = planilla.aumentos ? planilla.aumentos.find(aumento => aumento.tipoAumentoDescripcion == tipo.descripcion) || null : null;
    
          worksheet.getCell(`B${rowAumento}`).value = tipo.descripcion;
          worksheet.getCell(`C${rowAumento}`).value = formatearNumero(tipoValue ? tipoValue.totalAumentoMonto : '0.00');
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
    
          let tipoValue = planilla.deducciones ? planilla.deducciones.find(deduccion => deduccion.tipoDeduccionDescripcion == tipo.descripcion) || null : null;
    
          worksheet.getCell(`E${rowDeduccion}`).value = tipo.descripcion;
          worksheet.getCell(`F${rowDeduccion}`).value = formatearNumero(tipoValue ? tipoValue.totalDeduccionMonto : '0.00');
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
        
        startRow = salto - 1;
        endRow = nextRow - 1;
        startCol = 'B';
        endCol = 'C';
        for (let row = startRow; row <= endRow; row++) {
          for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
            const cellAddress = `${String.fromCharCode(colCode)}${row}`;
            const cell = worksheet.getCell(cellAddress);
        
            // Determine border styles based on cell position
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
        
        startRow = salto - 1;
        endRow = nextRow - 1;
        startCol = 'E';
        endCol = 'F';
        for (let row = startRow; row <= endRow; row++) {
          for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
            const cellAddress = `${String.fromCharCode(colCode)}${row}`;
            const cell = worksheet.getCell(cellAddress);
        
            // Determine border styles based on cell position
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

        let showOtrosPagos = '';
        if (planilla.otrosPagos) {
          showOtrosPagos = planilla.otrosPagos
          .map(op => op.tipoOtroPagoDescripcion)
          .join(', ');  
        }
        worksheet.getCell(`B${++nextRow}`).value = 'Otros Pagos:';
        worksheet.getCell(`C${nextRow}`).value = showOtrosPagos
        worksheet.getCell(`C${nextRow}`).alignment = {
          horizontal: 'right',
        };
    
        worksheet.getCell(`E${nextRow}`).value = 'Vacaciones';
        worksheet.getCell(`F${nextRow}`).value = formatearNumero(planilla.usuarioVacacion);
        worksheet.getCell(`F${nextRow}`).alignment = {
          horizontal: 'right',
        };
    
        worksheet.getCell(`B${++nextRow}`).value = 'Total Deposito';
        worksheet.getCell(`C${nextRow}`).value = formatearNumero(planilla.salarioNeto);
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
    
        startRow = nextRow - 1;
        endRow = nextRow;
        startCol = 'B';
        endCol = 'F';
        for (let row = startRow; row <= endRow; row++) {
          for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
            const cellAddress = `${String.fromCharCode(colCode)}${row}`;
            const cell = worksheet.getCell(cellAddress);
        
            // Determine border styles based on cell position
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
      } else {
        worksheet.getColumn('B').width = 45.75;
        worksheet.getColumn('C').width = 45.75;
    
    
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
    
    
        // Merge cells for headers
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
        
    
    
        // Adding the main content
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
        
    
        const salto = 10;
    
        tipoAumentos.forEach((tipo, index) => {
          rowAumento = index + salto;
    
          let tipoValue = planilla.aumentos ? planilla.aumentos.find(aumento => aumento.tipoAumentoDescripcion == tipo.descripcion) || null : null;
    
          worksheet.getCell(`B${rowAumento}`).value = tipo.descripcion;
          worksheet.getCell(`C${rowAumento}`).value = formatearNumero(tipoValue ? tipoValue.totalAumentoMonto : '0.00');
          worksheet.getCell(`C${rowAumento}`).alignment = {
            horizontal: 'right',
          };
        });
    
        startRow = salto;
        endRow = rowAumento;
        startCol = 'B';
        endCol = 'C';
        for (let row = startRow; row <= endRow; row++) {
          for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
            const cellAddress = `${String.fromCharCode(colCode)}${row}`;
            const cell = worksheet.getCell(cellAddress);
        
            // Determine border styles based on cell position
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

        
        worksheet.getCell(`B${++rowAumento}`).value = 'BASE FACTURACION';
        worksheet.getCell(`C${rowAumento}`).value = formatearNumero(planilla.baseFacturacion ?? 0.00);
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

    
        tipoOtrosPagos.forEach((tipo, index) => {
          rowOtroPago = index + rowAumento + 1;
    
          let tipoValue = planilla.otrosPagos ? planilla.otrosPagos.find(otroPago => otroPago.tipoOtroPagoDescripcion == tipo.descripcion) || null : null;
    
          worksheet.getCell(`B${rowOtroPago}`).value = tipo.descripcion;
          worksheet.getCell(`C${rowOtroPago}`).value = formatearNumero(tipoValue ? tipoValue.totalOtroPagoMonto : '0.00');
          worksheet.getCell(`C${rowOtroPago}`).alignment = {
            horizontal: 'right',
          };
        });
    
        startRow = rowAumento + 1;
        endRow = rowOtroPago;
        startCol = 'B';
        endCol = 'C';
        for (let row = startRow; row <= endRow; row++) {
          for (let colCode = startCol.charCodeAt(0); colCode <= endCol.charCodeAt(0); colCode++) {
            const cellAddress = `${String.fromCharCode(colCode)}${row}`;
            const cell = worksheet.getCell(cellAddress);
        
            // Determine border styles based on cell position
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

        
        worksheet.getCell(`B${++rowOtroPago}`).value = 'SUBTOTAL';
        worksheet.getCell(`C${rowOtroPago}`).value = formatearNumero(planilla.salarioBruto);
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


    
        tipoDeducciones.forEach((tipo, index) => {
          rowDeduccion = index + rowOtroPago + 1;
    
          let tipoValue = planilla.deducciones ? planilla.deducciones.find(deduccion => deduccion.tipoDeduccionDescripcion == tipo.descripcion) || null : null;
    
          worksheet.getCell(`B${rowDeduccion}`).value = tipo.descripcion;
          worksheet.getCell(`C${rowDeduccion}`).value = formatearNumero(tipoValue ? tipoValue.totalDeduccionMonto : '0.00');
          worksheet.getCell(`C${rowDeduccion}`).alignment = {
            horizontal: 'right',
          };
        });
    
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

    
        worksheet.getCell(`B${++rowDeduccion}`).value = 'TOTAL DESEMBOLSO';
        worksheet.getCell(`C${rowDeduccion}`).value = formatearNumero(planilla.salarioNeto);
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

      const fechas = moment(new Date(planilla.fechaInicio)).format('YYYY-MM-DD') + '_' + moment(new Date(planilla.fechaFinal)).format('YYYY-MM-DD');

      const relativePath = `/uploads/planilla/${fechas}/comprobantes`;
      const file = `comprobante_${formatearNombre(planilla.usuarioNombre)}_${moment().format('YYYYMMDD')}.xlsx`;
      const dirPath = path.join('.', relativePath);
      const filePath = path.resolve(dirPath, file);
      
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      await workbook.xlsx.writeFile(filePath)
      .then(() => {
        enviarCorreoComprobante(planilla, filePath);
        guardarUbicacionComprobante(req, relativePath, file, planilla.id);
        enviarNotificacion(planilla.usuarioId)
      })
      .catch((error) => {
        console.error(`Error saving workbook: ${error.message}`);
      });

      await sleep(1000);
    } catch (error) {
      console.error(`Error processing planilla: ${error.message}`);
    }
  }
}

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

async function guardarUbicacionComprobante(req, ubicacion, archivo, idPlanilla) {
  try {
    const preHost = `${req.protocol}://${req.get('host')}`;
    const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost

    let crearDatos = {
      idPlanilla: idPlanilla,
      ubicacion: `${host}${ubicacion.replace(/\\/g, '/')}/${archivo}`
    }

    const data = await db.query(`INSERT INTO comprobanteplanilla SET ?`, [crearDatos]);

    if(data) {
      
    }
  } catch (error) {
    console.log(error)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crearRespaldo(req, planillas) {
  try {
    const [tipoAumentosAsalariado] = await db.query('SELECT * FROM tipoaumento WHERE sp = 0');
    const [tipoDeduccionesAsalariado] = await db.query('SELECT * FROM tipodeduccion WHERE sp = 0');
    const [tipoOtrosPagosAsalariado] = await db.query('SELECT * FROM tipootropago WHERE sp = 0');

    const [tipoAumentosSP] = await db.query('SELECT * FROM tipoaumento WHERE sp = 1');
    const [tipoDeduccionesSP] = await db.query('SELECT * FROM tipodeduccion WHERE sp = 1');
    const [tipoOtrosPagosSP] = await db.query('SELECT * FROM tipootropago WHERE sp = 1');

    let workbook = new exceljs.Workbook();
    const hojaAsalariado = workbook.addWorksheet('Asalariado');
    const hojaSP = workbook.addWorksheet('SP');

    const configurarHoja = (worksheet, planillas, headers, isAsalariado) => {
      worksheet.columns = headers.map(header => ({ header: header, width: 20 }));

      planillas.forEach(planilla => {
        let row = isAsalariado ? [
          planilla.usuarioIdentificacion,
          planilla.usuarioNombre,
          planilla.usuarioPuestoDescripcion,
          planilla.usuarioTipoContratoDescripcion,
          parseFloat(planilla.salarioBase)
        ] : [
          planilla.usuarioIdentificacion,
          planilla.usuarioNombre,
          planilla.usuarioPuestoDescripcion,
          planilla.usuarioTipoContratoDescripcion
        ];

        const tiposAumentos = isAsalariado ? tipoAumentosAsalariado : tipoAumentosSP;
        const tiposDeducciones = isAsalariado ? tipoDeduccionesAsalariado : tipoDeduccionesSP;
        const tiposOtrosPagos = isAsalariado ? tipoOtrosPagosAsalariado : tipoOtrosPagosSP;

        tiposAumentos.forEach(tipo => {
          const tipoValue = planilla.aumentos ? planilla.aumentos.find(p => p.tipoAumentoId == tipo.id) : null;
          row.push(tipoValue ? parseFloat(tipoValue.totalAumentoMonto) : 0);
        });

        if (isAsalariado) {
          row.push(parseFloat(planilla.salarioBruto));
        } else {
          row.push(parseFloat(planilla.baseFacturacion));
        }

        tiposDeducciones.forEach(tipo => {
          const tipoValue = planilla.deducciones ? planilla.deducciones.find(p => p.tipoDeduccionId == tipo.id) : null;
          row.push(tipoValue ? parseFloat(tipoValue.totalDeduccionMonto) : 0);
        });


        if (isAsalariado) {
          row.push(parseFloat(planilla.totalDeducciones));
          row.push(parseFloat(planilla.salarioNeto));
        } else {
          row.push(parseFloat(planilla.salarioBruto));
        }

        tiposOtrosPagos.forEach(tipo => {
          const tipoValue = planilla.otrosPagos ? planilla.otrosPagos.find(p => p.tipoOtroPagoId == tipo.id) : null;
          row.push(tipoValue ? parseFloat(tipoValue.totalOtroPagoMonto) : 0);
        });

        if (!isAsalariado) {
          row.push(parseFloat(planilla.salarioNeto));
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

    const fechas = moment(new Date(planillas[0].fechaInicio)).format('YYYY-MM-DD') + '_' + moment(new Date(planillas[0].fechaFinal)).format('YYYY-MM-DD');

    const relativePath = `/uploads/planilla/${fechas}`;
    const file = `resumen_planilla_${moment().format('YYYYMMDD')}.xlsx`;
    const dirPath = path.join('.', relativePath);
    const filePath = path.resolve(dirPath, file);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    await workbook.xlsx.writeFile(filePath)
    .then(() => {
      guardarUbicacionPlanilla(req, relativePath, file, planillas[0].fechaInicio, planillas[0].fechaFinal);
    })
    .catch((error) => {
      console.error(`Error saving workbook: ${error.message}`);
    });
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
  return headers;
}

function getHeaderSP(tipoAumentos, tipoDeducciones, tipoOtrosPagos) {
  const headers = ['Identificación', 'Nombre', 'Puesto', 'Tipo Contrato'];
  tipoAumentos.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Base Facturación');
  tipoDeducciones.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Salario Bruto');
  tipoOtrosPagos.forEach(tipo => headers.push(tipo.descripcion));
  headers.push('Salario Neto');
  return headers;
}

async function guardarUbicacionPlanilla(req, ubicacion, archivo, fechaInicio, fechaFinal) {
  try {
    const preHost = `${req.protocol}://${req.get('host')}`;
    const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost

    let crearDatos = {
      fechaInicio: fechaInicio,
      fechaFinal: fechaFinal,
      ubicacion: `${host}${ubicacion.replace(/\\/g, '/')}/${archivo}`
    }

    const data = await db.query(`INSERT INTO planillahistorial SET ?`, [crearDatos]);

    if(data) {
      
    }
  } catch (error) {
    console.log(error)
  }
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