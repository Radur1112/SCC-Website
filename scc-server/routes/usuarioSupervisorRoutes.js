const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const usuarioSupervisorController = require("../controllers/usuarioSupervisorController");

router.get('/', verifyToken, usuarioSupervisorController.get);
router.get('/:id', verifyToken, usuarioSupervisorController.getById);

router.post("/", verifyAdministrador, usuarioSupervisorController.crear);
router.post("/multiple", verifyAdministrador, usuarioSupervisorController.crearMultiples);
router.post("/borrar/multiple", verifyAdministrador, usuarioSupervisorController.borrarMultiple);

router.put("/borrar/:id", verifyAdministrador, usuarioSupervisorController.borrar);

module.exports = router;