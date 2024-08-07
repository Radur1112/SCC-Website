const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioModuloController = require("../controllers/usuarioModuloController");

router.get('/', verifyToken, usuarioModuloController.get);
router.get('/:id', verifyToken, usuarioModuloController.getById);
router.get('/usuario/:id', verifyToken, usuarioModuloController.getByIdUsuario);
router.get('/usuario/all/:id', verifyToken, usuarioModuloController.getAllByIdUsuario);
router.get('/modulo/:id', verifyToken, usuarioModuloController.getByIdModulo);

router.post("/", verifyToken, usuarioModuloController.crear);
router.post("/multiple", verifyToken, usuarioModuloController.crearMultiples);
router.post("/borrar/multiple", verifyToken, usuarioModuloController.borrarMultiple);

router.put("/:id", verifyToken, usuarioModuloController.actualizar);
router.put("/borrar/:id", verifyToken, usuarioModuloController.borrar);

module.exports = router;