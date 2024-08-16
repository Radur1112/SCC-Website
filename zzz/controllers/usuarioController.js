const db = require('../utils/db.js');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const xlsx = require('xlsx');
const path = require('path');
const exceljs = require('exceljs');
const fs = require('fs');
const { create_planilla_insert_usuario } = require('../utils/triggers.js')

var nombreTabla = 'usuario';
var selectNoPassword = 'u.id, u.idTipoUsuario, u.idTipoContrato, u.identificacion, u.correo, u.nombre, u.salario, u.fechaIngreso, u.vacacion, u.idPuesto, u.telefono';

module.exports.get = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, 
      tu.descripcion as tipoUsuarioDescripcion, 
      tc.descripcion as tipoContratoDescripcion, 
      p.descripcion as puestoDescripcion 
      FROM ${nombreTabla} u 
      INNER JOIN tipousuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipocontrato tc ON u.idTipoContrato = tc.id 
      LEFT JOIN puesto p ON u.idPuesto = p.id 
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
      SELECT ${selectNoPassword}, 
      tu.descripcion as tipoUsuarioDescripcion, 
      tc.descripcion as tipoContratoDescripcion, 
      p.descripcion as puestoDescripcion
      FROM ${nombreTabla} u
      INNER JOIN tipousuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipocontrato tc ON u.idTipoContrato = tc.id
      LEFT JOIN puesto p ON u.idPuesto = p.id
      WHERE u.estado != 0 AND u.id = ?`, [id]);
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
    const data = await db.query(`SELECT ${selectNoPassword} FROM ${nombreTabla} u WHERE u.estado != 0 AND u.identificacion = ?`, [id]);
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
    const data = await db.query(`SELECT ${selectNoPassword} FROM ${nombreTabla} u WHERE u.estado != 0 AND u.correo = ?`, [correo]);
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

module.exports.getByNoIdModulo = async(req, res, next) => {
  try {
    let idModulo = parseInt(req.params.id);
    if (!idModulo) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const data = await db.query(`
      SELECT u.id as usuarioId, u.identificacion as usuarioIdentificacion, u.nombre as usuarioNombre, u.correo as usuarioCorreo, p.descripcion as usuarioPuesto 
      FROM ${nombreTabla} u 
      INNER JOIN puesto p ON p.id = u.idPuesto
      LEFT JOIN usuariomodulo um ON um.idUsuario = u.id AND um.idModulo = ?
      WHERE u.estado != 0 AND um.idModulo IS NULL || um.idModulo != ?`, [idModulo, idModulo]);
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

module.exports.getAsesores = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, 
      tu.descripcion as tipoUsuarioDescripcion, 
      tc.descripcion as tipoContratoDescripcion, 
      p.descripcion as puestoDescripcion 
      FROM ${nombreTabla} u 
      INNER JOIN tipousuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipocontrato tc ON u.idTipoContrato = tc.id 
      LEFT JOIN puesto p ON u.idPuesto = p.id 
      WHERE u.estado != 0 AND u.idTipoUsuario = 2`);
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

