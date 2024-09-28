const db = require('../utils/db.js');
const xlsx = require('xlsx');
const exceljs = require('exceljs');
const moment = require('moment');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

const { enviarCorreoAviso } = require('../utils/emailService');
const { update_usuario_after_vacacion, insert_notificacion } = require('../utils/triggers.js')

var nombreTabla = 'vacacion';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE u.estado != 0
      GROUP BY v.id
      ORDER BY v.fechaCreado DESC`);
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
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE u.estado != 0 AND v.estado = 2
      GROUP BY v.id
      ORDER BY v.fechaCreado DESC`);
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
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON v.idUsuario = u.id
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE us.idSupervisor = ? AND v.estado = 2 AND u.estado != 0
      ORDER BY v.fechaCreado DESC`, [id]);
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
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE v.id = ? AND u.estado != 0`, [id]);
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
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON v.idUsuario = u.id
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE us.idSupervisor = ? AND u.estado != 0
      ORDER BY v.fechaCreado DESC`, [id]);
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
      SELECT v.*,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE v.estado != 0 AND v.idUsuario = ?  AND u.estado != 0
      ORDER BY v.fechaInicio`, [id]);
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
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE v.idUsuario = ? AND u.estado != 0
      GROUP BY v.id
      ORDER BY v.fechaCreado DESC`, [id]);
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
      fechaInicio: datos.fechaInicio,
      fechaFinal: datos.fechaFinal,
      comentario: datos.comentario ?? null
    }

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    if (data) {
      update_usuario_after_vacacion(data[0].insertId, true);

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

module.exports.confirmarVacacion = async (req, res, next) => {
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

module.exports.rechazarVacacion = async (req, res, next) => {
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
      update_usuario_after_vacacion(id, false);
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
  const [data] = await db.query(`SELECT v.*, u.correo AS usuarioCorreo FROM ${nombreTabla} v INNER JOIN usuario u ON u.id = v.idUsuario WHERE v.id = ?`, [id]);
  const vacacion = data[0];

  let fechaInicio = format(vacacion.fechaInicio, "d 'de' MMMM, yyyy - hh:mm aa", { locale: es });
  let fechaFinal = format(vacacion.fechaFinal, "d 'de' MMMM, yyyy - hh:mm aa", { locale: es });
  
  let datos;
  if (aceptado) {
    datos = {
      idUsuario: vacacion.idUsuario,
      titulo: 'Vacacion aprobada',
      descripcion: 'Su solicitud de vacaciones ha sido aprobada',
      destino: `/vacacion/historial/${vacacion.idUsuario}`,
      asunto: 'Vacacion aprobada',
      color: 1,
      html: `Su solicitud de vacaciones del ${fechaInicio} al ${fechaFinal} ha sido aprobada`,
      usuarioCorreo: vacacion.usuarioCorreo
    };
  } else {
    datos = {
      idUsuario: vacacion.idUsuario,
      titulo: 'Vacacion rechazada',
      descripcion: 'Su solicitud de vacaciones ha sido rechazada',
      destino: `/vacacion/historial/${vacacion.idUsuario}`,
      asunto: 'Vacacion rechazada',
      color: 3,
      html: `Su solicitud de vacaciones del ${fechaInicio} al ${fechaFinal} ha sido rechazada`,
      usuarioCorreo: vacacion.usuarioCorreo
    };
  }

  enviarCorreoAviso(datos);
  insert_notificacion(datos);
}

module.exports.exportarExcel = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE u.estado != 0
      GROUP BY v.id
      ORDER BY v.fechaCreado DESC`);
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
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion,
        u2.nombre AS supervisorNombre
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      LEFT JOIN usuario u2 ON u2.id = v.idSupervisor
      WHERE u.estado != 0 AND us.idSupervisor = ?
      GROUP BY v.id
      ORDER BY v.fechaCreado DESC`, [id]);
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
    const nombre = `vacaciones_${moment().format('YYYYMMDD')}.xlsx`;
    
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
    const hoja = workbook.addWorksheet('Vacaciones');

    const configurarHoja = (worksheet, vacaciones) => {
      const headers = [
        { header: 'Identificación', width: 15 },
        { header: 'Nombre completo', width: 30 },
        { header: 'Fechas de vacaciones', width: 60 },
        { header: 'Comentario', width: 30 },
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

      vacaciones.forEach(vacacion => {
        const formattedInicio = format(vacacion.fechaInicio, "d 'de' MMMM, y - hh:mm a", { locale: es });
        const formattedFinal = format(vacacion.fechaFinal, "d 'de' MMMM, y - hh:mm a", { locale: es });
        const fechas = `${formattedInicio} / ${formattedFinal}`;

        let row = [
          vacacion.usuarioIdentificacion,
          vacacion.usuarioNombre,
          fechas,
          vacacion.comentario ?? 'Sin comentarios',
          estados[vacacion.estado],
          vacacion.supervisorNombre ?? 'No especificado'
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