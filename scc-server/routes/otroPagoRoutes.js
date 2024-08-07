const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const otroPagoController = require("../controllers/otroPagoController");

router.post("/", verifySupervisor, otroPagoController.crear);
router.post("/multiple", verifySupervisor, otroPagoController.crearMultiples);

router.put("/:id", verifySupervisor, otroPagoController.actualizar);
router.put("/borrar/:id", verifySupervisor, otroPagoController.borrar);

module.exports = router;