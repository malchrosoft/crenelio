-- ===================================================================
-- Crénelio — Migration Item 27 : suivi de la version du schéma
-- Enregistre dans `config.schema_version` le nom de la dernière migration appliquée,
-- lu par `GET /api/health` et `npm run deploy:init` pour lister les migrations à jouer.
-- Toute migration suivante doit se terminer par la même instruction, avec son propre nom.
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-10-29_item27_schema_version.sql
-- ===================================================================

SET NAMES utf8mb4;

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-10-29_item27_schema_version')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
