const db = require('../utils/db.js');
const { update_planilla_after_anotacion, create_pagos_insert_planilla } = require('../utils/triggers.js')

var nombreTabla = 'otroPago';

module.exports.crear = async (req, res, next) => {
  try {
    const datos = req.body;

    const [planilla] = await db.query(`SELECT estado AS planillaEstado FROM planilla WHERE id = ${datos.idPlanilla}`);

    if (planilla[0].planillaEstado != 1) {
      throw new Error('completada')
    }

    let crearDatos = {
        idPlanilla: datos.idPlanilla,
        idTipoOtroPago: datos.idTipoOtroPago ?? datos.idTipo,
        descripcion: datos.descripcion,
        monto: datos.monto,
        idUsuario: datos.idUsuario ?? null
    }

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
    if (data) {
      await create_pagos_insert_planilla(datos.idPlanilla);
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
    if (error.message = 'completada') {
      res.status(401).json({
        success: false,
        message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
        id: error.message
      });
    } else {
      console.log(error);
      res.status(500).send({
        success: false,
        message: `Error en borrar ${nombreTabla}`,
        error: error
      });
    }
  }
};

module.exports.crearMultiples = async (req, res, next) => {
  try {
    const datos = req.body;

    const otroPagosPromises = datos.map(async (dato) => {
      const [planilla] = await db.query(`SELECT estado AS planillaEstado FROM planilla WHERE id = ${dato.idPlanilla}`);

      if (planilla[0].planillaEstado != 1) {
        throw new Error('completada')
      }

      let crearDatos = {
        idPlanilla: dato.idPlanilla,
        idTipoOtroPago: dato.idTipoOtroPago ?? dato.idTipo,
        descripcion: dato.descripcion,
        monto: dato.monto,
        idUsuario: dato.idUsuario ?? null
      }

      const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [crearDatos]);
      await create_pagos_insert_planilla(dato.idPlanilla);
      return data[0];
    });

    Promise.all(otroPagosPromises)
      .then((results) => {
        res.status(201).json({
          success: true,
          message: `${nombreTabla} creados`,
          data: results,
        });
      })
      .catch((error) => {
        if (error.message = 'completada') {
          res.status(401).json({
            success: false,
            message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
            id: error.message
          });
        } else {
          console.log(error);
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      });
    } catch (error) {
      if (error.message = 'completada') {
        res.status(401).json({
          success: false,
          message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
          id: error.message
        });
      } else {
        console.log(error);
        res.status(500).send({
          success: false,
          message: `Error en borrar ${nombreTabla}`,
          error: error
        });
      }
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
  
    const [anotacion] = await db.query(`SELECT x.*, p.estado AS planillaEstado FROM ${nombreTabla} x INNER JOIN planilla p ON p.id = x.idPlanilla WHERE x.id = ${id}`);

    if (anotacion[0].planillaEstado != 1) {
      throw new Error('completada')
    }

    const datos = req.body;

    let actualizarDatos = {
      idPlanilla: datos.idPlanilla,
      idTipoOtroPago: datos.idTipoOtroPago ?? datos.idTipo,
      descripcion: datos.descripcion,
      monto: datos.monto,
      idUsuario: datos.idUsuario ?? null
    }


    const data = await db.query(`UPDATE ${nombreTabla} SET ? WHERE id = ?`, [actualizarDatos, id]);
    if (data) {
      await create_pagos_insert_planilla(datos.idPlanilla);
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
    if (error.message = 'completada') {
      res.status(401).json({
        success: false,
        message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
        id: error.message
      });
    } else {
      console.log(error);
      res.status(500).send({
        success: false,
        message: `Error en borrar ${nombreTabla}`,
        error: error
      });
    }
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
  
      const [anotacion] = await db.query(`SELECT x.*, p.estado AS planillaEstado FROM ${nombreTabla} x INNER JOIN planilla p ON p.id = x.idPlanilla WHERE x.id = ${id}`);

      if (anotacion[0].planillaEstado != 1) {
        throw new Error('completada')
      }
  
      await db.query(`DELETE FROM ${nombreTabla} WHERE id = ?`, [id]);

      if (anotacion.length > 0) {
        await create_pagos_insert_planilla(anotacion[0].idPlanilla);
      }

      res.status(201).json({
          status: true,
          message: `${nombreTabla} borrado`
      });
    } catch (error) {
      if (error.message = 'completada') {
        res.status(401).json({
          success: false,
          message: 'Esta planilla ya fue completada, no se pueden realizar cambios',
          id: error.message
        });
      } else {
        console.log(error);
        res.status(500).send({
          success: false,
          message: `Error en borrar ${nombreTabla}`,
          error: error
        });
      }
    }
  };
  