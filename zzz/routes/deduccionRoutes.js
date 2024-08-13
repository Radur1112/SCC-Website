const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const deduccionController = require("../controllers/deduccionController");

router.post("/", verifyToken([1, 3, 5]), deduccionController.crear);
router.post("/multiple", verifyToken([1, 3, 5]), deduccionController.crearMultiples);

router.put("/:id", verifyToken([1, 3, 5]), deduccionController.actualizar);
router.put("/borrar/:id", verifyToken([1, 3, 5]), deduccionController.borrar);

module.exports = router;