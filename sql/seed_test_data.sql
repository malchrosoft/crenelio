-- ===================================================================
-- Crénelio : Données DML de test et de démonstration
-- Prestations d'exemple, indisponibilités et rendez-vous clients
-- ===================================================================

SET NAMES utf8mb4;

-- 1. Prestations d'exemple pour un artisan à domicile
INSERT INTO `services` (`name`, `description`, `duration_minutes`, `price`, `travel_fee_mode`, `travel_fee_amount`, `is_active`, `display_order`) VALUES
(
    'Diagnostic & Recherche de panne',
    'Déplacement et diagnostic complet de l''installation. Devis gratuit immédiat si réparation complémentaire requise.',
    45,
    59.00,
    'distance_tiers',
    0.00,
    1,
    1
),
(
    'Entretien & Contrôle préventif',
    'Nettoyage, vérification des organes de sécurité, tests de bon fonctionnement et rapport d''intervention.',
    60,
    89.00,
    'distance_tiers',
    0.00,
    1,
    2
),
(
    'Dépannage d''urgence standard',
    'Intervention prioritaire avec réparation immédiate (pièces d''usure courantes incluses).',
    90,
    129.00,
    'fixed',
    20.00,
    1,
    3
),
(
    'Visite technique & Devis projet',
    'Relevé technique sur place pour chiffrage précis de vos futurs travaux ou rénovations.',
    45,
    0.00,
    'none',
    0.00,
    1,
    4
);

-- 2. Indisponibilités & Congés de test (semaine prochaine)
INSERT INTO `unavailabilities` (`title`, `start_datetime`, `end_datetime`) VALUES
('Congés / Formation technique', DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY) + INTERVAL 8 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 4 DAY) + INTERVAL 18 HOUR),
('Révision véhicule d''intervention', DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) + INTERVAL 14 HOUR, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY) + INTERVAL 18 HOUR);

-- 3. Exemples de rendez-vous récents et à venir
INSERT INTO `appointments` (
    `service_id`,
    `client_name`,
    `client_email`,
    `client_phone`,
    `address`,
    `postal_code`,
    `city`,
    `notes`,
    `start_datetime`,
    `end_datetime`,
    `status`,
    `cancel_token`
) VALUES
(
    1,
    'Claire Dubois',
    'claire.dubois@example.com',
    '06 20 30 40 50',
    '14 Avenue Jean Jaurès',
    '92140',
    'Clamart',
    'Fuite sous évier cuisine, code porte 45A12, 2ème étage droite',
    DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 9 HOUR,
    DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY) + INTERVAL 9 HOUR + INTERVAL 45 MINUTE,
    'confirmed',
    'token_test_claire_001'
),
(
    2,
    'Marc Lefevre',
    'marc.lefevre@example.com',
    '07 11 22 33 44',
    '8 Rue de Meudon',
    '92140',
    'Clamart',
    'Entretien annuel chauffe-eau gaz, maison individuelle',
    DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 14 HOUR,
    DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 15 HOUR,
    'confirmed',
    'token_test_marc_002'
),
(
    3,
    'Sophie Martin',
    'sophie.martin@example.com',
    '06 99 88 77 66',
    '25 Rue Pierre et Marie Curie',
    '92140',
    'Clamart',
    'Plus d''eau chaude depuis ce matin',
    DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 10 HOUR,
    DATE_SUB(CURRENT_DATE, INTERVAL 2 DAY) + INTERVAL 11 HOUR + INTERVAL 30 MINUTE,
    'completed',
    'token_test_sophie_003'
);
