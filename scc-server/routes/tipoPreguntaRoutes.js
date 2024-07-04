const express = require('express');
const router = express.Router();

const tipoPreguntaController = require("../controllers/tipoPreguntaController");

router.get('/', tipoPreguntaController.get);
router.get('/:id', tipoPreguntaController.getById);

module.exports = router;