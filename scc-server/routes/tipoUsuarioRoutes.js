const express = require('express');
const router = express.Router();

const tipoUsuarioController = require("../controllers/tipoUsuarioController");

router.get('/', tipoUsuarioController.get);
router.get('/:id', tipoUsuarioController.getById);

module.exports = router;