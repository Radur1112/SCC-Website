const db = require('../utils/db.js');

var nombreTabla = 'usuariofororespuesta';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
        SELECT ufr.*, 
        f.titulo as foroTitulo, f.descripcion as foroDescripcion, 
        u.nombre as usuarioNombre
        FROM ${nombreTabla} ufr
        INNER JOIN foro f ON f.id = ufr.idForo AND f.estado != 0
        INNER JOIN usuario u ON u.id = ufr.idUsuario AND u.estado != 0
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
      const id = req.params.id;
      if (!id) {
        return res.status(404).send({
          success: false,
          message: 'Id inválido',
        });
      }

    const data = await db.query(`
        SELECT ufr.*, 
        f.titulo as foroTitulo, f.descripcion as foroDescripcion, 
        u.nombre as usuarioNombre
        FROM ${nombreTabla} ufr
        INNER JOIN foro f ON f.id = ufr.idForo AND f.estado != 0
        INNER JOIN usuario u ON u.id = ufr.idUsuario AND u.estado != 0
        WHERE ufr.id = ?`, [id]);
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

module.exports.getByIdForo = async(req, res, next) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(404).send({
          success: false,
          message: 'Id inválido',
        });
      }

    const data = await db.query(`
        SELECT ufr.*, 
        u.nombre AS usuarioNombre,
        fr.descripcion AS respuesta
        FROM ${nombreTabla} ufr
        INNER JOIN usuario u ON u.id = ufr.idUsuario AND u.estado != 0
        LEFT JOIN fororespuesta fr ON fr.id = ufr.idForoRespuesta
        WHERE ufr.idForo = ?
        ORDER BY ufr.fechaCreado DESC`, [id]);
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
        idForo: datos.idForo,
        idUsuario: datos.idUsuario,
        idForoRespuesta: datos.idForoRespuesta ?? null,
        descripcion: datos.descripcion ?? null
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
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const datos = req.body;
    
    let actualizarDatos = {
        idForo: datos.idForo,
        idUsuario: datos.idUsuario,
        idForoRespuesta: datos.idForoRespuesta ?? null,
        descripcion: datos.descripcion ?? null
    }

    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE id = ?`, [actualizarDatos, id]);
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
