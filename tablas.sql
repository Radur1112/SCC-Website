DROP TABLE IF EXISTS `aumento`;
CREATE TABLE `aumento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idPlanilla` int NOT NULL,
  `idTipoAumento` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `monto` decimal(11,2) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Aumento_Plainlla_idx` (`idPlanilla`),
  KEY `FK_Aumento_TipoAumento_idx` (`idTipoAumento`),
  KEY `FK_Aumento_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_Aumento_Plainlla` FOREIGN KEY (`idPlanilla`) REFERENCES `planilla` (`id`),
  CONSTRAINT `FK_Aumento_TipoAumento` FOREIGN KEY (`idTipoAumento`) REFERENCES `tipoaumento` (`id`),
  CONSTRAINT `FK_Aumento_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `comprobanteplanilla`;
CREATE TABLE `comprobanteplanilla` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idPlanilla` int NOT NULL,
  `ubicacion` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ComprobantePlanilla_Planilla_idx` (`idPlanilla`),
  CONSTRAINT `FK_ComprobantePlanilla_Planilla` FOREIGN KEY (`idPlanilla`) REFERENCES `planilla` (`id`)
);

DROP TABLE IF EXISTS `deduccion`;
CREATE TABLE `deduccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idPlanilla` int NOT NULL,
  `idTipoDeduccion` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `monto` decimal(11,2) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_Deduccion_Planilla_idx` (`idPlanilla`),
  KEY `FK_Rebajo_TipoRebajo_idx` (`idTipoDeduccion`),
  KEY `FK_Deduccion_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_Deduccion_Planilla` FOREIGN KEY (`idPlanilla`) REFERENCES `planilla` (`id`),
  CONSTRAINT `FK_Deduccion_TipoDeduccion` FOREIGN KEY (`idTipoDeduccion`) REFERENCES `tipodeduccion` (`id`),
  CONSTRAINT `FK_Deduccion_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `foro`;
CREATE TABLE `foro` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idTipoForo` int NOT NULL,
  `idUsuario` int NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `fechaCreado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Foro_Usuario_idx` (`idUsuario`),
  KEY `FK_Foro_TipoForo_idx` (`idTipoForo`),
  CONSTRAINT `FK_Foro_TipoForo` FOREIGN KEY (`idTipoForo`) REFERENCES `tipoforo` (`id`),
  CONSTRAINT `FK_Foro_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `foroarchivo`;
CREATE TABLE `foroarchivo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idForo` int NOT NULL,
  `ubicacion` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ForoArchivo_Foro_idx` (`idForo`),
  CONSTRAINT `FK_ForoArchivo_Foro` FOREIGN KEY (`idForo`) REFERENCES `foro` (`id`)
);

DROP TABLE IF EXISTS `forohistorial`;
CREATE TABLE `forohistorial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idForo` int NOT NULL,
  `idForoArchivo` int DEFAULT NULL,
  `idUsuario` int NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_ForoHistorial_Foro_idx` (`idForo`),
  KEY `FK_ForoHistorial_Usuario_idx` (`idUsuario`),
  KEY `FK_ForoHistorial_ForoArchivo_idx` (`idForoArchivo`),
  CONSTRAINT `FK_ForoHistorial_Foro` FOREIGN KEY (`idForo`) REFERENCES `foro` (`id`),
  CONSTRAINT `FK_ForoHistorial_ForoArchivo` FOREIGN KEY (`idForoArchivo`) REFERENCES `foroarchivo` (`id`),
  CONSTRAINT `FK_ForoHistorial_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `fororespuesta`;
CREATE TABLE `fororespuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idForo` int NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ForoRespuesta_Foro_idx` (`idForo`),
  CONSTRAINT `FK_ForoRespuesta_Foro` FOREIGN KEY (`idForo`) REFERENCES `foro` (`id`)
);

DROP TABLE IF EXISTS `incapacidad`;
CREATE TABLE `incapacidad` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `razon` varchar(250) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFinal` date NOT NULL,
  `fechaCreado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` int NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `FK_Incapacidad_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_Incapacidad_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `incapacidadarchivo`;
CREATE TABLE `incapacidadarchivo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idIncapacidad` int NOT NULL,
  `ubicacion` varchar(250) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_IncapacidadArchivo_Incapacidad_idx` (`idIncapacidad`),
  CONSTRAINT `FK_IncapacidadArchivo_Incapacidad` FOREIGN KEY (`idIncapacidad`) REFERENCES `incapacidad` (`id`)
);

DROP TABLE IF EXISTS `modulo`;
CREATE TABLE `modulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `modulovideo`;
CREATE TABLE `modulovideo` (
  `idModulo` int NOT NULL,
  `idVideo` int NOT NULL,
  `nivel` varchar(100) NOT NULL DEFAULT '0',
  PRIMARY KEY (`idModulo`,`idVideo`),
  KEY `FK_ModuloVideo_Modulo_idx` (`idModulo`),
  KEY `FK_ModuloVideo_Video_idx` (`idVideo`),
  CONSTRAINT `FK_ModuloVideo_Modulo` FOREIGN KEY (`idModulo`) REFERENCES `modulo` (`id`),
  CONSTRAINT `FK_ModuloVideo_Video` FOREIGN KEY (`idVideo`) REFERENCES `video` (`id`)
);

