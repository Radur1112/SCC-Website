const db = require('../utils/db.js');

var nombreTabla = 'foro';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT f.*,
        u.nombre AS usuarioNombre,
        tf.descripcion AS tipoForoDescripcion,
        COUNT(ufrr.id) AS cantRespuestas,
        (
          SELECT 
            JSON_OBJECT(
              'usuarioNombre', u23.nombre,
              'fecha', urf.fechaCreado
            )
          FROM usuariofororespuesta urf
          LEFT JOIN usuario u23 ON u23.id = urf.idUsuario
          WHERE urf.idForo = f.id
          ORDER BY urf.fechaCreado DESC
          LIMIT 1
        ) AS respuestaForo
      FROM ${nombreTabla} f
      INNER JOIN usuario u ON u.id = f.idUsuario
      INNER JOIN tipoforo tf ON tf.id = f.idTipoForo
      LEFT JOIN usuariofororespuesta ufrr ON ufrr.idForo = f.id
      WHERE f.estado != 0
      GROUP BY f.id
      ORDER BY f.fechaCreado DESC`);
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
      SELECT f.*,
        u.nombre AS usuarioNombre,
        tf.descripcion AS tipoForoDescripcion,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', fa.id,
                'ubicacion', fa.ubicacion
              )
            )
          FROM foroarchivo fa
          WHERE fa.idForo = f.id
        ) AS archivos,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', fr.id,
                'descripcion', fr.descripcion,
                'cantRespuestas', (
                  SELECT COALESCE(COUNT(ufr.id), 0)
                  FROM usuariofororespuesta ufr
                  WHERE ufr.idForoRespuesta = fr.id
                )
              )
            )
          FROM fororespuesta fr
          WHERE fr.idForo = f.id
        ) AS respuestas
      FROM ${nombreTabla} f
      INNER JOIN usuario u ON u.id = f.idUsuario
      INNER JOIN tipoforo tf ON tf.id = f.idTipoForo
      WHERE f.estado != 0 AND f.id = ?
      GROUP BY f.id`, [id]);
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

module.exports.crear = async (req, res, next) => {
  try {
    const datos = req.body;
    
    let crearDatos = {
        idTipoForo: datos.idTipoForo,
        idUsuario: datos.idUsuario,
        titulo: datos.titulo,
        descripcion: datos.descripcion
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
      let crearDatos = {
        idForo: datos.idForo,
        ubicacion: `${req.protocol}://${req.get('host')}/${archivo.path.replace(/\\/g, '/')}`
      }

      const data = await db.query(`INSERT INTO foroarchivo SET ?`, [crearDatos]);
      return data[0];
    });

    Promise.all(archivosPromises)
      .then((results) => {
        res.status(201).json({
          success: true,
          message: "Foro archivos creados",
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

module.exports.crearRespuestas = async (req, res, next) => {
  try {
    const datos = req.body;

    const respuestasPromises = datos.respuestas.map(async (dato) => {
      let crearDatos = {
        idForo: datos.idForo,
        descripcion: dato.descripcion ?? dato.respuesta
      }

      const data = await db.query(`INSERT INTO fororespuesta SET ?`, [crearDatos]);
      return data[0];
    });

    Promise.all(respuestasPromises)
      .then((results) => {
        res.status(201).json({
          success: true,
          message: `${nombreTabla} creados`,
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
        idTipoForo: datos.idTipoForo,
        idUsuario: datos.idUsuario,
        titulo: datos.titulo,
        descripcion: datos.descripcion
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

    await db.query(`UPDATE ${nombreTabla} SET estado = 0 WHERE id = ?`, [id]);
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

/*
module.exports.crearConArchivos = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const datos = req.body;
    const archivos = req.files;
    
    let crearDatos = {
      idTipoForo: datos.idTipoForo,
      idUsuario: datos.idUsuario,
      titulo: datos.titulo,
      descripcion: datos.descripcion
    }

    const [data] = await connection.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    const idForo = data.insertId;


    const archivosPromises = archivos.map((archivo) => {
      const crearArchivoDatos = {
        idForo,
        ubicacion: `${req.protocol}://${req.get('host')}/${archivo.path.replace(/\\/g, '/')}`,
      };

      return connection.query(`INSERT INTO foroarchivo SET ?`, [crearArchivoDatos]);
    });

    
    const respuestas = JSON.parse(datos.respuestas);

    const respuestasPromises = respuestas.map(async (dato) => {
      const crearRespuestaDatos = {
        idForo,
        descripcion: dato.descripcion ?? dato.respuesta
      }

      return connection.query(`INSERT INTO fororespuesta SET ?`, [crearRespuestaDatos]);
    });

    
    await Promise.all([archivosPromises, respuestasPromises]);

    await connection.commit();

    res.status(201).json({
      status: true,
      message: `${nombreTabla} y archivos creados`,
      data: { idForo },
    });
  } catch (error) {
    await connection.rollback();

    console.error(error);
    res.status(500).send({
      success: false,
      message: `Error en registrar ${nombreTabla}`,
      error: error.message,
    });
  } finally {
    connection.release();
  }
};
*/