module.exports.getSupervisores = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT 
        u.id AS id, u.identificacion AS identificacion, u.nombre AS nombre, u.correo AS correo,
        p.descripcion AS puestoDescripcion, 
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'usuarioId', su.id,
                'usuarioIdentificacion', su.identificacion,
                'usuarioNombre', su.nombre,
                'usuarioCorreo', su.correo,
                'usuarioPuestoDescripcion', p2.descripcion
              )
            )
          FROM usuario su
          INNER JOIN usuariosupervisor us ON su.id = us.idUsuario
          INNER JOIN puesto p2 ON p2.id = su.idPuesto
          WHERE us.idSupervisor = u.id AND su.estado != 0
        ) AS supervisados,
        (
          SELECT 
            JSON_ARRAYAGG(
              JSON_OBJECT(
                'usuarioId', uno.id,
                'usuarioIdentificacion', uno.identificacion,
                'usuarioNombre', uno.nombre,
                'usuarioCorreo', uno.correo,
                'usuarioPuestoDescripcion', p3.descripcion
              )
            )
          FROM usuario uno
          INNER JOIN puesto p3 ON p3.id = uno.idPuesto
          WHERE uno.id NOT IN (
            SELECT idUsuario FROM usuariosupervisor WHERE idSupervisor = u.id
          ) AND uno.estado != 0 AND uno.idTipoUsuario = 2
        ) AS noSupervisados
      FROM ${nombreTabla} u
      INNER JOIN puesto p ON p.id = u.idPuesto
      WHERE u.estado != 0 AND u.idTipoUsuario = 3
      GROUP BY u.id;`);
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

/*module.exports.getPlanilla = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, 
      p.descripcion as puestoDescripcion,
      pl.fechaInicio as planillaFechaInicio, pl.fechaFinal as planillaFechaFinal, pl.salarioBruto as planillaSalarioBruto, pl.salarioNeto as planillaSalarioNeto, 
      a.descripcion as aumentoDescripcion, a.monto as aumentoMonto, 
      ta.descripcion as tipoAumentoDescripcion, 
      d.descripcion as deduccionDescripcion, d.monto as deduccionMonto, 
      td.descripcion as tipoDeduccionDescripcion 
      FROM ${nombreTabla} u 
      INNER JOIN puesto p ON p.id = u.idPuesto 
      INNER JOIN planilla pl ON pl.idUsuario = u.id 
      LEFT JOIN aumento a ON a.idPlanilla = pl.id 
      LEFT JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
      LEFT JOIN deduccion d ON d.idPlanilla = pl.id 
      LEFT JOIN tipodeduccion td ON td.id = a.idTipoDeduccion 
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
}*/

module.exports.login = async (req, res, next) => {
    try {
      let usuarioReq = req.body;

      const data = await db.query(`SELECT * FROM ${nombreTabla} WHERE estado != 0 AND correo = ?`, [usuarioReq.correo]);
      if (data) {
        if (data[0].length === 0) {
          return res.status(401).json({
              success: false,
              message: "Usuario no registrado",
          });
        }
        const usuario = data[0][0];
        
        // Compare passwords
        const compararPassword = await bcrypt.compare(usuarioReq.password, usuario.password);
        if (!compararPassword) {
          return res.status(401).json({
              success: false,
              message: "Credenciales no válidas"
          });
        }

        // Create payload
        const payload = {
          id: usuario.id,
          correo: usuario.correo,
          idTipoUsuario: usuario.idTipoUsuario
        };
  
        // Create JWT token
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
          expiresIn: process.env.JWT_EXPIRE
        });
        
        delete usuario['password'];
        
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

module.exports.registrar = async (req, res, next) => {
  try {
    const usuarioData = req.body;

    let usuario = {
      idTipoUsuario: usuarioData.idTipoUsuario,
      idTipoContrato: usuarioData.idTipoContrato,
      identificacion: usuarioData.identificacion,
      correo: usuarioData.correo,
      password: usuarioData.password,
      nombre: usuarioData.nombre,
      salario: usuarioData.salario,
      fechaIngreso: usuarioData.fechaIngreso,
      vacacion: verificarVacacion(usuarioData.vacacion ?? null),
      idPuesto: usuarioData.idPuesto,
      telefono: usuarioData.telefono
    }

    validarUsuario(usuario);
  
    //Salt es una cadena aleatoria.
    //"salt round" factor de costo controla cuánto tiempo se necesita para calcular un solo hash de BCrypt
    // salt es un valor aleatorio y debe ser diferente para cada cálculo, por lo que el resultado casi nunca debe ser el mismo, incluso para contraseñas iguales
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(usuarioData.password.toString(), salt);

    usuario.password = hash;

    const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [usuario]);
    if (data) {
      if (usuario.idPuesto != 1 && usuario.idPuesto != 2) {
        create_planilla_insert_usuario(data[0].insertId);
      }
      
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
        message: 'Identificación y/o correo ya está en uso por otro usuario',
        id: 'duplicado',
      });
    } else {
      console.log(error);
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
      idTipoUsuario: usuarioData.idTipoUsuario,
      idTipoContrato: usuarioData.idTipoContrato,
      identificacion: usuarioData.identificacion,
      correo: usuarioData.correo,
      password: usuarioData.password ?? usuarioData.password == null ? null : undefined,
      nombre: usuarioData.nombre,
      salario: usuarioData.salario,
      fechaIngreso: usuarioData.fechaIngreso,
      vacacion: verificarVacacion(usuarioData.vacacion ?? null),
      idPuesto: usuarioData.idPuesto,
      telefono: usuarioData.telefono
    }

    validarUsuario(usuario);

    let data;

    if (usuario.password) {
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(usuario.password.toString(), salt);

      data = await db.query(`
        UPDATE ${nombreTabla} 
        SET idTipoUsuario = ?, idTipoContrato = ?, identificacion = ?, correo = ?, nombre = ?, salario = ?, fechaIngreso = ?, vacacion = ?, idPuesto = ?, telefono = ?, password = ? 
        WHERE id = ?`, 
        [usuario.idTipoUsuario, usuario.idTipoContrato, usuario.identificacion, usuario.correo, usuario.nombre, usuario.salario, usuario.fechaIngreso, usuario.vacacion, usuario.idPuesto, usuario.telefono, hash, id]);
    } else {
      data = await db.query(`
        UPDATE ${nombreTabla} 
        SET idTipoUsuario = ?, idTipoContrato = ?, identificacion = ?, correo = ?, nombre = ?, salario = ?, fechaIngreso = ?, vacacion = ?, idPuesto = ?, telefono = ?
        WHERE id = ?`, 
        [usuario.idTipoUsuario, usuario.idTipoContrato, usuario.identificacion, usuario.correo, usuario.nombre, usuario.salario, usuario.fechaIngreso, usuario.vacacion, usuario.idPuesto, usuario.telefono, id]);
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

module.exports.actualizarSalario = async (req, res, next) => {
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
      salario: usuarioData.salario
    }

    let data = await db.query(`UPDATE ${nombreTabla} SET salario = ? WHERE id = ?`, [usuario.salario, id]);
    
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

function validarUsuario(usuarioData) {
  const MAX_IDENTIFICACION_LENGTH = 20;
  const MAX_CORREO_LENGTH = 250;
  const MAX_PASSWORD_LENGTH = 60;
  const MAX_NOMBRE_LENGTH = 250;
  const MAX_TELEFONO_LENGTH = 20; 

  const MIN_SALARIO = 0;
  const MAX_SALARIO = 999999999;
  const MIN_ID = 0;
  const MAX_ID = 99;
  
  if (!usuarioData.idTipoUsuario || isNaN(usuarioData.idTipoUsuario) || usuarioData.idTipoUsuario < MIN_ID || usuarioData.idTipoUsuario > MAX_ID) {
    throw new Error('idTipoUsuario debe ser un número válido');
  }
  
  if (!usuarioData.idTipoContrato || (isNaN(usuarioData.idTipoContrato) || usuarioData.idTipoContrato < MIN_ID || usuarioData.idTipoContrato > MAX_ID)) {
    throw new Error('idTipoContrato debe ser un número válido');
  }
  
  if (!usuarioData.identificacion) {
    throw new Error('identificacion es requerida');
  }
  if (usuarioData.identificacion.length > MAX_IDENTIFICACION_LENGTH) {
    throw new Error(`identificacion no debe exceder el limite de ${MAX_IDENTIFICACION_LENGTH} carácteres`);
  }
  
  if (!usuarioData.correo || !isValidEmail(usuarioData.correo)) {
    throw new Error('correo es requerido y debe ser un correo electrónico válido');
  }
  if (usuarioData.correo.length > MAX_CORREO_LENGTH) {
    throw new Error(`correo no debe exceder el limite de ${MAX_CORREO_LENGTH} carácteres`);
  }
  
  if (usuarioData.password === undefined) {
    throw new Error('password es requerida');
  }
  if (usuarioData.password && usuarioData.password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`password no debe exceder el limite de ${MAX_PASSWORD_LENGTH} carácteres`);
  }
  
  if (!usuarioData.nombre) {
    throw new Error('nombre es requerido');
  }
  if (usuarioData.nombre.length > MAX_NOMBRE_LENGTH) {
    throw new Error(`nombre no debe exceder el limite de ${MAX_NOMBRE_LENGTH} carácteres`);
  }

  if (!usuarioData.telefono || !isValidTelefono(usuarioData.telefono) || usuarioData.telefono.length > MAX_TELEFONO_LENGTH) {
    throw new Error(`telefono debe ser un número de telefono válido y no debe exceder el limite de ${MAX_TELEFONO_LENGTH} carácteres`);
  }
  
  if (!usuarioData.idPuesto || isNaN(usuarioData.idPuesto) || usuarioData.idPuesto < MIN_ID || usuarioData.idPuesto > MAX_ID) {
    throw new Error('idPuesto debe ser un número válido');
  }
  
  if (!usuarioData.salario || (isNaN(usuarioData.salario) || usuarioData.salario < MIN_SALARIO || usuarioData.salario > MAX_SALARIO)) {
    throw new Error('salario debe ser un número válido dentro del límite establecido');
  }

  if (!usuarioData.fechaIngreso || !isValidDate(usuarioData.fechaIngreso)) {
    throw new Error('fechaIngreso debe ser una fecha válida');
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidDate(dateString) {
  return !isNaN(Date.parse(dateString));
}

function isValidTelefono(telefono) {
  const telefonoRegex = /^[+]?[\d\s\-().]{0,20}$/;
  return telefonoRegex.test(telefono);
}


const nombresPermitidos = {
  'tipoUsuario': ['tipousuario', 'tipodeusuario', 'rol'],
  'tipoContrato': ['tipocontrato', 'tipodecontrato', 'contrato'],
  'identificacion': ['identificacion', 'id', 'numerodeidentificacion', 'cedula', 'numerodecedula'],
  'correo': ['correo', 'correoelectronico', 'email', 'mail'],
  'password': ['password', 'contrasena', 'contraseña'],
  'nombre': ['nombre', 'nombres', 'nombrecompleto', 'nombreyapellidos'],
  'puesto': ['puesto', 'posicion'],
  'telefono': ['telefono', 'numerotelefono', 'numerodetelefono'],
  'salario': ['salario', 'sueldo'],
  'fechaIngreso': ['fechaingreso', 'fechadeingreso', 'fechainicio', 'fechadeinicio', 'fecha'],
  'vacacion': ['cantvacacion', 'cantvacaciones', 'cantidaddevacaciones', 'cantidaddevacacionesinicial', 'cantidaddevacacionesiniciales', 'vacacionesiniciales', 'vacacioninicial', 'vacacion', 'vacaciones']
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

async function getMap(tabla) {
  const data = await db.query(`SELECT * FROM ${tabla}`);
  
  const mapping = {};
  data[0].forEach(row => {
    mapping[formatearNombre(row.descripcion)] = row.id;
  });
  
  return mapping;
}

async function validarDatos(data) {
  let datos = [];
  let fila = {};
  let errors = {};
  let isAsalariado = false;

  const tipoUsuarios = await getMap('tipousuario');
  const tipoContratos = await getMap('tipocontrato');
  const puestos = await getMap('puesto');

  const [rows1] = await db.query('SELECT * FROM tipousuario');
  const [rows2] = await db.query('SELECT * FROM tipocontrato');
  const [rows3] = await db.query('SELECT * FROM puesto');
  const tus = rows1.length ? rows1 : null;
  const tcs = rows2.length ? rows2 : null;
  const ps = rows3.length ? rows3 : null;

  const minSalario = 0;
  const maxSalario = 999999999;

  data.forEach(async (row, rowIndex) => {
    for (let nombreColumnaExcel in row) {
      const nombreValidado = validarNombre(nombreColumnaExcel);

      if (!nombreValidado) {
        if (!errors['nombreColumnaExcel']) errors['nombreColumnaExcel'] = {};
        errors['nombreColumnaExcel'][nombreColumnaExcel] = `El nombre de columna '${nombreColumnaExcel}' no fue reconocido.`;
      } else {
        switch (nombreValidado) {
          case 'tipoUsuario':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 45) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['tipoUsuario'] = `El tipo de usuario excede el límite de 45 carácteres.`;
            } else {
              let tipoUsuario = row[nombreColumnaExcel] ? formatearNombre(row[nombreColumnaExcel]) : '';
              const idTipoUsuario = tipoUsuarios[tipoUsuario];
              
              if (!idTipoUsuario) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['tipoUsuario'] = `El tipo de usuario es inválido.`;
              } else {
                tipoUsuario = tus.find(tu => tu.id == idTipoUsuario)?.descripcion;
                
                row[nombreColumnaExcel] = tipoUsuario;
              }
            }
            break;
          case 'tipoContrato':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 45) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['tipoContrato'] = `El tipo de contrato excede el límite de 45 carácteres`;
            } else {
              let tipoContrato = row[nombreColumnaExcel] ? formatearNombre(row[nombreColumnaExcel]) : '';
              const idTipoContrato = tipoContratos[tipoContrato];
              
              if (!idTipoContrato) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['tipoContrato'] = `El tipo de contrato es inválido.`;
              } else {
                tipoContrato = tcs.find(tc => tc.id == idTipoContrato)?.descripcion;
                switch (idTipoContrato) {
                  case 1:
                    isAsalariado = true;
                    break;
                  default:
                    isAsalariado = false;
                }
                row[nombreColumnaExcel] = tipoContrato;
              }
            }
            break;
          case 'identificacion':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 20) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['identificacion'] = `La identificacion excede el límite de 20 carácteres`;
            }
            break;
          case 'correo':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 250) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['correo'] = `El correo electrónico excede el límite de 250 carácteres`;
            } else {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
              if (row[nombreColumnaExcel] && !emailRegex.test(row[nombreColumnaExcel].toString().trim())) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['correo'] = `El correo electrónico es inválido. Debe ser un correo electrónico válido`;
              }
            }
            break;
          case 'password':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 60) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['password'] = `La contraseña excede el límite de 60 carácteres`;
            }
            break;
          case 'nombre':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 250) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['nombre'] = `El nombre excede el límite de 250 carácteres`;
            }
            break;
          case 'puesto':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 45) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['puesto'] = `El tipo de contrato excede el límite de 45 carácteres`;
            } else {
              let puesto = row[nombreColumnaExcel] ? formatearNombre(row[nombreColumnaExcel]) : '';
              const idPuesto = puestos[puesto];
              
              if (!idPuesto) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['puesto'] = `El puesto es inválido.`;
              } else {
                puesto = ps.find(p => p.id == idPuesto)?.descripcion;

                row[nombreColumnaExcel] = puesto;
              }
            }
            break;
          case 'telefono':
            if (row[nombreColumnaExcel] && row[nombreColumnaExcel].toString().trim().length > 20) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['telefono'] = `El telefono excede el límite de 20 carácteres`;
            } else {
              const telefonoRegex = /^[+]?[\d\s\-().]{0,20}$/;
  
              if (row[nombreColumnaExcel] && !telefonoRegex.test(row[nombreColumnaExcel].toString().trim())) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['telefono'] = `El telefono es inválido.`;
              }
            }
            break;
          case 'salario':
            if (isNaN(row[nombreColumnaExcel])) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['salario'] = `El salario es inválido. Debe ser un número válido`;
            } else {
              const salario = parseFloat(row[nombreColumnaExcel]);
              if (salario < minSalario || salario > maxSalario) {
                if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
                errors[rowIndex + 1]['salario'] = `El salario está fuera de los límites establecidos. Debe estar entre ${minSalario} y ${maxSalario}.`;
              }
            }
            break;
          case 'fechaIngreso':
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            const fechaFormateada = formatearFecha(row[nombreColumnaExcel]);

            if (row[nombreColumnaExcel] && !dateRegex.test(fechaFormateada.trim())) {
              if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
              errors[rowIndex + 1]['fechaIngreso'] = `La fecha es inválida. Revise el formato de la misma`;
            } else {
              row[nombreColumnaExcel] = fechaFormateada;
            }
            break;
          case 'vacacion':
            break;
        }
      }
      fila[nombreValidado] = row[nombreColumnaExcel];
    }

    if (!fila['identificacion']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['identificacion'] = `La identificacion es requerida. Ingrese los datos solicitados`;
    }

    if (!fila['correo']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['correo'] = `El correo electrónico es requerido. Ingrese los datos solicitados`;
    }

    if (!fila['password']) {
      if (fila['identificacion']) {
        fila['password'] = fila['identificacion'];

        if (fila['password'] && fila['password'].toString().trim().length > 60) {
          if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
          errors[rowIndex + 1]['password'] = `La contraseña excede el límite de 60 carácteres`;
        }
      }
    }
    
    if (!fila['nombre']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['nombre'] = `El nombre es requerido. Ingrese los datos solicitados`;
    }

    if (!fila['puesto']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['puesto'] = `El puesto es requerido para usuarios. Ingrese los datos solicitados`;
    }

    if (!fila['telefono']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['telefono'] = `El telefono es requerido para usuarios. Ingrese los datos solicitados`;
    }

    if (!fila['tipoContrato']) {
      fila['tipoContrato'] = 'Asalariado';
    }

    if (!fila['salario']) {
      if (!errors[rowIndex + 1]) errors[rowIndex + 1] = {};
      errors[rowIndex + 1]['salario'] = `El salario es requerido para usuarios. Ingrese los datos solicitados`;
    }

    if (!fila['fechaIngreso']) {
      fila['fechaIngreso'] = fechaHoy();
    }

    if (!fila['vacacion']) {
      fila['vacacion'] = null;
    }

    if (!fila['tipoUsuario']) {
      switch(fila['puesto']) {
        case 'TI':
          fila['tipoUsuario'] = 'Administrador';
          break;
        case 'Gerente':
          fila['tipoUsuario'] = 'Administrador';
          break;
        case 'Supervisor':
          fila['tipoUsuario'] = 'Supervisor';
          break;
        case 'Asesor':
          fila['tipoUsuario'] = 'Asesor';
          break;
        case 'Contabilidad':
          fila['tipoUsuario'] = 'Supervisor';
          break;
        case 'Rango Medio':
          fila['tipoUsuario'] = 'Supervisor';
          break;
      }
    }
    console.log(fila)

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

    const validacion = await validarDatos(data);
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

    const correos = usuariosData.map(u => u.correo);
    const identificaciones = usuariosData.map(u => u.identificacion);
    const telefonos = usuariosData.map(u => u.telefono);

    const [duplicados] = await db.query(`
      SELECT 
        CASE WHEN correo IN (?) THEN correo ELSE NULL END AS correo,
        CASE WHEN identificacion IN (?) THEN identificacion ELSE NULL END AS identificacion,
        CASE WHEN telefono IN (?) THEN telefono ELSE NULL END AS telefono 
      FROM ${nombreTabla}
      WHERE estado != 0 AND (correo IN (?) OR identificacion IN (?) OR telefono IN (?))`, [correos, identificaciones, telefonos, correos, identificaciones, telefonos]);
      
    if (duplicados.length > 0) {
      const errorCorreos = duplicados.map(usuario => usuario.correo ? `${usuario.correo}<br>` : '').join('');
      const errorIdentificaciones = duplicados.map(usuario => usuario.identificacion ? `${usuario.identificacion}<br>` : '').join('');
      const errorTelefonos = duplicados.map(usuario => usuario.telefono ? `${usuario.telefono}<br>` : '').join('');
      
      const message = 
        (errorCorreos ? `Los siguientes correos ya están ocupados por otros usuarios: <br>${errorCorreos}<br>` : '') + 
        (errorIdentificaciones ? `Las siguientes identificaciones ya están ocupadas por otros usuarios: <br>${errorIdentificaciones}<br>` : '') + 
        (errorTelefonos ? `Los siguientes telefonos ya están ocupados por otros usuarios: <br>${errorTelefonos}<br>` : '');

      return res.status(400).json({
        success: false,
        message: message,
        id: 'duplicado',
      });
    }

    const usuariosPromises = usuariosData.map(async (usuarioData) => {

      let usuario = {
        idTipoUsuario: usuarioData.idTipoUsuario,
        idTipoContrato: usuarioData.idTipoContrato,
        identificacion: usuarioData.identificacion,
        correo: usuarioData.correo,
        password: usuarioData.password,
        nombre: usuarioData.nombre,
        salario: usuarioData.salario,
        fechaIngreso: usuarioData.fechaIngreso,
        vacacion: verificarVacacion(usuarioData.vacacion ?? null),
        idPuesto: usuarioData.idPuesto,
        telefono: usuarioData.telefono
      };

      validarUsuario(usuario);

      // Salt is a random string.
      // The "salt round" cost factor controls how long it takes to calculate a single BCrypt hash.
      // Salt is a random value and should be different for each calculation, so the result should almost never be the same, even for the same passwords.
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(usuario.password.toString(), salt);

      usuario.password = hash;

      // Insert into database
      const data = await db.query(`INSERT INTO ${nombreTabla} SET ?`, [usuario]);
      if (usuario.idPuesto != 1 && usuario.idPuesto != 2) {
        create_planilla_insert_usuario(data[0].insertId);
      }
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
            message: `'${duplicatedValue}' ya está en uso por otro usuario`,
            id: 'duplicado',
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
    console.log(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports.exportUsuarios = async(req, res, next) => {
  try {
    const data = await db.query(`
      SELECT ${selectNoPassword}, 
      tu.descripcion as tipoUsuarioDescripcion, 
      tc.descripcion as tipoContratoDescripcion, 
      p.descripcion as puestoDescripcion
      FROM ${nombreTabla} u
      INNER JOIN tipousuario tu ON u.idTipoUsuario = tu.id 
      LEFT JOIN tipocontrato tc ON u.idTipoContrato = tc.id
      LEFT JOIN puesto p ON u.idPuesto = p.id`);
    if(data) {
      let workbook = new exceljs.Workbook();
      let worksheet = workbook.addWorksheet('Usuarios');

      const headers = ['Nombre', 'Cedula', 'Tipo de Usuario', 'Puesto', 'Correo', 'Salario', 'Tipo de Contrato', 'Vacaciones', 'Telefono', 'Fecha de Ingreso'];
      const headerRows = worksheet.addRow(headers);


      headerRows.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
      });


      const columnWidths = headers.map(header => header.length);

      data[0].forEach(usuario => {
        const headers = ['Nombre', 'Cedula', 'Tipo de Usuario', 'Puesto', 'Correo', 'Salario', 'Tipo de Contrato', 'Vacaciones', 'Telefono', 'Fecha de Ingreso'];
        const row = worksheet.addRow([usuario.nombre, usuario.identificacion, usuario.tipoUsuarioDescripcion, usuario.puestoDescripcion, usuario.correo, usuario.salario, usuario.tipoContratoDescripcion, usuario.vacacion, usuario.telefono, usuario.fechaIngreso]);
        
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

function verificarVacacion(vacacion) {
  if (!vacacion || isNaN(Number(vacacion)) || vacacion == '') {
    return null;
  } else {
    return vacacion;
  }
}