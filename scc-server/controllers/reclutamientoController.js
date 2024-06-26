const db = require('../utils/db.js');
const dayjs = require('dayjs');
const fs = require('fs');
const { enviarCorreoReclutamiento } = require('../utils/emailService');

var nombreTabla = 'historialReclutamiento';

const recibirReclutamientoForm = async (req, res) => {
  const datos = req.body;
  const cv = req.file;
  
  const identificacion = datos.identificacion;

  try {
    const get = await db.query(`SELECT * FROM ${nombreTabla} WHERE identificacion = ?`, [identificacion]);
    if(get) {
      if (get[0].length == 0) {
        let reclutamiento = {
          identificacion: identificacion,
          fecha: new Date()
        }
        const insert = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [reclutamiento]);
        if (insert) {
          await enviarCorreoReclutamiento(datos, cv.path);

          res.status(200).json('Su información ha sido enviada correctamente.');
        } else {
          borrarArchivo(cv.path);
          res.status(500).send({
            success: false,
            message: 'Error en registrar reclutamiento'
          });
        }
      } else {
        const fechaPasada = dayjs(get[0][0].Fecha);
        const fechaActual = dayjs();

        const monthsDiff = fechaActual.diff(fechaPasada, 'month');
        const daysDiff = fechaActual.diff(fechaPasada, 'day');

        if (monthsDiff > 2 || (monthsDiff === 2 && daysDiff >= 0)) {
          const update = await db.query(`UPDATE ${nombreTabla} SET Fecha = ? WHERE Id = ?`, [new Date(), get[0][0].Id]);
          if (update) {
            await enviarCorreoReclutamiento(datos, cv.path);

            res.status(200).json('Su información ha sido enviada correctamente.');
          } else {
            borrarArchivo(cv.path);
            res.status(500).send({
              success: false,
              message: 'Error en registrar reclutamiento'
            });
          }
        } else {
          borrarArchivo(cv.path);
          res.status(401).send({
            success: false,
            message: 'Debe esperar 2 meses desde el último envío de su información.',
            id: 'baneado'
          });
        }
      }
    } else {
      borrarArchivo(cv.path);
      res.status(404).send({
        success: false,
        message: 'No se encontraron datos',
      });
    }
  } catch (error) {
    borrarArchivo(cv.path);
    console.log(error)
    res.status(500).send({
      success: false,
      message: 'Error en registrar reclutamiento',
      error: error
    });
  }
};

function borrarArchivo(ubicacionCV) {
  fs.unlink(ubicacionCV, (unlinkErr) => {
    if (unlinkErr) {
      console.error('Error deleting file:', unlinkErr);
    }
  });
}

module.exports = { recibirReclutamientoForm };