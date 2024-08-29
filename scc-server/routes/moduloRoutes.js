const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const moduloController = require("../controllers/moduloController");

router.get('/', verifyToken([0]), moduloController.get);
router.get('/reporte', verifyToken([1, 4]), moduloController.getReporte);
router.get('/:id', verifyToken([0]), moduloController.getById);

router.post("/", verifyToken([1, 4]), moduloController.crear);

router.put("/:id", verifyToken([1, 4]), moduloController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), moduloController.borrar);

module.exports = router;