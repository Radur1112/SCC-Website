const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { verifyToken, verifyAdministrador, verifyUsuario } = require('../utils/verifyToken')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = `uploads/foro/${req.body.idForo}`;

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

router.get('/', verifyToken, foroController.get);
router.get('/:id', verifyToken, foroController.getById);

router.post("/", verifyToken, foroController.crear);
router.post("/archivos", verifyToken, upload.array('archivo'), foroController.crearArchivos);

router.put("/:id", verifyAdministrador, foroController.actualizar);
router.put("/borrar/:id", verifyAdministrador, foroController.borrar);

module.exports = router;