-- ===================================================================
-- Crénelio — Migration Item 22 : exécution, paiement et décompte du temps sur les devis (écarts 1 à 3)
-- Colonnes `execution_terms`, `payment_terms`, `time_counting` ; réglages par défaut et n° de TVA.
-- Applique sur une base existante ce que `schema.sql` crée désormais nativement.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-04b_item22_execution_paiement.sql
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

CALL `crenelio_add_column`('quotes', 'execution_terms', 'VARCHAR(255) NULL AFTER `urgent`');
CALL `crenelio_add_column`('quotes', 'payment_terms', 'VARCHAR(500) NULL AFTER `execution_terms`');
CALL `crenelio_add_column`('quotes', 'time_counting', 'VARCHAR(255) NULL AFTER `payment_terms`');
CALL `crenelio_add_column`('quotes', 'builder_works', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER `time_counting`');

DROP PROCEDURE IF EXISTS `crenelio_add_column`;

INSERT IGNORE INTO `config` (`config_key`, `config_value`) VALUES
('quote_payment_terms',   'Paiement à réception de la facture, par virement, chèque ou espèces.'),
('quote_time_counting',   ''),
('legal_vat_number',      ''),
-- Traitement des réclamations (C. consom. R111-1, 2°)
('legal_complaints',      'Toute réclamation peut être adressée par email ou par courrier aux coordonnées de l''entreprise indiquées ci-dessus.'),
('quote_builder_guarantees', '0'),
('insurance_attestation_until', '');

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-04b_item22_execution_paiement')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
