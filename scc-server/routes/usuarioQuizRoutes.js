const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioQuizController = require("../controllers/usuarioQuizController");

router.get('/', verifyToken, usuarioQuizController.get);
router.get('/:id', verifyToken, usuarioQuizController.getById);
router.get('/usuario/:id', verifyToken, usuarioQuizController.getByIdUsuario);
router.get('/quiz/:id', verifyToken, usuarioQuizController.getByIdQuiz);

router.post("/", verifyAdministrador, usuarioQuizController.crear);

router.put("/:id", verifyAdministrador, usuarioQuizController.actualizar);
router.put("/borrar/:id", verifyAdministrador, usuarioQuizController.borrar);

module.exports = router;