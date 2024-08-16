const dotEnv = require('dotenv');
const express = require('express');
const cors = require('cors');
const db = require('./utils/db');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session")
const path = require('path');

const app = express();


const recultamientoRouter = require('./routes/recultamientoRoutes');
const contactoRouter = require('./routes/contactoRoutes');

const notificacionRouter = require('./routes/notificacionRoutes');

const usuarioRouter = require("./routes/usuarioRoutes");
const tipoUsuarioRouter = require('./routes/tipoUsuarioRoutes');
const tipoContratoRouter = require('./routes/tipoContratoRoutes');
const puestoRouter = require('./routes/puestoRoutes');
const incapacidadRouter = require('./routes/incapacidadRoutes');
const vacacionRouter = require('./routes/vacacionRoutes');

const moduloRouter = require('./routes/moduloRoutes');
const videoRouter = require('./routes/videoRoutes');
const moduloVideoRouter = require('./routes/moduloVideoRoutes');
const usuarioModuloRouter = require('./routes/usuarioModuloRoutes');
const usuarioVideoRouter = require('./routes/usuarioVideoRoutes');
const quizRouter = require('./routes/quizRoutes');
const quizPreguntaRouter = require('./routes/quizPreguntaRoutes');
const quizRespuestaRouter = require('./routes/quizRespuestaRoutes');
const tipoPreguntaRouter = require('./routes/tipoPreguntaRoutes');
const usuarioQuizRouter = require('./routes/usuarioQuizRoutes');
const usuarioQuizRespuestaRouter = require('./routes/usuarioQuizRespuestaRoutes');

const planillaRouter = require('./routes/planillaRoutes');
const aumentoRouter = require('./routes/aumentoRoutes');
const tipoAumentoRouter = require('./routes/tipoAumentoRoutes');
const deduccionRouter = require('./routes/deduccionRoutes');
const tipoDeduccionRouter = require('./routes/tipoDeduccionRoutes');
const otroPagoRouter = require('./routes/otroPagoRoutes');
const usuarioSupervisorRouter = require('./routes/usuarioSupervisorRoutes');

const foroRouter = require('./routes/foroRoutes');
const foroHistorialRouter = require('./routes/foroHistorialRoutes');
const tipoForoRouter = require('./routes/tipoForoRoutes');
const usuarioForoRespuestaRouter = require('./routes/usuarioForoRespuestaRoutes');


dotEnv.config();

app.use(cors());
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use("/reclutamiento/", recultamientoRouter);
app.use("/contacto/", contactoRouter);

app.use("/notificacion/", notificacionRouter);

app.use("/usuario/", usuarioRouter);
app.use("/tipoUsuario/", tipoUsuarioRouter);
app.use("/tipoContrato/", tipoContratoRouter);
app.use("/puesto/", puestoRouter);
app.use("/incapacidad/", incapacidadRouter);
app.use("/vacacion/", vacacionRouter);

app.use("/modulo/", moduloRouter);
app.use("/video/", videoRouter);
app.use("/moduloVideo/", moduloVideoRouter);
app.use("/usuarioModulo/", usuarioModuloRouter);
app.use("/usuarioVideo/", usuarioVideoRouter);
app.use("/quiz/", quizRouter);
app.use("/quizPregunta/", quizPreguntaRouter);
app.use("/quizRespuesta/", quizRespuestaRouter);
app.use("/tipoPregunta/", tipoPreguntaRouter);
app.use("/usuarioQuiz/", usuarioQuizRouter);
app.use("/usuarioQuizRespuesta/", usuarioQuizRespuestaRouter);

app.use("/planilla/", planillaRouter);
app.use("/aumento/", aumentoRouter);
app.use("/tipoAumento/", tipoAumentoRouter);
app.use("/deduccion/", deduccionRouter);
app.use("/tipoDeduccion/", tipoDeduccionRouter);
app.use("/otroPago/", otroPagoRouter);
app.use("/usuarioSupervisor/", usuarioSupervisorRouter)

app.use("/foro/", foroRouter);
app.use("/foroHistorial/", foroHistorialRouter);
app.use("/tipoForo/", tipoForoRouter);
app.use("/usuarioForoRespuesta/", usuarioForoRespuestaRouter);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });