const { enviarCorreoContacto } = require('../utils/emailService');

const recibirContactoForm = async (req, res) => {
  const datos = req.body;

  try {
    // Send email
    await enviarCorreoContacto(datos);

    res.status(200).json('Su información ha sido enviada correctamente.');
  } catch (error) {
    res.status(500).send(error.toString());
  }
};

module.exports = { recibirContactoForm };