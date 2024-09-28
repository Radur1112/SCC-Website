const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const planillaController = require("../controllers/planillaController");

//router.get('/completar', verifyToken([1, 5]), planillaController.completarTodos); planillausuario
//router.get('/tipos', verifyToken([1, 3, 5]), planillaController.getTipos); anotacion
router.get('/actual', verifyToken([1, 3, 5]), planillaController.getActual);
router.get('/fechas', verifyToken([1, 3, 5]), planillaController.getFechas);
//router.get('/anotaciones', verifyToken([1, 3, 5]), planillaController.getHistorialAnotaciones); planillausuarioanotacion
router.get('/historial', verifyToken([1, 3, 5]), planillaController.getHistorial);
//router.get('/usuarios', verifyToken([1, 3, 5]), planillaController.getUsuarios); planillausuario
//router.get('/supervisor/:id', verifyToken([1, 3, 5]), planillaController.getUsuariosByIdSupervisor); planillausuario
//router.get('/comprobantes/:id', verifyToken([0]), planillaController.getComprobantesByIdUsuario); planillausuario
//router.get('/usuario/:id', verifyToken([1, 3, 5]), planillaController.getByIdUsuario); planillausuario
//router.get('/tipos/asalariado', verifyToken([1, 3, 5]), planillaController.getTiposAsalariado); anotacion
//router.get('/tipos/sp', verifyToken([1, 3, 5]), planillaController.getTiposSP); anotacion
//router.get('/actual/exportar', verifyToken([1, 3, 5]), planillaController.exportarPlanillaActual); planillausuario
//router.get('/comprobante/preview/:id', verifyToken([0]), planillaController.getComprobanteByIdPlanilla); planillausuario
//router.get('/comprobante/exportar/:id', verifyToken([0]), planillaController.exportarComprobanteByIdPlanilla); planillausuario
//router.get('/historial/supervisor/:id', verifyToken([1, 3, 5]), planillaController.getHistorialAnotacionesBySupervisor); planillausuarioanotacion

router.get('/crear', verifyToken([1, 5]), planillaController.crear);
//router.post('/anotaciones/fechas', verifyToken([1, 3, 5]), planillaController.getHistorialAnotacionesByPlanillaFechas); planillausuarioanotacion

router.put('/:id', verifyToken([1, 5]), planillaController.actualizar);
//router.put('/salario/:id', verifyToken([1, 3, 5]), planillaController.actualizarSalarioBase); planillausuario

module.exports = router;