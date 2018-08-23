-- MySQL dump 10.13  Distrib 5.7.12, for Win64 (x86_64)
--
-- Host: localhost    Database: tesis_borrador
-- ------------------------------------------------------
-- Server version	5.7.13-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carritos`
--

DROP TABLE IF EXISTS `carritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carritos` (
  `idCarrito` int(11) NOT NULL AUTO_INCREMENT,
  `idCliente` int(11) NOT NULL,
  `Estado` char(1) NOT NULL DEFAULT 'C',
  `Fecha` datetime DEFAULT NULL,
  PRIMARY KEY (`idCarrito`),
  KEY `idx_idCliente` (`idCliente`),
  CONSTRAINT `fk_idCliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idClientes`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clientes` (
  `idClientes` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(30) NOT NULL,
  `Apellido` varchar(30) NOT NULL,
  `Telefono` bigint(20) DEFAULT '0',
  `FechaNacimiento` date NOT NULL,
  `Contrasenia` varchar(30) NOT NULL,
  `Mail` varchar(40) DEFAULT NULL,
  `Saldo` decimal(10,2) DEFAULT '0.00',
  `Documento` int(11) NOT NULL,
  `Estado` char(1) DEFAULT 'I',
  PRIMARY KEY (`idClientes`),
  UNIQUE KEY `Cliente` (`Nombre`,`Apellido`,`Documento`),
  UNIQUE KEY `Documento_UNIQUE` (`Documento`),
  KEY `clNombre` (`Nombre`),
  KEY `clApellido` (`Apellido`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `compras` (
  `idCompras` int(11) NOT NULL AUTO_INCREMENT,
  `idProveedores` int(11) NOT NULL,
  `Fecha` datetime NOT NULL,
  `Estado` char(2) NOT NULL DEFAULT 'I',
  PRIMARY KEY (`idCompras`),
  KEY `fk-proveedor_idx` (`idProveedores`),
  CONSTRAINT `fk-proveedor` FOREIGN KEY (`idProveedores`) REFERENCES `proveedores` (`idProveedores`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `consultas`
--

DROP TABLE IF EXISTS `consultas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `consultas` (
  `idConsultas` int(11) NOT NULL AUTO_INCREMENT,
  `idClientes` int(11) NOT NULL,
  `idProductos` int(11) DEFAULT NULL,
  `Contenido` varchar(150) NOT NULL,
  `Foto` varchar(120) DEFAULT NULL,
  `Estado` char(1) DEFAULT 'N',
  PRIMARY KEY (`idConsultas`),
  KEY `fk-idClienteCons_idx` (`idClientes`),
  KEY `fk-idProdCons_idx` (`idProductos`),
  CONSTRAINT `fk-idClienteCons` FOREIGN KEY (`idClientes`) REFERENCES `clientes` (`idClientes`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk-idProdCons` FOREIGN KEY (`idProductos`) REFERENCES `productos` (`idProductos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `detalles`
--

DROP TABLE IF EXISTS `detalles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `detalles` (
  `idDetalles` int(11) NOT NULL AUTO_INCREMENT,
  `idFactura` int(11) NOT NULL,
  `idProductos` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idDetalles`),
  KEY `fk-idProducto_idx` (`idProductos`),
  KEY `fk-idFactura_idx` (`idFactura`),
  CONSTRAINT `fk-idFactura` FOREIGN KEY (`idFactura`) REFERENCES `facturas` (`idFactura`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk-idProducto` FOREIGN KEY (`idProductos`) REFERENCES `productos` (`idProductos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `empleados`
--

DROP TABLE IF EXISTS `empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `empleados` (
  `idEmpleados` int(11) NOT NULL AUTO_INCREMENT,
  `Documento` int(10) unsigned NOT NULL,
  `Nombre` varchar(30) NOT NULL,
  `Apellido` varchar(30) NOT NULL,
  `Telefono` int(11) DEFAULT NULL,
  `Mail` varchar(60) NOT NULL,
  `Rol` char(1) NOT NULL DEFAULT 'E',
  `Contrasenia` varchar(30) NOT NULL,
  `Estado` varchar(10) NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`idEmpleados`),
  UNIQUE KEY `DNI_UNIQUE` (`Documento`),
  KEY `emNombre` (`Nombre`),
  KEY `clApellido` (`Apellido`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `facturas` (
  `idFactura` int(11) NOT NULL AUTO_INCREMENT,
  `idCliente` int(11) DEFAULT NULL,
  `idEmpleados` int(11) DEFAULT NULL,
  `Fecha` datetime NOT NULL,
  `Estado` char(2) NOT NULL DEFAULT 'P',
  `Tipo` char(2) NOT NULL DEFAULT 'L',
  PRIMARY KEY (`idFactura`),
  KEY `fk-idCliente_idx` (`idCliente`),
  KEY `fk-idEmpleado_idx` (`idEmpleados`),
  CONSTRAINT `fk-idCliente` FOREIGN KEY (`idCliente`) REFERENCES `clientes` (`idClientes`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk-idEmpleado` FOREIGN KEY (`idEmpleados`) REFERENCES `empleados` (`idEmpleados`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lineacarritos`
--

DROP TABLE IF EXISTS `lineacarritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lineacarritos` (
  `idLineaCarrito` int(11) NOT NULL AUTO_INCREMENT,
  `idCarrito` int(11) NOT NULL,
  `idProducto` int(11) NOT NULL,
  `Cantidad` int(11) unsigned NOT NULL,
  `PrecioProducto` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`idLineaCarrito`),
  KEY `idx_Carrito` (`idCarrito`),
  KEY `fk_idProducto_idx` (`idProducto`),
  CONSTRAINT `fk_idCarrito` FOREIGN KEY (`idCarrito`) REFERENCES `carritos` (`idCarrito`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk_idProducto` FOREIGN KEY (`idProducto`) REFERENCES `productos` (`idProductos`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lineacompras`
--

DROP TABLE IF EXISTS `lineacompras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lineacompras` (
  `idLineaCompras` int(11) NOT NULL AUTO_INCREMENT,
  `idCompras` int(11) NOT NULL,
  `idProductos` int(11) NOT NULL,
  `Cantidad` int(11) NOT NULL,
  `Precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`idLineaCompras`,`idCompras`,`idProductos`),
  KEY `fk-ProvComp_idx` (`idCompras`),
  KEY `fk-Producto_idx` (`idProductos`),
  CONSTRAINT `fk-Producto` FOREIGN KEY (`idProductos`) REFERENCES `productos` (`idProductos`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk-ProvComp` FOREIGN KEY (`idCompras`) REFERENCES `compras` (`idCompras`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lineapagosclientes`
--

DROP TABLE IF EXISTS `lineapagosclientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lineapagosclientes` (
  `idLineaPagosClientes` int(11) NOT NULL AUTO_INCREMENT,
  `idFactura` int(11) DEFAULT NULL,
  `idPagosClientes` int(11) NOT NULL,
  PRIMARY KEY (`idLineaPagosClientes`),
  KEY `fk-idFacturas_idx` (`idFactura`),
  KEY `fk-idPagosClientes_idx` (`idPagosClientes`),
  CONSTRAINT `fk-idFacturas` FOREIGN KEY (`idFactura`) REFERENCES `facturas` (`idFactura`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk-idPagosClientes` FOREIGN KEY (`idPagosClientes`) REFERENCES `pagosclientes` (`idPagosClientes`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lineapagosproveedores`
--

DROP TABLE IF EXISTS `lineapagosproveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lineapagosproveedores` (
  `idLineaPagosProveedores` int(11) NOT NULL AUTO_INCREMENT,
  `idCompras` int(11) DEFAULT NULL,
  `idPagosProveedores` int(11) NOT NULL,
  PRIMARY KEY (`idLineaPagosProveedores`),
  KEY `fk-idCompras_idx` (`idCompras`),
  KEY `FK-idPagosProveedores_idx` (`idPagosProveedores`),
  CONSTRAINT `FK-idPagosProveedores` FOREIGN KEY (`idPagosProveedores`) REFERENCES `pagosproveedores` (`idPagosProveedores`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `fk-idCompras` FOREIGN KEY (`idCompras`) REFERENCES `compras` (`idCompras`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagosclientes`
--

DROP TABLE IF EXISTS `pagosclientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagosclientes` (
  `idPagosClientes` int(11) NOT NULL AUTO_INCREMENT,
  `Monto` decimal(10,2) NOT NULL,
  `Fecha` datetime NOT NULL,
  `idClientes` int(11) NOT NULL,
  `SaldoAnterior` float NOT NULL DEFAULT '0',
  `Tipo` char(2) NOT NULL DEFAULT 'CC',
  PRIMARY KEY (`idPagosClientes`),
  KEY `fk-idClientes_idx` (`idClientes`),
  CONSTRAINT `fk-idClientes` FOREIGN KEY (`idClientes`) REFERENCES `clientes` (`idClientes`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pagosproveedores`
--

DROP TABLE IF EXISTS `pagosproveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pagosproveedores` (
  `idPagosProveedores` int(11) NOT NULL AUTO_INCREMENT,
  `Monto` decimal(10,2) NOT NULL,
  `Fecha` datetime NOT NULL,
  `idProveedores` int(11) NOT NULL,
  `saldoAnterior` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`idPagosProveedores`),
  KEY `fk-idProveedores_idx` (`idProveedores`),
  CONSTRAINT `fk-idProveedores` FOREIGN KEY (`idProveedores`) REFERENCES `proveedores` (`idProveedores`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `idProductos` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(45) NOT NULL,
  `Precio` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Stock` int(10) unsigned DEFAULT '0',
  `Foto` varchar(120) DEFAULT '-',
  `idRubro` int(11) NOT NULL,
  `Descripcion` varchar(100) DEFAULT 'NULL',
  `PrecioCosto` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Destacado` tinyint(1) DEFAULT '0',
  `Oferta` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`idProductos`),
  UNIQUE KEY `NombreProducto_UNIQUE` (`Nombre`),
  KEY `prodNombre` (`Nombre`),
  KEY `fk-idRubro1_idx` (`idRubro`),
  CONSTRAINT `fk-idRubro` FOREIGN KEY (`idRubro`) REFERENCES `rubros` (`idSubRubro`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `proveedores`
--

DROP TABLE IF EXISTS `proveedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `proveedores` (
  `idProveedores` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(70) NOT NULL,
  `Saldo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `Telefono` int(11) DEFAULT NULL,
  `Mail` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`idProveedores`),
  UNIQUE KEY `mail_UNIQUE` (`Mail`),
  KEY `provNombre` (`Nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rubros`
--

DROP TABLE IF EXISTS `rubros`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rubros` (
  `idSubRubro` int(11) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(25) NOT NULL,
  `idRubro` int(11) DEFAULT NULL,
  PRIMARY KEY (`idSubRubro`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'tesis_borrador'
--
/*!50003 DROP PROCEDURE IF EXISTS `buscarDeudores` */;
ALTER DATABASE `tesis_borrador` CHARACTER SET utf8 COLLATE utf8_general_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `buscarDeudores`()
BEGIN
	SELECT distinct(Documento),idClientes,Nombre,Apellido,date_format(`FechaNacimiento`, '%d-%m-%Y') as FechaNacimiento,
    Telefono,Mail,Saldo FROM tesis_borrador.clientes 
    left join facturas on facturas.idCliente = clientes.idClientes
	where (Saldo > 0 OR facturas.Estado = 'CC') order by Apellido;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `tesis_borrador` CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
/*!50003 DROP PROCEDURE IF EXISTS `buscarProveedorConDeuda` */;
ALTER DATABASE `tesis_borrador` CHARACTER SET utf8 COLLATE utf8_general_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `buscarProveedorConDeuda`()
BEGIN
	SELECT distinct(proveedores.idProveedores),Nombre,Telefono,Mail,Saldo 
    FROM tesis_borrador.proveedores left join compras 
    on compras.idProveedores = proveedores.idProveedores
	where (Saldo > 0 OR compras.Estado = 'I')
    order by Nombre;
    
    
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `tesis_borrador` CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
/*!50003 DROP PROCEDURE IF EXISTS `traerProductosConVentasPendientes` */;
ALTER DATABASE `tesis_borrador` CHARACTER SET utf8 COLLATE utf8_general_ci ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `traerProductosConVentasPendientes`()
BEGIN
	select productos.idProductos,productos.Nombre,Precio,Stock,PrecioProducto as VentaAsociada from productos 
	left join lineaCarritos on lineaCarritos.idProducto = productos.idProductos && PrecioProducto is not null
	group by idProductos
	order by productos.Nombre;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
ALTER DATABASE `tesis_borrador` CHARACTER SET utf8 COLLATE utf8_unicode_ci ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-11-27  0:47:50
