const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioRespuestaController = require("../controllers/usuarioRespuestaController");

router.get('/', verifyToken, usuarioRespuestaController.get);
router.get('/:id', verifyToken, usuarioRespuestaController.getById);
router.get('/usuarioQuiz/:id', verifyToken, usuarioRespuestaController.getByIdUsuarioQuiz);
router.get('/usuario/:id', verifyToken, usuarioRespuestaController.getByIdUsuario);
router.get('/pregunta/:id', verifyToken, usuarioRespuestaController.getByIdPregunta);
router.get('/quiz/:id', verifyToken, usuarioRespuestaController.getByIdRespuesta);

router.post("/", verifyAdministrador, usuarioRespuestaController.crear);

router.put("/:id", verifyAdministrador, usuarioRespuestaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, usuarioRespuestaController.borrar);

module.exports = router;