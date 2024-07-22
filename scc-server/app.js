const dotEnv = require('dotenv');
const express = require('express');
const cors = require('cors');
const db = require('./utils/db');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session")

const app = express();

const usuarioRouter = require("./routes/usuarioRoutes");
const tipoUsuarioRouter = require('./routes/tipoUsuarioRoutes');
const tipoContratoRouter = require('./routes/tipoContratoRoutes');
const recultamientoRouter = require('./routes/recultamientoRoutes');
const contactoRouter = require('./routes/contactoRoutes');
const puestoRouter = require('./routes/puestoRoutes');
const moduloRouter = require('./routes/moduloRoutes');
const moduloVideoRouter = require('./routes/moduloVideoRoutes');
const quizPreguntaRouter = require('./routes/quizPreguntaRoutes');
const quizRouter = require('./routes/quizRoutes');
const quizRespuestaRouter = require('./routes/quizRespuestaRoutes');
const tipoPreguntaRouter = require('./routes/tipoPreguntaRoutes');
const usuarioModuloRouter = require('./routes/usuarioModuloRoutes');
const usuarioQuizRouter = require('./routes/usuarioQuizRoutes');
const usuarioQuizRespuestaRouter = require('./routes/usuarioQuizRespuestaRoutes');
const usuarioVideoRouter = require('./routes/usuarioVideoRoutes');
const videoRouter = require('./routes/videoRoutes');
const planillaRouter = require('./routes/planillaRoutes');
const foroRouter = require('./routes/foroRoutes');
const tipoForoRouter = require('./routes/tipoForoRoutes');
const usuarioForoRespuestaRouter = require('./routes/usuarioForoRespuestaRoutes');
const usuarioSupervisorRouter = require('./routes/usuarioSupervisorRoutes');

dotEnv.config();

const corsOptions = {
  origin: 'http://localhost:4200',
  credentials: true
};

app.use(cors(corsOptions));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser())

/*
const MySQLStore = require('express-mysql-session')(session);
const options = {
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
}))
*/

const port = process.env.PORT;

app.use("/usuario/", usuarioRouter);
app.use("/tipoUsuario/", tipoUsuarioRouter);
app.use("/tipoContrato/", tipoContratoRouter);
app.use("/reclutamiento/", recultamientoRouter);
app.use("/contacto/", contactoRouter);
app.use("/puesto/", puestoRouter);
app.use("/modulo/", moduloRouter);
app.use("/moduloVideo/", moduloVideoRouter);
app.use("/quizPregunta/", quizPreguntaRouter);
app.use("/quiz/", quizRouter);
app.use("/quizRespuesta/", quizRespuestaRouter);
app.use("/tipoPregunta/", tipoPreguntaRouter);
app.use("/usuarioModulo/", usuarioModuloRouter);
app.use("/usuarioQuiz/", usuarioQuizRouter);
app.use("/usuarioQuizRespuesta/", usuarioQuizRespuestaRouter);
app.use("/usuarioVideo/", usuarioVideoRouter);
app.use("/video/", videoRouter);
app.use("/planilla/", planillaRouter);
app.use("/foro/", foroRouter);
app.use("/tipoForo/", tipoForoRouter);
app.use("/usuarioForoRespuesta/", usuarioForoRespuestaRouter);
app.use("/usuarioSupervisor/", usuarioSupervisorRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });