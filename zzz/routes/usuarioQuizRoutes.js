const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioQuizController = require("../controllers/usuarioQuizController");

router.get('/', verifyToken([0]), usuarioQuizController.get);
router.get('/:id', verifyToken([0]), usuarioQuizController.getById);
router.get('/usuario/:id', verifyToken([0]), usuarioQuizController.getByIdUsuario);
router.get('/quiz/:id', verifyToken([0]), usuarioQuizController.getByIdQuiz);

router.post("/", verifyToken([1, 4]), usuarioQuizController.crear);

router.put("/:id", verifyToken([1, 4]), usuarioQuizController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), usuarioQuizController.borrar);

module.exports = router;