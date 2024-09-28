const db = require('../utils/db.js');

var nombreTabla = 'anotacion';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT a.*, ta.descripcion AS tipoAnotacionDescripcion 
      FROM ${nombreTabla} a 
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion 
      ORDER BY a.idTipoAnotacion`);
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
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT a.*, ta.descripcion AS tipoAnotacionDescripcion 
      FROM ${nombreTabla} a 
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion 
      WHERE a.id = ?
      ORDER BY a.idTipoAnotacion`, [id]);
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

module.exports.getByIdTipoContrato = async(req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT a.*, ta.descripcion AS tipoAnotacionDescripcion 
      FROM ${nombreTabla} a 
      INNER JOIN tipoanotacion ta ON ta.id = a.idTipoAnotacion
      WHERE a.estado != 0 AND a.idTipoContrato = ?
      ORDER BY a.idTipoAnotacion`, [id]);
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

module.exports.getGroupByIdTipoContrato = async(req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT 
      ta.id, ta.descripcion,
      (
        SELECT 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', a.id,
              'descripcion', a.descripcion,
              'fijo', a.fijo,
              'valor', a.valor,
              'valorHoras', a.valorHoras
            )
          )
        FROM ${nombreTabla} a 
        WHERE a.idTipoAnotacion = ta.id AND a.estado != 0 AND a.fijo != 1 AND a.fijo != 2 AND a.idTipoContrato = ?
      ) AS anotaciones
      FROM tipoanotacion ta`, [id]);
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
      idTipoAnotacion: datos.idTipoAnotacion,
      idTipoContrato: datos.idTipoContrato,
      descripcion: datos.descripcion,
      fijo: datos.fijo,
      valor: datos.valor,
      valorHoras: datos.valorHoras
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
      idTipoAnotacion: datos.idTipoAnotacion,
      idTipoContrato: datos.idTipoContrato,
      descripcion: datos.descripcion,
      fijo: datos.fijo,
      valor: datos.valor,
      valorHoras: datos.valorHoras,
      estado: datos.estado
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