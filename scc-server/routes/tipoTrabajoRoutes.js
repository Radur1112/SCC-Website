const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const tipoTrabajoController = require("../controllers/tipoTrabajoController");

router.get('/', tipoTrabajoController.get);
router.get('/:id', tipoTrabajoController.getById);

router.post("/", verifyToken([1, 4]), tipoTrabajoController.crear);

router.put("/:id", verifyToken([1, 4]), tipoTrabajoController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), tipoTrabajoController.borrar);

module.exports = router;