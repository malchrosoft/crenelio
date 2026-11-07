-- ===================================================================
-- Crénelio — Migration Item 22 : main-d'œuvre au temps passé (07/11/2026)
-- Réglages : main-d'œuvre facturée au temps × taux horaire ou au forfait, arrondi du temps passé
-- (minutes) et minimum facturé ; décompte du temps déduit de ces réglages s'il n'est pas saisi
-- (arrêté du 24 janvier 2017, art. 2 et 3). Aucune modification de structure.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-07_item22_temps_passe.sql
-- ===================================================================

SET NAMES utf8mb4;

INSERT IGNORE INTO `config` (`config_key`, `config_value`) VALUES
('quote_labour_hourly', '1'),
('quote_time_step',     '15'),
('quote_time_minimum',  '');

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-07_item22_temps_passe')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
