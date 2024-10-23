const db = require('../utils/db.js');
const xlsx = require('xlsx');
const exceljs = require('exceljs');
const moment = require('moment');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

const { enviarCorreoAviso } = require('../utils/emailService');
const { insert_notificacion } = require('../utils/triggers.js')

var nombreTabla = 'incapacidad';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', ia.id,
                'ubicacion', ia.ubicacion
              )
            )
          FROM incapacidadarchivo ia
          WHERE ia.idIncapacidad = i.id
        ) AS archivos
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE u.estado != 0
      GROUP BY i.id
      ORDER BY i.fechaCreado DESC`);
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

module.exports.getPendientes = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', ia.id,
                'ubicacion', ia.ubicacion
              )
            )
          FROM incapacidadarchivo ia
          WHERE ia.idIncapacidad = i.id
        ) AS archivos
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE i.estado = 2 AND u.estado != 0
      GROUP BY i.id
      ORDER BY i.fechaCreado DESC`);
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

module.exports.getPendientesByIdSupervisor = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', ia.id,
                'ubicacion', ia.ubicacion
              )
            )
          FROM incapacidadarchivo ia
          WHERE ia.idIncapacidad = i.id
        ) AS archivos
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON i.idUsuario = u.id AND u.estado != 0
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE us.idSupervisor = ? AND i.estado = 2 AND u.estado != 0
      GROUP BY i.id, u.nombre, u.identificacion
      ORDER BY i.fechaCreado DESC`, [id]);
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

module.exports.getById = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', ia.id,
                'ubicacion', ia.ubicacion
              )
            )
          FROM incapacidadarchivo ia
          WHERE ia.idIncapacidad = i.id
        ) AS archivos
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE i.id = ? AND u.estado != 0`, [id]);
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

