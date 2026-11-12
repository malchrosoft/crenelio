-- ===================================================================
-- Crénelio — Migration Item 22 : devis annulé par le professionnel (12/11/2026)
-- Statut `cancelled` : devis envoyé que le professionnel annule avant toute réponse du client
-- (rétractation de l'offre, C. civ. 1115 et 1116) ; date et motif ; email au client (`cancellation_client`).
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-12_item22_devis_annule.sql
-- ===================================================================

SET NAMES utf8mb4;

ALTER TABLE `quotes`
    MODIFY `status` ENUM('draft', 'sent', 'accepted', 'refused', 'expired', 'withdrawn', 'cancelled') NOT NULL DEFAULT 'draft';

SET @has_col := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quotes' AND COLUMN_NAME = 'cancelled_at');
SET @sql := IF(@has_col = 0,
    'ALTER TABLE `quotes` ADD COLUMN `cancelled_at` DATETIME NULL AFTER `refusal_reason`, ADD COLUMN `cancel_reason` VARCHAR(255) NULL AFTER `cancelled_at`',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `quote_notifications`
    MODIFY `type` ENUM('quote_client', 'decision_client', 'decision_pro', 'withdrawal_client', 'withdrawal_pro', 'cancellation_client') NOT NULL;

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-12_item22_devis_annule')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
