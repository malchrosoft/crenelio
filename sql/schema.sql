-- ===================================================================
-- Crénelio : Schéma de Base de Données MySQL (InnoDB / UTF-8 mb4)
-- Application mono-artisan / auto-hébergée de prise de rendez-vous
-- Compatible hébergement partagé OVHcloud et serveurs dédiés
-- ===================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

DROP TABLE IF EXISTS `quote_notifications`;
DROP TABLE IF EXISTS `quote_lines`;
DROP TABLE IF EXISTS `quotes`;
DROP TABLE IF EXISTS `appointment_notifications`;
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
    -- Mode de facturation du déplacement propre à la prestation :
    --   none           : déplacement inclus / prestation sans déplacement
    --   fixed          : forfait fixe porté par `travel_fee_amount`
    --   distance_tiers : paliers kilométriques globaux de la table `config`
    `travel_fee_mode`   ENUM('none', 'fixed', 'distance_tiers') NOT NULL DEFAULT 'none',
    `travel_fee_amount` DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
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
    -- Frais de déplacement figés au moment de la réservation (traçabilité tarifaire)
    -- Position du lieu d'intervention (calculée à la réservation ; carte, tournées)
    `latitude`            DECIMAL(9,6)    NULL,
    `longitude`           DECIMAL(9,6)    NULL,
    `travel_fee`          DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `distance_km`         DECIMAL(6,2)    NULL,
    `is_out_of_zone`      BOOLEAN         NOT NULL DEFAULT FALSE,
    `notes`               TEXT            NULL,
    `start_datetime`      DATETIME        NOT NULL,
    `end_datetime`        DATETIME        NOT NULL,
    `status`              ENUM('pending', 'confirmed', 'completed', 'cancelled') NOT NULL DEFAULT 'confirmed',
    `cancel_token`        VARCHAR(64)     NOT NULL UNIQUE,
    -- Demande exceptionnelle : jeton du lien « Accepter / refuser » de l'artisan (NULL une fois décidé)
    `decision_token`      VARCHAR(64)     NULL UNIQUE,
    `cancellation_reason` TEXT            NULL,
    `created_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_appointment_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_appointments_dates` ON `appointments` (`start_datetime`, `end_datetime`);
CREATE INDEX `idx_appointments_status` ON `appointments` (`status`);

