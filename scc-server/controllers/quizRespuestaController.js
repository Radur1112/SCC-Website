const db = require('../utils/db.js');
const fs = require('fs');
const path = require('path');

const { update_usuarioQuiz_after_quizes } = require('../utils/triggers.js');

var nombreTabla = 'quizrespuesta';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT r.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen 
      FROM ${nombreTabla} r
      INNER JOIN quizpregunta p ON r.idQuizPregunta = p.id AND p.estado != 0
      WHERE r.estado != 0`);
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
      SELECT r.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen 
      FROM ${nombreTabla} r
      INNER JOIN quizpregunta p ON r.idQuizPregunta = p.id AND p.estado != 0
        WHERE r.estado != 0 AND r.id = ?`, [id]);
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

module.exports.getByIdPregunta = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT r.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen 
      FROM ${nombreTabla} r
      INNER JOIN quizpregunta p ON r.idQuizPregunta = p.id AND p.estado != 0
        WHERE r.estado != 0 AND r.idPregunta = ?`, [id]);
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
        idQuizPregunta: datos.idQuizPregunta,
        descripcion: datos.descripcion,
        correcta: datos.correcta
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

module.exports.saveMultiples = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;
    const respuestasIds = [];
    const quizesIds = [];

    for (const respuesta of datos) {
      let idQuizRespuesta;
      if (!respuesta.id) {
        const respuestaQuery = `INSERT INTO ${nombreTabla} (idQuizPregunta, descripcion, correcta, orden) VALUES (?, ?, ?, ?)`;
        const [respuestaData] = await connection.query(respuestaQuery, [respuesta.idQuizPregunta, respuesta.descripcion.trim(), respuesta.correcta, respuesta.indexRespuesta]);
        idQuizRespuesta = respuestaData.insertId;
      } else {
        const respuestaQuery = `UPDATE ${nombreTabla} SET idQuizPregunta = ?, descripcion = ?, correcta = ?, orden = ? WHERE id = ?`;
        await connection.query(respuestaQuery, [respuesta.idQuizPregunta, respuesta.descripcion.trim(), respuesta.correcta, respuesta.indexRespuesta, respuesta.id]);
        idQuizRespuesta = respuesta.id;
      }
      respuestasIds.push({ id: idQuizRespuesta, indexQuiz: respuesta.indexQuiz , indexPregunta: respuesta.indexPregunta , indexRespuesta: respuesta.indexRespuesta });

      if (!quizesIds.includes(respuesta.idQuiz)) {
        quizesIds.push(respuesta.idQuiz);
      }
    }

    await connection.commit();


    for (const idQuiz of quizesIds) {
      update_usuarioQuiz_after_quizes(idQuiz);
    }

    res.status(201).json({
      status: true,
      message: `${nombreTabla} actualizado`,
      respuestasIds: respuestasIds
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);

    res.status(500).send({
      success: false,
      message: `Error en registrar ${nombreTabla}`,
      error: error
    })
  } finally {
    connection.release();
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
        idQuizPregunta: datos.idQuizPregunta,
        descripcion: datos.descripcion,
        correcta: datos.correcta
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

module.exports.actualizarImagenes = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    let ids = req.body.id;
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    const files = req.files;


    files.forEach(async (file, index) => {
      const [quizRespuesta] = await db.query(`SELECT * FROM ${nombreTabla} WHERE id = ?`, [ids[index]]);
      if (quizRespuesta[0].imagen) {
        const folderPath = path.join(__dirname, `../${file.destination}`);
        const fileToKeep = path.basename(file.filename);

        deleteFilesExceptOne(folderPath, fileToKeep);
      }


      const preHost = `${req.protocol}://${req.get('host')}`;
      const host = !preHost.includes('localhost') ? `${preHost.slice(0, 4)}s${preHost.slice(4)}/api` : preHost;
      
      const imagen = `${host}/${file.path.replace(/\\/g, '/')}`
  
      await db.query(`UPDATE ${nombreTabla} SET imagen = ? WHERE id = ?`, [imagen, ids[index]]);
    });

    await connection.commit();

    res.status(201).json({
      status: true,
      message: `${nombreTabla} actualizado`
    });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).send({
      success: false,
      message: `Error en actualizar ${nombreTabla}`,
      error: error
    });
  } finally {
    connection.release();
  }
};

async function deleteFilesExceptOne(folderPath, fileToKeep) {
  try {
    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      if (file !== fileToKeep) {
        const filePath = path.join(folderPath, file);
        fs.unlinkSync(filePath);
      }
    });
  } catch (err) {
    console.error('Error deleting files:', err);
  }
};

module.exports.borrarMultiples = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;
    const quizesIds = [];

    for (let ids of datos) {
      await db.query(`UPDATE ${nombreTabla} SET estado = 0 WHERE id = ?`, [ids.id]);
      
      const folderPath = path.join(__dirname, `../uploads/quiz/${ids.idQuiz}/pregunta/${ids.idQuizPregunta}/respuesta/${ids.id}`);
      deleteFilesInFolder(folderPath);

      if (!quizesIds.includes(ids.idQuiz)) {
        quizesIds.push(ids.idQuiz);
      }
    }

    await connection.commit();

    for (const idQuiz of quizesIds) {
      update_usuarioQuiz_after_quizes(idQuiz);
    }

    res.status(201).json({
      status: true,
      message: `${nombreTabla} borrado`
    });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).send({
      success: false,
      message: `Error en borrar ${nombreTabla}`,
      error: error
    });
  } finally {
    connection.release();
  }
};

module.exports.borrarImagenes = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;

    for (let ids of datos) {
      await db.query(`UPDATE ${nombreTabla} SET imagen = NULL WHERE id = ?`, [ids.id]);
      
      const folderPath = path.join(__dirname, `../uploads/quiz/${ids.idQuiz}/pregunta/${ids.idQuizPregunta}/respuesta/${ids.id}`);
      deleteFilesInFolder(folderPath);
    }

    await connection.commit();

    res.status(201).json({
      status: true,
      message: `${nombreTabla} imagen borrado`
    });
  } catch (error) {
    console.log(error);
    await connection.rollback();
    res.status(500).send({
      success: false,
      message: `Error en borrar imagen ${nombreTabla}`,
      error: error
    });
  } finally {
    connection.release();
  }
};

function deleteFilesInFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Unable to scan directory: ${err}`);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error(`Unable to stat file: ${err}`);
          return;
        }
        if (stat.isFile()) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Unable to delete file: ${err}`);
            } else {
            }
          });
        }
      });
    });
  });
}