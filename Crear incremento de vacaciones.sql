UPDATE usuario SET siguienteVacacion = '2024-10-14' WHERE id = 47;
UPDATE usuario SET siguienteVacacion = '2024-10-28' WHERE id = 81;
UPDATE usuario SET siguienteVacacion = '2024-10-02' WHERE id = 95;
UPDATE usuario SET siguienteVacacion = '2024-11-01' WHERE id = 91;
UPDATE usuario SET siguienteVacacion = '2024-10-02' WHERE id = 80;
UPDATE usuario SET siguienteVacacion = '2024-10-02' WHERE id = 84;
UPDATE usuario SET siguienteVacacion = '2024-10-13' WHERE id = 20;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 3;
UPDATE usuario SET siguienteVacacion = '2024-11-01' WHERE id = 29;
UPDATE usuario SET siguienteVacacion = '2024-10-22' WHERE id = 79;
UPDATE usuario SET siguienteVacacion = '2024-10-17' WHERE id = 6;
UPDATE usuario SET siguienteVacacion = '2024-10-19' WHERE id = 94;
UPDATE usuario SET siguienteVacacion = '2024-10-19' WHERE id = 96;
UPDATE usuario SET siguienteVacacion = '2024-10-20' WHERE id = 27;
UPDATE usuario SET siguienteVacacion = '2024-10-02' WHERE id = 97;
UPDATE usuario SET siguienteVacacion = '2024-10-07' WHERE id = 30;
UPDATE usuario SET siguienteVacacion = '2024-10-14' WHERE id = 92;
UPDATE usuario SET siguienteVacacion = '2024-10-18' WHERE id = 93;
UPDATE usuario SET siguienteVacacion = '2024-10-04' WHERE id = 14;
UPDATE usuario SET siguienteVacacion = '2024-10-03' WHERE id = 16;
UPDATE usuario SET siguienteVacacion = '2024-10-02' WHERE id = 85;
UPDATE usuario SET siguienteVacacion = '2024-10-04' WHERE id = 87;
UPDATE usuario SET siguienteVacacion = '2024-10-04' WHERE id = 88;
UPDATE usuario SET siguienteVacacion = '2024-10-06' WHERE id = 23;
UPDATE usuario SET siguienteVacacion = '2024-10-29' WHERE id = 1;
UPDATE usuario SET siguienteVacacion = '2024-10-02' WHERE id = 82;
UPDATE usuario SET siguienteVacacion = '2024-10-09' WHERE id = 21;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 31;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 32;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 35;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 51;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 53;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 54;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 56;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 57;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 58;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 59;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 60;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 63;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 64;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 65;
UPDATE usuario SET siguienteVacacion = '2024-10-16' WHERE id = 66;
UPDATE usuario SET siguienteVacacion = '2024-10-04' WHERE id = 86;
UPDATE usuario SET siguienteVacacion = '2024-10-05' WHERE id = 2;
UPDATE usuario SET siguienteVacacion = '2024-10-05' WHERE id = 13;
UPDATE usuario SET siguienteVacacion = '2024-10-05' WHERE id = 15;
UPDATE usuario SET siguienteVacacion = '2024-10-05' WHERE id = 44;
UPDATE usuario SET siguienteVacacion = '2024-10-05' WHERE id = 78;
UPDATE usuario SET siguienteVacacion = '2024-10-05' WHERE id = 83;
UPDATE usuario SET siguienteVacacion = '2024-09-30' WHERE id = 98;
UPDATE usuario SET siguienteVacacion = '2024-09-30' WHERE id = 99;
UPDATE usuario SET siguienteVacacion = '2024-09-30' WHERE id = 100;
UPDATE usuario SET siguienteVacacion = '2024-09-30' WHERE id = 101;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 103;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 104;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 105;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 106;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 107;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 108;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 109;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 110;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 111;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 112;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 114;
UPDATE usuario SET siguienteVacacion = '2024-10-11' WHERE id = 116;
UPDATE usuario SET siguienteVacacion = '2024-10-12' WHERE id = 117;
UPDATE usuario SET siguienteVacacion = '2024-10-13' WHERE id = 118;
UPDATE usuario SET siguienteVacacion = '2024-10-30' WHERE id = 122;
UPDATE usuario SET siguienteVacacion = '2024-10-30' WHERE id = 123;



SET GLOBAL event_scheduler = ON;

show processlist;

SHOW EVENTS;

SHOW TRIGGERS;

DROP TRIGGER set_vacacion_fecha;
DROP EVENT updateVacaciones;

