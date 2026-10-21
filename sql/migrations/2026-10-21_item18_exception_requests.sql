-- ===================================================================
-- Crénelio — Migration Item 18 : demandes d'intervention exceptionnelles
-- Rendez-vous « pending » validé ou refusé par l'artisan via un lien à jeton.
-- Applique sur une base existante ce que `schema.sql` crée désormais
-- nativement. Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-10-21_item18_exception_requests.sql
-- ===================================================================

SET NAMES utf8mb4;

-- Jeton du lien « Accepter / refuser » envoyé à l'artisan (NULL une fois la décision prise)
SET @has_column := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'appointments' AND COLUMN_NAME = 'decision_token'
);
SET @sql := IF(@has_column = 0,
    'ALTER TABLE `appointments` ADD COLUMN `decision_token` VARCHAR(64) NULL UNIQUE AFTER `cancel_token`',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Nouveaux types d'emails journalisés (redéfinition complète, sans effet si déjà appliquée)
ALTER TABLE `appointment_notifications`
    MODIFY `type` ENUM(
        'client_confirmation', 'pro_confirmation',
        'exception_client_ack', 'exception_pro_request', 'exception_client_refused'
    ) NOT NULL;
