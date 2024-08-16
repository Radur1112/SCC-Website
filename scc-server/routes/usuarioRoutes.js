const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const { verifyToken } = require('../utils/verifyToken')


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/`;

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, originalName); // Preserve original filename
  }
});

const upload = multer({ storage: storage });


const usuarioController = require("../controllers/usuarioController");

router.get('/', verifyToken([1, 5]), usuarioController.get);
router.get('/exportarUsuarios', verifyToken([1]), usuarioController.exportUsuarios);
router.get('/asesores', verifyToken([1]), usuarioController.getAsesores);
router.get('/supervisores', verifyToken([1]), usuarioController.getSupervisores);
router.get('/:id', verifyToken([0]), usuarioController.getById);
router.get('/noModulo/:id', verifyToken([1]), usuarioController.getByNoIdModulo);
router.get('/identificacion/:id', verifyToken([0]), usuarioController.getByIdentificacion);
router.get('/correo/:correo', verifyToken([0]), usuarioController.getByCorreo);

router.post('/login', usuarioController.login);
router.post("/registrar", verifyToken([1]), usuarioController.registrar);
router.post("/registrar/verificar", upload.single('archivo'), usuarioController.verificarUsuariosSubidos);
router.post("/registrar/multiples", verifyToken([1]), usuarioController.registrarMultiples);

router.put("/:id", verifyToken([1]), usuarioController.actualizar);
router.put("/salario/:id", verifyToken([1, 3 ,5]), usuarioController.actualizarSalario);
router.put("/borrar/:id", verifyToken([1]), usuarioController.borrar);

module.exports = router;