const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioForoRespuestaController = require("../controllers/usuarioForoRespuestaController");

router.get('/', verifyToken, usuarioForoRespuestaController.get);
router.get('/:id', verifyToken, usuarioForoRespuestaController.getById);
router.get('/foro/:id', verifyToken, usuarioForoRespuestaController.getByIdForo);

router.post("/", verifyToken, usuarioForoRespuestaController.crear);

router.put("/:id", verifyAdministrador, usuarioForoRespuestaController.actualizar);
router.put("/borrar/:id", verifyAdministrador, usuarioForoRespuestaController.borrar);

module.exports = router;