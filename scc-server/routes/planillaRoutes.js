const express = require('express');
const router = express.Router();

const planillaController = require("../controllers/planillaController");

router.get('/usuario/:id', planillaController.getByIdUsuario);
router.get('/fecha', planillaController.getFechas);
router.get('/tipos', planillaController.getTipos);

module.exports = router;