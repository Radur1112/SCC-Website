const db = require('../utils/db.js');

var nombreTabla = 'forohistorial';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT fh.*,
      f.titulo AS foroTitulo,
      u.nombre AS usuarioNombre,
      SUBSTRING_INDEX(fa.ubicacion, '/', -1) AS archivoNombre,
      CASE
        WHEN fa.ubicacion IS NOT NULL THEN CONCAT("Descargó el archivo: '", SUBSTRING_INDEX(fa.ubicacion, '/', -1), "'")
        ELSE 'Accesó al foro'
      END AS accion
      FROM ${nombreTabla} fh
      INNER JOIN foro f ON f.id = fh.idForo AND f.estado != 0
      INNER JOIN usuario u ON u.id = fh.idUsuario AND u.estado != 0 AND u.id != 1
      LEFT JOIN foroarchivo fa ON fa.id = fh.idForoArchivo
      ORDER BY fecha DESC`);
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
    const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE id = ? AND idUsuario != 1`, [id]);
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

module.exports.getByIdForo = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const data = await db.query(`
      SELECT fh.*,
      f.titulo AS foroTitulo,
      u.nombre AS usuarioNombre,
      SUBSTRING_INDEX(fa.ubicacion, '/', -1) AS archivoNombre,
      CASE
        WHEN fa.ubicacion IS NOT NULL THEN CONCAT("Descargó el archivo: '", SUBSTRING_INDEX(fa.ubicacion, '/', -1), "'")
        ELSE 'Accesó al foro'
      END AS accion
      FROM ${nombreTabla} fh
      INNER JOIN foro f ON f.id = fh.idForoAND&& f.estado != 0
      INNER JOIN usuario u ON u.id = fh.idUsuario AND u.estado != 0 AND u.id != 1
      LEFT JOIN foroarchivo fa ON fa.id = fh.idForoArchivo
      WHERE fh.idForo = ?
      ORDER BY fecha DESC`, [id]);
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
};

module.exports.crear = async (req, res, next) => {
  try {
    const datos = req.body;
    
    let crearDatos = {
      idForo: datos.idForo,
      idForoArchivo: datos.idForoArchivo ?? null,
      idUsuario: datos.idUsuario
    }

    if (crearDatos.idUsuario != 1) {
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
        idForo: datos.idForo,
        idForoArchivo: datos.idForoArchivo ?? null,
        idUsuario: datos.idUsuario
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
