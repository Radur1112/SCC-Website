SELECT * FROM xd;

DELETE FROM aumento WHERE idPlanilla > 81;
DELETE FROM deduccion WHERE idPlanilla > 81;
DELETE FROM otropago WHERE idPlanilla > 81;
DELETE FROM planilla WHERE id > 81;

UPDATE planilla pl INNER JOIN usuario u ON u.id = pl.idUsuario SET pl.estado = 1 WHERE u.estado != 0 AND pl.fechaInicio < '2024-08-12';

DELETE FROM planillahistorial WHERE id = 1;
DELETE ph FROM comprobanteplanilla ph INNER JOIN planilla pl ON pl.id = ph.idPlanilla WHERE pl.fechaInicio < '2024-08-12';

SELECT * FROM usuario;
SELECT * FROM tipousuario;
SELECT * FROM tipocontrato;
SELECT * FROM puesto;
SELECT * FROM usuariosupervisor;
SELECT * FROM incapacidad;
SELECT * FROM incapacidadarchivo;
SELECT * FROM vacacion;
SELECT * FROM notificacion;

UPDATE vacacion SET estado = 2 WHERE id > 0;
UPDATE usuario SET vacacion = 2 WHERE id > 0;

SELECT * FROM video;
SELECT * FROM modulo;
SELECT * FROM modulovideo;
SELECT * FROM usuariovideo;
SELECT * FROM usuariomodulo;

SELECT * FROM quiz;
SELECT * FROM quizpregunta;
SELECT * FROM tipopregunta;
SELECT * FROM quizrespuesta;
SELECT * FROM usuarioquiz;
SELECT * FROM usuarioquizrespuesta;

SELECT * FROM tipoforo;
SELECT * FROM foro;
SELECT * FROM foroarchivo;
SELECT * FROM fororespuesta;
SELECT * FROM forohistorial;
SELECT * FROM usuariofororespuesta;

SELECT * FROM planilla;
SELECT * FROM aumento;
SELECT * FROM tipoaumento;
SELECT * FROM deduccion;
SELECT * FROM tipodeduccion;
SELECT * FROM otropago;
SELECT * FROM tipootropago;
SELECT * FROM comprobanteplanilla;
SELECT * FROM planillahistorial;

SELECT * FROM planilla;
SELECT * FROM planillausuario;
SELECT * FROM planillausuarioanotacion;
SELECT * FROM anotacion;
SELECT * FROM tipoanotacion;
SELECT * FROM comprobanteplanilla;
SELECT * FROM planillahistorial;

SELECT * FROM aumento;
SELECT * FROM tipoaumento;
SELECT * FROM deduccion;
SELECT * FROM tipodeduccion;
SELECT * FROM otropago;
SELECT * FROM tipootropago;

SELECT * FROM tipotrabajo;

DELETE FROM planillahistorial WHERE id > 0;
ALTER TABLE planillahistorial AUTO_INCREMENT = 1;
DELETE FROM comprobanteplanilla WHERE id > 0;
ALTER TABLE comprobanteplanilla AUTO_INCREMENT = 1;
DELETE FROM planillausuarioanotacion WHERE id > 0;
ALTER TABLE planillausuarioanotacion AUTO_INCREMENT = 1;
DELETE FROM planillausuario WHERE id > 0;
ALTER TABLE planillausuario AUTO_INCREMENT = 1;
DELETE FROM planilla WHERE id > 0;
ALTER TABLE planilla AUTO_INCREMENT = 1;


DELETE FROM tipoaumento WHERE id > 0;
ALTER TABLE tipoaumento AUTO_INCREMENT = 1;
DELETE FROM tipodeduccion WHERE id > 0;
ALTER TABLE tipodeduccion AUTO_INCREMENT = 1;
DELETE FROM tipootropago WHERE id > 0;
ALTER TABLE tipootropago AUTO_INCREMENT = 1;
DELETE FROM aumento WHERE id > 0;
ALTER TABLE aumento AUTO_INCREMENT = 1;
DELETE FROM deduccion WHERE id > 0;
ALTER TABLE deduccion AUTO_INCREMENT = 1;
DELETE FROM otropago WHERE id > 0;
ALTER TABLE otropago AUTO_INCREMENT = 1;

