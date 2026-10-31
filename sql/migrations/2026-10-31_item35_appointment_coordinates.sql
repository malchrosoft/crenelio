-- ===================================================================
-- Crénelio — Migration Item 35 : coordonnées des rendez-vous
-- Position du lieu d'intervention, déjà calculée à la réservation (frais de déplacement) et
-- désormais conservée : carte du tableau de bord, et plus tard les tournées (Item 37).
-- Donnée personnelle : effacée avec l'adresse (Appointment::anonymizeWhere).
-- Applique sur une base existante ce que `schema.sql` crée désormais nativement.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-10-31_item35_appointment_coordinates.sql
-- ===================================================================

SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS `crenelio_add_column`;
DELIMITER $$
CREATE PROCEDURE `crenelio_add_column`(
    IN p_table      VARCHAR(64),
    IN p_column     VARCHAR(64),
    IN p_definition TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = p_table
          AND COLUMN_NAME  = p_column
    ) THEN
        SET @ddl = CONCAT('ALTER TABLE `', p_table, '` ADD COLUMN `', p_column, '` ', p_definition);
        PREPARE stmt FROM @ddl;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

CALL `crenelio_add_column`('appointments', 'latitude', 'DECIMAL(9,6) NULL AFTER `city`');
CALL `crenelio_add_column`('appointments', 'longitude', 'DECIMAL(9,6) NULL AFTER `latitude`');

DROP PROCEDURE IF EXISTS `crenelio_add_column`;

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-10-31_item35_appointment_coordinates')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
