const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const moduloVideoController = require("../controllers/moduloVideoController");

router.get('/', verifyToken, moduloVideoController.get);
router.get('/niveles/:id', verifyToken, moduloVideoController.getNiveles);
router.get('/modulo/:id', verifyToken, moduloVideoController.getByIdModulo);
router.get('/moduloGroup/:id', verifyToken, moduloVideoController.getByIdModuloGroupByNivel);
router.get('/video/:id', verifyToken, moduloVideoController.getByIdVideo);
router.get('/:idModulo/:idVideo', verifyToken, moduloVideoController.getById);

router.post("/", verifyAdministrador, moduloVideoController.crear);

router.put("/:idModulo/:idVideo", verifyAdministrador, moduloVideoController.actualizar);
router.put("/borrar/:idModulo/:idVideo", verifyAdministrador, moduloVideoController.borrar);

module.exports = router;