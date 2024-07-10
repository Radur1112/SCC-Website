const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const quizController = require("../controllers/quizController");

router.get('/', verifyToken, quizController.get);
router.get('/:id', verifyToken, quizController.getById);
router.get('/modulo/:id', verifyToken, quizController.getByIdModulo);

router.post("/", verifyAdministrador, quizController.crear);

router.put("/:id", verifyAdministrador, quizController.actualizar);
router.put("/borrar/:id", verifyAdministrador, quizController.borrar);

module.exports = router;