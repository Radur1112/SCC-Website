const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const tipoAumentoController = require("../controllers/tipoAumentoController");

router.get('/', verifyToken([0]), tipoAumentoController.get);
router.get('/:id', verifyToken([0]), tipoAumentoController.getById);

router.post("/", verifyToken([1, 5]), tipoAumentoController.crear);

router.put("/:id", verifyToken([1, 5]), tipoAumentoController.actualizar);
router.put("/borrar/:id", verifyToken([1, 5]), tipoAumentoController.borrar);

module.exports = router;