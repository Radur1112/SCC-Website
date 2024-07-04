const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const moduloController = require("../controllers/moduloController");

router.get('/', verifyToken, moduloController.get);
router.get('/:id', verifyToken, moduloController.getById);

router.post("/", verifyAdministrador, moduloController.crear);

router.put("/:id", verifyAdministrador, moduloController.actualizar);
router.put("/borrar/:id", verifyAdministrador, moduloController.borrar);

module.exports = router;