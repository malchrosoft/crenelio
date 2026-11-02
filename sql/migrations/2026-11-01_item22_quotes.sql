-- ===================================================================
-- Crénelio — Migration Item 22 : devis en ligne
-- Tables `quotes` et `quote_lines`, réglages des devis (TVA, validité, numérotation).
-- Applique sur une base existante ce que `schema.sql` crée désormais nativement.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-01_item22_quotes.sql
-- ===================================================================

SET NAMES utf8mb4;

-- -------------------------------------------------------------------
-- 7. Devis (Item 22) : un devis par proposition, rattaché ou non à un rendez-vous
-- Client figé à la création (le devis reste lisible si le rendez-vous change) ; effacé avec lui (RGPD).
-- -------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `quotes` (
    `id`              INT AUTO_INCREMENT PRIMARY KEY,
    -- Numéro attribué à l'envoi (D-2026-0001) : jamais de numéro pour un brouillon
    `number`          VARCHAR(30)     NULL UNIQUE,
    `appointment_id`  INT             NULL,
    `client_name`     VARCHAR(255)    NOT NULL,
    `client_email`    VARCHAR(255)    NOT NULL DEFAULT '',
    `client_phone`    VARCHAR(50)     NOT NULL DEFAULT '',
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
    -- Demande expresse du client de commencer avant la fin du délai de rétractation (L221-25)
    `early_execution` BOOLEAN         NOT NULL DEFAULT FALSE,
    `withdrawal_until` DATE           NULL,
    -- Déclaration de rétractation en ligne (« Renoncer au contrat ici ») : nom, email de l'accusé, date, IP
    `withdrawn_at`     DATETIME       NULL,
    `withdrawal_name`  VARCHAR(255)   NULL,
    `withdrawal_email` VARCHAR(255)   NULL,
    `withdrawal_ip`    VARCHAR(45)    NULL,
    `refusal_reason`  TEXT            NULL,
    `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_quotes_status` (`status`),
    CONSTRAINT `fk_quote_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Lignes : main-d'œuvre, forfait, déplacement, pièce achetée au nom du client (débours, hors
-- chiffre d'affaires) ou fourniture revendue (achat-revente, désactivée par défaut)
CREATE TABLE IF NOT EXISTS `quote_lines` (
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
    INDEX `idx_quote_lines_quote` (`quote_id`, `position`),
    CONSTRAINT `fk_quote_line_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Journal des emails d'un devis (envoi, réponses, rétractation), comme appointment_notifications
CREATE TABLE IF NOT EXISTS `quote_notifications` (
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

-- Devis (Item 22) : valeurs susceptibles d'évoluer avec la réglementation, réglables dans l'Espace Artisan
INSERT IGNORE INTO `config` (`config_key`, `config_value`) VALUES
('quote_vat_mode',        'franchise'),
('quote_vat_rates',       '20,10,5.5'),
('quote_vat_exemption',   'TVA non applicable, art. 293 B du CGI'),
('quote_validity_days',   '30'),
('quote_number_prefix',   'D'),
('quote_labour_rate',     ''),
('quote_allow_supply',    '0'),
-- Facturation (volet B) : 'external' (logiciel de l'artisan, fiche et exports) ou 'none'
('invoicing_mode',        'external'),
-- Mentions de l'entreprise : forme juridique (« EI » accolé au nom d'un entrepreneur individuel,
-- C. com. R526-27 ; forme et capital d'une société), répertoire des métiers, médiateur (C. consom. L616-1)
('legal_form',            'ei'),
('legal_ei_mention',      'EI'),
('legal_capital',         ''),
('legal_rm',              ''),
('legal_mediator',        '');

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-01_item22_quotes')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
