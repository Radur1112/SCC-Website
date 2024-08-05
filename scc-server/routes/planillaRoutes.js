const express = require('express');
const router = express.Router();

const planillaController = require("../controllers/planillaController");

router.get('/crear', planillaController.crearTodos);
router.get('/completar', planillaController.completarTodos);
router.get('/tipos', planillaController.getTipos);
router.get('/fechas', planillaController.getFechas);
router.get('/historial', planillaController.getHistorialAnotaciones);
router.get('/usuario/:id', planillaController.getByIdUsuario);
router.get('/historial/supervisor/:id', planillaController.getHistorialAnotacionesBySupervisor);

router.post('/', planillaController.crear);
router.post('/fechas', planillaController.actualizarFechas);

router.put('/:id', planillaController.actualizar);

module.exports = router;