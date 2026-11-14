-- ===================================================================
-- Crénelio — Migration RGPD : libellé des données effacées (14/11/2026)
-- Fin de conservation = suppression (Appointment::erase, purgeOlderThan, purgeQuotes) ; seuls restent les
-- rendez-vous réduits d'un contrat conservé. Leur nom « Client anonymisé » devient « Client (données
-- effacées) » : la ligne garde sa date, elle n'est pas anonyme (docs/legal/fr/conservation-effacement.md).
-- Idempotent : réexécutable sans effet de bord.
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-14_rgpd_donnees_effacees.sql
-- ===================================================================

SET NAMES utf8mb4;

UPDATE `appointments` SET `client_name` = 'Client (données effacées)' WHERE `client_name` = 'Client anonymisé';
UPDATE `quotes` SET `client_name` = 'Client (données effacées)' WHERE `client_name` = 'Client anonymisé';
UPDATE `appointment_notifications` SET `subject` = '(données effacées)' WHERE `subject` IN ('(données anonymisées)', '(données réduites)');
UPDATE `quote_notifications` SET `subject` = '(données effacées)' WHERE `subject` = '(données anonymisées)';

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-14_rgpd_donnees_effacees')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
