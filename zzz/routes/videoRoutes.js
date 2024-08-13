const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const videoController = require("../controllers/videoController");

router.get('/', verifyToken([0]), videoController.get);
router.get('/:id', verifyToken([0]), videoController.getById);

router.post("/", verifyToken([1, 4]), videoController.crear);

router.put("/:id", verifyToken([1, 4]), videoController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), videoController.borrar);

module.exports = router;