const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const tipoDeduccionController = require("../controllers/tipoDeduccionController");

router.get('/', verifyToken, tipoDeduccionController.get);
router.get('/:id', verifyToken, tipoDeduccionController.getById);

router.post("/", verifyAdministrador, tipoDeduccionController.crear);

router.put("/:id", verifyAdministrador, tipoDeduccionController.actualizar);
router.put("/borrar/:id", verifyAdministrador, tipoDeduccionController.borrar);

module.exports = router;