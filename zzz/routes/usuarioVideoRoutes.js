const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioVideoController = require("../controllers/usuarioVideoController");

router.get('/', verifyToken([0]), usuarioVideoController.get);
router.get('/:id', verifyToken([0]), usuarioVideoController.getById);
router.get('/usuario/:id', verifyToken([0]), usuarioVideoController.getByIdUsuario);
router.get('/video/:id', verifyToken([0]), usuarioVideoController.getByIdVideo);
router.get('/:idUsuario/:idVideo', verifyToken([0]), usuarioVideoController.getByIdUsuarioIdVideo);

router.post("/", verifyToken([0]), usuarioVideoController.crear);

router.put("/:id", verifyToken([0]), usuarioVideoController.actualizar);
router.put("/borrar/:id", verifyToken([0]), usuarioVideoController.borrar);

module.exports = router;