-- A los usuarios que sean asalariado, les suma 1 a las vacaciones si ya paso un mes, lo revisa cada día
DELIMITER //
CREATE EVENT IF NOT EXISTS updateVacaciones
ON SCHEDULE EVERY 5 second
STARTS '2024-10-16 00:00:00'
DO
BEGIN
    DECLARE today DATE;
    DECLARE new_siguienteVacacion DATE;
    SET today = CURDATE();

    UPDATE sccdb.usuario
    SET vacacion = vacacion + 1,
    siguienteVacacion = CASE
        WHEN DAY(fechaIngreso) <= DAY(LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))) THEN 
            DATE_ADD(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH), INTERVAL DAY(fechaIngreso) - DAY(siguienteVacacion) DAY)
        ELSE
            LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))
    END
    WHERE vacacion IS NOT NULL 
      AND estado != 0
      AND (YEAR(today) > YEAR(siguienteVacacion)
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) > MONTH(siguienteVacacion))
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) = MONTH(siguienteVacacion) AND  DAY(today) >= DAY(siguienteVacacion)));


    UPDATE sccdb.usuario
    SET siguienteVacacion = CASE
        WHEN DAY(fechaIngreso) <= DAY(LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))) THEN 
            DATE_ADD(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH), INTERVAL DAY(fechaIngreso) - DAY(siguienteVacacion) DAY)
        ELSE
            LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))
    END
    WHERE vacacion IS NULL 
      AND estado != 0
      AND (YEAR(today) > YEAR(siguienteVacacion)
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) > MONTH(siguienteVacacion))
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) = MONTH(siguienteVacacion) AND  DAY(today) >= DAY(siguienteVacacion)));
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


DELIMITER //
CREATE TRIGGER set_vacacion_fecha
BEFORE INSERT ON usuario
FOR EACH ROW
BEGIN
    DECLARE today DATE;
    DECLARE dia INT;
    DECLARE mes INT;
    DECLARE annio INT;
    DECLARE last_day_of_month INT;

    SET today = CURDATE();
    SET dia = DAY(NEW.fechaIngreso);

     IF (YEAR(today) < YEAR(NEW.fechaIngreso)) THEN
		SET annio = YEAR(NEW.fechaIngreso);
		SET mes = MONTH(NEW.fechaIngreso);
     ELSE   
		SET annio = YEAR(today);
		IF (MONTH(today) > MONTH(NEW.fechaIngreso)) THEN
			SET mes = MONTH(today);
		ELSE   
			SET mes = MONTH(NEW.fechaIngreso);
		END IF;
		
		IF (DAY(today) >= DAY(NEW.fechaIngreso)) THEN
			SET mes = mes + 1;
		END IF;
    END IF;
    
	IF (mes = 13) THEN
		SET mes = 1;
		SET annio = annio + 1;
	END IF;
    
    
    SET last_day_of_month = DAY(LAST_DAY(CONCAT(annio, '-', LPAD(mes, 2, '0'), '-01')));
    IF dia > last_day_of_month THEN
        SET dia = last_day_of_month;
    END IF;
    
    SET NEW.siguienteVacacion = STR_TO_DATE(CONCAT(annio, '-', LPAD(mes, 2, '0'), '-', LPAD(dia, 2, '0')), '%Y-%m-%d');
END; //
DELIMITER ;  











DELIMITER //
BEGIN
    DECLARE today DATE;
    DECLARE new_siguienteVacacion DATE;
    SET today = CURDATE();

    UPDATE sccdb.usuario
    SET vacacion = vacacion + 1,
    siguienteVacacion = CASE
        WHEN DAY(fechaIngreso) <= DAY(LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))) THEN 
            DATE_ADD(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH), INTERVAL DAY(fechaIngreso) - DAY(siguienteVacacion) DAY)
        ELSE
            LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))
    END
    WHERE vacacion IS NOT NULL 
      AND estado != 0
      AND (YEAR(today) > YEAR(siguienteVacacion)
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) > MONTH(siguienteVacacion))
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) = MONTH(siguienteVacacion) AND  DAY(today) >= DAY(siguienteVacacion)));


    UPDATE sccdb.usuario
    SET siguienteVacacion = CASE
        WHEN DAY(fechaIngreso) <= DAY(LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))) THEN 
            DATE_ADD(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH), INTERVAL DAY(fechaIngreso) - DAY(siguienteVacacion) DAY)
        ELSE
            LAST_DAY(DATE_ADD(siguienteVacacion, INTERVAL 1 MONTH))
    END
    WHERE vacacion IS NULL 
      AND estado != 0
      AND (YEAR(today) > YEAR(siguienteVacacion)
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) > MONTH(siguienteVacacion))
      OR (YEAR(today) = YEAR(siguienteVacacion) AND MONTH(today) = MONTH(siguienteVacacion) AND  DAY(today) >= DAY(siguienteVacacion)));
END; //
DELIMITER ;  
       