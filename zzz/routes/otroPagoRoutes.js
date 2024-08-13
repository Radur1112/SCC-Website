const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const otroPagoController = require("../controllers/otroPagoController");

router.post("/", verifyToken([1, 3, 5]), otroPagoController.crear);
router.post("/multiple", verifyToken([1, 3, 5]), otroPagoController.crearMultiples);

router.put("/:id", verifyToken([1, 3, 5]), otroPagoController.actualizar);
router.put("/borrar/:id", verifyToken([1, 3, 5]), otroPagoController.borrar);

module.exports = router;