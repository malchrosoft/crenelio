-- ===================================================================
-- Crénelio — Migration Item 4 : journal des notifications email
-- Applique sur une base existante ce que `schema.sql` crée désormais
-- nativement. Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-10-11_item4_notifications.sql
-- ===================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `appointment_notifications` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `appointment_id` INT             NOT NULL,
    `type`           ENUM('client_confirmation', 'pro_confirmation') NOT NULL,
    `recipient`      VARCHAR(255)    NOT NULL,
    `subject`        VARCHAR(255)    NOT NULL,
    `status`         ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `error_message`  TEXT            NULL,
    `sent_at`        DATETIME        NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_notifications_appointment` (`appointment_id`, `created_at`),
    CONSTRAINT `fk_notification_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