module.exports.getByIdSupervisor = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', ia.id,
                'ubicacion', ia.ubicacion
              )
            )
          FROM incapacidadarchivo ia
          WHERE ia.idIncapacidad = i.id
        ) AS archivos
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON i.idUsuario = u.id AND u.estado != 0
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE us.idSupervisor = ? AND u.estado != 0
      GROUP BY i.id, u.nombre, u.identificacion
      ORDER BY i.fechaCreado DESC`, [id]);
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

module.exports.getNoRechazadoByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT i.*,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE i.estado != 0 AND i.idUsuario = ?  AND u.estado != 0
      ORDER BY i.fechaInicio`, [id]);
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
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', ia.id,
                'ubicacion', ia.ubicacion
              )
            )
          FROM incapacidadarchivo ia
          WHERE ia.idIncapacidad = i.id
        ) AS archivos
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE i.idUsuario = ? AND u.estado != 0
      GROUP BY i.id
      ORDER BY i.fechaCreado DESC`, [id]);
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
      razon: datos.razon,
      fechaInicio: datos.fechaInicio,
      fechaFinal: datos.fechaFinal
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
    console.log(error)
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
  }
};

module.exports.crearArchivos = async (req, res, next) => {
  try {
    const datos = req.body;
    const archivos = req.files;


    const archivosPromises = archivos.map(async (archivo) => {
      const preHost = `${req.protocol}://${req.get('host')}`;
      const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost

      let crearDatos = {
        idIncapacidad: datos.idIncapacidad,
        ubicacion: `${host}/${archivo.path.replace(/\\/g, '/')}`
      }

      const data = await db.query(`INSERT INTO incapacidadarchivo SET ?`, [crearDatos]);
      return data[0];
    });

    Promise.all(archivosPromises)
      .then((results) => {
        res.status(201).json({
          success: true,
          message: "Incapacidad archivos creados",
          data: results,
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
    console.log(error)
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
  }
};

module.exports.confirmarIncapacidad = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;

    const data = await db.query(`UPDATE ${nombreTabla} SET estado = 1, idSupervisor = ? WHERE id = ?`, [datos.idSupervisor, id]);
    if (data) {
      enviarNotificacion(true, id);
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

module.exports.rechazarIncapacidad = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;

    const data = await db.query(`UPDATE ${nombreTabla} SET estado = 0, idSupervisor = ? WHERE id = ?`, [datos.idSupervisor, id]);
    if (data) {
      enviarNotificacion(false, id);
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

async function enviarNotificacion(aceptado, id) {
  const [data] = await db.query(`SELECT i.*, u.correo AS usuarioCorreo FROM ${nombreTabla} i INNER JOIN usuario u ON u.id = i.idUsuario WHERE i.id = ?`, [id]);
  const incapacidad = data[0];

  let fechaInicio = format(incapacidad.fechaInicio, "d 'de' MMMM, yyyy - hh:mm aa", { locale: es });
  let fechaFinal = format(incapacidad.fechaFinal, "d 'de' MMMM, yyyy - hh:mm aa", { locale: es });
  
  let datos;
  if (aceptado) {
    datos = {
      idUsuario: incapacidad.idUsuario,
      titulo: 'Incapacidad aprobada',
      descripcion: 'Su justificación de incapacidad ha sido aprobada',
      destino: `/incapacidad/historial/${incapacidad.idUsuario}`,
      asunto: 'Incapacidad aprobada',
      color: 1,
      html: `Su justificación de incapacidad del ${fechaInicio} al ${fechaFinal} ha sido aprobada`,
      usuarioCorreo: incapacidad.usuarioCorreo
    };
  } else {
    datos = {
      idUsuario: incapacidad.idUsuario,
      titulo: 'Incapacidad rechazada',
      descripcion: 'Su justificación de incapacidad ha sido rechazada',
      destino: `/incapacidad/historial/${incapacidad.idUsuario}`,
      asunto: 'Incapacidad rechazada',
      color: 3,
      html: `Su justificación de incapacidad del ${fechaInicio} al ${fechaFinal} ha sido rechazada`,
      usuarioCorreo: incapacidad.usuarioCorreo
    };
  }

  enviarCorreoAviso(datos);
  insert_notificacion(datos);
}

module.exports.exportarExcel = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE u.estado != 0
      GROUP BY i.id
      ORDER BY i.fechaCreado DESC`);
    if(data) {
      crearExport(res, data[0]);
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

module.exports.exportarExcelByIdSupervisor = async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT i.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} i
      INNER JOIN usuario u ON u.id = i.idUsuario
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      LEFT JOIN usuario u2 ON u2.id = i.idSupervisor
      WHERE u.estado != 0 AND us.idSupervisor = ?
      GROUP BY i.id
      ORDER BY i.fechaCreado DESC`, [id]);
    if(data) {
      crearExport(res, data[0]);
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

async function crearExport(res, data) {
  try {
    const workbook = await crearExcel(data);
    const nombre = `incapacidades_${moment().format('YYYYMMDD')}.xlsx`;
    
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
  } catch (error) {
    console.error('Error creating Excel file:', error);
  }
}

async function crearExcel(data) {
  try {
    let workbook = new exceljs.Workbook();
    const hoja = workbook.addWorksheet('Incapacidades');

    const configurarHoja = (worksheet, incapacidades) => {
      const headers = [
        { header: 'Identificación', width: 15 },
        { header: 'Nombre completo', width: 30 },
        { header: 'Fechas de incapacidad', width: 60 },
        { header: 'Razón', width: 30 },
        { header: 'Estado', width: 15 },
        { header: 'Revisado por', width: 30 }
      ];
      worksheet.columns = headers;
      worksheet.getRow(1).font = { bold: true };
      
      const estados = {
        0: 'Rechazado',
        1: 'Confirmado',
        2: 'Pendiente'
      };

      incapacidades.forEach(incapacidad => {
        const formattedInicio = format(incapacidad.fechaInicio, "d 'de' MMMM, y - hh:mm a", { locale: es });
        const formattedFinal = format(incapacidad.fechaFinal, "d 'de' MMMM, y - hh:mm a", { locale: es });
        const fechas = `${formattedInicio} / ${formattedFinal}`;

        let row = [
          incapacidad.usuarioIdentificacion,
          incapacidad.usuarioNombre,
          fechas,
          incapacidad.razon ?? 'Sin razón',
          estados[incapacidad.estado],
          incapacidad.supervisorNombre ?? 'No especificado'
        ];

        worksheet.addRow(row);
      });
    };

    configurarHoja(hoja, data);

    return workbook;
  } catch (error) {
    console.error('Error creating Excel file:', error);
  }
}