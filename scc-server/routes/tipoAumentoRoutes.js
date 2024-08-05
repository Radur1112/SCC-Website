const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const tipoAumentoController = require("../controllers/tipoAumentoController");

router.get('/', verifyToken, tipoAumentoController.get);
router.get('/:id', verifyToken, tipoAumentoController.getById);

router.post("/", verifyAdministrador, tipoAumentoController.crear);

router.put("/:id", verifyAdministrador, tipoAumentoController.actualizar);
router.put("/borrar/:id", verifyAdministrador, tipoAumentoController.borrar);

module.exports = router;