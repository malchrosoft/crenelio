-- ===================================================================
-- Crénelio : Schéma de Base de Données MySQL (InnoDB / UTF-8 mb4)
-- Application mono-artisan / auto-hébergée de prise de rendez-vous
-- Compatible hébergement partagé OVHcloud et serveurs dédiés
-- ===================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `unavailabilities`;
DROP TABLE IF EXISTS `schedules`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `config`;

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------
-- 1. Configuration de l'artisan (Table clé-valeur)
-- -------------------------------------------------------------------
CREATE TABLE `config` (
    `config_key`   VARCHAR(64)     PRIMARY KEY,
    `config_value` TEXT            NULL,
    `updated_at`   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 2. Prestations proposées
-- -------------------------------------------------------------------
CREATE TABLE `services` (
    `id`               INT AUTO_INCREMENT PRIMARY KEY,
    `name`             VARCHAR(255)    NOT NULL,
    `description`      TEXT            NULL,
    `duration_minutes` INT             NOT NULL DEFAULT 60,
    `price`            DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `is_active`        BOOLEAN         NOT NULL DEFAULT TRUE,
    `display_order`    INT             NOT NULL DEFAULT 0,
    `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 3. Horaires hebdomadaires habituels (1 = Lundi, 7 = Dimanche)
-- -------------------------------------------------------------------
CREATE TABLE `schedules` (
    `id`              INT AUTO_INCREMENT PRIMARY KEY,
    `day_of_week`     TINYINT         NOT NULL UNIQUE, -- 1=Lundi .. 7=Dimanche
    `is_active`       BOOLEAN         NOT NULL DEFAULT TRUE,
    `morning_start`   TIME            NULL, -- ex: '08:30:00'
    `morning_end`     TIME            NULL, -- ex: '12:00:00'
    `afternoon_start` TIME            NULL, -- ex: '13:30:00'
    `afternoon_end`   TIME            NULL, -- ex: '18:00:00'
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 4. Indisponibilités exceptionnelles & Congés
-- -------------------------------------------------------------------
CREATE TABLE `unavailabilities` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `title`          VARCHAR(255)    NOT NULL DEFAULT 'Indisponible',
    `start_datetime` DATETIME        NOT NULL,
    `end_datetime`   DATETIME        NOT NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- 5. Rendez-vous clients
-- -------------------------------------------------------------------
CREATE TABLE `appointments` (
    `id`                  INT AUTO_INCREMENT PRIMARY KEY,
    `service_id`          INT             NOT NULL,
    `client_name`         VARCHAR(255)    NOT NULL,
    `client_email`        VARCHAR(255)    NOT NULL,
    `client_phone`        VARCHAR(50)     NOT NULL,
    `address`             TEXT            NOT NULL,
    `postal_code`         VARCHAR(20)     NOT NULL,
    `city`                VARCHAR(100)    NOT NULL,
    `notes`               TEXT            NULL,
    `start_datetime`      DATETIME        NOT NULL,
    `end_datetime`        DATETIME        NOT NULL,
    `status`              ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    `cancel_token`        VARCHAR(64)     NOT NULL UNIQUE,
    `cancellation_reason` TEXT            NULL,
    `created_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointment_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_appointments_dates` ON `appointments` (`start_datetime`, `end_datetime`);
CREATE INDEX `idx_appointments_status` ON `appointments` (`status`);

