const db = require('../utils/db.js');
const xlsx = require('xlsx');
const exceljs = require('exceljs');
const moment = require('moment');
const { format } = require('date-fns');
const { es } = require('date-fns/locale');

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
      ORDER BY fh.fecha DESC`);
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
      INNER JOIN foro f ON f.id = fh.idForo AND f.estado != 0
      INNER JOIN usuario u ON u.id = fh.idUsuario AND u.estado != 0 AND u.id != 1
      LEFT JOIN foroarchivo fa ON fa.id = fh.idForoArchivo
      WHERE fh.idForo = ?
      ORDER BY fh.fecha DESC`, [id]);
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

module.exports.exportarExcel = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT f.*,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'fecha', subquery.fecha,
                'usuarioNombre', subquery.usuarioNombre,
                'archivoNombre', subquery.archivoNombre,
                'accion', subquery.accion
              )
            )
          FROM (
            SELECT 
              fh.fecha,
              u.nombre AS usuarioNombre,
              SUBSTRING_INDEX(fa.ubicacion, '/', -1) AS archivoNombre,
              CASE
                WHEN fa.ubicacion IS NOT NULL THEN CONCAT("Descargó el archivo: '", SUBSTRING_INDEX(fa.ubicacion, '/', -1), "'")
                ELSE 'Accesó al foro'
              END AS accion
            FROM forohistorial fh
            INNER JOIN usuario u ON u.id = fh.idUsuario
            LEFT JOIN foroarchivo fa ON fa.id = fh.idForoArchivo
            WHERE fh.idForo = f.id AND u.estado != 0 AND u.id != 1
            ORDER BY fh.fecha DESC
          ) AS subquery
        ) AS historial
      FROM foro f
      INNER JOIN forohistorial fh2 ON fh2.idForo = f.id
	    INNER JOIN usuario u2 ON u2.id = fh2.idUsuario
      WHERE f.estado != 0 AND u2.estado != 0 AND u2.id != 1
      GROUP BY f.id`);
    if(data) {
      crearExport(res, data[0]);
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

module.exports.exportarExcelById = async(req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }

    const data = await db.query(`
      SELECT f.*,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'fecha', subquery.fecha,
                'usuarioNombre', subquery.usuarioNombre,
                'archivoNombre', subquery.archivoNombre,
                'accion', subquery.accion
              )
            )
          FROM (
            SELECT 
              fh.fecha,
              u.nombre AS usuarioNombre,
              SUBSTRING_INDEX(fa.ubicacion, '/', -1) AS archivoNombre,
              CASE
                WHEN fa.ubicacion IS NOT NULL THEN CONCAT("Descargó el archivo: '", SUBSTRING_INDEX(fa.ubicacion, '/', -1), "'")
                ELSE 'Accesó al foro'
              END AS accion
            FROM forohistorial fh
            INNER JOIN usuario u ON u.id = fh.idUsuario
            LEFT JOIN foroarchivo fa ON fa.id = fh.idForoArchivo
            WHERE fh.idForo = f.id AND u.estado != 0 AND u.id != 1
            ORDER BY fh.fecha DESC
          ) AS subquery
        ) AS historial
      FROM foro f
      INNER JOIN forohistorial fh2 ON fh2.idForo = f.id
	    INNER JOIN usuario u2 ON u2.id = fh2.idUsuario
      WHERE f.estado != 0 AND u2.estado != 0 AND u2.id != 1 AND f.id = ?
      GROUP BY f.id`, [id]);
    if(data) {
      crearExport(res, data[0]);
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

async function crearExport(res, data) {
  try {
    const workbook = await crearExcel(data);
    const nombre = `${data.length == 1 ? data[0].titulo : 'foros'}_historial_${moment().format('YYYYMMDD')}.xlsx`;
    
    workbook.xlsx.writeBuffer()
      .then(buffer => {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombre}"`);
        res.send(buffer);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({
          success: false,
          message: 'Error al generar el achivo de Excel',
        });
      });
  } catch (error) {
    console.error('Error creating Excel file:', error);
  }
}

async function crearExcel(data) {
  try {
    const titleCount = {};
    
    let workbook = new exceljs.Workbook();
    for (let foro of data) {
      if (foro.titulo.length > 29) {
        foro.titulo = foro.titulo.substring(0, 29);
      }

      let sheetName = '';
      if (titleCount[foro.titulo]) {
        titleCount[foro.titulo] += 1;
        sheetName = `${foro.titulo} (${titleCount[foro.titulo]})`;
      } else {
        titleCount[foro.titulo] = 1;
        sheetName = foro.titulo;
      }
      
      const hoja = workbook.addWorksheet(sheetName);

      const configurarHoja = (worksheet, historiales) => {
        const headers = [
          { header: 'Nombre completo', width: 30 },
          { header: 'Acción', width: 50 },
          { header: 'Fecha de acción', width: 35 },
        ];
        worksheet.columns = headers;
        worksheet.getRow(1).font = { bold: true };

        historiales.forEach(historial => {
          const fecha = format(historial.fecha, "d 'de' MMMM, y - hh:mm a", { locale: es });
  
          let row = [
            historial.usuarioNombre,
            historial.accion,
            fecha
          ];
  
          worksheet.addRow(row);
        });
      };
  
      configurarHoja(hoja, foro.historial);
    }
    
    return workbook;
  } catch (error) {
    console.error('Error creating Excel file:', error);
  }
}