DROP TABLE IF EXISTS `otropago`;
CREATE TABLE `otropago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idPlanilla` int NOT NULL,
  `idTipoOtroPago` int NOT NULL,
  `descripcion` varchar(100) NOT NULL,
  `monto` decimal(11,2) DEFAULT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuario` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_OtrosPagos_TiposOtrosPagos_idx` (`idTipoOtroPago`),
  KEY `FK_OtrosPagos_Planilla_idx` (`idPlanilla`),
  KEY `FK_OtroPago_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_OtroPago_Planilla` FOREIGN KEY (`idPlanilla`) REFERENCES `planilla` (`id`),
  CONSTRAINT `FK_OtroPago_TiposOtroPago` FOREIGN KEY (`idTipoOtroPago`) REFERENCES `tipootropago` (`id`),
  CONSTRAINT `FK_OtroPago_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `planilla`;
CREATE TABLE `planilla` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFinal` date NOT NULL,
  `salarioBruto` decimal(11,2) NOT NULL DEFAULT '0.00',
  `salarioNeto` decimal(11,2) NOT NULL DEFAULT '0.00',
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Planilla_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_Planilla_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `planillahistorial`;
CREATE TABLE `planillahistorial` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ubicacion` varchar(250) NOT NULL,
  `fechaInicio` date NOT NULL,
  `fechaFinal` date NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `puesto`;
CREATE TABLE `puesto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `quiz`;
CREATE TABLE `quiz` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idModulo` int NOT NULL,
  `titulo` varchar(45) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Quiz_Modulo_idx` (`idModulo`),
  CONSTRAINT `FK_Quiz_Modulo` FOREIGN KEY (`idModulo`) REFERENCES `modulo` (`id`)
);

DROP TABLE IF EXISTS `quizpregunta`;
CREATE TABLE `quizpregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idQuiz` int NOT NULL,
  `idTipoPregunta` int NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Pregunta_TipoPregunta_idx` (`idTipoPregunta`),
  KEY `FK_Pregunta_Quiz_idx` (`idQuiz`),
  CONSTRAINT `FK_QuizPregunta_Quiz` FOREIGN KEY (`idQuiz`) REFERENCES `quiz` (`id`),
  CONSTRAINT `FK_QuizPregunta_TipoPregunta` FOREIGN KEY (`idTipoPregunta`) REFERENCES `tipopregunta` (`id`)
);

DROP TABLE IF EXISTS `quizrespuesta`;
CREATE TABLE `quizrespuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idQuizPregunta` int NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `correcta` tinyint NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Respuesta_Pregunta_idx` (`idQuizPregunta`),
  CONSTRAINT `FK_QuizRespuesta_QuizPregunta` FOREIGN KEY (`idQuizPregunta`) REFERENCES `quizpregunta` (`id`)
);