DELETE FROM usuarioquizrespuesta WHERE id > 0;
ALTER TABLE usuarioquizrespuesta AUTO_INCREMENT = 1;
DELETE FROM usuarioquiz WHERE id > 0;
ALTER TABLE usuarioquiz AUTO_INCREMENT = 1;
DELETE FROM quizrespuesta WHERE id > 0;
ALTER TABLE quizrespuesta AUTO_INCREMENT = 1;
DELETE FROM quizpregunta WHERE id > 0;
ALTER TABLE quizpregunta AUTO_INCREMENT = 1;
DELETE FROM quiz WHERE id > 0;
ALTER TABLE quiz AUTO_INCREMENT = 1;

DELETE FROM usuariomodulo WHERE id > 0;
ALTER TABLE usuariomodulo AUTO_INCREMENT = 1;
DELETE FROM usuariovideo WHERE id > 0;
ALTER TABLE usuariovideo AUTO_INCREMENT = 1;
DELETE FROM modulovideo WHERE idVideo > 0;
DELETE FROM modulo WHERE id > 0;
ALTER TABLE modulo AUTO_INCREMENT = 1;
DELETE FROM video WHERE id > 0;
ALTER TABLE video AUTO_INCREMENT = 1;

SELECT * FROM video;
SELECT * FROM modulo;
SELECT * FROM modulovideo;
SELECT * FROM usuariovideo;
SELECT * FROM usuariomodulo;

DELETE FROM incapacidadarchivo WHERE id > 0;
ALTER TABLE incapacidadarchivo AUTO_INCREMENT = 1;
DELETE FROM incapacidad WHERE id > 0;
ALTER TABLE incapacidad AUTO_INCREMENT = 1;
DELETE FROM vacacion WHERE id > 0;
ALTER TABLE vacacion AUTO_INCREMENT = 1;

DELETE FROM usuario WHERE id > 1;
ALTER TABLE usuario AUTO_INCREMENT = 2;

DELETE FROM usuariofororespuesta WHERE id > 0;
ALTER TABLE usuariofororespuesta AUTO_INCREMENT = 1;
DELETE FROM forohistorial WHERE id > 0;
ALTER TABLE forohistorial AUTO_INCREMENT = 1;
DELETE FROM foroarchivo WHERE id > 0;
ALTER TABLE foroarchivo AUTO_INCREMENT = 1;
DELETE FROM fororespuesta WHERE id > 0;
ALTER TABLE fororespuesta AUTO_INCREMENT = 1;
DELETE FROM foro WHERE id > 0;
ALTER TABLE foro AUTO_INCREMENT = 1;

INSERT INTO puesto SET descripcion = 'Gerente';
INSERT INTO puesto SET descripcion = 'Supervisor';
INSERT INTO puesto SET descripcion = 'Asesor';
INSERT INTO puesto SET descripcion = 'Contabilidad';
INSERT INTO puesto SET descripcion = 'Rango Medio';

