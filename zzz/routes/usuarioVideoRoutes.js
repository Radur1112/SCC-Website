const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioVideoController = require("../controllers/usuarioVideoController");

router.get('/', verifyToken, usuarioVideoController.get);
router.get('/:id', verifyToken, usuarioVideoController.getById);
router.get('/usuario/:id', verifyToken, usuarioVideoController.getByIdUsuario);
router.get('/video/:id', verifyToken, usuarioVideoController.getByIdVideo);
router.get('/:idUsuario/:idVideo', verifyToken, usuarioVideoController.getByIdUsuarioIdVideo);

router.post("/", verifyAdministrador, usuarioVideoController.crear);

router.put("/:id", verifyAdministrador, usuarioVideoController.actualizar);
router.put("/borrar/:id", verifyAdministrador, usuarioVideoController.borrar);

module.exports = router;