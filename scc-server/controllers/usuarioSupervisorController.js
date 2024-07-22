const db = require('../utils/db.js');

var nombreTabla = 'usuariosupervisor';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT mv.*, 
      m.titulo as moduloTitulo, m.descripcion as moduloDescripcion, 
      v.id as videoId, v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
      FROM ${nombreTabla} mv
      INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
      INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
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
    const idModulo = req.params.idModulo;
    const idVideo = req.params.idVideo;
    if (!idModulo || !idVideo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
        SELECT mv.*, 
        m.titulo as moduloTitulo, m.descripcion as moduloDescripcion, 
        v.id as videoId, v.titulo as videoTitulo, v.descripcion as videoDescripcion, v.link as videoLink, v.fechaLimite as videoFechaLimite, v.requerido as videoRequerido 
        FROM ${nombreTabla} mv
        INNER JOIN modulo m ON mv.idModulo = m.id AND m.estado != 0
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE mv.idModulo = ? AND mv.idVideo = ?`, [idModulo, idVideo]);
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
        idSupervisor: datos.idSupervisor,
        idUsuario: datos.idUsuario
    }

    if (crearDatos.idSupervisor == crearDatos.idUsuario) {
        throw new Error('Un usuario no puede ser su mismo supervisor');
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

module.exports.crearMultiples = async (req, res, next) => {
  try {
    const datos = req.body;

    if (!Array.isArray(datos.datos) || datos.datos.length === 0) {
      return res.status(400).send(`Datos inválidos para crear ${nombreTabla}`);
    }

    const query = `INSERT INTO ${nombreTabla} (idSupervisor, idUsuario) VALUES ?`
    const values = datos.datos.map(item => [datos.idSupervisor ?? datos.supervisorId, item.idUsuario ?? item.usuarioId]);

    const data = await db.query(query, [values]);
    if (data) {
      res.status(201).json({
          status: true,
          message: `${nombreTabla} creados`,
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

module.exports.borrar = async (req, res, next) => {
  try {
    const idSupervisor = req.params.idSupervisor;
    const idUsuario = req.params.idUsuario;
    if (!idSupervisor || !idUsuario) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    await db.query(`DELETE FROM ${nombreTabla} WHERE idSupervisor = ? AND idUsuario = ?`, [idSupervisor, idUsuario]);
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

module.exports.borrarMultiple = async (req, res, next) => {
  try {
    const datos = req.body;

    if (!Array.isArray(datos.idUsuarios) || datos.idUsuarios.length === 0) {
      return res.status(400).send(`Datos inválidos para borrar ${nombreTabla}`);
    }

    // Generate the placeholders for the query
    const usuarioPlaceholder = datos.idUsuarios.map(() => '?').join(',');
  
    const query = `DELETE FROM ${nombreTabla} WHERE idSupervisor = ? AND idUsuario IN (${usuarioPlaceholder}) `;
  
    const values = [datos.idSupervisor, ...datos.idUsuarios];

    
    await db.query(query, values);
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