const db = require('../utils/db.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const xlsx = require('xlsx');
const path = require('path');
const exceljs = require('exceljs');
const fs = require('fs');

var nombreTabla = 'usuario';
var selectNoPassword = 'u.Id, u.IdTipoUsuario, u.IdTipoContrato, u.Identificacion, u.Correo, u.Nombre, u.Apellidos, u.Salario, u.FechaIngreso, u.CantVacacion, u.Estado';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, tu.descripcion as TipoUsuarioDescripcion, tc.descripcion as TipoContratoDescripcion
      FROM ${nombreTabla} u
      INNER JOIN tipoUsuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipoContrato tc ON u.idTipoContrato = tc.id 
      WHERE u.estado != 0`);
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

module.exports.getAll = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, tu.descripcion as TipoUsuarioDescripcion, tc.descripcion as TipoContratoDescripcion 
      FROM ${nombreTabla} u 
      INNER JOIN tipoUsuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipoContrato tc ON u.idTipoContrato = tc.id 
      ORDER BY u.estado DESC`);
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
    const data = await db.query(`
      SELECT ${selectNoPassword}, tu.descripcion as TipoUsuarioDescripcion, tc.descripcion as TipoContratoDescripcion
      FROM ${nombreTabla} u
      INNER JOIN tipoUsuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipoContrato tc ON u.idTipoContrato = tc.id 
      WHERE u.id = ?`, [id]);
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

