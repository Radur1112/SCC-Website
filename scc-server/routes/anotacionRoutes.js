const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const anotacionController = require("../controllers/anotacionController");

router.get('/', verifyToken([0]), anotacionController.get);
router.get('/:id', verifyToken([0]), anotacionController.getById);
router.get('/tipoContrato/:id', verifyToken([0]), anotacionController.getByIdTipoContrato);
router.get('/group/tipoContrato/:id', verifyToken([0]), anotacionController.getGroupByIdTipoContrato);

router.post("/", verifyToken([1, 5]), anotacionController.crear);

router.put("/:id", verifyToken([1, 5]), anotacionController.actualizar);
router.put("/borrar/:id", verifyToken([1, 5]), anotacionController.borrar);

module.exports = router;