DROP TABLE IF EXISTS `tipoaumento`;
CREATE TABLE `tipoaumento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sp` int NOT NULL DEFAULT '0',
  `descripcion` varchar(45) NOT NULL,
  `valorHoras` decimal(3,2) NOT NULL DEFAULT '1.00',
  `fijo` int DEFAULT NULL,
  `valor` decimal(11,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tipocontrato`;
CREATE TABLE `tipocontrato` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tipodeduccion`;
CREATE TABLE `tipodeduccion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sp` int NOT NULL DEFAULT '0',
  `descripcion` varchar(45) NOT NULL,
  `valorHoras` decimal(3,2) NOT NULL DEFAULT '1.00',
  `fijo` int DEFAULT NULL,
  `valor` decimal(11,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tipoforo`;
CREATE TABLE `tipoforo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tipootropago`;
CREATE TABLE `tipootropago` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sp` int NOT NULL DEFAULT '0',
  `descripcion` varchar(100) NOT NULL,
  `valorHoras` decimal(3,2) NOT NULL DEFAULT '1.00',
  `fijo` int DEFAULT NULL,
  `valor` decimal(11,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tipopregunta`;
CREATE TABLE `tipopregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `tipousuario`;
CREATE TABLE `tipousuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
);

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idTipoUsuario` int NOT NULL,
  `idTipoContrato` int NOT NULL,
  `idPuesto` int NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `password` varchar(100) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `salario` decimal(11,2) NOT NULL,
  `fechaIngreso` date NOT NULL,
  `vacacion` decimal(6,2) DEFAULT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Usuario_TipoUsuario_idx` (`idTipoUsuario`),
  KEY `FK_Usuario_Puesto_idx` (`idPuesto`),
  KEY `FK_Usuario_TipoContrato_idx` (`idTipoContrato`),
  CONSTRAINT `FK_Usuario_Puesto` FOREIGN KEY (`idPuesto`) REFERENCES `puesto` (`id`),
  CONSTRAINT `FK_Usuario_TipoContrato` FOREIGN KEY (`idTipoContrato`) REFERENCES `tipocontrato` (`id`),
  CONSTRAINT `FK_Usuario_TipoUsuario` FOREIGN KEY (`idTipoUsuario`) REFERENCES `tipousuario` (`id`)
);

DROP TABLE IF EXISTS `usuariofororespuesta`;
CREATE TABLE `usuariofororespuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idForo` int NOT NULL,
  `idUsuario` int NOT NULL,
  `idForoRespuesta` int DEFAULT NULL,
  `descripcion` text,
  `fechaCreado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioForoRespuesta_Foro_idx` (`idForo`),
  KEY `FK_UsuarioForoRespuesta_Usuario_idx` (`idUsuario`),
  KEY `FK_UsuarioForoRespuesta_ForoRespeusta_idx` (`idForoRespuesta`),
  CONSTRAINT `FK_UsuarioForoRespuesta_Foro` FOREIGN KEY (`idForo`) REFERENCES `foro` (`id`),
  CONSTRAINT `FK_UsuarioForoRespuesta_ForoRespeusta` FOREIGN KEY (`idForoRespuesta`) REFERENCES `fororespuesta` (`id`),
  CONSTRAINT `FK_UsuarioForoRespuesta_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `usuariomodulo`;
CREATE TABLE `usuariomodulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idModulo` int NOT NULL,
  `progreso` decimal(5,2) DEFAULT '0.00',
  `fechaEmpezado` datetime DEFAULT NULL,
  `fechaCompletado` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioModulo_Modulo_idx` (`idModulo`),
  KEY `FK_UsuarioModulo_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_UsuarioModulo_Modulo` FOREIGN KEY (`idModulo`) REFERENCES `modulo` (`id`),
  CONSTRAINT `FK_UsuarioModulo_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `usuarioquiz`;
CREATE TABLE `usuarioquiz` (
  `id` int NOT NULL,
  `idUsuario` int NOT NULL,
  `idQuiz` int NOT NULL,
  `nota` varchar(10) NOT NULL,
  `fecha` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioQuiz_Usuario_idx` (`idUsuario`),
  KEY `FK_UsuarioQuiz_Quiz_idx` (`idQuiz`),
  CONSTRAINT `FK_UsuarioQuiz_Quiz` FOREIGN KEY (`idQuiz`) REFERENCES `quiz` (`id`),
  CONSTRAINT `FK_UsuarioQuiz_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `usuarioquizrespuesta`;
CREATE TABLE `usuarioquizrespuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuarioQuiz` int NOT NULL,
  `idQuizPregunta` int NOT NULL,
  `idQuizRespuesta` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioRespuesta_Pregunta_idx` (`idQuizPregunta`),
  KEY `FK_UsuarioRespuesta_Respuesta_idx` (`idQuizRespuesta`),
  KEY `FK_UsuarioRespuesta_UsuarioQuiz_idx` (`idUsuarioQuiz`),
  CONSTRAINT `FK_UsuarioQuizRespuesta_QuizPregunta` FOREIGN KEY (`idQuizPregunta`) REFERENCES `quizpregunta` (`id`),
  CONSTRAINT `FK_UsuarioQuizRespuesta_QuizRespuesta` FOREIGN KEY (`idQuizRespuesta`) REFERENCES `quizrespuesta` (`id`),
  CONSTRAINT `FK_UsuarioQuizRespuesta_UsuarioQuiz` FOREIGN KEY (`idUsuarioQuiz`) REFERENCES `usuarioquiz` (`id`)
);

DROP TABLE IF EXISTS `usuariosupervisor`;
CREATE TABLE `usuariosupervisor` (
  `idSupervisor` int NOT NULL,
  `idUsuario` int NOT NULL,
  PRIMARY KEY (`idSupervisor`,`idUsuario`),
  KEY `FK_UsuarioSupervisor_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_UsuarioSupervisor_Supervisor` FOREIGN KEY (`idSupervisor`) REFERENCES `usuario` (`id`),
  CONSTRAINT `FK_UsuarioSupervisor_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `usuariovideo`;
CREATE TABLE `usuariovideo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idVideo` int NOT NULL,
  `progreso` decimal(5,2) NOT NULL DEFAULT '0.00',
  `fechaEmpezado` datetime DEFAULT NULL,
  `fechaCompletado` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioVideo_Usuario_idx` (`idUsuario`),
  KEY `FK_UsuarioVideo_VIdeo_idx` (`idVideo`),
  CONSTRAINT `FK_UsuarioVideo_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `FK_UsuarioVideo_VIdeo` FOREIGN KEY (`idVideo`) REFERENCES `video` (`id`)
);

DROP TABLE IF EXISTS `vacacion`;
CREATE TABLE `vacacion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `fechaInicio` datetime NOT NULL,
  `fechaFinal` datetime NOT NULL,
  `fechaCreado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comentario` varchar(250) DEFAULT NULL,
  `estado` int NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`),
  KEY `FK_Vacacion_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_Vacacion_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
);

DROP TABLE IF EXISTS `video`;
CREATE TABLE `video` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `link` varchar(250) NOT NULL,
  `fechaLimite` datetime DEFAULT NULL,
  `requerido` tinyint NOT NULL DEFAULT '1',
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
);
