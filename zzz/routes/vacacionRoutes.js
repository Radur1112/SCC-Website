const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const vacacionController = require("../controllers/vacacionController");

router.get('/', verifyToken([0]), vacacionController.get);
router.get('/pendientes', verifyToken([1, 3]), vacacionController.getPendientes);
router.get('/:id', verifyToken([1, 3]), vacacionController.getById);
router.get("/usuario/:id", verifyToken([0]), vacacionController.getByIdUsuario);
router.get("/confirmar/:id", verifyToken([1, 3]), vacacionController.confirmarVacacion);
router.get("/rechazar/:id", verifyToken([1, 3]), vacacionController.rechazarVacacion);
router.get("/noRechazado/usuario/:id", verifyToken([0]), vacacionController.getNoRechazadoByIdUsuario);
router.get('/pendientes/supervisor/:id', verifyToken([1, 3]), vacacionController.getPendientesByIdSupervisor);


router.post("/", verifyToken([0]), vacacionController.crear);


module.exports = router;