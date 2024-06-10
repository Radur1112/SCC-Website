const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();

const enviarCorreoReclutamiento = async (formData, ubicacionCV) => {
  try {
    const datos = formData;

    // Configuarar el email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Optiones del correo
    const opcionesCorreo = {
      from: process.env.EMAIL_USER,
      to: process.env.HR_EMAIL,
      subject: datos.asunto,
      html: formatearContenidoDeCorreo(datos),
      attachments: [
        {
          filename: ubicacionCV.split('\\').pop(),
          path: ubicacionCV
        }
      ]
    };
    // Enviar correo
    await transporter.sendMail(opcionesCorreo);

    // Delete the file after sending email
    fs.unlink(ubicacionCV, (unlinkErr) => {
      if (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    });
    
    //console.log("correo enviado a "+process.env.HR_EMAIL+" con asunto "+ datos.asunto)
      
  } catch (error) {
    console.log(error)
  }
};

function formatearContenidoDeCorreo(datos) {
  let formateo = `
  <p><strong>Identificación:</strong> ${datos.identificacion}</p>
  <p><strong>Nombre:</strong> ${datos.nombre}</p>
  <p><strong>Correo Electrónico:</strong> ${datos.correo}</p>
  <p><strong>Teléfono:</strong> ${datos.telefono}</p>
  <p><strong>Dirección:</strong> ${datos.direccion}</p>
  <p><strong>Fecha de Nacimiento:</strong> ${datos.fecha}</p>
  `;

  if(datos.experiencia !== 'null' && datos.experiencia !== '') {
    formateo += `<p><strong>Experiencia:</strong> ${datos.experiencia} años</p>`
  }

  if(datos.comentario !== 'null' && datos.comentario !== '') {
    formateo += `<p><strong>Comentarios:</strong> ${datos.comentario}</p>`
  }
  return formateo;
}

module.exports = { enviarCorreoReclutamiento };