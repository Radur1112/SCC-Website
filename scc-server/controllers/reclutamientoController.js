const { enviarCorreoReclutamiento } = require('../utils/emailService');

const recibirReclutamientoForm = async (req, res) => {
  const datos = req.body;
  const cv = req.file;

  try {
    // Send email
    await enviarCorreoReclutamiento(datos, cv.path);

    res.status(200).json('Su información ha sido enviada correctamente.');
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

module.exports = { recibirReclutamientoForm };