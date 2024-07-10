const db = require('../utils/db.js');

var nombreTabla = 'modulovideo';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT mv.*, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion, 
      v.id as videoId, v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} mv
      INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
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
    const idModulo = req.params.idModulo;
    const idVideo = req.params.idVideo;
    if (!idModulo || !idVideo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
        SELECT mv.*, 
        m.titulo as moduloTitulo, m.descripcion as moduloDescripcion, 
        v.id as videoId, v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
        FROM ${nombreTabla} mv
        INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE mv.idModulo = ? AND mv.idVideo = ?`, [idModulo, idVideo]);
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

module.exports.getNiveles = async(req, res, next) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`SELECT DISTINCT nivel FROM ${nombreTabla} WHERE idModulo = ?`, [id]);
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
        SELECT mv.*, 
        m.titulo as moduloTitulo, m.descripcion as moduloDescripcion, 
        v.id as videoId, v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
        FROM ${nombreTabla} mv
        INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE mv.idModulo = ?`, [id]);
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

module.exports.getByIdModuloGroupByNivel = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
        SELECT mv.nivel, 
        JSON_ARRAYAGG(JSON_OBJECT(
        'moduloTitulo', m.titulo, 'moduloDescripcion', m.descripcion, 
        'videoId', v.id , 'videoTitulo', v.titulo, 'videoDescripcion', v.descripcion, 'videoLink', v.link, 'videoFechaLimite', v.fechaLimite, 'videoRequerido', v.requerido)) AS moduloVideos
        FROM ${nombreTabla} mv
        INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE mv.idModulo = ?
        GROUP BY mv.nivel`, [id]);
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
        SELECT mv.*, 
        m.titulo as moduloTitulo, m.descripcion as moduloDescripcion, 
        v.id as videoId, v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
        FROM ${nombreTabla} mv
        INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE mv.idVideo = ?`, [id]);
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
        idModulo: datos.idModulo,
        idVideo: datos.idVideo,
        nivel: datos.nivel ?? null
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

module.exports.actualizar = async (req, res, next) => {
  try {
    const idModulo = req.params.idModulo;
    const idVideo = req.params.idVideo;
    if (!idModulo || !idVideo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const datos = req.body;
    
    let actualizarDatos = {
        idModulo: datos.idModulo,
        idVideo: datos.idVideo,
        nivel: datos.nivel ?? null
    }

    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE idModulo = ? AND idVideo = ?`, [actualizarDatos, idModulo, idVideo]);
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

module.exports.borrar = async (req, res, next) => {
  try {
    const idModulo = req.params.idModulo;
    const idVideo = req.params.idVideo;
    if (!idModulo || !idVideo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    await db.query(`DELETE FROM ${nombreTabla} WHERE idModulo = ? AND idVideo = ?`, [idModulo, idVideo]);
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