module.exports.getByIdentificacion = async(req, res, next) => {
  try {
    let id = parseInt(req.params.id);
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const data = await db.query(`SELECT ${selectNoPassword} FROM ${nombreTabla} u WHERE identificacion = ?`, [id]);
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

module.exports.getByCorreo = async(req, res, next) => {
  try {
    let correo = parseInt(req.params.correo);
    if (!correo) {
      return res.status(404).send({
        success: false,
        message: 'Correo inválido',
      });
    }
    const data = await db.query(`SELECT ${selectNoPassword} FROM ${nombreTabla} u WHERE correo = ?`, [correo]);
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

module.exports.login = async (req, res, next) => {
    try {
      let usuarioReq = req.body;

      const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE correo = ?`, [usuarioReq.correo]);
      if (data) {
        if (data[0].length === 0) {
          return res.status(401).json({
              success: false,
              message: "Usuario no registrado",
          });
        }
  
        const usuario = data[0][0];
  
        // If usuario is inactive
        if (usuario.Estado === 0) {
          return res.status(401).json({
              success: false,
              message: "Usuario denegado",
          });
        }
        
        // Compare passwords
        const compararPassword = await bcrypt.compare(usuarioReq.password, usuario.Password);
        if (!compararPassword) {
          return res.status(401).json({
              success: false,
              message: "Credenciales no válidas"
          });
        }

        // Create payload
        const payload = {
          id: usuario.Id,
          correo: usuario.Correo,
          idTipoUsuario: usuario.IdTipoUsuario
        };
  
        // Create JWT token
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
          expiresIn: process.env.JWT_EXPIRE
        });
        
        delete usuario['Password'];
        
        res.status(200).json({
          status: 200,
          success: true,
          message: "Usuario logueado",
          data: {
            usuario,
            token,
          }
        });
        /*
        // Send res with usuario data and token
        res.cookie("access_token", token, {httpOnly: false})
        .status(200).json({
          status:200,
          success: true,
          message: "Usuario logueado",
          data: {
              usuario,
              token,
          }
        });*/
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
        message: 'Error en login usuario',
        error: error
      })
    }
};

module.exports.logout = async (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send({
          success: false,
          message: 'Error en logout usuario',
          error: error
        })
      } else {
        res.status(200).json({
          status:200,
          success: true,
          message: "Usuario deslogueado"
        });
      }
    })
  } else {
    res.status(404).send({
      success: false,
      message: 'Usuario no logueado',
    });
  }
}

module.exports.registrar = async (req, res, next) => {
  try {
    const usuarioData = req.body;
    
    let usuario = {
      idTipoUsuario: usuarioData.IdTipoUsuario ?? usuarioData.idTipoUsuario,
      idTipoContrato: usuarioData.IdTipoContrato ?? usuarioData.idTipoContrato ?? null,
      identificacion: usuarioData.Identificacion ?? usuarioData.identificacion,
      correo: usuarioData.Correo ?? usuarioData.correo,
      password: usuarioData.Password ?? usuarioData.password,
      nombre: usuarioData.Nombre ?? usuarioData.nombre,
      apellidos: usuarioData.Apellidos ?? usuarioData.apellidos,
      salario: usuarioData.Salario ?? usuarioData.salario ?? null,
      fechaIngreso: usuarioData.FechaIngreso ?? usuarioData.fechaIngreso ?? null,
      cantVacacion: usuarioData.CantVacacion ?? usuarioData.cantVacacion ?? null
    };

    validarUsuario(usuario);
  
    //Salt es una cadena aleatoria.
    //"salt round" factor de costo controla cuánto tiempo se necesita para calcular un solo hash de BCrypt
    // salt es un valor aleatorio y debe ser diferente para cada cálculo, por lo que el resultado casi nunca debe ser el mismo, incluso para contraseñas iguales
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(usuarioData.password.toString(), salt);

    usuario.password = hash;

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [usuario]);
    if (data) {
      res.status(201).json({
          status: true,
          message: "Usuario creado",
          data: data[0],
      });
    } else {
      res.status(404).send({
        success: false,
        message: 'Error en INSERT',
      });
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({
        success: false,
        message: 'Identificación y/o correo ya está en uso',
        id: 'duplicado',
      });
    } else {
      res.status(500).send({
        success: false,
        message: 'Error en registrar usuario',
        error: error
      })
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

    const usuarioData = req.body;
    
    let usuario = {
      idTipoUsuario: usuarioData.IdTipoUsuario ?? usuarioData.idTipoUsuario,
      idTipoContrato: usuarioData.IdTipoContrato ?? usuarioData.idTipoContrato ?? null,
      identificacion: usuarioData.Identificacion ?? usuarioData.identificacion,
      correo: usuarioData.Correo ?? usuarioData.correo,
      password: usuarioData.Password ?? usuarioData.password ?? null,
      nombre: usuarioData.Nombre ?? usuarioData.nombre,
      apellidos: usuarioData.Apellidos ?? usuarioData.apellidos,
      salario: usuarioData.Salario ?? usuarioData.salario ?? null,
      fechaIngreso: usuarioData.FechaIngreso ?? usuarioData.fechaIngreso ?? null,
      cantVacacion: usuarioData.CantVacacion ?? usuarioData.cantVacacion ?? null,
      estado: usuarioData.Estado ?? usuarioData.estado
    }

    validarUsuario(usuario);

    let data;

    if (usuario.password) {
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(usuario.password.toString(), salt);

      data = await db.query(`
        UPDATE ${nombreTabla} 
        SET idTipoUsuario = ?, idTipoContrato = ?, identificacion = ?, correo = ?, nombre = ?, apellidos = ?, salario = ?, fechaIngreso = ?, cantVacacion = ?, estado = ?, password = ? 
        WHERE id = ?`, 
        [usuario.idTipoUsuario, usuario.idTipoContrato, usuario.identificacion, usuario.correo, usuario.nombre, usuario.apellidos, usuario.salario, usuario.fechaIngreso, usuario.cantVacacion, usuario.estado, hash, id]);
    } else {
      data = await db.query(`
        UPDATE ${nombreTabla} 
        SET idTipoUsuario = ?, idTipoContrato = ?, identificacion = ?, correo = ?, nombre = ?, apellidos = ?, salario = ?, fechaIngreso = ?, cantVacacion = ?, estado = ? 
        WHERE id = ?`, 
        [usuario.idTipoUsuario, usuario.idTipoContrato, usuario.identificacion, usuario.correo, usuario.nombre, usuario.apellidos, usuario.salario, usuario.fechaIngreso, usuario.cantVacacion, usuario.estado, id]);
    }
    
    
    if (data) {
      res.status(201).json({
          status: true,
          message: "Usuario actualizado"
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
      message: 'Error en actualizar usuario',
      error: error
    });
  }
};

function validarUsuario(usuarioData) {
  const MAX_IDENTIFICACION_LENGTH = 20;
  const MAX_CORREO_LENGTH = 250;
  const MAX_PASSWORD_LENGTH = 60;
  const MAX_NOMBRE_LENGTH = 100;
  const MAX_APELLIDOS_LENGTH = 150;

  const MIN_SALARIO = 100;
  const MAX_SALARIO = 999999999;
  const MIN_ID = 0;
  const MAX_ID = 99;
  
  if (!usuarioData.idTipoUsuario || isNaN(usuarioData.idTipoUsuario) || usuarioData.idTipoUsuario < MIN_ID || usuarioData.idTipoUsuario > MAX_ID) {
    throw new Error('idTipoUsuario debe ser un número válido');
  }
  
  if (usuarioData.idTipoContrato !== null && (isNaN(usuarioData.idTipoContrato) || usuarioData.idTipoContrato < MIN_ID || usuarioData.idTipoContrato > MAX_ID)) {
    throw new Error('idTipoContrato debe ser un número válido');
  }
  
  if (!usuarioData.identificacion) {
    throw new Error('identificacion es requerida');
  }
  if (!usuarioData.identificacion.length > MAX_IDENTIFICACION_LENGTH) {
    throw new Error(`identificacion no debe exceder el limite de ${MAX_IDENTIFICACION_LENGTH} carácteres`);
  }
  
  if (!usuarioData.correo || !isValidEmail(usuarioData.correo)) {
    throw new Error('correo es requerido y debe ser un correo electrónico válido');
  }
  if (!usuarioData.correo.length > MAX_CORREO_LENGTH) {
    throw new Error(`correo no debe exceder el limite de ${MAX_CORREO_LENGTH} carácteres`);
  }
  
  if (!usuarioData.password) {
    throw new Error('password es requerida');
  }
  if (!usuarioData.password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`password no debe exceder el limite de ${MAX_PASSWORD_LENGTH} carácteres`);
  }
  
  if (!usuarioData.nombre) {
    throw new Error('nombre es requerido');
  }
  if (!usuarioData.nombre.length > MAX_NOMBRE_LENGTH) {
    throw new Error(`nombre no debe exceder el limite de ${MAX_NOMBRE_LENGTH} carácteres`);
  }
  
  if (!usuarioData.apellidos) {
    throw new Error('apellidos es requerido');
  }
  if (!usuarioData.apellidos.length > MAX_APELLIDOS_LENGTH) {
    throw new Error(`apellidos no debe exceder el limite de ${MAX_APELLIDOS_LENGTH} carácteres`);
  }
  
  if (usuarioData.salario !== null && (isNaN(usuarioData.salario) || usuarioData.salario < MIN_SALARIO || usuarioData.salario > MAX_SALARIO)) {
    throw new Error('salario debe ser un número válido dentro del límite establecido');
  }

  if (usuarioData.fechaIngreso && !isValidDate(usuarioData.fechaIngreso)) {
    throw new Error('fechaIngreso must be a valid date');
  }

  if (usuarioData.cantVacacion !== null && (isNaN(usuarioData.cantVacacion) || usuarioData.cantVacacion < MIN_ID || usuarioData.cantVacacion > MAX_ID)) {
    throw new Error('cantVacacion debe ser un número válido dentro del límite establecido');
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}


const nombresPermitidos = {
  'TipoUsuario': ['tipousuario', 'tipodeusuario', 'rol'],
  'TipoContrato': ['tipocontrato', 'tipodecontrato', 'contrato'],
  'Identificacion': ['identificacion', 'id', 'numerodeidentificacion', 'cedula', 'numerodecedula'],
  'Correo': ['correo', 'correoelectronico', 'email', 'mail'],
  'Password': ['password', 'contrasena', 'contraseña'],
  'Nombre': ['nombre', 'nombres'],
  'Apellidos': ['apellidos', 'apellido'],
  'Salario': ['salario', 'sueldo'],
  'FechaIngreso': ['fechaingreso', 'fechadeingreso', 'fechainicio', 'fechadeinicio', 'fecha'],
  'CantVacacion': ['cantvacacion', 'cantvacaciones', 'cantidaddevacaciones', 'cantidaddevacacionesinicial', 'cantidaddevacacionesiniciales', 'vacacionesiniciales', 'vacacioninicial']
};

function formatearNombre(nombre) {
  const especiales = {
    'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
    'ü': 'u', 'ñ': 'n'
  };

  let corregido = nombre.toLowerCase().replace(/\s+/g, '');
  corregido = corregido.replace(/[áéíóúÁÉÍÓÚüÜñÑ]/g, letra => especiales[letra] || letra);

  return corregido;
}

function validarNombre(nombreActual) {
  nombreActual = formatearNombre(nombreActual);
  for (let nombreEsperado in nombresPermitidos) {
    if (nombresPermitidos[nombreEsperado].includes(nombreActual)) {
      return nombreEsperado;
    }
  }
  return null;
}

function validarDatos(data) {
  let datos = [];
  let fila = {};
  let errors = {};
  let isAdmin = false;
  let isAsalariado = false;

  const minSalario = 100;
  const maxSalario = 999999999;

  const minVacaciones = 0;
  const maxVacaciones = 99;

  data.forEach((row, rowIndex) => {
    for (let nombreColumnaExcel in row) {
      const nombreValidado = validarNombre(nombreColumnaExcel);

      if (!nombreValidado) {
        if (!errors['nombreColumnaExcel']) errors['nombreColumnaExcel'] = {};
        errors['nombreColumnaExcel'][nombreColumnaExcel] = `El nombre de columna '${nombreColumnaExcel}' no fue reconocido.`;
      } else {
        switch (nombreValidado) {
          case 'TipoUsuario':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 45) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['TipoUsuario'] = `El tipo de usuario excede el límite de 45 carácteres.`;
            } else {
              const allowedTiposUsuario = ['administrador', 'admin', 'usuario'];
              let tipoUsuario = row[nombreColumnaExcel] ? formatearNombre(row[nombreColumnaExcel]) : '';
              
              if (row[nombreColumnaExcel] && !allowedTiposUsuario.includes(tipoUsuario)) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['TipoUsuario'] = `El tipo de usuario es inválido. Debe ser 'Administrador' o 'Usuario'.`;
              } else {
                if (tipoUsuario === 'administrador' || tipoUsuario === 'admin') {
                  tipoUsuario = 'Administrador';
                  isAdmin = true;
                } else if (tipoUsuario === 'usuario') {
                  isAdmin = false;
                  tipoUsuario = 'Usuario';
                }
                row[nombreColumnaExcel] = tipoUsuario;
              }
            }
            break;
          case 'TipoContrato':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 45) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['TipoContrato'] = `El tipo de contrato excede el límite de 45 carácteres`;
            } else {
              const allowedTiposContrato = ['asalariado', 'serviciosprofesionales', 'servicios'];
              let tipocontrato = row[nombreColumnaExcel] ? formatearNombre(row[nombreColumnaExcel]) : '';

              if (row[nombreColumnaExcel] && !allowedTiposContrato.includes(tipocontrato)) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['TipoContrato'] = `El tipo de contrato es inválido. Debe ser 'Asalariado' o 'Servicios profesionales'`;
              } else {
                if (tipocontrato === 'asalariado') {
                  tipocontrato = 'Asalariado';
                  isAsalariado = true;
                } else if (tipocontrato === 'serviciosprofesionales' || tipocontrato === 'servicios') {
                  tipocontrato = 'Servicios Profesionales';
                  isAsalariado = false;
                }
                row[nombreColumnaExcel] = tipocontrato;
              }
            }
            break;
          case 'Identificacion':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 20) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['Identificacion'] = `La identificacion excede el límite de 20 carácteres`;
            }
            break;
          case 'Correo':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 250) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['Correo'] = `El correo electrónico excede el límite de 250 carácteres`;
            } else {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
              if (row[nombreColumnaExcel] && !emailRegex.test(row[nombreColumnaExcel].toString().trim())) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['Correo'] = `El correo electrónico es inválido. Debe ser un correo electrónico válido`;
              }
            }
            break;
          case 'Password':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 60) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['Password'] = `la Contraseña excede el límite de 60 carácteres`;
            }
            break;
          case 'Nombre':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 100) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['Nombre'] = `El nombre excede el límite de 100 carácteres`;
            }
            break;
          case 'Apellidos':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 150) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['Apellidos'] = `Los apellidos exceden el límite de 150 carácteres`;
            }
            break;
          case 'Salario':
            if (isNaN(row[nombreColumnaExcel])) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['Salario'] = `El salario es inválido. Debe ser un número válido`;
            } else {
              const salario = parseFloat(row[nombreColumnaExcel]);
              if (salario < minSalario || salario > maxSalario) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['Salario'] = `El salario está fuera de los límites establecidos. Debe estar entre ${minSalario} y ${maxSalario}.`;
              }
            }
            break;
          case 'FechaIngreso':
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            const fechaFormateada = formatearFecha(row[nombreColumnaExcel]);

            if (row[nombreColumnaExcel] && !dateRegex.test(fechaFormateada.trim())) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['FechaIngreso'] = `La fecha es inválida. Revise el formato de la misma`;
            } else {
              row[nombreColumnaExcel] = fechaFormateada;
            }
            break;
          case 'CantVacacion':
            if (isNaN(row[nombreColumnaExcel])) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['CantVacacion'] = `La cantidad de vacaciones es inválida. Debe ser un número válido`;
            } else {
              const vacaciones = parseFloat(row[nombreColumnaExcel]);
              if (vacaciones < minVacaciones || vacaciones > maxVacaciones) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['CantVacacion'] = `La cantidad de vacaciones está fuera de los límites establecidos. Debe estar entre ${minVacaciones} y ${maxVacaciones}.`;
              }
            }
            break;
        }
      }
      fila[nombreValidado] = row[nombreColumnaExcel];
    }
    
    if (!fila['TipoUsuario']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['TipoUsuario'] = `El tipo de usuario es requerido. Ingrese los datos solicitados`;
    }

    if (!fila['Identificacion']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['Identificacion'] = `La identificacion es requerida. Ingrese los datos solicitados`;
    }

    if (!fila['Correo']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['Correo'] = `El correo electrónico es requerido. Ingrese los datos solicitados`;
    }

    if (!fila['Password']) {
      if (fila['Identificacion']) {
        fila['Password'] = fila['Identificacion'];
      }
    }
    
    if (!fila['Nombre']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['Nombre'] = `El nombre es requerido. Ingrese los datos solicitados`;
    }

    if (!fila['Apellidos']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['Apellidos'] = `Los apellidos son requeridos. Ingrese los datos solicitados`;
    }
    
    if (!isAdmin) {
      if (!fila['TipoContrato']) {
        if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
        errors[rowIndex + 1]['TipoContrato'] = `El tipo de contrato es requerido para usuarios. Ingrese los datos solicitados`;
      }

      if (!fila['Salario']) {
        if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
        errors[rowIndex + 1]['Salario'] = `El salario es requerido para usuarios. Ingrese los datos solicitados`;
      }

      if (!fila['FechaIngreso']) {
        fila['FechaIngreso'] = fechaHoy();
      }

      if (isAsalariado) {
        if (!fila['CantVacacion']) {
          fila['CantVacacion'] = 0;
        }
      } else {
        delete fila['CantVacacion'];
      }
    } else {
      delete fila['TipoContrato'];
      delete fila['Salario'];
      delete fila['FechaIngreso'];
      delete fila['CantVacacion'];
    }

    datos.push(fila)
    fila = {};
  });
  return { datos, errors };
}

function formatearFecha(fecha) {
  // Calcular la fecha base de Excel (1 de enero de 1900)
  const fechaBaseExcel = new Date(1900, 0, 1); // 1900-01-01
  
  // Crear una nueva fecha sumando los días al número base de Excel
  const fechaFormateada = new Date(fechaBaseExcel.getTime() + (fecha - 2) * 24 * 60 * 60 * 1000);
  
  // Obtener componentes de fecha (año, mes, día)
  const year = fechaFormateada.getFullYear();
  const month = String(fechaFormateada.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados en JavaScript
  const day = String(fechaFormateada.getDate()).padStart(2, '0');
  
  // Formato YYYY-MM-DD
  return `${year}-${month}-${day}`;
}

function fechaHoy() {
  const fechaFormateada = new Date();
  
  // Obtener componentes de fecha (año, mes, día)
  const year = fechaFormateada.getFullYear();
  const month = String(fechaFormateada.getMonth() + 1).padStart(2, '0'); // Meses son 0-indexados en JavaScript
  const day = String(fechaFormateada.getDate()).padStart(2, '0');
  
  // Formato YYYY-MM-DD
  return `${year}-${month}-${day}`;
}

module.exports.verificarUsuariosSubidos = async (req, res, next) => {
  const filePath = path.join(__dirname, '../uploads', req.file.filename);

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const validacion = validarDatos(data);
    const erroresDatos = validacion.errors;
    const usuarios = validacion.datos;

    if (Object.keys(erroresDatos).length == 0) {
      borrarExcel(filePath);
      res.status(200).json({
        status: true,
        message: "Formato de archivo correcto",
        usuarios: usuarios
      });
    } else {
      borrarExcel(filePath);
      res.status(200).json({
        status: true,
        message: "Formato de archivo incorrecto",
        errors: erroresDatos,
        usuarios: usuarios,
        id: 'formatoExcel'
      });
    }
  } catch (err) {
    borrarExcel(filePath);
    console.error('Error processing file:', err);
    res.status(500).json({
      status: false,
      message: "Error al procesar el archivo"
    });
  }
};

function borrarExcel(filePath) {
  fs.unlink(filePath, (unlinkErr) => {
    if (unlinkErr) {
      console.error('Error deleting file:', unlinkErr);
    }
  });
}

module.exports.registrarMultiples = async (req, res, next) => {
  try {
    const usuariosData = req.body;

    const usuariosPromises = usuariosData.map(async (usuarioData) => {

      let usuario = {
        idTipoUsuario: usuarioData.IdTipoUsuario ?? usuarioData.idTipoUsuario,
        idTipoContrato: usuarioData.IdTipoContrato ?? usuarioData.idTipoContrato ?? null,
        identificacion: usuarioData.Identificacion ?? usuarioData.identificacion,
        correo: usuarioData.Correo ?? usuarioData.correo,
        password: usuarioData.Password ?? usuarioData.password,
        nombre: usuarioData.Nombre ?? usuarioData.nombre,
        apellidos: usuarioData.Apellidos ?? usuarioData.apellidos,
        salario: usuarioData.Salario ?? usuarioData.salario ?? null,
        fechaIngreso: usuarioData.FechaIngreso ?? usuarioData.fechaIngreso ?? null,
        cantVacacion: usuarioData.CantVacacion ?? usuarioData.cantVacacion ?? null
      };
      // Validate each user data
      validarUsuario(usuario);

  
      //Salt es una cadena aleatoria.
      //"salt round" factor de costo controla cuánto tiempo se necesita para calcular un solo hash de BCrypt
      // salt es un valor aleatorio y debe ser diferente para cada cálculo, por lo que el resultado casi nunca debe ser el mismo, incluso para contraseñas iguales
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(usuario.password.toString(), salt);

      usuario.password = hash;

      // Insert into database
      const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [usuario]);
      return data[0];
    });

    Promise.all(usuariosPromises)
      .then((results) => {
        res.status(201).json({
          success: true,
          message: "Usuarios creados",
          data: results,
        });
      })
      .catch((error) => {
        if (error.code === 'ER_DUP_ENTRY') {
          const match = error.sqlMessage.match(/Duplicate entry '([^']+)'/);
          const duplicatedValue = match ? match[1] : null;

          res.status(400).json({
            success: false,
            message: `Identificación o correo '${duplicatedValue}' ya está en uso por otro usuario`,
            id: 'duplicado',
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.exportUsuarios = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, tu.descripcion as TipoUsuarioDescripcion, tc.descripcion as TipoContratoDescripcion
      FROM ${nombreTabla} u
      INNER JOIN tipoUsuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipoContrato tc ON u.idTipoContrato = tc.id 
      WHERE u.estado != 0`);
    if(data) {
      let workbook = new exceljs.Workbook();
      let worksheet = workbook.addWorksheet('Usuarios');

      const headers = ['Identificacion', 'Tipo de Usuario', 'Nombre', 'Apellidos', 'Correo Electrónico', 'Tipo de Contrato', 'Salario', 'Fecha de Ingreso', 'Cantidad de Vacaciones', 'Estado'];
      const headerRows = worksheet.addRow(headers);


      headerRows.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });


      const columnWidths = headers.map(header => header.length);

      data[0].forEach(usuario => {
        const row = worksheet.addRow([usuario.Identificacion, usuario.TipoUsuarioDescripcion, usuario.Nombre, usuario.Apellidos, usuario.Correo, usuario.TipoContratoDescripcion, usuario.Salario, usuario.FechaIngreso, usuario.CantVacacion, usuario.Estado == 1 ? 'Habilitado' : 'Deshabilitado']);
        
        row.eachCell((cell, colNumber) => {
          if (cell.value && cell.value.toString().length > columnWidths[colNumber - 1]) {
            columnWidths[colNumber - 1] = cell.value.toString().length;
          }
        });
      });

      columnWidths.forEach((width, i) => {
        worksheet.getColumn(i + 1).width = width + 2;
      });


      workbook.xlsx.writeBuffer()
        .then(buffer => {
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="usuario.xlsx"`);
          res.send(buffer);
        })
        .catch(err => {
          console.log(err);
          res.status(500).send({
            success: false,
            message: 'Error al generar el achivo de Excel',
          });
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