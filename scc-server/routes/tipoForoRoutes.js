const express = require('express');
const router = express.Router();

const tipoForoController = require("../controllers/tipoForoController");

router.get('/', tipoForoController.get);
router.get('/:id', tipoForoController.getById);

module.exports = router;