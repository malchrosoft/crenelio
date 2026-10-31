-- ===================================================================
-- Crénelio — Migration Item 32 : fiabilité des notifications
-- Nouveaux types d'emails journalisés : annulation et reprogrammation, pour le client et pour
-- l'artisan (mise à jour de son agenda).
-- Applique sur une base existante ce que `schema.sql` crée désormais nativement.
-- Idempotent : réexécutable sans effet de bord (MODIFY redéfinit la liste complète).
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-10-31_item32_notification_types.sql
-- ===================================================================

SET NAMES utf8mb4;

ALTER TABLE `appointment_notifications`
    MODIFY `type` ENUM(
        'client_confirmation', 'pro_confirmation',
        'exception_client_ack', 'exception_pro_request', 'exception_client_refused',
        'cancellation_client', 'cancellation_pro', 'reschedule_client', 'reschedule_pro'
    ) NOT NULL;

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-10-31_item32_notification_types')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
