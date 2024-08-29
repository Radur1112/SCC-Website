const db = require('../utils/db.js');
const fs = require('fs');
const path = require('path');

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
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;
    const archivos = req.files;


    const archivosPromises = archivos.map(async (archivo) => {
      const preHost = `${req.protocol}://${req.get('host')}`;
      const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost

      let crearDatos = {
        idForo: id,
        ubicacion: `${host}/${archivo.path.replace(/\\/g, '/')}`
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
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;

    const respuestasPromises = datos.map(async (dato) => {
      let crearDatos = {
        idForo: id,
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

    const queryFields = Object.keys(actualizarDatos)
    .map(field => `${field} = ?`)
    .join(', ');

    const queryValues = Object.values(actualizarDatos);


    const data = await db.query(`UPDATE ${nombreTabla} SET ${queryFields} WHERE id = ?`, [...queryValues, id]);
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

module.exports.actualizarArchivos = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const datos = req.body;

    const borrarIds = datos.map(ab => ab.id);
    const borrarUbicaciones = datos.map(ab => ab.ubicacion);

    await connection.query(`DELETE FROM forohistorial WHERE idForo = ? AND idForoArchivo IN (?)`, [id, borrarIds]);
    await connection.query(`DELETE FROM foroarchivo WHERE idForo = ? AND id IN (?)`, [id, borrarIds]);


    for (let ubicacion of borrarUbicaciones) {
      const folderPath = path.join(__dirname, `..${getPathFromUrl(ubicacion)}`)

      deleteFile(folderPath, async (err) => {
        if (!err) {
          res.status(201).json({
            status: true,
            message: `${nombreTabla} actualizado`
          });
        }
      });
    }

    await connection.commit();

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error en actualizar ${nombreTabla}`,
      error: error
    });
  } finally {
    connection.release();
  }
};

module.exports.actualizarRespuestas = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const datos = req.body;

    if (datos.respuestasBorrarIds.length > 0) {
      await connection.query(`DELETE FROM usuariofororespuesta WHERE idForo = ? AND idForoRespuesta IN (?)`, [id, datos.respuestasBorrarIds]);
      await connection.query(`DELETE FROM fororespuesta WHERE idForo = ? AND id IN (?)`, [id, datos.respuestasBorrarIds]);
    }

    let results = [];
    if (datos.respuestasNuevas && datos.respuestasNuevas.length > 0) {
      for (const dato of datos.respuestasNuevas) {
        const crearDatos = {
          idForo: id,
          descripcion: dato.descripcion ?? dato.respuesta
        };
        const [result] = await connection.query(`INSERT INTO fororespuesta SET ?`, [crearDatos]);

        results.push(result);
      }
    }

    await connection.commit();

    res.status(201).json({
      status: true,
      message: `fororespuesta actualizados`
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error en actualizar ${nombreTabla}`,
      error: error
    });
  } finally {
    connection.release();
  }
};

function getPathFromUrl(url) {
  try {
    const urlObj = new URL(url);
    let path = urlObj.pathname;
    
    if (path.startsWith('/api')) {
      path = path.substring(4);
    }

    return path;
  } catch (error) {
    console.error('Invalid URL:', error);
    return null;
  }
}

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
    await db.query(`DELETE FROM forohistorial WHERE idForo = ?`, [id]);
    await db.query(`DELETE FROM foroarchivo WHERE idForo = ?`, [id]);

    const folderPath = path.join(__dirname, `../uploads/foro/${id}`);
    deleteFolderRecursive(folderPath);

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

function deleteFile(filePath, callback) {
  const decodedPath = decodeURIComponent(filePath);

  fs.unlink(decodedPath, (err) => {
    if (!err) {
      if (callback) callback(null);
    } else {
      console.error(`Error borrando ${decodedPath}:`, err);
      if (callback) callback(err);
    }
  });
}

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file, index) => {
      const curPath = path.join(folderPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(folderPath);
  }
}

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