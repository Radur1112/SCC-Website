const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');

const recultamientoRouter = require('./routes/recultamientoRoutes');

const app = express();

app.use(cors()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000;

app.use("/reclutamiento/", recultamientoRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });