const db = require('../utils/db.js');

var nombreTabla = 'foro';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT f.*,
      u.nombre AS usuarioNombre,
      tf.descripcion AS tipoForoDescripcion,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ufr.id,
          'usuarioNombre', ufr.usuarioNombre,
          'descripcion', ufr.descripcion,
          'fecha', ufr.fechaCreado
        )
      ) AS respuestasForo,
      COUNT(ufr.usuarioNombre) AS cantRespuestas
      FROM ${nombreTabla} f
      INNER JOIN usuario u ON u.id = f.idUsuario
      INNER JOIN tipoforo tf ON tf.id = f.idTipoForo
      LEFT JOIN (
        SELECT ufr.id, ufr.idForo,
              u2.nombre AS usuarioNombre,
              ufr.descripcion,
              ufr.fechaCreado
          FROM usuariofororespuesta ufr
          LEFT JOIN usuario u2 ON u2.id = ufr.idUsuario
          ORDER BY ufr.fechaCreado DESC
      ) ufr ON ufr.idForo = f.id
      WHERE f.estado != 0
      GROUP BY f.id`);
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
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'id', ufr.id,
          'usuarioNombre', ufr.usuarioNombre,
          'descripcion', ufr.descripcion,
          'fecha', ufr.fechaCreado
        )
      ) AS respuestasForo,
      COUNT(ufr.usuarioNombre) AS cantRespuestas
      FROM ${nombreTabla} f
      INNER JOIN usuario u ON u.id = f.idUsuario
      INNER JOIN tipoforo tf ON tf.id = f.idTipoForo
      LEFT JOIN (
        SELECT ufr.id, ufr.idForo,
              u2.nombre AS usuarioNombre,
              ufr.descripcion,
              ufr.fechaCreado
          FROM usuariofororespuesta ufr
          LEFT JOIN usuario u2 ON u2.id = ufr.idUsuario
          ORDER BY ufr.fechaCreado DESC
      ) ufr ON ufr.idForo = f.id
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
        ubicacion: archivo.path
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


    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE Id = ?`, [actualizarDatos, id]);
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
