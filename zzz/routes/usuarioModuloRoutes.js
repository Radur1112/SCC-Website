const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioModuloController = require("../controllers/usuarioModuloController");

router.get('/', verifyToken([0]), usuarioModuloController.get);
router.get('/:id', verifyToken([0]), usuarioModuloController.getById);
router.get('/usuario/:id', verifyToken([0]), usuarioModuloController.getByIdUsuario);
router.get('/usuario/all/:id', verifyToken([0]), usuarioModuloController.getAllByIdUsuario);
router.get('/modulo/:id', verifyToken([0]), usuarioModuloController.getByIdModulo);

router.post("/", verifyToken([0]), usuarioModuloController.crear);
router.post("/multiple", verifyToken([0]), usuarioModuloController.crearMultiples);
router.post("/borrar/multiple", verifyToken([0]), usuarioModuloController.borrarMultiple);

router.put("/:id", verifyToken([0]), usuarioModuloController.actualizar);
router.put("/borrar/:id", verifyToken([0]), usuarioModuloController.borrar);

module.exports = router;