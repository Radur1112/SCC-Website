const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const planillaController = require("../controllers/planillaController");

router.get('/crear', verifyToken([1, 5]), planillaController.crearTodos);
router.get('/completar', verifyToken([1, 5]), planillaController.completarTodos);
router.get('/tipos', verifyToken([1, 3, 5]), planillaController.getTipos);
router.get('/fechaActual', verifyToken([1, 3, 5]), planillaController.getFechaActual);
router.get('/fechas', verifyToken([1, 3, 5]), planillaController.getFechas);
router.get('/anotaciones', verifyToken([1, 3, 5]), planillaController.getHistorialAnotaciones);
router.get('/historial', verifyToken([1, 3, 5]), planillaController.getHistorial);
router.get('/usuarios', verifyToken([1, 3, 5]), planillaController.getUsuarios);
router.get('/supervisor/:id', verifyToken([1, 3, 5]), planillaController.getUsuariosByIdSupervisor);
router.get('/comprobante/:id', verifyToken([0]), planillaController.getComprobantesByIdUsuario);
router.get('/usuario/:id', verifyToken([1, 3, 5]), planillaController.getByIdUsuario);
router.get('/tipos/asalariado', verifyToken([1, 3, 5]), planillaController.getTiposAsalariado);
router.get('/tipos/sp', verifyToken([1, 3, 5]), planillaController.getTiposSP);
router.get('/historial/supervisor/:id', verifyToken([1, 3, 5]), planillaController.getHistorialAnotacionesBySupervisor);

router.post('/', verifyToken([1, 5]), planillaController.crear);
router.post('/fechas', verifyToken([1, 5]), planillaController.actualizarFechas);

router.put('/:id', verifyToken([1, 5]), planillaController.actualizar);
router.put('/salario/:id', verifyToken([1, 3, 5]), planillaController.actualizarSalarioBase);

module.exports = router;