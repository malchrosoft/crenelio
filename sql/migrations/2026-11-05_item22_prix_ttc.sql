-- ===================================================================
-- Crénelio — Migration Item 22, écart 7 : information du public sur les prix
-- Coût d'établissement d'un devis (arrêté du 24 janvier 2017, art. 2) et éléments non compris dans les
-- prix affichés (arrêté du 3 décembre 1987, art. 3). Aucune modification de structure.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-05_item22_prix_ttc.sql
-- ===================================================================

SET NAMES utf8mb4;

INSERT IGNORE INTO `config` (`config_key`, `config_value`) VALUES
('quote_default_price', ''),
('pricing_exclusions',  'Pièces et fournitures non comprises : chiffrées sur devis avant toute intervention.');

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-05_item22_prix_ttc')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