INSERT INTO sccdb.usuario (idtipousuario, idtipocontrato, idPuesto, identificacion, correo, password, nombre, telefono, salario, fechaingreso, vacacion)
VALUES 
(2, 1, 1, '12345678', 'user1@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User1', '1234567801', 160000.00, CURDATE(), 0),
(2, 1, 1, '22345678', 'user2@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User2', '1234567802', 160000.00, CURDATE(), 0),
(2, 1, 1, '32345678', 'user3@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User3', '1234567803', 160000.00, CURDATE(), 0),
(2, 1, 1, '42345678', 'user4@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User4', '1234567804', 160000.00, CURDATE(), 0),
(2, 1, 1, '52345678', 'user5@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User5', '1234567805', 160000.00, CURDATE(), 0),
(2, 1, 1, '62345678', 'user6@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User6', '1234567806', 160000.00, CURDATE(), 0),
(2, 1, 1, '72345678', 'user7@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User7', '1234567807', 160000.00, CURDATE(), 0),
(2, 1, 1, '82345678', 'user8@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User8', '1234567808', 160000.00, CURDATE(), 0),
(2, 1, 1, '92345678', 'user9@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User9', '1234567809', 160000.00, CURDATE(), 0),
(2, 1, 1, '10345678', 'user10@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User10', '1234567810', 160000.00, CURDATE(), 0),
(2, 1, 1, '11345678', 'user11@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User11', '1234567811', 160000.00, CURDATE(), 0),
(2, 1, 1, '12345678', 'user12@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User12', '1234567812', 160000.00, CURDATE(), 0),
(2, 1, 1, '13345678', 'user13@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User13', '1234567813', 160000.00, CURDATE(), 0),
(2, 1, 1, '14345678', 'user14@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User14', '1234567814', 160000.00, CURDATE(), 0),
(2, 1, 1, '15345678', 'user15@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User15', '1234567815', 160000.00, CURDATE(), 0),
(2, 1, 1, '16345678', 'user16@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User16', '1234567816', 160000.00, CURDATE(), 0),
(2, 1, 1, '17345678', 'user17@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User17', '1234567817', 160000.00, CURDATE(), 0),
(2, 1, 1, '18345678', 'user18@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User18', '1234567818', 160000.00, CURDATE(), 0),
(2, 1, 1, '19345678', 'user19@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User19', '1234567819', 160000.00, CURDATE(), 0),
(2, 1, 1, '20345678', 'user20@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User20', '1234567820', 160000.00, CURDATE(), 0),
(2, 1, 1, '21345678', 'user21@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User21', '1234567821', 160000.00, CURDATE(), 0),
(2, 1, 1, '22345678', 'user22@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User22', '1234567822', 160000.00, CURDATE(), 0),
(2, 1, 1, '23345678', 'user23@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User23', '1234567823', 160000.00, CURDATE(), 0),
(2, 1, 1, '24345678', 'user24@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User24', '1234567824', 160000.00, CURDATE(), 0),
(2, 1, 1, '25345678', 'user25@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User25', '1234567825', 160000.00, CURDATE(), 0),
(2, 1, 1, '26345678', 'user26@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User26', '1234567826', 160000.00, CURDATE(), 0),
(2, 1, 1, '27345678', 'user27@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User27', '1234567827', 160000.00, CURDATE(), 0),
(2, 1, 1, '28345678', 'user28@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User28', '1234567828', 160000.00, CURDATE(), 0),
(2, 1, 1, '29345678', 'user29@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User29', '1234567829', 160000.00, CURDATE(), 0),
(2, 1, 1, '30345678', 'user30@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User30', '1234567830', 160000.00, CURDATE(), 0),
(2, 1, 1, '31345678', 'user31@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User31', '1234567831', 160000.00, CURDATE(), 0),
(2, 1, 1, '32345678', 'user32@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User32', '1234567832', 160000.00, CURDATE(), 0),
(2, 1, 1, '33345678', 'user33@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User33', '1234567833', 160000.00, CURDATE(), 0),
(2, 1, 1, '34345678', 'user34@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User34', '1234567834', 160000.00, CURDATE(), 0),
(2, 1, 1, '35345678', 'user35@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User35', '1234567835', 160000.00, CURDATE(), 0),
(2, 1, 1, '36345678', 'user36@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User36', '1234567836', 160000.00, CURDATE(), 0),
(2, 1, 1, '37345678', 'user37@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User37', '1234567837', 160000.00, CURDATE(), 0),
(2, 1, 1, '38345678', 'user38@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User38', '1234567838', 160000.00, CURDATE(), 0),
(2, 1, 1, '39345678', 'user39@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User39', '1234567839', 160000.00, CURDATE(), 0),
(2, 1, 1, '40345678', 'user40@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', 'User40', '1234567840', 160000.00, CURDATE(), 0);

