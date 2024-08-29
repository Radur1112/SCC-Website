const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const getLastItem = (item) => 
        Array.isArray(item) ? item[item.length - 1] : item;

    const { id, idQuiz } = {
        id: getLastItem(req.body.id),
        idQuiz: getLastItem(req.body.idQuiz)
    };
    const uploadPath = `uploads/quiz/${idQuiz}/pregunta/${id}`;

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

const quizPreguntaController = require("../controllers/quizPreguntaController");

router.get('/', verifyToken([0]), quizPreguntaController.get);
router.get('/:id', verifyToken([0]), quizPreguntaController.getById);
router.get('/quiz/:id', verifyToken([0]), quizPreguntaController.getByIdQuiz);

router.post("/", verifyToken([1, 4]), quizPreguntaController.crear);
router.post("/imagenes", verifyToken([1, 4]), upload.array('imagen'), quizPreguntaController.actualizarImagenes);
router.post("/save/multiples", verifyToken([1, 4]), quizPreguntaController.saveMultiples);
router.post("/borrar/multiples", verifyToken([1, 4]), quizPreguntaController.borrarMultiples);
router.post("/borrar/imagenes", verifyToken([1, 4]), quizPreguntaController.borrarImagenes);

router.put("/:id", verifyToken([1, 4]), quizPreguntaController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), quizPreguntaController.borrar);

module.exports = router;