const db = require('../utils/db.js');

var nombreTabla = 'pregunta';

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
