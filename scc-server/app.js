const dotEnv = require('dotenv');
const express = require('express');
const cors = require('cors');
const db = require('./utils/db');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session")
const MySQLStore = require('express-mysql-session')(session);

const app = express();

const usuarioRouter = require("./routes/usuarioRoutes");
const tipoUsuarioRouter = require('./routes/tipoUsuarioRoutes');
const tipoContratoRouter = require('./routes/tipoContratoRoutes');
const recultamientoRouter = require('./routes/recultamientoRoutes');
const contactoRouter = require('./routes/contactoRoutes');

dotEnv.config();

const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())

/*const options = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  clearExpired: true, // Automatically check for and clear expired sessions
  checkExpirationInterval: 900000, // Interval for clearing expired sessions in milliseconds (15 minutes)
  expiration: 86400000 // Max age for a session in milliseconds (1 day)
};

const sessionStore = new MySQLStore(options);

app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  cookie: {httpOnly: false, maxAge: 1000 * 60 * 60 * 24}
}))*/

const port = process.env.PORT;

app.use("/usuario/", usuarioRouter);
app.use("/tipoUsuario/", tipoUsuarioRouter);
app.use("/tipoContrato/", tipoContratoRouter);
app.use("/reclutamiento/", recultamientoRouter);
app.use("/contacto/", contactoRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });