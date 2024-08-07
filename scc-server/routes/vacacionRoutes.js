const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const vacacionController = require("../controllers/vacacionController");

router.get('/', verifyToken, vacacionController.get);
router.get('/pendientes', verifySupervisor, vacacionController.getPendientes);
router.get('/:id', verifySupervisor, vacacionController.getById);
router.get("/confirmar/:id", verifySupervisor, vacacionController.confirmarVacacion);
router.get("/rechazar/:id", verifySupervisor, vacacionController.rechazarVacacion);
router.get('/pendientes/supervisor/:id', verifySupervisor, vacacionController.getPendientesByIdSupervisor);


router.post("/", verifyToken, vacacionController.crear);


module.exports = router;