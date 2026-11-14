-- ===================================================================
-- Crénelio — Migration Item 22 : figement du contrat (14/11/2026)
-- `frozen_config` : mentions de l'entreprise copiées à l'envoi du devis ; `contract_hash` : empreinte SHA-256
-- du contrat calculée à l'acceptation (intégrité de l'écrit électronique, C. civ. 1366 ; conservation de
-- l'écrit qui constate le contrat, C. consom. L213-1). Les devis envoyés ou acceptés avant cette migration ne
-- sont pas figés (aucune copie fidèle de leurs mentions d'origine n'existe).
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-14b_item22_figement_contrat.sql
-- ===================================================================

SET NAMES utf8mb4;

SET @has_col := (SELECT COUNT(*) FROM information_schema.COLUMNS
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'quotes' AND COLUMN_NAME = 'frozen_config');
SET @sql := IF(@has_col = 0,
    'ALTER TABLE `quotes` ADD COLUMN `frozen_config` TEXT NULL AFTER `cancel_reason`, ADD COLUMN `contract_hash` CHAR(64) NULL AFTER `frozen_config`',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-14b_item22_figement_contrat')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
