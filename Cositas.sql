SELECT * FROM xd;

SELECT * FROM usuario;
SELECT * FROM tipousuario;
SELECT * FROM usuariosupervisor;
SELECT * FROM incapacidad;
SELECT * FROM incapacidadarchivo;
SELECT * FROM vacacion;

UPDATE vacacion SET estado = 2 WHERE id > 0;
UPDATE usuario SET vacacion = 2 WHERE id > 0;

SELECT * FROM video;
SELECT * FROM modulo;
SELECT * FROM modulovideo;
SELECT * FROM usuariovideo;

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

SELECT * FROM usuariofororespuesta;

DELETE FROM incapacidadarchivo WHERE id > 0;
ALTER TABLE incapacidadarchivo AUTO_INCREMENT = 1;
DELETE FROM incapacidad WHERE id > 0;
ALTER TABLE incapacidad AUTO_INCREMENT = 1;
DELETE FROM vacacion WHERE id > 0;
ALTER TABLE vacacion AUTO_INCREMENT = 1;

DELETE FROM planillahistorial WHERE id > 0;
ALTER TABLE planillahistorial AUTO_INCREMENT = 1;
DELETE FROM comprobanteplanilla WHERE id > 0;
ALTER TABLE comprobanteplanilla AUTO_INCREMENT = 1;
DELETE FROM aumento WHERE id > 0;
ALTER TABLE aumento AUTO_INCREMENT = 1;
DELETE FROM deduccion WHERE id > 0;
ALTER TABLE deduccion AUTO_INCREMENT = 1;
DELETE FROM otropago WHERE id > 0;
ALTER TABLE otropago AUTO_INCREMENT = 1;
DELETE FROM planilla WHERE id > 0;
ALTER TABLE planilla AUTO_INCREMENT = 1;

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

INSERT INTO sccdb.usuario (idtipousuario, idtipocontrato, idPuesto, identificacion, correo, password, nombre, telefono, salario, fechaingreso, vacacion)
VALUES 
(2, 1, 1, '12345678', '123@example.com', '$2b$10$5B748kZtTRzOf5bhSU7I2erX/.LNiAuyn/M9IXPKuj6YTERMbxvTO', '123', '12345678', 160000.00, CURDATE(), 0);

UPDATE usuario SET vacacion = 1 WHERE id > 0;
UPDATE tipoaumento SET valor = NULL WHERE id = 5;


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
  
SELECT 
  JSON_ARRAYAGG(
    JSON_OBJECT(
      'tipoAumentoId', subquery.tipoAumentoId,
      'tipoAumentoDescripcion', subquery.tipoAumentoDescripcion,
      'tipoValorHoras', subquery.tipoValorHoras,
      'totalAumentoMonto', subquery.totalAumentoMonto
    )
  ) AS result
FROM (
  SELECT 
    ta.id AS tipoAumentoId,
    ta.descripcion AS tipoAumentoDescripcion,
    ta.valorHoras AS tipoValorHoras,
    SUM(a.monto) AS totalAumentoMonto
  FROM aumento a
  INNER JOIN tipoaumento ta ON ta.id = a.idTipoAumento 
  WHERE a.idPlanilla = 9 
  GROUP BY ta.id, ta.descripcion, ta.valorHoras
) AS subquery;