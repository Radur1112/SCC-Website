const express = require('express');
const router = express.Router();

const puestoController = require("../controllers/puestoController");

router.get('/', puestoController.get);
router.get('/:id', puestoController.getById);

module.exports = router;