const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const quizRespuestaController = require("../controllers/quizRespuestaController");

router.get('/', verifyToken([0]), quizRespuestaController.get);
router.get('/:id', verifyToken([0]), quizRespuestaController.getById);
router.get('/pregunta/:id', verifyToken([0]), quizRespuestaController.getByIdPregunta);

router.post("/", verifyToken([1, 4]), quizRespuestaController.crear);

router.put("/:id", verifyToken([1, 4]), quizRespuestaController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), quizRespuestaController.borrar);

module.exports = router;