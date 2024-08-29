const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('../utils/verifyToken')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const getLastItem = (item) => 
        Array.isArray(item) ? item[item.length - 1] : item;

    const { id, idQuiz, idQuizPregunta } = {
        id: getLastItem(req.body.id),
        idQuiz: getLastItem(req.body.idQuiz),
        idQuizPregunta: getLastItem(req.body.idQuizPregunta)
    };

    if (!id || !idQuiz || !idQuizPregunta) {
        return;
    }
    const uploadPath = `uploads/quiz/${idQuiz}/pregunta/${idQuizPregunta}/respuesta/${id}`;

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

const quizRespuestaController = require("../controllers/quizRespuestaController");

router.get('/', verifyToken([0]), quizRespuestaController.get);
router.get('/:id', verifyToken([0]), quizRespuestaController.getById);
router.get('/pregunta/:id', verifyToken([0]), quizRespuestaController.getByIdPregunta);

router.post("/", verifyToken([1, 4]), quizRespuestaController.crear);
router.post("/imagenes", verifyToken([1, 4]), upload.array('imagen'), quizRespuestaController.actualizarImagenes);
router.post("/save/multiples", verifyToken([1, 4]), quizRespuestaController.saveMultiples);
router.post("/borrar/multiples", verifyToken([1, 4]), quizRespuestaController.borrarMultiples);
router.post("/borrar/imagenes", verifyToken([1, 4]), quizRespuestaController.borrarImagenes);

router.put("/:id", verifyToken([1, 4]), quizRespuestaController.actualizar);
router.put("/borrar/:id", verifyToken([1, 4]), quizRespuestaController.borrar);

module.exports = router;