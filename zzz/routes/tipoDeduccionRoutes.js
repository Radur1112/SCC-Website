const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const tipoDeduccionController = require("../controllers/tipoDeduccionController");

router.get('/', verifyToken([0]), tipoDeduccionController.get);
router.get('/:id', verifyToken([0]), tipoDeduccionController.getById);

router.post("/", verifyToken([1, 5]), tipoDeduccionController.crear);

router.put("/:id", verifyToken([1, 5]), tipoDeduccionController.actualizar);
router.put("/borrar/:id", verifyToken([1, 5]), tipoDeduccionController.borrar);

module.exports = router;