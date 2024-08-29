const db = require('../utils/db.js');

var nombreTabla = 'usuarioquiz';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT uq.*, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
      q.titulo as quizTitulo, q.descripcion as quizDescripcion 
      FROM ${nombreTabla} uq
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
      INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
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
        SELECT uq.*, q.titulo, q.descripcion, q.idModulo, COALESCE(SUM(qp2.puntos), 0) AS sumPuntos, u.nombre,
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
                  ORDER BY qr.orden
                ),
                'respondidas', (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'idQuizRespuesta', uqr.idQuizRespuesta,
                        'descripcion', uqr.descripcion,
                        'correcta', qr2.correcta
                      )
                    )
                  FROM usuarioquizrespuesta uqr
                  LEFT JOIN quizrespuesta qr2 ON qr2.id = uqr.idQuizRespuesta AND qr2.estado != 0
                  WHERE uqr.idUsuarioQuiz = uq.id AND uqr.idQuizPregunta = qp.id
                )
              )
            )
          FROM quizpregunta qp
          INNER JOIN tipopregunta tp ON tp.id = qp.idTipoPregunta
          WHERE qp.idQuiz = q.id AND qp.estado != 0
          ORDER BY qp.orden
        ) AS preguntas
        FROM ${nombreTabla} uq
        INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
        LEFT JOIN quizPregunta qp2 ON qp2.idQuiz = q.id AND qp2.estado != 0
        WHERE uq.id = ?
        GROUP BY uq.id, q.titulo, q.descripcion, q.idModulo;`, [id]);
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
        SELECT uq.*, 
        u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
        q.titulo as quizTitulo, q.descripcion as quizDescripcion 
        FROM ${nombreTabla} uq
        INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
        WHERE uq.idUsuario = ?`, [id]);
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
        SELECT uq.*, 
        u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
        q.titulo as quizTitulo, q.descripcion as quizDescripcion 
        FROM ${nombreTabla} uq
        INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
        WHERE uq.idQuiz = ?`, [id]);
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
    let idQuiz = parseInt(req.params.idQuiz);
    if (!idUsuario || !idQuiz) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
        SELECT uq.*, 
        q.titulo as quizTitulo, q.descripcion as quizDescripcion 
        FROM ${nombreTabla} uq
        INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
        WHERE uq.idUsuario = ? AND uq.idQuiz = ?`, [idUsuario, idQuiz]);
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

module.exports.getAllByIds = async(req, res, next) => {
  try {
    let idUsuario = parseInt(req.params.idUsuario);
    let idQuiz = parseInt(req.params.idQuiz);
    if (!idUsuario || !idQuiz) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
        SELECT uq.*, q.titulo, q.descripcion, q.idModulo, COALESCE(SUM(qp2.puntos), 0) AS sumPuntos,
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
                  ORDER BY qr.orden
                ),
                'respondidas', (
                  SELECT 
                    JSON_ARRAYAGG(
                      JSON_OBJECT(
                        'idQuizRespuesta', uqr.idQuizRespuesta,
                        'descripcion', uqr.descripcion,
                        'correcta', qr2.correcta
                      )
                    )
                  FROM usuarioquizrespuesta uqr
                  LEFT JOIN quizrespuesta qr2 ON qr2.id = uqr.idQuizRespuesta AND qr2.estado != 0
                  WHERE uqr.idUsuarioQuiz = uq.id AND uqr.idQuizPregunta = qp.id
                )
              )
            )
          FROM quizpregunta qp
          INNER JOIN tipopregunta tp ON tp.id = qp.idTipoPregunta
          WHERE qp.idQuiz = q.id AND qp.estado != 0
          ORDER BY qp.orden
        ) AS preguntas
        FROM ${nombreTabla} uq
        INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
        LEFT JOIN quizPregunta qp2 ON qp2.idQuiz = q.id AND qp2.estado != 0
        WHERE uq.idUsuario = ? AND uq.idQuiz = ?
        GROUP BY uq.id, q.titulo, q.descripcion, q.idModulo;`, [idUsuario, idQuiz]);
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
        idQuiz: datos.idQuiz,
        nota: datos.nota
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
    console.log(error);
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
  }
};

module.exports.crearVacio = async (req, res, next) => {
  try {
    const datos = req.body;

    let crearDatos = {
      idUsuario: datos.idUsuario,
      idQuiz: datos.idQuiz
    }

    const [existente] = await db.query(`SELECT * FROM ${nombreTabla} WHERE idUsuario = ? AND idQuiz = ?`, [crearDatos.idUsuario, crearDatos.idQuiz]);
    if (!existente || existente.length === 0) {
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
    } else {
      res.status(201).json({
          status: true,
          message: `${nombreTabla} creado`
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
        idQuiz: datos.idQuiz,
        nota: datos.nota,
        fecha: datos.fecha
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