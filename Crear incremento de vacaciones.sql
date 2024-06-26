SET GLOBAL event_scheduler = ON;

show processlist;

CREATE EVENT IF NOT EXISTS updateVacaciones
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
UPDATE sccdb.usuario
SET CantVacacion = CantVacacion + 1
WHERE IdTipoContrato = 1
  AND DAY(FechaIngreso) = DAY(CURDATE())
  AND (MONTH(FechaIngreso) < MONTH(CURDATE()) 
       OR (MONTH(FechaIngreso) >= MONTH(CURDATE()) 
           AND YEAR(FechaIngreso) < YEAR(CURDATE())));