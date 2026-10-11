-- ===================================================================
-- Crénelio — Migration Item 1 : Frais de déplacement hybrides
-- Applique sur une base existante ce que `schema.sql` et `seed_init.sql`
-- créent désormais nativement. Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-10-11_item1_travel_fees.sql
-- ===================================================================

SET NAMES utf8mb4;

-- -------------------------------------------------------------------
-- Helper : ajoute une colonne uniquement si elle est absente
-- (MySQL 8 ne supporte pas ALTER TABLE ... ADD COLUMN IF NOT EXISTS)
-- -------------------------------------------------------------------
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

-- 1. Prestations : mode de facturation du déplacement
CALL `crenelio_add_column`('services', 'travel_fee_mode',
    "ENUM('none', 'fixed', 'distance_tiers') NOT NULL DEFAULT 'none' AFTER `price`");
CALL `crenelio_add_column`('services', 'travel_fee_amount',
    'DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `travel_fee_mode`');

-- 2. Rendez-vous : frais figés au moment de la réservation
CALL `crenelio_add_column`('appointments', 'travel_fee',
    'DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER `city`');
CALL `crenelio_add_column`('appointments', 'distance_km',
    'DECIMAL(6,2) NULL AFTER `travel_fee`');
CALL `crenelio_add_column`('appointments', 'is_out_of_zone',
    'BOOLEAN NOT NULL DEFAULT FALSE AFTER `distance_km`');

DROP PROCEDURE IF EXISTS `crenelio_add_column`;

-- 3. Paliers kilométriques globaux (laisse intactes les valeurs déjà réglées par le pro)
INSERT IGNORE INTO `config` (`config_key`, `config_value`) VALUES
('travel_tier_1_max_km', '15'),
('travel_tier_1_fee',    '0'),
('travel_tier_2_max_km', '30'),
('travel_tier_2_fee',    '15'),
('travel_tier_3_max_km', '50'),
('travel_tier_3_fee',    '30'),
('travel_max_km',        '50');
