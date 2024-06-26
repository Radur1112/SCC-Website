const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName); // Preserve original filename
  }
});

const upload = multer({ storage: storage });


const usuarioController = require("../controllers/usuarioController");

router.get('/', verifyAdministrador, usuarioController.get);
router.get('/all', verifyAdministrador, usuarioController.getAll);
router.get('/exportarUsuarios', verifyAdministrador, usuarioController.exportUsuarios);
router.get('/:id', verifyUsuario, usuarioController.getById);
router.get('/identificacion/:id', verifyToken, usuarioController.getByIdentificacion);
router.get('/correo/:correo', verifyToken, usuarioController.getByCorreo);

router.post('/login', usuarioController.login);
router.post("/registrar", verifyAdministrador, usuarioController.registrar);
router.post("/registrar/verificar", upload.single('archivo'), usuarioController.verificarUsuariosSubidos);
router.post("/registrar/multiples", verifyAdministrador, usuarioController.registrarMultiples);

router.put("/:id", verifyAdministrador, usuarioController.actualizar);

module.exports = router;