const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioQuizRespuestaController = require("../controllers/usuarioQuizRespuestaController");

router.get('/', verifyToken, usuarioQuizRespuestaController.get);
router.get('/:id', verifyToken, usuarioQuizRespuestaController.getById);
router.get('/usuarioQuiz/:id', verifyToken, usuarioQuizRespuestaController.getByIdUsuarioQuiz);
router.get('/usuario/:id', verifyToken, usuarioQuizRespuestaController.getByIdUsuario);
router.get('/pregunta/:id', verifyToken, usuarioQuizRespuestaController.getByIdPregunta);
router.get('/quiz/:id', verifyToken, usuarioQuizRespuestaController.getByIdRespuesta);

router.post("/", verifyAdministrador, usuarioQuizRespuestaController.crear);

router.put("/:id", verifyAdministrador, usuarioQuizRespuestaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, usuarioQuizRespuestaController.borrar);

module.exports = router;