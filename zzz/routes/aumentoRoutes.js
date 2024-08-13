const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const aumentoController = require("../controllers/aumentoController");

router.post("/", verifyToken([1, 3, 5]), aumentoController.crear);
router.post("/multiple", verifyToken([1, 3, 5]), aumentoController.crearMultiples);

router.put("/:id", verifyToken([1, 3, 5]), aumentoController.actualizar);
router.put("/borrar/:id", verifyToken([1, 3, 5]), aumentoController.borrar);

module.exports = router;