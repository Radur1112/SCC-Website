const db = require('../utils/db.js');
const xlsx = require('xlsx');
const path = require('path');
const exceljs = require('exceljs');
const fs = require('fs');

const { create_pagos_insert_planilla, create_planilla_update_planilla } = require('../utils/triggers.js')

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
        pl.id, pl.fechaInicio, pl.fechaFinal, 
        pl.salarioBruto, pl.salarioNeto, (pl.salarioBruto - pl.salarioNeto) AS totalDeducciones, (pl.salarioBruto - SUM(otpa.monto)) AS baseFacturacion,
        u.nombre AS usuarioNombre, u.salario AS salarioBase, u.vacacion AS usuarioVacacion, u.idTipoContrato AS usuarioIdTipoContrato, 
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
        GROUP BY pl.id, pl.fechaInicio, pl.fechaFinal, u.salario
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

module.exports.getFechas = async(req, res, next) => {
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

module.exports.getHistorialAnotaciones = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT 
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

      SELECT 
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

      SELECT 
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
      SELECT 
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

      SELECT 
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

      SELECT 
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

module.exports.crear = async (req, res, next) => {
  try {
    const datos = req.body;

    let crearDatos = {
      idUsuario: datos.idUsuario,
      fechaInicio: datos.fechaInicio ?? 'CURDATE()',
      fechaFinal: datos.fechaFinal ?? 'DATE_ADD(CURDATE(), INTERVAL 15 DAY)'
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
      SELECT u.id, p.estado AS planillaEstado 
      FROM usuario u 
      LEFT JOIN planilla p ON p.idUsuario = u.id AND p.estado = 1
      WHERE u.estado != 0`);

    const fechaInicio = 'CURDATE()';
    const fechaFinal = 'DATE_ADD(CURDATE(), INTERVAL 15 DAY)';

    const planillasPromises = usuarios.map(async (usuario) => {
      if (!usuario.planillaEstado) {
        const query = `
          INSERT INTO ${nombreTabla} (idUsuario, fechaInicio, fechaFinal)
          VALUES (?, ${fechaInicio}, ${fechaFinal})
        `;
  
        const data = await db.query(query, [usuario.id]);
        create_pagos_insert_planilla(data[0].insertId)
        return data[0];
      } else {
        throw new Error('planillaActivo');
      }
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
        if (error.message = 'planillaActivo') {
          res.status(401).json({
            success: false,
            message: 'No todas las planillas estan completadas',
            id: error.message
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
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
    const [planillas] = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado = 1`);

    const planillasPromises = planillas.map(async (planilla) => {
      const data = await db.query(`UPDATE ${nombreTabla} SET estado = 2 WHERE id = ?`, [planilla.id]);
      create_planilla_update_planilla(planilla, planilla.id);
      return data[0];
    });

    Promise.all(planillasPromises)
      .then(async (results) => {
        const filePath = await crearComprobantes(results);
        res.status(201).json({
          success: true,
          message: `${nombreTabla} creados`,
          filePath: filePath,
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

async function crearComprobantes(planillas) {
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Voucher');

  // Add logo
  const logoPath = path.resolve(__dirname, '../utils/logoExcel.png');
  const logoImage = workbook.addImage({
    filename: logoPath,
    extension: 'png',
  });
  worksheet.addImage(logoImage, 'C2:E5');

  // Set column widths
  worksheet.getColumn('B').width = 28;
  worksheet.getColumn('C').width = 28;
  worksheet.getColumn('D').width = 4;
  worksheet.getColumn('E').width = 28;
  worksheet.getColumn('F').width = 28;

  // Merge cells for headers
  worksheet.mergeCells('B6:F6');
  worksheet.getCell('B6').value = 'Christian Calvo Martinez';
  worksheet.getCell('B6').alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getCell('B6').font = { bold: true, size: 20, color: { argb: 'FFFFFF' }, name: 'Gadugi' };
  worksheet.getCell('B6').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0B3040' },
  };


  // Adding the main content
  worksheet.getCell('B7').value = 'Salario Base';
  worksheet.getCell('C7').value = 390000;
  worksheet.getCell('B7').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('C7').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('B8').value = 'Comision';
  worksheet.getCell('C8').value = 0;
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

  worksheet.getCell('B9').value = 'Horas Extra';
  worksheet.getCell('C9').value = 0;
  worksheet.getCell('B9').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('C9').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('B10').value = 'Incentivos';
  worksheet.getCell('C10').value = 0;
  worksheet.getCell('B10').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('C10').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('B11').value = 'Bonificaciones';
  worksheet.getCell('C11').value = '-';
  worksheet.getCell('B11').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('C11').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('B12').value = 'SALARIO BRUTO';
  worksheet.getCell('C12').value = 390000;
  worksheet.getCell('B12').font = { bold: true };
  worksheet.getCell('C12').font = { bold: true };
  worksheet.getCell('B12').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('C12').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('B13').value = 'SALARIO NETO';
  worksheet.getCell('C13').value = 348387;
  worksheet.getCell('B13').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('C13').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('B13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0B3040' },
  };
  worksheet.getCell('C13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0B3040' },
  };

  worksheet.getCell('E7').value = 'Menos:';
  worksheet.getCell('E7').font = { bold: true };
  worksheet.getCell('E7').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('F7').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('E8').value = 'CCSS (10,67%)';
  worksheet.getCell('F8').value = 41613;
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

  worksheet.getCell('E9').value = 'Impuesto sobre la renta';
  worksheet.getCell('F9').value = '-';
  worksheet.getCell('E9').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('F9').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('E10').value = 'Adelanto de Salario';
  worksheet.getCell('F10').value = '-';
  worksheet.getCell('E10').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('F10').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('E11').value = 'Prestamos';
  worksheet.getCell('F11').value = '-';
  worksheet.getCell('E11').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('F11').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('E12').value = 'Otros Rebajos';
  worksheet.getCell('F12').value = '-';
  worksheet.getCell('E12').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };
  worksheet.getCell('F12').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'DAE9F8' },
  };

  worksheet.getCell('E13').value = 'TOTAL DEDUCCIONES';
  worksheet.getCell('F13').value = 41613;
  worksheet.getCell('E13').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('F13').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('E13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0B3040' },
  };
  worksheet.getCell('F13').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0B3040' },
  };


  worksheet.getCell('B15').value = 'Otros Pagos: Viaticos';
  worksheet.getCell('C15').value = '-';

  worksheet.getCell('E15').value = 'Vacaciones';
  worksheet.getCell('F15').value = 4.3;

  worksheet.getCell('B16').value = 'Total Deposito';
  worksheet.getCell('C16').value = 348387;
  worksheet.getCell('B16').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('C16').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('B16').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '215C98' },
  };
  worksheet.getCell('C16').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '215C98' },
  };


  worksheet.getCell('E16').value = 'Fecha:';
  worksheet.getCell('F16').value = '15/7/2024';
  worksheet.getCell('E16').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('F16').font = { bold: true, color: { argb: 'FFFFFF' } };
  worksheet.getCell('E16').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '215C98' },
  };
  worksheet.getCell('F16').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '215C98' },
  };

  // Setting styles


  const cellsToStyle = [
    "B7", "C7", "D7", "E7", "F7",
    "B8", "C8", "D8", "E8", "F8",
    "B9", "C9", "D9", "E9", "F9",
    "B10", "C10", "D10", "E10", "F10",
    "B11", "C11", "D11", "E11", "F11",
    "B12", "C12", "D12", "E12", "F12",
    "B13", "C13", "D13", "E13", "F13",
    "B14", "C14", "D14", "E14", "F14",
    "B15", "C15", "D15", "E15", "F15",
    "B16", "C16", "D16", "E16", "F16",
    "B17", "C17", "D17", "E17", "F17",
    "B18", "C18", "D18", "E18", "F18",
    "B19", "C19", "D19", "E19", "F19",
    "B20", "C20", "D20", "E20", "F20",
    "B21", "C21", "D21", "E21", "F21",
    "B22", "C22", "D22", "E22", "F22",
    "B23", "C23", "D23", "E23", "F23",
    "B24", "C24", "D24", "E24", "F24",
    "B25", "C25", "D25", "E25", "F25",
    "B26", "C26", "D26", "E26", "F26",
    "B27", "C27", "D27", "E27", "F27",
    "B28", "C28", "D28", "E28", "F28",
    "B29", "C29", "D29", "E29", "F29",
    "B30", "C30", "D30", "E30", "F30"
  ];
  
  for (const cell of cellsToStyle) {
    worksheet.getCell(cell).font = { name: 'Gadugi', size: 13 };
    worksheet.getCell(cell).border = {
      top: { style: 'none' },
      left: { style: 'none' },
      bottom: { style: 'none' },
      right: { style: 'none' }
    };
  }


  // Save the workbook to the server
  const filePath = path.resolve(__dirname, `voucher_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(filePath);

  return filePath;
}