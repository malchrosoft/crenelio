<?php
/**
 * Tâche planifiée facultative : recharge la réserve des jours fériés (Holidays). Inutile si aucune tâche
 * cron n'est disponible : l'application la recharge d'elle-même au besoin. Exemple OVHcloud (« Tâches
 * planifiées - Cron ») : commande `www/api/cron/refresh-holidays.php`, une fois par an ou par mois.
 * Ligne de commande uniquement.
 */
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../core/Holidays.php';

$cache = Holidays::refresh();
echo $cache === null ? "Jours fériés : API indisponible, réserve conservée\n" : 'Jours fériés : ' . count($cache['dates']) . " dates enregistrées\n";
exit($cache === null ? 1 : 0);