UPDATE usuario SET estado = 0 WHERE id > 20;
UPDATE tipoaumento SET valor = NULL WHERE id = 5;
UPDATE puesto SET descripcion = 'Desarrollador' WHERE id = 1;
UPDATE usuario SET idPuesto = idPuesto + 1 WHERE idPuesto > 2;


SELECT 'Aumento' AS tipo, a.id, a.fecha, a.monto, ta.descripcion 
FROM aumento a
JOIN tipoaumento ta ON a.idTipoAumento = ta.id
WHERE a.idPlanilla = 1 

UNION ALL

SELECT 'Deduccion' AS tipo, d.id, d.fecha, d.monto, td.descripcion 
FROM deduccion d
JOIN tipodeduccion td ON d.idTipoDeduccion = td.id
WHERE d.idPlanilla = 1

UNION ALL

SELECT 'Otro Pago' AS tipo, op.id, op.fecha, op.monto, top.descripcion 
FROM otropago op
JOIN tipootropago top ON op.idTipoOtroPago = top.id
WHERE op.idPlanilla = 1

ORDER BY fecha DESC;




SELECT 
    'Aumento' AS tipo, a.id, a.fecha, a.monto, 
    u.id AS usuarioId, u.nombre AS usuarioNombre,
    ta.descripcion, 
    p.id AS planillaId, 
    u2.id AS usuarioModId, u2.nombre AS usuarioModNombre
FROM aumento a
JOIN tipoaumento ta ON a.idTipoAumento = ta.id
JOIN planilla p ON a.idPlanilla = p.id
JOIN usuario u ON p.idUsuario = u.id
LEFT JOIN usuario u2 ON a.idUsuario = u2.id

UNION ALL

SELECT 
	'Deduccion' AS tipo, d.id, d.fecha, d.monto, 
    u.id AS usuarioId, u.nombre AS usuarioNombre,
    td.descripcion, 
    p.id AS planillaId,  
    u2.id AS usuarioModId, u2.nombre AS usuarioModNombre
FROM deduccion d
JOIN tipodeduccion td ON d.idTipoDeduccion = td.id
JOIN planilla p ON d.idPlanilla = p.id
JOIN usuario u ON p.idUsuario = u.id
LEFT JOIN usuario u2 ON d.idUsuario = u2.id

UNION ALL

SELECT 
    'Otro Pago' AS tipo, op.id, op.fecha, op.monto, 
    u.id AS usuarioId, u.nombre AS usuarioNombre, 
    top.descripcion, 
    p.id AS planillaId, 
    u2.id AS usuarioModId, u2.nombre AS usuarioModNombre
FROM otropago op
JOIN tipootropago top ON op.idTipoOtroPago = top.id
JOIN planilla p ON op.idPlanilla = p.id
JOIN usuario u ON p.idUsuario = u.id
LEFT JOIN usuario u2 ON op.idUsuario = u2.id

ORDER BY fecha DESC;



SELECT u.id, u.identificacion, u.nombre, u.correo, p.descripcion AS puestoDescripcion
        FROM usuariosupervisor us
        INNER JOIN usuario u ON u.id = us.idUsuario AND u.estado != 0
        INNER JOIN puesto p ON p.id = u.idPuesto
        WHERE us.idSupervisor = 8;
        
        
        
SELECT 
	JSON_ARRAYAGG(
	  JSON_OBJECT(
		'tipoAumentoId', ta.id,
		'tipoAumentoDescripcion', ta.descripcion,
		'tipoValorHoras', ta.valorHoras,
		'totalAumentoMonto', SUM(a.monto)
	  )
	)
  FROM aumento a
  INNER JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
  WHERE a.idPlanilla = 9 
  GROUP BY ta.id, ta.descripcion, ta.valorHoras;
  
  
  
  
  
  
  
-- For table `planillahistorial`
DELETE FROM planillahistorial WHERE id > 0;
ALTER TABLE planillahistorial AUTO_INCREMENT = 1;

-- For table `usuariomodulo`
DELETE FROM usuariomodulo WHERE id > 0;
ALTER TABLE usuariomodulo AUTO_INCREMENT = 1;

