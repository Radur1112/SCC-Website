CREATE DATABASE  IF NOT EXISTS `sccdb` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sccdb`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: localhost    Database: sccdb
-- ------------------------------------------------------
-- Server version	8.0.37

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `historialreclutamiento`
--

DROP TABLE IF EXISTS `historialreclutamiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historialreclutamiento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `identificacion` varchar(20) NOT NULL,
  `fecha` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Identificacion_UNIQUE` (`identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modulo`
--

DROP TABLE IF EXISTS `modulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `modulovideo`
--

DROP TABLE IF EXISTS `modulovideo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modulovideo` (
  `idModulo` int NOT NULL,
  `idVideo` int NOT NULL,
  `nivel` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`idModulo`,`idVideo`),
  KEY `FK_ModuloVideo_Modulo_idx` (`idModulo`),
  KEY `FK_ModuloVideo_Video_idx` (`idVideo`),
  CONSTRAINT `FK_ModuloVideo_Modulo` FOREIGN KEY (`idModulo`) REFERENCES `modulo` (`id`),
  CONSTRAINT `FK_ModuloVideo_Video` FOREIGN KEY (`idVideo`) REFERENCES `video` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pregunta`
--

DROP TABLE IF EXISTS `pregunta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idQuiz` int NOT NULL,
  `idTipoPregunta` int NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Pregunta_TipoPregunta_idx` (`idTipoPregunta`),
  KEY `FK_Pregunta_Quiz_idx` (`idQuiz`),
  CONSTRAINT `FK_Pregunta_Quiz` FOREIGN KEY (`idQuiz`) REFERENCES `quiz` (`id`),
  CONSTRAINT `FK_Pregunta_TipoPregunta` FOREIGN KEY (`idTipoPregunta`) REFERENCES `tipopregunta` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `puesto`
--

DROP TABLE IF EXISTS `puesto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `puesto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `quiz`
--

DROP TABLE IF EXISTS `quiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idModulo` int NOT NULL,
  `titulo` varchar(45) NOT NULL,
  `descripcion` text NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Quiz_Modulo_idx` (`idModulo`),
  CONSTRAINT `FK_Quiz_Modulo` FOREIGN KEY (`idModulo`) REFERENCES `modulo` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `respuesta`
--

DROP TABLE IF EXISTS `respuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idPregunta` int NOT NULL,
  `descripcion` varchar(250) NOT NULL,
  `correcta` tinyint NOT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `FK_Respuesta_Pregunta_idx` (`idPregunta`),
  CONSTRAINT `FK_Respuesta_Pregunta` FOREIGN KEY (`idPregunta`) REFERENCES `pregunta` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipocontrato`
--

DROP TABLE IF EXISTS `tipocontrato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipocontrato` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipopregunta`
--

DROP TABLE IF EXISTS `tipopregunta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipopregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tipousuario`
--

DROP TABLE IF EXISTS `tipousuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipousuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idTipoUsuario` int NOT NULL,
  `idTipoContrato` int NOT NULL,
  `idPuesto` int NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `correo` varchar(250) NOT NULL,
  `password` varchar(60) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `salario` decimal(11,2) NOT NULL,
  `fechaIngreso` date NOT NULL,
  `vacacion` int DEFAULT NULL,
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `identificacion_UNIQUE` (`identificacion`),
  UNIQUE KEY `correo_UNIQUE` (`correo`),
  UNIQUE KEY `telefono_UNIQUE` (`telefono`),
  KEY `FK_Usuario_TipoUsuario_idx` (`idTipoUsuario`),
  KEY `FK_Usuario_Puesto_idx` (`idPuesto`),
  KEY `FK_Usuario_TipoContrato_idx` (`idTipoContrato`),
  CONSTRAINT `FK_Usuario_Puesto` FOREIGN KEY (`idPuesto`) REFERENCES `puesto` (`id`),
  CONSTRAINT `FK_Usuario_TipoContrato` FOREIGN KEY (`idTipoContrato`) REFERENCES `tipocontrato` (`id`),
  CONSTRAINT `FK_Usuario_TipoUsuario` FOREIGN KEY (`idTipoUsuario`) REFERENCES `tipousuario` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuariomodulo`
--

DROP TABLE IF EXISTS `usuariomodulo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuariomodulo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idModulo` int NOT NULL,
  `progreso` decimal(5,2) NOT NULL,
  `fechaEmpezado` datetime NOT NULL,
  `fechaCompletado` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioModulo_Modulo_idx` (`idModulo`),
  KEY `FK_UsuarioModulo_Usuario_idx` (`idUsuario`),
  CONSTRAINT `FK_UsuarioModulo_Modulo` FOREIGN KEY (`idModulo`) REFERENCES `modulo` (`id`),
  CONSTRAINT `FK_UsuarioModulo_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarioquiz`
--

DROP TABLE IF EXISTS `usuarioquiz`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuariorespuesta`
--

DROP TABLE IF EXISTS `usuariorespuesta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuariorespuesta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuarioQuiz` int NOT NULL,
  `idPregunta` int NOT NULL,
  `idRespuesta` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioRespuesta_Pregunta_idx` (`idPregunta`),
  KEY `FK_UsuarioRespuesta_Respuesta_idx` (`idRespuesta`),
  KEY `FK_UsuarioRespuesta_UsuarioQuiz_idx` (`idUsuarioQuiz`),
  CONSTRAINT `FK_UsuarioRespuesta_Pregunta` FOREIGN KEY (`idPregunta`) REFERENCES `pregunta` (`id`),
  CONSTRAINT `FK_UsuarioRespuesta_Respuesta` FOREIGN KEY (`idRespuesta`) REFERENCES `respuesta` (`id`),
  CONSTRAINT `FK_UsuarioRespuesta_UsuarioQuiz` FOREIGN KEY (`idUsuarioQuiz`) REFERENCES `usuarioquiz` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuariovideo`
--

DROP TABLE IF EXISTS `usuariovideo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuariovideo` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idUsuario` int NOT NULL,
  `idVideo` int NOT NULL,
  `progreso` decimal(5,2) NOT NULL,
  `fechaEmpezado` datetime NOT NULL,
  `fechaCompletado` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_UsuarioVideo_Usuario_idx` (`idUsuario`),
  KEY `FK_UsuarioVideo_VIdeo_idx` (`idVideo`),
  CONSTRAINT `FK_UsuarioVideo_Usuario` FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`id`),
  CONSTRAINT `FK_UsuarioVideo_VIdeo` FOREIGN KEY (`idVideo`) REFERENCES `video` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text NOT NULL,
  `link` varchar(250) NOT NULL,
  `fechaLimite` datetime DEFAULT NULL,
  `requerido` tinyint NOT NULL DEFAULT '1',
  `estado` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-07-02 12:41:02
