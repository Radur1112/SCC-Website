const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const deduccionController = require("../controllers/deduccionController");

router.post("/", verifySupervisor, deduccionController.crear);
router.post("/multiple", verifySupervisor, deduccionController.crearMultiples);

router.put("/:id", verifyAdministrador, deduccionController.actualizar);
router.put("/borrar/:id", verifyAdministrador, deduccionController.borrar);

module.exports = router;