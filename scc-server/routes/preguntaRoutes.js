const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const preguntaController = require("../controllers/preguntaController");

router.get('/', verifyToken, preguntaController.get);
router.get('/:id', verifyToken, preguntaController.getById);
router.get('/quiz/:id', verifyToken, preguntaController.getByIdQuiz);

router.post("/", verifyAdministrador, preguntaController.crear);

router.put("/:id", verifyAdministrador, preguntaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, preguntaController.borrar);

module.exports = router;