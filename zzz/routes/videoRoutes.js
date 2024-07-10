const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const videoController = require("../controllers/videoController");

router.get('/', verifyToken, videoController.get);
router.get('/:id', verifyToken, videoController.getById);

router.post("/", verifyAdministrador, videoController.crear);

router.put("/:id", verifyAdministrador, videoController.actualizar);
router.put("/borrar/:id", verifyAdministrador, videoController.borrar);

module.exports = router;