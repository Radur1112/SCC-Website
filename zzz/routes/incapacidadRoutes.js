const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

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

router.get('/', verifyToken([1, 3]), incapacidadController.get);
router.get('/pendientes', verifyToken([1, 3]), incapacidadController.getPendientes);
router.get('/:id', verifyToken([1, 3]), incapacidadController.getById);
router.get("/usuario/:id", verifyToken([0]), incapacidadController.getByIdUsuario);
router.get("/confirmar/:id", verifyToken([1, 3]), incapacidadController.confirmarIncapacidad);
router.get("/rechazar/:id", verifyToken([1, 3]), incapacidadController.rechazarIncapacidad);
router.get("/noRechazado/usuario/:id", verifyToken([0]), incapacidadController.getNoRechazadoByIdUsuario);
router.get('/pendientes/supervisor/:id', verifyToken([1, 3]), incapacidadController.getPendientesByIdSupervisor);

router.post("/", verifyToken([0]), incapacidadController.crear);
router.post("/archivos", verifyToken([0]), upload.array('archivo'), incapacidadController.crearArchivos);


module.exports = router;