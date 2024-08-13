const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const quizController = require("../controllers/quizController");

router.get('/', verifyToken([0]), quizController.get);
router.get('/:id', verifyToken([0]), quizController.getById);
router.get('/modulo/:id', verifyToken([0]), quizController.getByIdModulo);

router.post("/", verifyToken([1, 4]), quizController.crear);

router.put("/:id", verifyToken([1, 4]), quizController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), quizController.borrar);

module.exports = router;