-- -------------------------------------------------------------------
-- 6. Journal des notifications email rattachées aux rendez-vous
-- -------------------------------------------------------------------
CREATE TABLE `appointment_notifications` (
    `id`             INT AUTO_INCREMENT PRIMARY KEY,
    `appointment_id` INT             NOT NULL,
    `type`           ENUM(
        'client_confirmation', 'pro_confirmation',
        'exception_client_ack', 'exception_pro_request', 'exception_client_refused',
        -- Item 32 : annulation et reprogrammation (client, et agenda de l'artisan)
        'cancellation_client', 'cancellation_pro', 'reschedule_client', 'reschedule_pro'
    ) NOT NULL,
    `recipient`      VARCHAR(255)    NOT NULL,
    `subject`        VARCHAR(255)    NOT NULL,
    `status`         ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `error_message`  TEXT            NULL,
    `sent_at`        DATETIME        NULL,
    `created_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_notification_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_notifications_appointment` ON `appointment_notifications` (`appointment_id`, `created_at`);

-- -------------------------------------------------------------------
-- 7. Devis (Item 22) : un devis par proposition, rattaché ou non à un rendez-vous
-- Client figé à la création (le devis reste lisible si le rendez-vous change) ; effacé avec lui (RGPD).
-- -------------------------------------------------------------------
CREATE TABLE `quotes` (
    `id`              INT AUTO_INCREMENT PRIMARY KEY,
    -- Numéro attribué à l'envoi (D-2026-0001) : jamais de numéro pour un brouillon
    `number`          VARCHAR(30)     NULL UNIQUE,
    `appointment_id`  INT             NULL,
    `client_name`     VARCHAR(255)    NOT NULL,
    `client_email`    VARCHAR(255)    NOT NULL DEFAULT '',
    `client_phone`    VARCHAR(50)     NOT NULL DEFAULT '',
    -- Client professionnel : raison sociale et numéro d'identification (SIREN ou SIRET), mention des factures
    -- (CGI, annexe II, art. 242 nonies A, 1°)
    `client_company`  VARCHAR(255)    NULL,
    `client_siren`    VARCHAR(20)     NULL,
    `address`         TEXT            NOT NULL,
    `postal_code`     VARCHAR(20)     NOT NULL DEFAULT '',
    `city`            VARCHAR(100)    NOT NULL DEFAULT '',
    `title`           VARCHAR(255)    NOT NULL DEFAULT '',
    `notes`           TEXT            NULL,
    -- withdrawn : rétractation du client (fonction de rétractation en ligne, C. consom. L221-18 et suivants)
    `status`          ENUM('draft', 'sent', 'accepted', 'refused', 'expired', 'withdrawn') NOT NULL DEFAULT 'draft',
    -- Régime de TVA figé à la création : 'franchise' (art. 293 B du CGI) ou 'vat'
    `vat_mode`        ENUM('franchise', 'vat') NOT NULL DEFAULT 'franchise',
    `validity_days`   SMALLINT        NOT NULL DEFAULT 30,
    -- NULL : devis gratuit ; sinon prix du devis (arrêté du 24 janvier 2017, art. 4)
    `quote_price`     DECIMAL(10,2)   NULL,
    -- Totaux recalculés à chaque enregistrement : total_ttc = prestations seules ; débours à part (mandat
    -- séparé, hors chiffre d'affaires et hors TVA)
    `total_ht`        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `total_vat`       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `total_debours`   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `total_ttc`       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `token`           VARCHAR(64)     NULL UNIQUE,
    `sent_at`         DATETIME        NULL,
    `valid_until`     DATE            NULL,
    -- Réponse du client (preuve) : date, IP, choix sur les pièces remplacées, mandat de débours
    `decided_at`      DATETIME        NULL,
    `decision_ip`     VARCHAR(45)     NULL,
    -- Pièces remplacées (arrêté du 24 janvier 2017, annexe 2) : refus de les garder = décharge du client
    `keep_parts`      BOOLEAN         NULL,
    -- Mandat de débours : document distinct du devis, accord séparé du client (achat des pièces en son
    -- nom et pour son compte, dans la limite du budget). NULL : pas de réponse ; 0 : refusé (le client
    -- fournit lui-même les pièces) ; 1 : donné. Date et IP propres à cet accord.
    `debours_budget`     DECIMAL(10,2) NULL,
    `debours_mandate`    BOOLEAN       NULL,
    `mandate_decided_at` DATETIME      NULL,
    `mandate_ip`         VARCHAR(45)   NULL,
    -- Contrat à distance ou hors établissement (C. consom. L221-18) : rétractation de 14 jours, sauf
    -- travaux d'entretien ou de réparation urgents expressément demandés par le client (L221-28 8°)
    `urgent`          BOOLEAN         NOT NULL DEFAULT FALSE,
    -- Date ou délai d'exécution (C. consom. L221-5 3°) et modalités de paiement et d'exécution (R111-1 2°,
    -- R221-2 4°), figés sur le devis ; décompte du temps estimé de la main-d'œuvre (arrêté du 24 janvier
    -- 2017, art. 2)
    `execution_terms` VARCHAR(255)  NULL,
    `payment_terms`   VARCHAR(500)  NULL,
    `time_counting`   VARCHAR(255)  NULL,
    -- Travaux relevant des garanties des constructeurs (C. civ. 1792 et suivants) : garanties imprimées et
    -- attestation d'assurance décennale jointe au devis (C. assur. L243-2)
    `builder_works`   BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Fourniture revendue : contrat assimilé à une vente (C. consom. L221-1, II), délai de rétractation
    -- à compter de la prise de possession du bien (L221-18, 2°)
    `sale`            BOOLEAN       NOT NULL DEFAULT FALSE,
    -- Demande expresse du client de commencer avant la fin du délai de rétractation (L221-25)
    `early_execution` BOOLEAN         NOT NULL DEFAULT FALSE,
    `withdrawal_until` DATE           NULL,
    -- Vente : date de remise du bien au client, saisie par le professionnel ; fixe `withdrawal_until`
    `goods_received_at` DATE          NULL,
    -- Déclaration de rétractation en ligne (« Renoncer au contrat ici ») : nom, email de l'accusé, date, IP
    `withdrawn_at`     DATETIME       NULL,
    `withdrawal_name`  VARCHAR(255)   NULL,
    `withdrawal_email` VARCHAR(255)   NULL,
    `withdrawal_address` VARCHAR(500) NULL,
    `withdrawal_ip`    VARCHAR(45)    NULL,
    `refusal_reason`  TEXT            NULL,
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_quote_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_quotes_status` ON `quotes` (`status`);

-- Lignes : main-d'œuvre, forfait, déplacement, pièce achetée au nom du client (débours, hors
-- chiffre d'affaires) ou fourniture revendue (achat-revente, désactivée par défaut)
CREATE TABLE `quote_lines` (
    `id`          INT AUTO_INCREMENT PRIMARY KEY,
    `quote_id`    INT             NOT NULL,
    `position`    SMALLINT        NOT NULL DEFAULT 0,
    `kind`        ENUM('labour', 'service', 'travel', 'debours', 'supply') NOT NULL,
    `label`       VARCHAR(255)    NOT NULL,
    `quantity`    DECIMAL(10,2)   NOT NULL DEFAULT 1.00,
    `unit`        VARCHAR(20)     NOT NULL DEFAULT 'u',
    -- HT (TTC fournisseur pour un débours, refacturé à l'euro près)
    `unit_price`  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `vat_rate`    DECIMAL(4,2)    NOT NULL DEFAULT 0.00,
    CONSTRAINT `fk_quote_line_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX `idx_quote_lines_quote` ON `quote_lines` (`quote_id`, `position`);

-- Journal des emails d'un devis (envoi, réponses, rétractation), comme appointment_notifications
CREATE TABLE `quote_notifications` (
    `id`            INT AUTO_INCREMENT PRIMARY KEY,
    `quote_id`      INT             NOT NULL,
    `type`          ENUM('quote_client', 'decision_client', 'decision_pro', 'withdrawal_client', 'withdrawal_pro') NOT NULL,
    `recipient`     VARCHAR(255)    NOT NULL,
    `subject`       VARCHAR(255)    NOT NULL,
    `status`        ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
    `error_message` TEXT            NULL,
    `sent_at`       DATETIME        NULL,
    `created_at`    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_quote_notifications_quote` (`quote_id`, `created_at`),
    CONSTRAINT `fk_quote_notification_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
