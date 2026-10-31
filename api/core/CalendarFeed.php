<?php
/**
 * CalendarFeed — Abonnement d'agenda de l'artisan, optionnel (Item 33).
 *
 * Réglage stocké hors base et hors configuration publique : `api/storage/auth/calendar-feed.json`
 * (`token`, `include_unavailabilities`, `created_at`, `last_access`). Sans fichier, l'abonnement
 * est désactivé et l'adresse publique répond 404.
 */

require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../models/Unavailability.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/ICalendar.php';

class CalendarFeed
{
    /** Fenêtre publiée : un mois passé, un an à venir (les données plus anciennes ne sortent pas). */
    private const PAST_DAYS   = 31;
    private const FUTURE_DAYS = 366;

    private static function file(): string
    {
        return __DIR__ . '/../storage/auth/calendar-feed.json';
    }

    /** Réglage actuel, null si l'abonnement est désactivé. */
    public static function settings(): ?array
    {
        $raw = is_file(self::file()) ? json_decode((string)file_get_contents(self::file()), true) : null;
        return is_array($raw) && !empty($raw['token']) ? $raw : null;
    }

    /** Active l'abonnement, ou régénère l'adresse (l'ancienne cesse de fonctionner). */
    public static function enable(bool $includeUnavailabilities): array
    {
        $settings = [
            'token'                    => bin2hex(random_bytes(24)),
            'include_unavailabilities' => $includeUnavailabilities,
            'created_at'               => date('Y-m-d H:i:s'),
            'last_access'              => null,
        ];
        self::save($settings);
        return $settings;
    }

    public static function setIncludeUnavailabilities(bool $include): ?array
    {
        $settings = self::settings();
        if ($settings === null) {
            return null;
        }
        $settings['include_unavailabilities'] = $include;
        self::save($settings);
        return $settings;
    }

    public static function disable(): void
    {
        if (is_file(self::file())) {
            unlink(self::file());
        }
    }

    /** Vrai si `$token` est le jeton actif (comparaison à temps constant). */
    public static function matches(string $token): bool
    {
        $settings = self::settings();
        return $settings !== null && hash_equals($settings['token'], $token);
    }

    /** Contenu iCal du flux ; enregistre la date du dernier accès. */
    public static function render(): string
    {
        $settings = self::settings() ?? [];
        $from = date('Y-m-d', strtotime('-' . self::PAST_DAYS . ' days'));
        $to   = date('Y-m-d', strtotime('+' . self::FUTURE_DAYS . ' days'));

        $appointments = array_values(array_filter(
            Appointment::all($from, $to),
            fn($a) => $a['status'] !== 'cancelled' && $a['client_name'] !== Appointment::ANONYMIZED_NAME
        ));
        $unavailabilities = !empty($settings['include_unavailabilities'])
            ? Unavailability::getForRange("$from 00:00:00", "$to 23:59:59")
            : [];

        $settings['last_access'] = date('Y-m-d H:i:s');
        self::save($settings);

        return ICalendar::feed($appointments, $unavailabilities, Config::getAll());
    }

    private static function save(array $settings): void
    {
        $dir = dirname(self::file());
        if (!is_dir($dir)) {
            mkdir($dir, 0700, true);
        }
        file_put_contents(self::file(), json_encode($settings), LOCK_EX);
        @chmod(self::file(), 0600);
    }
}
