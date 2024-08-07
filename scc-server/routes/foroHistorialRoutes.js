const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const foroHistorialController = require("../controllers/foroHistorialController");

router.get('/', verifyAdministrador, foroHistorialController.get);
router.get('/:id', verifyAdministrador, foroHistorialController.getById);
router.get('/foro/:id', verifyAdministrador, foroHistorialController.getByIdForo);

router.post("/", verifyToken, foroHistorialController.crear);

router.put("/:id", verifyToken, foroHistorialController.actualizar);
router.put("/borrar/:id", verifyAdministrador, foroHistorialController.borrar);

module.exports = router;