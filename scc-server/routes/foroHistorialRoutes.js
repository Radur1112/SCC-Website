const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const foroHistorialController = require("../controllers/foroHistorialController");

router.get('/', verifyToken, foroHistorialController.get);
router.get('/:id', verifyToken, foroHistorialController.getById);
router.get('/foro/:id', verifyToken, foroHistorialController.getByIdForo);

router.post("/", verifyToken, foroHistorialController.crear);

router.put("/:id", verifyAdministrador, foroHistorialController.actualizar);
router.put("/borrar/:id", verifyAdministrador, foroHistorialController.borrar);

module.exports = router;