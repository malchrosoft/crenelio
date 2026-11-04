-- ===================================================================
-- Crénelio — Migration Item 22 : alignement sur les textes officiels (04/11/2026)
-- Mention de franchise reprise mot pour mot de l'article 293 E du CGI (« article », pas « art. »),
-- si l'artisan avait gardé la valeur par défaut précédente. Aucune modification de structure.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-04_item22_textes_officiels.sql
-- ===================================================================

SET NAMES utf8mb4;

UPDATE `config` SET `config_value` = 'TVA non applicable, article 293 B du CGI'
WHERE `config_key` = 'quote_vat_exemption' AND `config_value` = 'TVA non applicable, art. 293 B du CGI';

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-04_item22_textes_officiels')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
