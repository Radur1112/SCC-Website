const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();
const moment = require('moment');

const enviarCorreoElectronico = async (opciones, ubicacionCV) => {
  try {

    // Configuarar el email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Enviar correo
    await transporter.sendMail(opciones);

    if (ubicacionCV) {
      // Delete the file after sending email
      fs.unlink(ubicacionCV, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
        }
      });
    }
    
    //console.log("correo enviado a "+process.env.HR_EMAIL+" con asunto "+ datos.asunto)
      
  } catch (error) {
    console.log(error)
  }
};

const enviarCorreoElectronicoNoBorrar = async (opciones, ubicacionCV) => {
  try {

    // Configuarar el email transporter
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Enviar correo
    await transporter.sendMail(opciones);
    
    //console.log("correo enviado a "+process.env.HR_EMAIL+" con asunto "+ datos.asunto)
      
  } catch (error) {
    console.log(error)
  }
};


const enviarCorreoReclutamiento = async (formData, ubicacionCV) => {
  const datos = formData;

  // Optiones del correo
  const opcionesCorreo = {
    from: process.env.EMAIL_USER,
    to: process.env.HR_EMAIL,
    subject: datos.asunto,
    html: formatearContenidoDeCorreoReclutamiento(datos),
    attachments: [
      {
        filename: ubicacionCV.split('\\').pop(),
        path: ubicacionCV
      }
    ]
  };

  enviarCorreoElectronico(opcionesCorreo, ubicacionCV);
};

function formatearContenidoDeCorreoReclutamiento(datos) {
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


const enviarCorreoContacto = async (formData) => {
  const datos = formData;

  // Optiones del correo
  const opcionesCorreo = {
    from: process.env.EMAIL_USER,
    to: process.env.HR_EMAIL,
    subject: datos.asunto,
    html: formatearContenidoDeCorreoContacto(datos)
  };

  enviarCorreoElectronico(opcionesCorreo, null);
};

function formatearContenidoDeCorreoContacto(datos) {
  let formateo = `
  <p><strong>Identificación:</strong> ${datos.identificacion}</p>
  <p><strong>Nombre:</strong> ${datos.nombre}</p>
  <p><strong>Correo Electrónico:</strong> ${datos.correo}</p>
  <p><strong>Teléfono:</strong> ${datos.telefono}</p>
  <p><strong>Mensaje:</strong> ${datos.mensaje}</p>
  `;

  return formateo;
}


const enviarCorreoComprobante = async (formData, ubicacionCV) => {
  const datos = formData;
  
  // Optiones del correo
  const opcionesCorreo = {
    from: process.env.EMAIL_USER,
    to: datos.usuarioCorreo,
    subject: `Comprobante de planilla: ${moment(new Date(datos.fechaInicio)).format('YYYY-MM-DD')} - ${moment(new Date(datos.fechaFinal)).format('YYYY-MM-DD')}`,
    html: '<h3>Ajunto comprobante.<h3/>',
    attachments: [
      {
        filename: ubicacionCV.split('\\').pop(),
        path: ubicacionCV
      }
    ]
  };

  enviarCorreoElectronicoNoBorrar (opcionesCorreo, ubicacionCV);
};


const enviarCorreoAviso = async (formData) => {
  const datos = formData;

  // Optiones del correo
  const opcionesCorreo = {
    from: process.env.EMAIL_USER,
    to: process.env.HR_EMAIL,
    subject: datos.asunto,
    html: formatearContenidoDeCorreoAviso(datos)
  };

  enviarCorreoElectronico(opcionesCorreo, null);
};

function formatearContenidoDeCorreoAviso(datos) {
  let formateo = `
  <p><strong>Identificación:</strong> ${datos.identificacion}</p>
  <p><strong>Nombre:</strong> ${datos.nombre}</p>
  <p><strong>Correo Electrónico:</strong> ${datos.correo}</p>
  <p><strong>Teléfono:</strong> ${datos.telefono}</p>
  <p><strong>Mensaje:</strong> ${datos.mensaje}</p>
  `;

  return formateo;
}

module.exports = { enviarCorreoReclutamiento, enviarCorreoContacto, enviarCorreoElectronico, enviarCorreoComprobante };