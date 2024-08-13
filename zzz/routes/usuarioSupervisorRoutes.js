const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const usuarioSupervisorController = require("../controllers/usuarioSupervisorController");

router.get('/', verifyToken([0]), usuarioSupervisorController.get);
router.get('/supervisor/:id', verifyToken([0]), usuarioSupervisorController.getByIdSupervisor);

router.post("/", verifyToken([1]), usuarioSupervisorController.crear);
router.post("/multiple", verifyToken([1]), usuarioSupervisorController.crearMultiples);
router.post("/borrar/multiple", verifyToken([1]), usuarioSupervisorController.borrarMultiple);

router.put("/borrar/:id", verifyToken([1]), usuarioSupervisorController.borrar);

module.exports = router;