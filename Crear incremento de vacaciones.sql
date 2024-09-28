SET GLOBAL event_scheduler = ON;

show processlist;

SHOW EVENTS;

SHOW TRIGGERS;

DROP EVENT xd;

-- A los usuarios que sean asalariado, les suma 1 a las vacaciones si ya paso un mes, lo revisa cada día
DELIMITER //
CREATE EVENT IF NOT EXISTS updateVacaciones
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE sccdb.usuario
    SET vacacion = vacacion + 1
    WHERE CAST(vacacion AS UNSIGNED) IS NOT NULL
      AND DAY(fechaIngreso) = DAY(CURDATE())
      AND (
           (MONTH(fechaIngreso) < MONTH(CURDATE())) 
           OR (MONTH(fechaIngreso) >= MONTH(CURDATE()) 
               AND YEAR(fechaIngreso) < YEAR(CURDATE()))
          );
END //
DELIMITER ;  

DELIMITER //
CREATE EVENT IF NOT EXISTS xd
ON SCHEDULE EVERY 1 SECOND
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE sccdb.usuario
    SET vacacion = vacacion + 1
    WHERE CAST(vacacion AS UNSIGNED) IS NOT NULL;
END //
DELIMITER ;           
           
       