const db = require('../utils/db.js');

var nombreTabla = 'quiz';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT q.*, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion
      FROM ${nombreTabla} q
      INNER JOIN modulo m ON q.idModulo = m.id AND m.estado != 0
      WHERE q.estado != 0`);
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
      SELECT q.*,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', qp.id,
                'idQuiz', qp.idQuiz,
                'idTipoPregunta', qp.idTipoPregunta,
                'tipoPreguntaDescripcion', tp.descripcion,
                'descripcion', qp.descripcion,
                'orden', qp.orden,
                'imagen', qp.imagen
                'respuestas', (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'id', qr.id,
                        'idQuizPregunta', qr.idQuizPregunta,
                        'descripcion', qr.descripcion,
                        'orden', qr.orden,
                        'imagen', qr.imagen
                      )
                    )
                  FROM quizrespuesta qr
                  WHERE qr.idQuizPregunta = qp.id AND qr.estado != 0
                  ORDER BY qr.orden
                )   
              )
            )
          FROM quizpregunta qp
          INNER JOIN tipopregunta tp ON tp.id = qp.idTipoPregunta
          WHERE qp.idQuiz = q.id AND qp.estado != 0
          ORDER BY qp.orden
        ) AS preguntas
      FROM ${nombreTabla} q
      WHERE q.estado != 0 AND q.id = ?`, [id]);
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
      SELECT q.*, 
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', qp.id,
                'idQuiz', qp.idQuiz,
                'idTipoPregunta', qp.idTipoPregunta,
                'tipoPreguntaDescripcion', tp.descripcion,
                'descripcion', qp.descripcion,
                'puntos', qp.puntos,
                'orden', qp.orden,
                'imagen', qp.imagen,
                'respuestas', (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'id', qr.id,
                        'idQuizPregunta', qr.idQuizPregunta,
                        'descripcion', qr.descripcion,
                        'correcta', qr.correcta,
                        'orden', qr.orden,
                        'imagen', qr.imagen
                      )
                    )
                  FROM quizrespuesta qr
                  WHERE qr.idQuizPregunta = qp.id AND qr.estado != 0
                )   
              )
            )
          FROM quizpregunta qp
          INNER JOIN tipopregunta tp ON tp.id = qp.idTipoPregunta
          WHERE qp.idQuiz = q.id AND qp.estado != 0
        ) AS preguntas
      FROM ${nombreTabla} q
      INNER JOIN modulo m ON q.idModulo = m.id AND m.estado != 0
      WHERE q.estado != 0 AND q.idModulo = ?`, [id]);
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

module.exports.getByIds = async(req, res, next) => {
  try {
    let idUsuario = parseInt(req.params.idUsuario);
    let idModulo = parseInt(req.params.idModulo);
    if (!idUsuario || !idModulo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT 
      q.*, 
      uq.nota, uq.fecha,
      COUNT(qp.id)
      FROM quiz q
      LEFT JOIN quizpregunta qp ON qp.idQuiz = q.id AND qp.estado != 0
      LEFT JOIN usuarioquiz uq ON q.id = uq.idQuiz AND uq.idUsuario = ?
      WHERE q.estado != 0 AND q.idModulo = ?`, [idUsuario, idModulo]);
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
    const quizzesIds = [];
    
    for (const quiz of datos) {
      let idQuiz;
      if (!quiz.id) {
        const quizQuery = `INSERT INTO ${nombreTabla} (idModulo, titulo, descripcion) VALUES (?, ?, ?)`;
        const [quizData] = await connection.query(quizQuery, [quiz.idModulo, quiz.titulo.trim(), quiz.descripcion.trim()]);
        idQuiz = quizData.insertId;
      } else {
        const quizQuery = `UPDATE ${nombreTabla} SET idModulo = ?, titulo = ?, descripcion = ? WHERE id = ?`;
        await connection.query(quizQuery, [quiz.idModulo, quiz.titulo.trim(), quiz.descripcion.trim(), quiz.id]);
        idQuiz = quiz.id;
      }
      quizzesIds.push({ id: idQuiz, indexQuiz: quiz.indexQuiz });
    }

    await connection.commit();

    res.status(201).json({
      status: true,
      message: `${nombreTabla} actualizado`,
      quizzesIds: quizzesIds
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
        idModulo: datos.idModulo,
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
    const data = await db.query(`UPDATE ${nombreTabla} SET estado = 0 WHERE id = ?`, [id]);
    if (data) {
      res.status(201).json({
          status: true,
          message: `${nombreTabla} borrado`
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Error en borrar',
      });
    }
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
  try {
    const datos = req.body;

    const data = await db.query(`UPDATE ${nombreTabla} SET estado = 0 WHERE id IN (?)`, [datos]);
    if (data) {
      res.status(201).json({
          status: true,
          message: `${nombreTabla} borrado`
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Error en borrar',
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Error en borrar ${nombreTabla}`,
      error: error
    });
  }
};
