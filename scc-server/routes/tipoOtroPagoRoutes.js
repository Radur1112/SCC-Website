const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const tipoOtroPagoController = require("../controllers/tipoOtroPagoController");

router.get('/', verifyToken([0]), tipoOtroPagoController.get);
router.get('/:id', verifyToken([0]), tipoOtroPagoController.getById);

router.post("/", verifyToken([1, 5]), tipoOtroPagoController.crear);

router.put("/:id", verifyToken([1, 5]), tipoOtroPagoController.actualizar);
router.put("/borrar/:id", verifyToken([1, 5]), tipoOtroPagoController.borrar);

module.exports = router;