-- For table `modulovideo`
DELETE FROM modulovideo WHERE idModulo > 0 AND idVideo > 0;
-- Note: `AUTO_INCREMENT` cannot be used here since the primary key is a composite key (idModulo, idVideo)

-- For table `usuariovideo`
DELETE FROM usuariovideo WHERE id > 0;
ALTER TABLE usuariovideo AUTO_INCREMENT = 1;

-- For table `modulo`
DELETE FROM modulo WHERE id > 0;
ALTER TABLE modulo AUTO_INCREMENT = 1;

-- For table `video`
DELETE FROM video WHERE id > 0;
ALTER TABLE video AUTO_INCREMENT = 1;

-- For table `quiz`
DELETE FROM quiz WHERE id > 0;
ALTER TABLE quiz AUTO_INCREMENT = 1;

-- For table `aumento`
DELETE FROM aumento WHERE id > 0;
ALTER TABLE aumento AUTO_INCREMENT = 1;

-- For table `deduccion`
DELETE FROM deduccion WHERE id > 0;
ALTER TABLE deduccion AUTO_INCREMENT = 1;

-- For table `otropago`
DELETE FROM otropago WHERE id > 0;
ALTER TABLE otropago AUTO_INCREMENT = 1;

-- For table `comprobanteplanilla`
DELETE FROM comprobanteplanilla WHERE id > 0;
ALTER TABLE comprobanteplanilla AUTO_INCREMENT = 1;

-- For table `planilla`
DELETE FROM planilla WHERE id > 0;
ALTER TABLE planilla AUTO_INCREMENT = 1;

-- For table `usuariofororespuesta`
DELETE FROM usuariofororespuesta WHERE id > 0;
ALTER TABLE usuariofororespuesta AUTO_INCREMENT = 1;

-- For table `fororespuesta`
DELETE FROM fororespuesta WHERE id > 0;
ALTER TABLE fororespuesta AUTO_INCREMENT = 1;

-- For table `forohistorial`
DELETE FROM forohistorial WHERE id > 0;
ALTER TABLE forohistorial AUTO_INCREMENT = 1;

-- For table `foroarchivo`
DELETE FROM foroarchivo WHERE id > 0;
ALTER TABLE foroarchivo AUTO_INCREMENT = 1;

-- For table `incapacidadarchivo`
DELETE FROM incapacidadarchivo WHERE id > 0;
ALTER TABLE incapacidadarchivo AUTO_INCREMENT = 1;

-- For table `foro`
DELETE FROM foro WHERE id > 0;
ALTER TABLE foro AUTO_INCREMENT = 1;

-- For table `incapacidad`
DELETE FROM incapacidad WHERE id > 0;
ALTER TABLE incapacidad AUTO_INCREMENT = 1;

-- For table `quizpregunta`
DELETE FROM quizpregunta WHERE id > 0;
ALTER TABLE quizpregunta AUTO_INCREMENT = 1;

-- For table `quizrespuesta`
DELETE FROM quizrespuesta WHERE id > 0;
ALTER TABLE quizrespuesta AUTO_INCREMENT = 1;

-- For table `usuarioquizrespuesta`
DELETE FROM usuarioquizrespuesta WHERE id > 0;
ALTER TABLE usuarioquizrespuesta AUTO_INCREMENT = 1;

-- For table `usuarioquiz`
DELETE FROM usuarioquiz WHERE id > 0;
ALTER TABLE usuarioquiz AUTO_INCREMENT = 1;

-- For table `usuariosupervisor`
DELETE FROM usuariosupervisor WHERE idSupervisor > 0 AND idUsuario > 0;
-- Note: `AUTO_INCREMENT` cannot be used here since the primary key is a composite key (idSupervisor, idUsuario)

-- For table `vacacion`
DELETE FROM vacacion WHERE id > 0;
ALTER TABLE vacacion AUTO_INCREMENT = 1;


-- For table `vacacion`
DELETE FROM usuario WHERE id > 2;
ALTER TABLE vacacion AUTO_INCREMENT = 3;