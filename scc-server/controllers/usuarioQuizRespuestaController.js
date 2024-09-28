const db = require('../utils/db.js');

const { update_usuarioQuiz_after_respuestas } = require('../utils/triggers.js');

var nombreTabla = 'usuarioquizrespuesta';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ur.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen, 
      r.descripcion as quizRespuestaDescripcion, r.correcta as quizRespuestaCorrecta, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion 
      FROM ${nombreTabla} ur
      INNER JOIN usuarioquiz uq ON ur.idUsuarioQuiz = uq.id 
      INNER JOIN quizpregunta p ON ur.idquizPregunta = p.id AND p.estado != 0 
      INNER JOIN quizqespuesta r ON ur.idquizRespuesta = r.id AND r.estado != 0 
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
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
      SELECT ur.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen, 
      r.descripcion as quizRespuestaDescripcion, r.correcta as quizRespuestaCorrecta, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion 
      FROM ${nombreTabla} ur
      INNER JOIN usuarioquiz uq ON ur.idUsuarioQuiz = uq.id 
      INNER JOIN quizpregunta p ON ur.idquizPregunta = p.id AND p.estado != 0 
      INNER JOIN quizrespuesta r ON ur.idquizRespuesta = r.id AND r.estado != 0 
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        WHERE ur.id = ?`, [id]);
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

module.exports.getByIdUsuarioQuiz = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT ur.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen, 
      r.descripcion as quizRespuestaDescripcion, r.correcta as quizRespuestaCorrecta, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion 
      FROM ${nombreTabla} ur
      INNER JOIN usuarioquiz uq ON ur.idUsuarioQuiz = uq.id 
      INNER JOIN quizpregunta p ON ur.idquizPregunta = p.id AND p.estado != 0 
      INNER JOIN quizrespuesta r ON ur.idquizRespuesta = r.id AND r.estado != 0 
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        WHERE ur.idUsuarioQuiz = ?`, [id]);
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
      SELECT ur.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen, 
      r.descripcion as quizRespuestaDescripcion, r.correcta as quizRespuestaCorrecta, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion 
      FROM ${nombreTabla} ur
      INNER JOIN usuarioquiz uq ON ur.idUsuarioQuiz = uq.id 
      INNER JOIN quizpregunta p ON ur.idquizPregunta = p.id AND p.estado != 0 
      INNER JOIN quizrespuesta r ON ur.idquizRespuesta = r.id AND r.estado != 0 
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
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
      SELECT ur.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen, 
      r.descripcion as quizRespuestaDescripcion, r.correcta as quizRespuestaCorrecta, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion 
      FROM ${nombreTabla} ur
      INNER JOIN usuarioquiz uq ON ur.idUsuarioQuiz = uq.id 
      INNER JOIN quizpregunta p ON ur.idquizPregunta = p.id AND p.estado != 0 
      INNER JOIN quizrespuesta r ON ur.idquizRespuesta = r.id AND r.estado != 0 
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        WHERE ur.idPregunta = ?`, [id]);
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

module.exports.getByIdRespuesta = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    
    const data = await db.query(`
      SELECT ur.*, 
      p.idTipoPregunta as quizPreguntaIdTipoPregunta, p.descripcion as quizPreguntaDescripcion, p.imagen as quizPreguntaImagen, 
      r.descripcion as quizRespuestaDescripcion, r.correcta as quizRespuestaCorrecta, 
      u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion 
      FROM ${nombreTabla} ur
      INNER JOIN usuarioquiz uq ON ur.idUsuarioQuiz = uq.id 
      INNER JOIN quizpregunta p ON ur.idquizPregunta = p.id AND p.estado != 0 
      INNER JOIN quizrespuesta r ON ur.idquizRespuesta = r.id AND r.estado != 0 
      INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        WHERE ur.idRespuesta = ?`, [id]);
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
        idUsuarioQuiz: datos.idUsuarioQuiz,
        idQuizPregunta: datos.idQuizPregunta,
        idQuizRespuesta: datos.idQuizRespuesta,
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
    res.status(500).send({
    success: false,
    message: `Error en registrar ${nombreTabla}`,
    error: error
    })
  }
};

module.exports.crearMultiples = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const datos = req.body;

    if (!Array.isArray(datos) || datos.length === 0) {
      throw new Error('Invalid input: datos should be a non-empty array');
    }
  
    const usrQuery = `INSERT INTO ${nombreTabla} (idUsuarioQuiz, idQuizPregunta, idQuizRespuesta, descripcion) VALUES (?, ?, ?, ?)`;
    
    for (const respuesta of datos) {
      if (!respuesta.idUsuarioQuiz || !respuesta.idQuizPregunta) {
        throw new Error('Invalid respuesta: idUsuarioQuiz and idQuizPregunta are required');
      }
  
      await connection.query(usrQuery, [
        respuesta.idUsuarioQuiz,
        respuesta.idQuizPregunta,
        respuesta.idQuizRespuesta ?? null,
        respuesta.descripcion ? respuesta.descripcion.trim() : null
      ]);
    }
  
    await connection.query(`UPDATE usuarioquiz SET fecha = NOW() WHERE id = ?`, [datos[0].idUsuarioQuiz])

    await connection.commit();

    await update_usuarioQuiz_after_respuestas(datos[0].idUsuarioQuiz);

    res.status(201).json({
      status: true,
      message: `${nombreTabla} creados`
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
        idUsuarioQuiz: datos.idUsuarioQuiz,
        idQuizPregunta: datos.idQuizPregunta,
        idQuizRespuesta: datos.idQuizRespuesta,
        descripcion: datos.descripcion ?? null
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