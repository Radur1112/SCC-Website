SET GLOBAL event_scheduler = ON;

show processlist;

SHOW EVENTS;

SHOW TRIGGERS;



-- A los usuarios que sean asalariado, les suma 1 a las vacaciones si ya paso un mes, lo revisa cada día
DELIMITER //
CREATE EVENT IF NOT EXISTS updateVacaciones
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE sccdb.usuario
    SET vacacion = vacacion + 1
    WHERE idTipoContrato = 1
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
ON SCHEDULE EVERY 1 MINUTE
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    UPDATE sccdb.usuario
    SET vacacion = vacacion + 1
    WHERE idTipoContrato = 1;
END //
DELIMITER ;           
           
           
       
       
           
-- Estos 6 triggers son para el progreso de los modulos, se hacen cuando:
-- se crea, actualiza, o borra el progreso de un video de un usuario (recorre los videos de los modulos que tengan ese usuario y ese video y les suma el progreso),
-- se crea, actualiza, o borra un video en un modulo (a cada usuario que tenga ese modulo lo recorre los videos y le suma el progreso total)
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