<?php
/**
 * Holidays — Jours fériés de métropole, pour le calcul des délais (C. proc. civ. 642 : un délai qui expire un
 * jour férié est prorogé au premier jour ouvrable suivant).
 *
 * Source : API Jours fériés de calendrier.api.gouv.fr (`/jours-feries/metropole.json`, toutes les années
 * connues, environ cinq ans d'avance). Mise en réserve dans `api/storage/holidays/metropole.json`, rechargée
 * d'elle-même quand l'année demandée manque ou que la réserve a plus d'un an : aucune tâche planifiée n'est
 * nécessaire (offre Starter). `scripts/refresh-holidays.php` permet de la recharger depuis une tâche cron.
 * En cas d'échec, la réserve existante reste utilisée ; sans réserve, aucun jour férié n'est connu.
 */
class Holidays
{
    private const URL = 'https://calendrier.api.gouv.fr/jours-feries/metropole.json';
    private const MAX_AGE = 365 * 24 * 3600;

    private static function file(): string
    {
        return __DIR__ . '/../storage/holidays/metropole.json';
    }

    /** Jours fériés (`YYYY-MM-DD` => libellé) des années demandées, rechargés si besoin. */
    public static function forYears(array $years): array
    {
        $cache = self::read();
        $missing = array_filter($years, fn($year) => !array_filter(array_keys($cache['dates']), fn($d) => str_starts_with($d, "$year-")));
        if ($missing || time() - $cache['fetched_at'] > self::MAX_AGE) {
            $cache = self::refresh() ?? $cache;
        }
        $dates = array_filter($cache['dates'], fn($d) => in_array((int)substr($d, 0, 4), $years, true), ARRAY_FILTER_USE_KEY);
        ksort($dates);
        return $dates;
    }

    /** Recharge la réserve depuis l'API ; null en cas d'échec (réserve inchangée). */
    public static function refresh(): ?array
    {
        $context = stream_context_create(['http' => ['timeout' => 5, 'header' => "Accept: application/json\r\n"]]);
        $body = @file_get_contents(self::URL, false, $context);
        $dates = $body === false ? null : json_decode($body, true);
        if (!is_array($dates) || !$dates) {
            error_log('[Crenelio] Jours fériés : API indisponible, réserve conservée');
            return null;
        }
        $cache = ['fetched_at' => time(), 'source' => self::URL, 'dates' => $dates];
        if (!is_dir(dirname(self::file()))) {
            @mkdir(dirname(self::file()), 0775, true);
        }
        @file_put_contents(self::file(), json_encode($cache, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        return $cache;
    }

    private static function read(): array
    {
        $cache = is_file(self::file()) ? json_decode((string)file_get_contents(self::file()), true) : null;
        return is_array($cache) && isset($cache['dates']) ? $cache : ['fetched_at' => 0, 'dates' => []];
    }
}
