const express = require('express');
const router = express.Router();
const multer = require('multer');


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


const { recibirReclutamientoForm } = require("../controllers/reclutamientoController");

router.post('/', upload.single('cv'), recibirReclutamientoForm);


module.exports = router;