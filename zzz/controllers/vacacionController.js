const db = require('../utils/db.js');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

const { enviarCorreoAviso } = require('../utils/emailService');
const { update_usuario_after_vacacion, insert_notificacion } = require('../utils/triggers.js')

var nombreTabla = 'vacacion';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT v.*,
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
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
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      WHERE v.estado = 2
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
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON v.idUsuario = u.id AND u.estado != 0
      INNER JOIN usuariosupervisor us ON us.idUsuario = u.id
      WHERE us.idSupervisor = ? AND v.estado = 2
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
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      WHERE v.id = ?
      GROUP BY v.d`, [id]);
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

module.exports.getNoRechazadoByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado != 0 AND idUsuario = ? ORDER BY fechaInicio`, [id]);
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
        u.nombre AS usuarioNombre, u.identificacion AS usuarioIdentificacion
      FROM ${nombreTabla} v
      INNER JOIN usuario u ON u.id = v.idUsuario
      WHERE v.idUsuario = ?
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

    const data = await db.query(`UPDATE ${nombreTabla} SET estado = 1 WHERE id = ?`, [id]);
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

    const data = await db.query(`UPDATE ${nombreTabla} SET estado = 0 WHERE id = ?`, [id]);
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