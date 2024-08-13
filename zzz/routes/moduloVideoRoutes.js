const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const moduloVideoController = require("../controllers/moduloVideoController");

router.get('/', verifyToken([0]), moduloVideoController.get);
router.get('/niveles/:id', verifyToken([0]), moduloVideoController.getNiveles);
router.get('/modulo/:id', verifyToken([0]), moduloVideoController.getByIdModulo);
router.get('/moduloGroup/:id', verifyToken([0]), moduloVideoController.getByIdModuloGroupByNivel);
router.get('/video/:id', verifyToken([0]), moduloVideoController.getByIdVideo);
router.get('/:idModulo/:idVideo', verifyToken([0]), moduloVideoController.getById);

router.post("/", verifyToken([1, 4]), moduloVideoController.crear);

router.put("/:idModulo/:idVideo", verifyToken([1, 4]), moduloVideoController.actualizar);
router.put("/borrar/:idModulo/:idVideo", verifyToken([1, 4]), moduloVideoController.borrar);

module.exports = router;