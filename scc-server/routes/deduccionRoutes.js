const express = require('express');
const router = express.Router();
const { verifyToken, verifySupervisor, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const deduccionController = require("../controllers/deduccionController");

router.post("/", verifySupervisor, deduccionController.crear);
router.post("/multiple", verifySupervisor, deduccionController.crearMultiples);

router.put("/:id", verifySupervisor, deduccionController.actualizar);
router.put("/borrar/:id", verifySupervisor, deduccionController.borrar);

module.exports = router;