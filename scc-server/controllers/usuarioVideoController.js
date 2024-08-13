const db = require('../utils/db.js');

const { update_usuario_modulo_progreso } = require('../utils/triggers.js');

var nombreTabla = 'usuariovideo';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT uv.*, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
      v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} uv
      INNER JOIN usuario u ON uv.idUsuario = u.id AND u.estado != 0
      INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
      `);
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
      SELECT uv.*, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
      v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} uv
      INNER JOIN usuario u ON uv.idUsuario = u.id AND u.estado != 0
      INNER JOIN video v ON uv.idVideo = v.id AND v.estado != 0
      WHERE uv.id = ?`, [id]);
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
      SELECT uv.*, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
      v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} uv
      INNER JOIN usuario u ON uv.idUsuario = u.id AND u.estado != 0
      INNER JOIN video v ON uv.idVideo = v.id AND v.estado != 0
      WHERE uv.idUsuario = ?`, [id]);
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

module.exports.getByIdVideo = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT uv.*, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
      v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} uv
      INNER JOIN usuario u ON uv.idUsuario = u.id AND u.estado != 0
      INNER JOIN video v ON uv.idVideo = v.id AND v.estado != 0
      WHERE uv.idVideo = ?`, [id]);
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

module.exports.getByIdUsuarioIdVideo = async(req, res, next) => {
  
  try {
    const idUsuario = req.params.idUsuario;
    const idVideo = req.params.idVideo;
    if (!idUsuario || !idVideo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT uv.*, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
      v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} uv
      INNER JOIN usuario u ON uv.idUsuario = u.id AND u.estado != 0
      INNER JOIN video v ON uv.idVideo = v.id AND v.estado != 0
      WHERE uv.idUsuario = ? AND uv.idVideo = ?`, [idUsuario, idVideo]);
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



module.exports.crear = async (req, res, next) => {
  try {
    const datos = req.body;

    let crearDatos = {
        idUsuario: datos.idUsuario,
        idVideo: datos.idVideo,
        progreso: datos.progreso ?? '0.00',
        fechaEmpezado: datos.fechaEmpezado ?? null, 
        fechaCompletado: datos.fechaCompletado ?? null
    }

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    if (data) {
      update_usuario_modulo_progreso(crearDatos.idUsuario, null, crearDatos.idVideo);

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
        idVideo: datos.idVideo,
        progreso: datos.progreso ?? '0.00',
        fechaEmpezado: datos.fechaEmpezado ?? null, 
        fechaCompletado: datos.fechaCompletado ?? null
    }

    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE id = ?`, [actualizarDatos, id]);
    if (data) {
      update_usuario_modulo_progreso(actualizarDatos.idUsuario, null, actualizarDatos.idVideo);

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

module.exports.borrar = async (req, res, next) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(404).send({
          success: false,
          message: 'Id inválido',
        });
      }
  
      await db.query(`DELETE FROM ${nombreTabla} WHERE id = ?`, [id]);

      res.status(201).json({
          status: true,
          message: `${nombreTabla} borrado`
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: `Error en borrar ${nombreTabla}`,
        error: error
      });
    }
};