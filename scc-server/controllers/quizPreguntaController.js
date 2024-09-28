const db = require('../utils/db.js');
const fs = require('fs');
const path = require('path');

const { update_usuarioQuiz_after_quizes } = require('../utils/triggers.js');

var nombreTabla = 'quizpregunta';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
    SELECT p.*, 
    tp.descripcion as tipoPreguntaDescripcion, 
    q.titulo as quizTitulo, q.descripcion as quizDescripcion 
    FROM ${nombreTabla} p
    INNER JOIN tipopregunta tp ON p.idTipoPregunta = tp.id
    INNER JOIN quiz q ON p.idQuiz = q.id AND q.estado != 0
    WHERE p.estado != 0`);
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
        SELECT p.*, 
        tp.descripcion as tipoPreguntaDescripcion, 
        q.titulo as quizTitulo, q.descripcion as quizDescripcion 
        FROM ${nombreTabla} p
        INNER JOIN tipopregunta tp ON p.idTipoPregunta = tp.id
        INNER JOIN quiz q ON p.idQuiz = q.id AND q.estado != 0
        WHERE p.estado != 0 AND p.id = ?`, [id]);
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

module.exports.getByIdQuiz = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
        SELECT p.*, 
        tp.descripcion as tipoPreguntaDescripcion, 
        q.titulo as quizTitulo, q.descripcion as quizDescripcion 
        FROM ${nombreTabla} p
        INNER JOIN tipopregunta tp ON p.idTipoPregunta = tp.id
        INNER JOIN quiz q ON p.idQuiz = q.id AND q.estado != 0
        WHERE p.estado != 0 AND p.idQuiz = ?`, [id]);
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
        idQuiz: datos.idQuiz,
        idTipoPregunta: datos.idTipoPregunta,
        descripcion: datos.descripcion,
        imagen: datos.imagen ?? null
    }

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    if (data) {
      update_usuarioQuiz_after_quizes(crearDatos.idQuiz);
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
    const preguntasIds = [];
    const quizesIds = [];

    for (const pregunta of datos) {
      let idQuizPregunta;
      if (!pregunta.id) {
        const preguntaQuery = `INSERT INTO ${nombreTabla} (idQuiz, idTipoPregunta, descripcion, puntos, orden) VALUES (?, ?, ?, ?, ?)`;
        const [preguntaData] = await connection.query(preguntaQuery, [pregunta.idQuiz, pregunta.idTipoPregunta, pregunta.descripcion.trim(), pregunta.puntos ?? 0, pregunta.indexPregunta]);
        idQuizPregunta = preguntaData.insertId;
      } else {
        const preguntaQuery = `UPDATE ${nombreTabla} SET idQuiz = ?, idTipoPregunta = ?, descripcion = ?, puntos = ?, orden = ? WHERE id = ?`;
        await connection.query(preguntaQuery, [pregunta.idQuiz, pregunta.idTipoPregunta, pregunta.descripcion.trim(), pregunta.puntos ?? 0, pregunta.indexPregunta, pregunta.id]);
        idQuizPregunta = pregunta.id;
      }
      preguntasIds.push({ id: idQuizPregunta, indexQuiz: pregunta.indexQuiz , indexPregunta: pregunta.indexPregunta });
      
      if (!quizesIds.includes(pregunta.idQuiz)) {
        quizesIds.push(pregunta.idQuiz);
      }
    }

    await connection.commit();

    for (const idQuiz of quizesIds) {
      await update_usuarioQuiz_after_quizes(idQuiz);
    }
    res.status(201).json({
      status: true,
      message: `${nombreTabla} actualizado`,
      preguntasIds: preguntasIds
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
        idQuiz: datos.idQuiz,
        idTipoPregunta: datos.idTipoPregunta,
        descripcion: datos.descripcion,
        imagen: datos.imagen ?? null
    }

    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE id = ?`, [actualizarDatos, id]);
    if (data) {
      update_usuarioQuiz_after_quizes(actualizarDatos.idQuiz);
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
      const [quizPregunta] = await db.query(`SELECT * FROM ${nombreTabla} WHERE id = ?`, [ids[index]]);
      
      if (quizPregunta[0].imagen) {
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

module.exports.borrarMultiples = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;
    const quizesIds = [];

    for (let ids of datos) {
      await db.query(`UPDATE ${nombreTabla} SET estado = 0 WHERE id = ?`, [ids.id]);
      
      const folderPath = path.join(__dirname, `../uploads/quiz/${ids.idQuiz}/pregunta/${ids.id}`);
      deleteFilesInFolder(folderPath);

      if (!quizesIds.includes(ids.idQuiz)) {
        quizesIds.push(ids.idQuiz);
      }
    }

    await connection.commit();

    for (const idQuiz of quizesIds) {
      await update_usuarioQuiz_after_quizes(idQuiz);
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
      
      const folderPath = path.join(__dirname, `../uploads/quiz/${ids.idQuiz}/pregunta/${ids.id}`);
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