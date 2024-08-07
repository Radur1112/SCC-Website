const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioVideoController = require("../controllers/usuarioVideoController");

router.get('/', verifyToken, usuarioVideoController.get);
router.get('/:id', verifyToken, usuarioVideoController.getById);
router.get('/usuario/:id', verifyToken, usuarioVideoController.getByIdUsuario);
router.get('/video/:id', verifyToken, usuarioVideoController.getByIdVideo);
router.get('/:idUsuario/:idVideo', verifyToken, usuarioVideoController.getByIdUsuarioIdVideo);

router.post("/", verifyToken, usuarioVideoController.crear);

router.put("/:id", verifyToken, usuarioVideoController.actualizar);
router.put("/borrar/:id", verifyToken, usuarioVideoController.borrar);

module.exports = router;