const db = require('../utils/db.js');

var nombreTabla = 'usuariomodulo';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT um.*, 
      u.id as usuarioId, u.identificacion as usuarioIdentificacion, u.nombre as usuarioNombre, u.correo as usuarioCorreo, p.descripcion as usuarioPuesto, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion 
      FROM ${nombreTabla} um
      INNER JOIN usuario u ON um.idUsuario = u.id AND u.estado != 0
      INNER JOIN modulo m ON um.idModulo = m.id AND m.estado != 0 
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
      SELECT um.*, 
      u.id as usuarioId, u.identificacion as usuarioIdentificacion, u.nombre as usuarioNombre, u.correo as usuarioCorreo, p.descripcion as usuarioPuesto, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion 
      FROM ${nombreTabla} um
      INNER JOIN usuario u ON um.idUsuario = u.id AND u.estado != 0
      INNER JOIN puesto p ON p.id = u.idPuesto 
      INNER JOIN modulo m ON um.idModulo = m.id AND m.estado != 0 
      WHERE um.id = ?`, [id]);
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
      SELECT um.*, 
      u.id as usuarioId, u.identificacion as usuarioIdentificacion, u.nombre as usuarioNombre, u.correo as usuarioCorreo, p.descripcion as usuarioPuesto, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion 
      FROM ${nombreTabla} um
      INNER JOIN usuario u ON um.idUsuario = u.id AND u.estado != 0
      INNER JOIN puesto p ON p.id = u.idPuesto 
      INNER JOIN modulo m ON um.idModulo = m.id AND m.estado != 0 
      WHERE um.idUsuario = ?`, [id]);
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

module.exports.getByIdModulo = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT um.*, 
      u.id as usuarioId, u.identificacion as usuarioIdentificacion, u.nombre as usuarioNombre, u.correo as usuarioCorreo, p.descripcion as usuarioPuesto, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion 
      FROM ${nombreTabla} um
      INNER JOIN usuario u ON um.idUsuario = u.id AND u.estado != 0
      INNER JOIN puesto p ON p.id = u.idPuesto 
      INNER JOIN modulo m ON um.idModulo = m.id AND m.estado != 0 
      WHERE um.idModulo = ?`, [id]);
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

module.exports.getAllByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT um.*,
        m.titulo AS moduloTitulo, m.descripcion AS moduloDescripcion, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'nivel', mv.nivel,
            'videos', mv.videos
          )
        ) AS videosByModulo
      FROM ${nombreTabla} um
      INNER JOIN modulo m ON um.idModulo = m.id AND m.estado != 0 
      LEFT JOIN (
        SELECT mv.nivel, mv.idModulo, 
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'videoId', v.id , 'videoTitulo', v.titulo, 'videoDescripcion', v.descripcion, 'videoLink', v.link, 'videoFechaLimite', v.fechaLimite, 'videoRequerido', v.requerido, 'videoProgreso', uv.progreso
          )
        ) AS videos
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo AND uv.idUsuario = ?
        GROUP BY mv.nivel, mv.idModulo
      ) mv ON mv.idModulo = m.id
      WHERE um.idUsuario = ?
      GROUP BY um.id`, [id, id]);
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
        idModulo: datos.idModulo,
        progreso: datos.progreso,
        fechaEmpezado: datos.fechaEmpezado, 
        fechaCompletado: datos.fechaCompletado ?? null
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

module.exports.crearMultiples = async (req, res, next) => {
  try {
    const datos = req.body;

    if (!Array.isArray(datos.datos) || datos.datos.length === 0) {
      return res.status(400).send(`Datos inválidos para crear ${nombreTabla}`);
    }

    const query = `INSERT INTO ${nombreTabla} (idModulo, idUsuario) VALUES ?`
    const values = datos.datos.map(item => [datos.idModulo ?? datos.moduloId, item.idUsuario ?? item.usuarioId]);

    const data = await db.query(query, [values]);
    if (data) {
      res.status(201).json({
          status: true,
          message: `${nombreTabla} creados`,
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
        idModulo: datos.idModulo,
        progreso: datos.progreso,
        fechaEmpezado: datos.fechaEmpezado, 
        fechaCompletado: datos.fechaCompletado ?? null
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

module.exports.borrarMultiple = async (req, res, next) => {
  try {
    const datos = req.body;
    
    if (!Array.isArray(datos) || datos.length === 0) {
      return res.status(400).send(`Datos inválidos para borrar ${nombreTabla}`);
    }
    
    await db.query(`DELETE FROM ${nombreTabla} WHERE id IN (?)`, [datos]);
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