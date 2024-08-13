const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.params.id;
    if (!id) {
      return res.status(404).send({
        success: false,
        message: 'Id inválido',
      });
    }
    const uploadPath = `uploads/foro/${id}`;

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

const foroController = require("../controllers/foroController");

router.get('/', verifyToken([0]), foroController.get);
router.get('/:id', verifyToken([0]), foroController.getById);

router.post("/", verifyToken([0]), foroController.crear);
router.post("/archivos/:id", verifyToken([0]), upload.array('archivo'), foroController.crearArchivos);
router.post("/respuestas/:id", verifyToken([0]), foroController.crearRespuestas);

router.put("/:id", verifyToken([0]), foroController.actualizar);
router.put("/archivos/:id", verifyToken([0]), foroController.actualizarArchivos);
router.put("/respuestas/:id", verifyToken([0]), foroController.actualizarRespuestas);
router.put("/borrar/:id", verifyToken([0]), foroController.borrar);

module.exports = router;