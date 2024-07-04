const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioModuloController = require("../controllers/usuarioModuloController");

router.get('/', verifyToken, usuarioModuloController.get);
router.get('/:id', verifyToken, usuarioModuloController.getById);
router.get('/usuario/:id', verifyToken, usuarioModuloController.getByIdUsuario);
router.get('/modulo/:id', verifyToken, usuarioModuloController.getByIdModulo);

router.post("/", verifyAdministrador, usuarioModuloController.crear);
router.post("/multiple", verifyAdministrador, usuarioModuloController.crearMultiples);
router.post("/borrar/multiple", verifyAdministrador, usuarioModuloController.borrarMultiple);

router.put("/:id", verifyAdministrador, usuarioModuloController.actualizar);
router.put("/borrar/:id", verifyAdministrador, usuarioModuloController.borrar);

module.exports = router;