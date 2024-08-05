const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const vacacionController = require("../controllers/vacacionController");

router.get('/', verifySupervisor, vacacionController.get);
router.get('/pendientes', verifySupervisor, vacacionController.getPendientes);
router.get('/:id', verifyToken, vacacionController.getById);
router.get("/confirmar/:id", verifySupervisor, vacacionController.confirmarVacacion);
router.get("/rechazar/:id", verifySupervisor, vacacionController.rechazarVacacion);
router.get('/pendientes/supervisor/:id', verifyToken, vacacionController.getPendientesByIdSupervisor);


router.post("/", verifyToken, vacacionController.crear);


module.exports = router;