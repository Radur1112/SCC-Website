const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const quizRespuestaController = require("../controllers/quizRespuestaController");

router.get('/', verifyToken, quizRespuestaController.get);
router.get('/:id', verifyToken, quizRespuestaController.getById);
router.get('/pregunta/:id', verifyToken, quizRespuestaController.getByIdPregunta);

router.post("/", verifyAdministrador, quizRespuestaController.crear);

router.put("/:id", verifyAdministrador, quizRespuestaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, quizRespuestaController.borrar);

module.exports = router;