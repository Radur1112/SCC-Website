const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const quizController = require("../controllers/quizController");

router.get('/', verifyToken([0]), quizController.get);
router.get('/:id', verifyToken([0]), quizController.getById);
router.get('/modulo/:id', verifyToken([0]), quizController.getByIdModulo);
router.get('/modulo/:idModulo/usuario/:idUsuario', verifyToken([0]), quizController.getByIds);

router.post("/", verifyToken([1, 4]), quizController.crear);
router.post("/save/multiples", verifyToken([1, 4]), quizController.saveMultiples);
router.post("/borrar/multiples", verifyToken([1, 4]), quizController.borrarMultiples);

router.put("/:id", verifyToken([1, 4]), quizController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), quizController.borrar);

module.exports = router;