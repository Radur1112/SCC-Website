const db = require('../utils/db.js');

var nombreTabla = 'modulo';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado != 0`);
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
    const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado != 0 AND id = ?`, [id]);
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

module.exports.getReporte = async(req, res, next) => {
  try {
    const [modulos, usuarios] = await Promise.all([
        db.query(`
          SELECT 
            m.titulo, 
            (
              SELECT
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'identificacion', u.identificacion,
                    'nombre', u.nombre,
                    'progreso', um.progreso,
                    'videos', 
                    (
                      SELECT
                        JSON_ARRAYAGG(
                          JSON_OBJECT(
                            'titulo', v.titulo,
                            'requerido', v.requerido,
                            'progreso', uv.progreso
                          )
                        )
                      FROM video v
                      LEFT JOIN usuariovideo uv ON v.id = uv.idVideo AND uv.idUsuario = u.id
                      INNER JOIN modulovideo mv ON mv.idModulo = m.id AND mv.idVideo = v.id
                      WHERE v.estado != 0
                    ),
                    'quizzes', 
                    (
                      SELECT
                        JSON_ARRAYAGG(
                          JSON_OBJECT(
                            'id', uq.id,
                            'titulo', q.titulo,
                            'fecha', uq.fecha,
                            'nota', uq.nota,
                            'sumPuntos', qp.sumPuntos
                          )
                        )
                      FROM quiz q
                      LEFT JOIN usuarioquiz uq ON q.id = uq.idQuiz AND uq.idUsuario = u.id
                      LEFT JOIN (
                        SELECT idQuiz, SUM(puntos) AS sumPuntos
                        FROM quizpregunta
                        WHERE estado != 0
                        GROUP BY idQuiz
                      ) qp ON qp.idQuiz = q.id
                      WHERE q.idModulo = m.id AND q.estado != 0
                    )
                  )
                )
              FROM usuariomodulo um
              INNER JOIN usuario u ON u.id = um.idUsuario AND u.estado != 0 AND u.id != 1
              WHERE um.idModulo = m.id
            ) AS usuarios
          FROM modulo m
          WHERE m.estado != 0
          ORDER BY m.id`),
        db.query(`
          SELECT 
            u.nombre, u.identificacion, (um2.sumProgreso / um2.cantModulos) AS progresoTotal,
            (
              SELECT
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'titulo', m.titulo,
                    'progreso', um.progreso,
                    'videos', 
                    (
                      SELECT
                        JSON_ARRAYAGG(
                          JSON_OBJECT(
                            'titulo', v.titulo,
                            'requerido', v.requerido,
                            'progreso', uv.progreso
                          )
                        )
                      FROM video v
                      LEFT JOIN usuariovideo uv ON v.id = uv.idVideo AND uv.idUsuario = u.id
                      INNER JOIN modulovideo mv ON mv.idModulo = m.id AND mv.idVideo = v.id
                      WHERE v.estado != 0
                    ),
                    'quizzes', 
                    (
                      SELECT
                        JSON_ARRAYAGG(
                          JSON_OBJECT(
                            'id', uq.id,
                            'titulo', q.titulo,
                            'fecha', uq.fecha,
                            'nota', uq.nota,
                            'sumPuntos', qp.sumPuntos
                          )
                        )
                      FROM quiz q
                      LEFT JOIN usuarioquiz uq ON q.id = uq.idQuiz AND uq.idUsuario = u.id
                      LEFT JOIN (
                        SELECT idQuiz, SUM(puntos) AS sumPuntos
                        FROM quizpregunta
                        WHERE estado != 0
                        GROUP BY idQuiz
                      ) qp ON qp.idQuiz = q.id
                      WHERE q.idModulo = m.id AND q.estado != 0
                    )
                  )
                )
              FROM usuariomodulo um
              INNER JOIN modulo m ON m.id = um.idModulo AND m.estado != 0
              WHERE um.idUsuario = u.id
            ) AS modulos
          FROM usuario u
          LEFT JOIN (
            SELECT idUsuario, SUM(um.progreso) AS sumProgreso, COUNT(um.progreso) AS cantModulos
            FROM usuariomodulo um
            INNER JOIN modulo m ON m.id = um.idModulo AND m.estado != 0
            GROUP BY idUsuario
          ) um2 ON um2.idUsuario = u.id
          WHERE u.estado != 0 AND u.id != 1`)
    ]);

    res.status(200).send({
      success: true,
      message: 'Datos obtenidos correctamente',
      data: {
        modulos: modulos[0], 
        usuarios: usuarios[0]
      }
    });
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
