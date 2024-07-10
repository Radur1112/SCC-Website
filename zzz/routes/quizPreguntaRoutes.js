const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const quizPreguntaController = require("../controllers/quizPreguntaController");

router.get('/', verifyToken, quizPreguntaController.get);
router.get('/:id', verifyToken, quizPreguntaController.getById);
router.get('/quiz/:id', verifyToken, quizPreguntaController.getByIdQuiz);

router.post("/", verifyAdministrador, quizPreguntaController.crear);

router.put("/:id", verifyAdministrador, quizPreguntaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, quizPreguntaController.borrar);

module.exports = router;