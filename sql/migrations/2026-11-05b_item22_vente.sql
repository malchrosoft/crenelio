-- ===================================================================
-- Crénelio — Migration Item 22, écart 11 : devis assimilé à une vente (C. consom. L221-1, II)
-- `sale` : le devis comporte une fourniture revendue (transfert de propriété d'un bien) ;
-- `goods_received_at` : prise de possession du bien par le client, point de départ du délai de
-- rétractation d'un contrat de vente (L221-18, 2°). Ajout au devis existant des lignes « supply ».
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-05b_item22_vente.sql
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

CALL `crenelio_add_column`('quotes', 'sale', 'BOOLEAN NOT NULL DEFAULT FALSE AFTER `builder_works`');
CALL `crenelio_add_column`('quotes', 'goods_received_at', 'DATE NULL AFTER `withdrawal_until`');

DROP PROCEDURE IF EXISTS `crenelio_add_column`;

UPDATE `quotes` q SET q.sale = TRUE
WHERE EXISTS (SELECT 1 FROM `quote_lines` l WHERE l.quote_id = q.id AND l.kind = 'supply');

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-05b_item22_vente')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
