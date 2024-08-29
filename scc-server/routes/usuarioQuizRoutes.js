const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioQuizController = require("../controllers/usuarioQuizController");

router.get('/', verifyToken([0]), usuarioQuizController.get);
router.get('/:id', verifyToken([0]), usuarioQuizController.getById);
router.get('/usuario/:id', verifyToken([0]), usuarioQuizController.getByIdUsuario);
router.get('/quiz/:id', verifyToken([0]), usuarioQuizController.getByIdQuiz);
router.get('/:idUsuario/:idQuiz', verifyToken([0]), usuarioQuizController.getByIds);
router.get('/all/:idUsuario/:idQuiz', verifyToken([0]), usuarioQuizController.getAllByIds);

router.post("/", verifyToken([0]), usuarioQuizController.crear);
router.post("/vacio", verifyToken([0]), usuarioQuizController.crearVacio);

router.put("/:id", verifyToken([0]), usuarioQuizController.actualizar);
router.put("/borrar/:id", verifyToken([0]), usuarioQuizController.borrar);

module.exports = router;