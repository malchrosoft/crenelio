<?php
/**
 * ICalendar — Génération du fichier `.ics` joint à l'email de l'artisan.
 *
 * Produit un VCALENDAR / VEVENT conforme à la RFC 5545, importable
 * directement dans Google Calendar, Apple Calendar et Outlook.
 */

class ICalendar
{
    /**
     * Construit l'événement d'une intervention.
     *
     * Le créneau est élargi du temps de trajet (`config.buffer_minutes`) de
     * part et d'autre, afin que l'agenda de l'artisan reflète le déplacement
     * réel et non la seule durée de la prestation.
     *
     * @param array $appointment Ligne `appointments` enrichie du service.
     * @param array $config      Paires clé-valeur de la table `config`.
     */
    public static function forAppointment(array $appointment, array $config): string
    {
        $bufferMinutes = max(0, (int)($config['buffer_minutes'] ?? 0));
        $timezone      = new DateTimeZone(APP_TIMEZONE);
        $utc           = new DateTimeZone('UTC');

        $start = new DateTime($appointment['start_datetime'], $timezone);
        $end   = new DateTime($appointment['end_datetime'], $timezone);

        if ($bufferMinutes > 0) {
            $start->modify("-$bufferMinutes minutes");
            $end->modify("+$bufferMinutes minutes");
        }

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Crenelio//Prise de rendez-vous//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:REQUEST',
            'BEGIN:VEVENT',
            'UID:' . self::uid($appointment),
            'DTSTAMP:' . (new DateTime('now', $utc))->format('Ymd\THis\Z'),
            'DTSTART:' . $start->setTimezone($utc)->format('Ymd\THis\Z'),
            'DTEND:' . $end->setTimezone($utc)->format('Ymd\THis\Z'),
            'SUMMARY:' . self::escape(self::summary($appointment)),
            'LOCATION:' . self::escape(self::location($appointment)),
            'DESCRIPTION:' . self::escape(self::description($appointment, $bufferMinutes)),
            'STATUS:' . ($appointment['status'] === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'),
            'ORGANIZER;CN=' . self::escape($config['company_name'] ?? 'Crénelio')
                . ':mailto:' . ($config['pro_email'] ?? MAIL_FROM),
            'ATTENDEE;CN=' . self::escape($appointment['client_name'])
                . ';ROLE=REQ-PARTICIPANT:mailto:' . $appointment['client_email'],
            'END:VEVENT',
            'END:VCALENDAR',
        ];

        return implode("\r\n", array_map([self::class, 'fold'], $lines)) . "\r\n";
    }

    /** Identifiant stable d'un événement, pour que les réimports se remplacent. */
    private static function uid(array $appointment): string
    {
        $domain = substr(strrchr(MAIL_FROM, '@') ?: '@crenelio.local', 1);
        return 'crenelio-rdv-' . $appointment['id'] . '@' . $domain;
    }

    private static function summary(array $appointment): string
    {
        return sprintf('%s — %s', $appointment['service_name'] ?? 'Intervention', $appointment['client_name']);
    }

    private static function location(array $appointment): string
    {
        return sprintf(
            '%s, %s %s',
            $appointment['address'],
            $appointment['postal_code'],
            $appointment['city']
        );
    }

    private static function description(array $appointment, int $bufferMinutes): string
    {
        $travelFee = (float)($appointment['travel_fee'] ?? 0);
        $price     = (float)($appointment['service_price'] ?? 0);

        $lines = [
            'Client : ' . $appointment['client_name'],
            'Téléphone : ' . $appointment['client_phone'],
            'Email : ' . $appointment['client_email'],
            'Prestation : ' . ($appointment['service_name'] ?? '—')
                . ' (' . ($appointment['duration_minutes'] ?? '?') . ' min)',
            'Tarif prestation : ' . number_format($price, 2, ',', ' ') . ' €',
        ];

        if ($travelFee > 0) {
            $distance = $appointment['distance_km'] ?? null;
            $lines[] = 'Frais de déplacement : ' . number_format($travelFee, 2, ',', ' ') . ' €'
                . ($distance !== null ? ' (' . number_format((float)$distance, 1, ',', ' ') . ' km)' : '');
            $lines[] = 'Total estimé : ' . number_format($price + $travelFee, 2, ',', ' ') . ' €';
        }

        if ($bufferMinutes > 0) {
            $lines[] = "Créneau élargi de $bufferMinutes min avant et après pour le trajet.";
        }

        if (!empty($appointment['notes'])) {
            $lines[] = '';
            $lines[] = "Notes d'accès : " . $appointment['notes'];
        }

        return implode("\n", $lines);
    }

    /**
     * Échappement RFC 5545 : les virgules, points-virgules, antislashs et
     * retours à la ligne doivent être protégés dans une valeur de propriété.
     */
    private static function escape(string $value): string
    {
        return str_replace(
            ['\\', "\r\n", "\n", "\r", ';', ','],
            ['\\\\', '\\n', '\\n', '\\n', '\\;', '\\,'],
            $value
        );
    }

    /**
     * Pliage des lignes à 75 octets (RFC 5545), la continuation débutant
     * par une espace. Le découpage respecte les caractères multi-octets.
     */
    private static function fold(string $line): string
    {
        if (strlen($line) <= 75) {
            return $line;
        }

        $folded = '';
        $current = '';

        foreach (mb_str_split($line) as $char) {
            if (strlen($current) + strlen($char) > 74) {
                $folded .= $current . "\r\n ";
                $current = '';
            }
            $current .= $char;
        }

        return $folded . $current;
    }
}
