const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const quizPreguntaController = require("../controllers/quizPreguntaController");

router.get('/', verifyToken([0]), quizPreguntaController.get);
router.get('/:id', verifyToken([0]), quizPreguntaController.getById);
router.get('/quiz/:id', verifyToken([0]), quizPreguntaController.getByIdQuiz);

router.post("/", verifyToken([1, 4]), quizPreguntaController.crear);

router.put("/:id", verifyToken([1, 4]), quizPreguntaController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), quizPreguntaController.borrar);

module.exports = router;