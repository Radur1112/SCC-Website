const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const planillaUsuarioController = require("../controllers/planillaUsuarioController");

router.get('/planilla/:idPlanilla/supervisor/:idSupervisor', verifyToken([1, 3, 5]), planillaUsuarioController.getByIdPlanillaByIdSupervisor);
router.get('/comprobante/preview/:id', verifyToken([0]), planillaUsuarioController.getComprobanteByIdPlanillaUsuario);
router.get('/resumen/exportar/:id', verifyToken([1, 3, 5]), planillaUsuarioController.exportarResumenByIdPlanilla);
router.get('/comprobante/exportar/actual/:id', verifyToken([0]), planillaUsuarioController.exportarComprobanteActualByIdPlanillaUsuario);

router.get('/:id', verifyToken([1, 3, 5]), planillaUsuarioController.getComprobanteByIdPlanillaUsuario);
router.get('/planilla/:id', verifyToken([1, 5]), planillaUsuarioController.getByIdPlanilla);
router.get('/usuario/:id', verifyToken([1, 3, 5]), planillaUsuarioController.getByIdUsuario);
router.get('/completar/:id', verifyToken([1, 5]), planillaUsuarioController.completarByIdPlanilla);


router.put('/salario/:id', verifyToken([1, 3, 5]), planillaUsuarioController.actualizarSalarioBase);

module.exports = router;