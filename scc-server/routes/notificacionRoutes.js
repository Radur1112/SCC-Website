const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const notificacionController = require("../controllers/notificacionController");

router.get('/', verifyToken([0]), notificacionController.get);
router.get('/:id', verifyToken([0]), notificacionController.getById);
router.get('/usuario/:id', verifyToken([0]), notificacionController.getByIdUsuario);
router.get("/leido/usuario/:id", verifyToken([0]), notificacionController.actualizarLeidoByIdUsuario);

router.post("/", verifyToken([0]), notificacionController.crear);

router.put("/:id", verifyToken([0]), notificacionController.actualizar);
router.put("/leido/:id", verifyToken([0]), notificacionController.actualizarLeido);
router.put("/borrar/:id", verifyToken([0]), notificacionController.borrar);

module.exports = router;