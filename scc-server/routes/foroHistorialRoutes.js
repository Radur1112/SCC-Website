const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const foroHistorialController = require("../controllers/foroHistorialController");

router.get('/', verifyToken([1]), foroHistorialController.get);
router.get('/exportar', verifyToken([1]), foroHistorialController.exportarExcel);
router.get('/:id', verifyToken([1]), foroHistorialController.getById);
router.get('/exportar/:id', verifyToken([1]), foroHistorialController.exportarExcelById);
router.get('/foro/:id', verifyToken([1]), foroHistorialController.getByIdForo);

router.post("/", verifyToken([0]), foroHistorialController.crear);

router.put("/:id", verifyToken([0]), foroHistorialController.actualizar);
router.put("/borrar/:id", verifyToken([1]), foroHistorialController.borrar);

module.exports = router;