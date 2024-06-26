const express = require('express');
const router = express.Router();

const { recibirContactoForm } = require("../controllers/contactoController");

router.post('/', recibirContactoForm);


module.exports = router;