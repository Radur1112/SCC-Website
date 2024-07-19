const db = require('../utils/db.js');

var nombreTabla = 'planilla';

module.exports.getByIdUsuario = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    let fecha = req.query.param;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    let query = '';
    let vars = [];

    if (fecha) {
      query = `
        SELECT pl.fecha,
        u.nombre AS usuarioNombre, u.salario AS salarioBase, u.vacacion AS usuarioVacacion, 
       (u.salario + COALESCE(SUM(a.monto), 0)) AS salarioBruto,
       (u.salario + COALESCE(SUM(a.monto), 0) - COALESCE(SUM(d.monto), 0)) AS salarioNeto,
       (COALESCE(SUM(d.monto), 0)) AS totalDeducciones,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'aumentoDescripcion', a.descripcion,
            'aumentoMonto', a.monto,
            'tipoAumentoDescripcion', ta.descripcion
          )
        ) AS aumentos,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'deduccionDescripcion', d.descripcion,
            'deduccionMonto', d.monto,
            'tipoDeduccionDescripcion', td.descripcion
          )
        ) AS deducciones
        FROM ${nombreTabla} pl
        INNER JOIN usuario u ON u.id = ?
        LEFT JOIN aumento a ON a.idPlanilla = pl.id 
        LEFT JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
        LEFT JOIN deduccion d ON d.idPlanilla = pl.id 
        LEFT JOIN tipodeduccion td ON td.id = d.idTipoDeduccion
        WHERE pl.idUsuario = ? AND pl.fecha = ?
        GROUP BY pl.fecha, u.salario`;
      vars = [id, id, fecha];
    } else {
      query = `
        SELECT pl.fecha,
        u.nombre AS usuarioNombre, u.salario AS salarioBase, u.vacacion AS usuarioVacacion, 
       (u.salario + COALESCE(SUM(a.monto), 0)) AS salarioBruto,
       (u.salario + COALESCE(SUM(a.monto), 0) - COALESCE(SUM(d.monto), 0)) AS salarioNeto,
       (COALESCE(SUM(d.monto), 0)) AS totalDeducciones,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'aumentoDescripcion', a.descripcion,
            'aumentoMonto', a.monto,
            'tipoAumentoDescripcion', ta.descripcion
          )
        ) AS aumentos,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'deduccionDescripcion', d.descripcion,
            'deduccionMonto', d.monto,
            'tipoDeduccionDescripcion', td.descripcion
          )
        ) AS deducciones
        FROM ${nombreTabla} pl
        INNER JOIN usuario u ON u.id = ?
        LEFT JOIN aumento a ON a.idPlanilla = pl.id 
        LEFT JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
        LEFT JOIN deduccion d ON d.idPlanilla = pl.id 
        LEFT JOIN tipodeduccion td ON td.id = d.idTipoDeduccion
        WHERE pl.idUsuario = ?
        GROUP BY pl.fecha, u.salario
        ORDER BY pl.fecha DESC
        LIMIT 1;`;
      vars = [id, id];
    }
    

    const data = await db.query(query, vars);
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

module.exports.getFechas = async(req, res, next) => {
  try {
    const data = await db.query(`
        SELECT DISTINCT fecha FROM ${nombreTabla} ORDER BY fecha DESC`);
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

module.exports.getTipos = async(req, res, next) => {
  try {

    const tipoAumentoQuery = 'SELECT * FROM tipoaumento';
    const tipoDeduccionQuery = 'SELECT * FROM tipodeduccion';
    const tipoOtroPagoQuery = 'SELECT * FROM tipootropago';
    
    const [tipoAumentos] = await db.query(tipoAumentoQuery);
    const [tipoDeducciones] = await db.query(tipoDeduccionQuery);
    const [tipoOtrosPagos] = await db.query(tipoOtroPagoQuery);

    const tipos = [
      {
        tipo: 'Aumentos',
        lista: tipoAumentos
      },
      {
        tipo: 'Deducciones',
        lista: tipoDeducciones
      },
      {
        tipo: 'Otros Pagos',
        lista: tipoOtrosPagos
      }
    ]
    
    if(tipos) {
      res.status(200).send({
        success: true,
        message: 'Datos obtenidos correctamente',
        data: tipos
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

