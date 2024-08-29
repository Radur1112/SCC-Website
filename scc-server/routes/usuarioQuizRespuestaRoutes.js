const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioQuizRespuestaController = require("../controllers/usuarioQuizRespuestaController");

router.get('/', verifyToken([0]), usuarioQuizRespuestaController.get);
router.get('/:id', verifyToken([0]), usuarioQuizRespuestaController.getById);
router.get('/usuarioQuiz/:id', verifyToken([0]), usuarioQuizRespuestaController.getByIdUsuarioQuiz);
router.get('/usuario/:id', verifyToken([0]), usuarioQuizRespuestaController.getByIdUsuario);
router.get('/pregunta/:id', verifyToken([0]), usuarioQuizRespuestaController.getByIdPregunta);
router.get('/quiz/:id', verifyToken([0]), usuarioQuizRespuestaController.getByIdRespuesta);

router.post("/", verifyToken([0]), usuarioQuizRespuestaController.crear);
router.post("/multiples", verifyToken([0]), usuarioQuizRespuestaController.crearMultiples);

router.put("/:id", verifyToken([1, 4]), usuarioQuizRespuestaController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), usuarioQuizRespuestaController.borrar);

module.exports = router;