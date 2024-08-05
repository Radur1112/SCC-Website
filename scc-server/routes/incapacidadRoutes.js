const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifySupervisor, verifyUsuario } = require('../utils/verifyToken')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/incapacidad/${req.body.idIncapacidad}`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName);
  }
});

const upload = multer({ storage: storage });

const incapacidadController = require("../controllers/incapacidadController");

router.get('/', verifyToken, incapacidadController.get);
router.get('/pendientes', verifySupervisor, incapacidadController.getPendientes);
router.get('/:id', verifySupervisor, incapacidadController.getById);
router.get("/confirmar/:id", verifySupervisor, incapacidadController.confirmarIncapacidad);
router.get("/rechazar/:id", verifySupervisor, incapacidadController.rechazarIncapacidad);
router.get('/pendientes/supervisor/:id', verifySupervisor, incapacidadController.getPendientesByIdSupervisor);

router.post("/", verifyToken, incapacidadController.crear);
router.post("/archivos", verifyToken, upload.array('archivo'), incapacidadController.crearArchivos);


module.exports = router;