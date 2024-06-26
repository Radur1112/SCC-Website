const express = require('express');
const router = express.Router();

const tipoContratoController = require("../controllers/tipoContratoController");

router.get('/', tipoContratoController.get);
router.get('/:id', tipoContratoController.getById);

module.exports = router;