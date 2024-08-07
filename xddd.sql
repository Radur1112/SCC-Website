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
-- Dumping data for table `puesto`
--

LOCK TABLES `puesto` WRITE;
/*!40000 ALTER TABLE `puesto` DISABLE KEYS */;
INSERT INTO `puesto` VALUES (1,'TI');
/*!40000 ALTER TABLE `puesto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipoaumento`
--

LOCK TABLES `tipoaumento` WRITE;
/*!40000 ALTER TABLE `tipoaumento` DISABLE KEYS */;
INSERT INTO `tipoaumento` VALUES (1,0,'Comision',1.00,NULL,NULL),(2,0,'Horas Extra',2.00,NULL,NULL),(3,0,'Incentivos',1.00,NULL,NULL),(4,0,'Bonificaciones',1.00,NULL,NULL),(5,1,'Bono productividad',1.00,3,NULL),(6,1,'Comisiones',1.00,NULL,NULL),(7,1,'Bono excedente meta',1.00,NULL,NULL),(8,1,'Otros Bonos',1.00,NULL,NULL),(9,1,'Otros incentivos',1.00,NULL,NULL);
/*!40000 ALTER TABLE `tipoaumento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipocontrato`
--

LOCK TABLES `tipocontrato` WRITE;
/*!40000 ALTER TABLE `tipocontrato` DISABLE KEYS */;
INSERT INTO `tipocontrato` VALUES (1,'Asalariado'),(2,'Servicios Profesionales');
/*!40000 ALTER TABLE `tipocontrato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipodeduccion`
--

LOCK TABLES `tipodeduccion` WRITE;
/*!40000 ALTER TABLE `tipodeduccion` DISABLE KEYS */;
INSERT INTO `tipodeduccion` VALUES (1,0,'CCSS',1.00,2,10.67),(2,0,'Impuesto sobre la renta',1.00,NULL,NULL),(3,0,'Adelando de Salario',1.00,NULL,NULL),(4,0,'Prestamos',1.00,NULL,NULL),(5,0,'Otros Rebajos',1.00,NULL,NULL),(6,1,'Prestamos o adelantos de pago',1.00,NULL,NULL);
/*!40000 ALTER TABLE `tipodeduccion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipoforo`
--

LOCK TABLES `tipoforo` WRITE;
/*!40000 ALTER TABLE `tipoforo` DISABLE KEYS */;
INSERT INTO `tipoforo` VALUES (1,'Consulta'),(2,'Encuesta');
/*!40000 ALTER TABLE `tipoforo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipootropago`
--

LOCK TABLES `tipootropago` WRITE;
/*!40000 ALTER TABLE `tipootropago` DISABLE KEYS */;
INSERT INTO `tipootropago` VALUES (1,0,'Viaticos',1.00,NULL,NULL),(2,1,'Impuesto al valor Agregado',1.00,2,13.00);
/*!40000 ALTER TABLE `tipootropago` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `tipousuario`
--

LOCK TABLES `tipousuario` WRITE;
/*!40000 ALTER TABLE `tipousuario` DISABLE KEYS */;
INSERT INTO `tipousuario` VALUES (1,'Administrador'),(2,'Asesor'),(3,'Supervisor'),(4,'Capacitador'),(5,'Planillero');
/*!40000 ALTER TABLE `tipousuario` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-08-07  5:59:38
