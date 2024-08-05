const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const aumentoController = require("../controllers/aumentoController");

router.post("/", verifySupervisor, aumentoController.crear);
router.post("/multiple", verifySupervisor, aumentoController.crearMultiples);

router.put("/:id", verifyAdministrador, aumentoController.actualizar);
router.put("/borrar/:id", verifyAdministrador, aumentoController.borrar);

module.exports = router;