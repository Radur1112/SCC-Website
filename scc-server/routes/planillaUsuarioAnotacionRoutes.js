const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const planillaUsuarioAnotacionController = require("../controllers/planillaUsuarioAnotacionController");

router.get('/activa/', verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.getActiva);
router.get('/activa/supervisor/:id', verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.getActivaByIdSupervisor);
router.get('/historial/planilla/:id', verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.getHistorialAnotacionesByidPlanilla);
router.get('/historial/planilla/:idPlanilla/supervisor/:idSupervisor', verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.getHistorialAnotacionesByidPlanillaIdSupervisor);

router.post("/", verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.crear);
router.post("/multiple", verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.crearMultiples);

router.put("/:id", verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.actualizar);
router.put("/borrar/:id", verifyToken([1, 3, 5]), planillaUsuarioAnotacionController.borrar);

module.exports = router;