const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const respuestaController = require("../controllers/respuestaController");

router.get('/', verifyToken, respuestaController.get);
router.get('/:id', verifyToken, respuestaController.getById);
router.get('/pregunta/:id', verifyToken, respuestaController.getByIdPregunta);

router.post("/", verifyAdministrador, respuestaController.crear);

router.put("/:id", verifyAdministrador, respuestaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, respuestaController.borrar);

module.exports = router;