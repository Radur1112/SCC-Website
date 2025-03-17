const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const vacacionController = require("../controllers/vacacionController");

router.get('/', verifyToken([0]), vacacionController.get);
router.get('/exportar', verifyToken([1]), vacacionController.exportarExcel);
router.get('/pendientes', verifyToken([1]), vacacionController.getPendientes);
router.get('/:id', verifyToken([1, 3]), vacacionController.getById);
router.get("/usuario/:id", verifyToken([0]), vacacionController.getByIdUsuario);
router.get("/supervisor/:id", verifyToken([0]), vacacionController.getByIdSupervisor);
router.get('/exportar/supervisor/:id', verifyToken([1, 3]), vacacionController.exportarExcelByIdSupervisor);
router.get("/noRechazado/usuario/:id", verifyToken([0]), vacacionController.getNoRechazadoByIdUsuario);
router.get('/pendientes/supervisor/:id', verifyToken([1, 3]), vacacionController.getPendientesByIdSupervisor);

router.post("/", verifyToken([0]), vacacionController.crear);

router.put("/confirmar/:id", verifyToken([1, 3]), vacacionController.confirmarVacacion);
router.put("/rechazar/:id", verifyToken([1, 3]), vacacionController.rechazarVacacion);
router.put("/cancelar/:id", verifyToken([1, 3]), vacacionController.cancelarVacacion);
router.put("/cancelar/:id/:estado", verifyToken([1, 3]), vacacionController.cancelarVacacion);


module.exports = router;