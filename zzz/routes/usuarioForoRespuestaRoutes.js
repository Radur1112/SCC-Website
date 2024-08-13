const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioForoRespuestaController = require("../controllers/usuarioForoRespuestaController");

router.get('/', verifyToken([0]), usuarioForoRespuestaController.get);
router.get('/:id', verifyToken([0]), usuarioForoRespuestaController.getById);
router.get('/foro/:id', verifyToken([0]), usuarioForoRespuestaController.getByIdForo);

router.post("/", verifyToken([0]), usuarioForoRespuestaController.crear);

router.put("/:id", verifyToken([0]), usuarioForoRespuestaController.actualizar);
router.put("/borrar/:id", verifyToken([0]), usuarioForoRespuestaController.borrar);

module.exports = router;