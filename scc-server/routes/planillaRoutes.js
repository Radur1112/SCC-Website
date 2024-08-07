const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const planillaController = require("../controllers/planillaController");

router.get('/crear', verifyAdministrador, planillaController.crearTodos);
router.get('/completar', verifyAdministrador, planillaController.completarTodos);
router.get('/tipos', verifySupervisor, planillaController.getTipos);
router.get('/fechaActual', verifySupervisor, planillaController.getFechaActual);
router.get('/fechas', verifySupervisor, planillaController.getFechas);
router.get('/anotaciones', verifySupervisor, planillaController.getHistorialAnotaciones);
router.get('/historial', verifySupervisor, planillaController.getHistorial);
router.get('/comprobante/:id', verifyToken, planillaController.getComprobantesByIdUsuario);
router.get('/usuario/:id', verifyAdministrador, planillaController.getByIdUsuario);
router.get('/tipos/asalariado', verifySupervisor, planillaController.getTiposAsalariado);
router.get('/tipos/sp', verifySupervisor, planillaController.getTiposSP);
router.get('/historial/supervisor/:id', verifySupervisor, planillaController.getHistorialAnotacionesBySupervisor);

router.post('/', verifyAdministrador, planillaController.crear);
router.post('/fechas', verifyAdministrador, planillaController.actualizarFechas);

router.put('/:id', verifyAdministrador, planillaController.actualizar);

module.exports = router;