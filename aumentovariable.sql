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
-- Dumping data for table `anotacionvariable`
--

LOCK TABLES `anotacionvariable` WRITE;
/*!40000 ALTER TABLE `anotacionvariable` DISABLE KEYS */;
INSERT INTO `anotacionvariable` VALUES (1,1,1,'Comision',1.00,1),(2,1,1,'Horas Extra',2.00,1),(3,1,1,'Incentivos',1.00,1),(4,1,1,'Bonificaciones',1.00,1),(5,1,1,'Pago de incapacidad',0.50,1),(6,1,2,'Comisiones',1.00,1),(7,1,2,'Bono excedente meta',1.00,1),(8,1,2,'Otros Bonos',1.00,1),(9,1,2,'Otros incentivos',1.00,1),(10,1,2,'Bono por enfermedad',0.50,1),(11,2,1,'Impuesto sobre la renta',1.00,1),(12,2,1,'Adelanto de Salario',1.00,1),(13,2,1,'Prestamos',1.00,1),(14,2,1,'Otros Rebajos',1.00,1),(15,2,1,'Prestamos o adelantos de pago',1.00,1),(16,2,2,'Rebajo por incapacidad',1.00,1),(17,3,1,'Viaticos',1.00,1);
/*!40000 ALTER TABLE `anotacionvariable` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-18 16:16:49
