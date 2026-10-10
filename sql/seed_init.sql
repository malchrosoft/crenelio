-- ===================================================================
-- Crénelio : Initialisation DML minimale obligatoire (Socle applicatif)
-- Clés de configuration de base et horaires d'ouverture standards
-- ===================================================================

SET NAMES utf8mb4;

-- 1. Paramétrage clé-valeur de base
INSERT INTO `config` (`config_key`, `config_value`) VALUES
('company_name',        'Crénelio Dépannage & Services'),
('pro_name',            'Alexandre Martin'),
('pro_email',           'contact@crenelio.local'),
('pro_phone',           '06 12 34 56 78'),
('service_area',        'Clamart et communes limitrophes (rayon 15 km)'),
('slot_step_minutes',   '30'),   -- Graduation des créneaux affichés (30 min)
('buffer_minutes',      '30'),   -- Temps de battement / trajet entre interventions
('min_notice_hours',    '12'),   -- Réservation au moins 12h à l'avance
('max_advance_days',    '30'),   -- Réservation jusqu'à 30 jours à l'avance
('default_latitude',    '48.8000'), -- Clamart par défaut
('default_longitude',   '2.2625'),  -- Clamart par défaut
('default_zoom',        '12'),
('admin_password_hash', '$2y$10$qyk0/fef0o7Ic3vocJBAXOp18E.2J0UaQhC62vS98B9fAlfK7aCQi'), -- 'admin123'
-- Vitrine
('vitrine_tagline',      'Votre artisan de confiance, à domicile'),
('vitrine_about',        'Artisan qualifié et expérimenté, j\'interviens rapidement chez vous pour tous vos travaux. Devis gratuit, travail soigné et garanti.'),
('vitrine_photo_url',    ''),
('vitrine_engagement_1', '🕐 Ponctualité garantie'),
('vitrine_engagement_2', '🛡️ Travail soigné et garanti'),
('vitrine_engagement_3', '📍 Intervention à domicile'),
('vitrine_engagement_4', '💬 Devis gratuit et sans engagement'),
-- Mentions légales
('legal_raison_sociale', ''),
('legal_siret',          ''),
('legal_naf',            ''),
('legal_assurance',      ''),
('legal_adresse',        ''),
('legal_hebergeur',      'OVHcloud, 2 rue Kellermann, 59100 Roubaix – France');

-- 2. Horaires d'ouverture hebdomadaires habituels (1=Lundi .. 7=Dimanche)
INSERT INTO `schedules` (`day_of_week`, `is_active`, `morning_start`, `morning_end`, `afternoon_start`, `afternoon_end`) VALUES
(1, 1, '08:30:00', '12:00:00', '13:30:00', '18:00:00'), -- Lundi
(2, 1, '08:30:00', '12:00:00', '13:30:00', '18:00:00'), -- Mardi
(3, 1, '08:30:00', '12:00:00', '13:30:00', '18:00:00'), -- Mercredi
(4, 1, '08:30:00', '12:00:00', '13:30:00', '18:00:00'), -- Jeudi
(5, 1, '08:30:00', '12:00:00', '13:30:00', '17:30:00'), -- Vendredi
(6, 1, '09:00:00', '12:30:00', NULL, NULL),               -- Samedi matin
(7, 0, NULL, NULL, NULL, NULL);                            -- Dimanche fermé
