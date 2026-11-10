-- ===================================================================
-- Crénelio — Migration Item 22 : lignes de remise sur les devis (10/11/2026)
-- Nouveau type de ligne `discount` : montant déduit des prestations (prix unitaire négatif, HT, au taux
-- de TVA de la ligne), jamais des débours.
-- Idempotent : réexécutable sans effet de bord (MODIFY redonne la même définition).
--
-- Usage :
--   docker compose exec -T db mysql -ucrenelio -p<mdp> crenelio \
--     < sql/migrations/2026-11-10_item22_remise.sql
-- ===================================================================

SET NAMES utf8mb4;

ALTER TABLE `quote_lines`
    MODIFY `kind` ENUM('labour', 'service', 'travel', 'debours', 'supply', 'discount') NOT NULL;

INSERT INTO `config` (`config_key`, `config_value`)
VALUES ('schema_version', '2026-11-10_item22_remise')
ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`);
