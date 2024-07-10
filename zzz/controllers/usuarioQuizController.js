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
        SELECT uq.*, 
        u.nombre as usuarioNombre, u.identificacion as usuarioIdentificacion, 
        q.titulo as quizTitulo, q.descripcion as quizDescripcion 
        FROM ${nombreTabla} uq
        INNER JOIN usuario u ON uq.idUsuario = u.id AND u.estado != 0
        INNER JOIN quiz q ON uq.idQuiz = q.id AND q.estado != 0 
        WHERE uq.id = ?`, [id]);
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

module.exports.crear = async (req, res, next) => {
  try {
    const datos = req.body;

    let crearDatos = {
        idUsuario: datos.idUsuario,
        idQuiz: datos.idQuiz,
        nota: datos.nota,
        fecha: datos.fecha
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