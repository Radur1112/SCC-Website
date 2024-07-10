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
           
           
           
       
       
PONER OTRO DE AFTER DELETE SI NECESARIO
           
DELIMITER //
CREATE TRIGGER update_usuario_modulo_progreso_insert
AFTER INSERT ON usuarioVideo
FOR EACH ROW
BEGIN
    DECLARE total_videos INT;
    DECLARE total_progreso FLOAT;
    DECLARE avg_progreso FLOAT;
    DECLARE done INT DEFAULT 0;
    DECLARE moduloId INT;

    DECLARE cur CURSOR FOR 
        SELECT um.idModulo
        FROM usuariomodulo um 
        INNER JOIN modulovideo mv ON um.idModulo = mv.idModulo
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE um.idUsuario = NEW.idUsuario
          AND mv.idVideo = NEW.idVideo;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO moduloId;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*) , SUM(uv.progreso) INTO total_videos, total_progreso
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo
        WHERE idModulo = moduloId;

        IF total_videos > 0 THEN
            SET avg_progreso = total_progreso / total_videos;
        ELSE
            SET avg_progreso = 0;
        END IF;

        UPDATE usuariomodulo
        SET progreso = avg_progreso
        WHERE idUsuario = NEW.idUsuario
          AND idModulo = moduloId;
    END LOOP;
    CLOSE cur;
END //
DELIMITER ;
           
DELIMITER //
CREATE TRIGGER update_usuario_modulo_progreso_update
AFTER UPDATE ON usuarioVideo
FOR EACH ROW
BEGIN
    DECLARE total_videos INT;
    DECLARE total_progreso FLOAT;
    DECLARE avg_progreso FLOAT;
    DECLARE done INT DEFAULT 0;
    DECLARE moduloId INT;

    DECLARE cur CURSOR FOR 
        SELECT um.idModulo
        FROM usuariomodulo um 
        INNER JOIN modulovideo mv ON um.idModulo = mv.idModulo
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE um.idUsuario = NEW.idUsuario
          AND mv.idVideo = NEW.idVideo;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO moduloId;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*) , SUM(uv.progreso) INTO total_videos, total_progreso
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo
        WHERE idModulo = moduloId;

        IF total_videos > 0 THEN
            SET avg_progreso = total_progreso / total_videos;
        ELSE
            SET avg_progreso = 0;
        END IF;

        UPDATE usuariomodulo
        SET progreso = avg_progreso
        WHERE idUsuario = NEW.idUsuario
          AND idModulo = moduloId;
    END LOOP;
    CLOSE cur;
END //
DELIMITER ;
           
DELIMITER //
CREATE TRIGGER update_usuario_modulo_progreso_delete
AFTER DELETE ON usuarioVideo
FOR EACH ROW
BEGIN
    DECLARE total_videos INT;
    DECLARE total_progreso FLOAT;
    DECLARE avg_progreso FLOAT;
    DECLARE done INT DEFAULT 0;
    DECLARE moduloId INT;

    DECLARE cur CURSOR FOR 
        SELECT um.idModulo
        FROM usuariomodulo um 
        INNER JOIN modulovideo mv ON um.idModulo = mv.idModulo
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        WHERE um.idUsuario = OLD.idUsuario
          AND mv.idVideo = OLD.idVideo;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO moduloId;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*) , SUM(uv.progreso) INTO total_videos, total_progreso
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo
        WHERE idModulo = moduloId;

        IF total_videos > 0 THEN
            SET avg_progreso = total_progreso / total_videos;
        ELSE
            SET avg_progreso = 0;
        END IF;

        UPDATE usuariomodulo
        SET progreso = avg_progreso
        WHERE idUsuario = OLD.idUsuario
          AND idModulo = moduloId;
    END LOOP;
    CLOSE cur;
END //
DELIMITER ;




DROP TRIGGER update_usuario_modulo_progreso_insert_modulo_video
DROP TRIGGER update_usuario_modulo_progreso_update_modulo_video
DROP TRIGGER update_usuario_modulo_progreso_delete_modulo_video

DELIMITER //

CREATE TRIGGER update_usuario_modulo_progreso_insert_modulo_video
AFTER INSERT ON moduloVideo
FOR EACH ROW
BEGIN
    DECLARE total_videos INT;
    DECLARE total_progreso FLOAT;
    DECLARE avg_progreso FLOAT;
    DECLARE done INT DEFAULT 0;
    DECLARE umId INT;

    DECLARE cur CURSOR FOR 
        SELECT DISTINCT um.id
        FROM usuariomodulo um
        WHERE um.idModulo = NEW.idModulo;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO umId;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*), SUM(uv.progreso) INTO total_videos, total_progreso
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo
        WHERE idModulo = NEW.idModulo;

        IF total_videos > 0 THEN
            SET avg_progreso = total_progreso / total_videos;
        ELSE
            SET avg_progreso = 0;
        END IF;

        UPDATE usuariomodulo
        SET progreso = avg_progreso
        WHERE id = umId;
    END LOOP;
    CLOSE cur;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER update_usuario_modulo_progreso_update_modulo_video
AFTER UPDATE ON moduloVideo
FOR EACH ROW
BEGIN
    DECLARE total_videos INT;
    DECLARE total_progreso FLOAT;
    DECLARE avg_progreso FLOAT;
    DECLARE done INT DEFAULT 0;
    DECLARE umId INT;

    DECLARE cur CURSOR FOR 
        SELECT DISTINCT um.id
        FROM usuariomodulo um
        WHERE um.idModulo = NEW.idModulo;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO umId;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*), SUM(uv.progreso) INTO total_videos, total_progreso
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo
        WHERE idModulo = NEW.idModulo;

        IF total_videos > 0 THEN
            SET avg_progreso = total_progreso / total_videos;
        ELSE
            SET avg_progreso = 0;
        END IF;

        UPDATE usuariomodulo
        SET progreso = avg_progreso
        WHERE id = umId;
    END LOOP;
    CLOSE cur;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER update_usuario_modulo_progreso_delete_modulo_video
AFTER DELETE ON moduloVideo
FOR EACH ROW
BEGIN
    DECLARE total_videos INT;
    DECLARE total_progreso FLOAT;
    DECLARE avg_progreso FLOAT;
    DECLARE done INT DEFAULT 0;
    DECLARE umId INT;

    DECLARE cur CURSOR FOR 
        SELECT DISTINCT um.id
        FROM usuariomodulo um
        WHERE um.idModulo = OLD.idModulo;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO umId;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT COUNT(*), SUM(uv.progreso) INTO total_videos, total_progreso
        FROM modulovideo mv
        INNER JOIN video v ON mv.idVideo = v.id AND v.estado != 0
        LEFT JOIN usuariovideo uv ON mv.idVideo = uv.idVideo
        WHERE idModulo = OLD.idModulo;

        IF total_videos > 0 THEN
            SET avg_progreso = total_progreso / total_videos;
        ELSE
            SET avg_progreso = 0;
        END IF;

        UPDATE usuariomodulo
        SET progreso = avg_progreso
        WHERE id = umId;
    END LOOP;
    CLOSE cur;
END //

DELIMITER ;