<?php
/**
 * ICalendar — Fichiers `.ics` des rendez-vous : celui de l'artisan (invitation, créneau élargi du
 * trajet, coordonnées du client) et celui du client (publication, créneau exact, coordonnées de
 * l'artisan et lien de gestion du rendez-vous).
 *
 * Produit un VCALENDAR / VEVENT conforme à la RFC 5545, importable
 * directement dans Google Calendar, Apple Calendar et Outlook.
 */

require_once __DIR__ . '/EmailTemplates.php';

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

    /**
     * Événement côté client : créneau exact (sans le trajet de l'artisan), coordonnées de l'artisan,
     * détail des tarifs et lien « Gérer ou annuler mon rendez-vous ». `METHOD:PUBLISH` : simple
     * ajout à l'agenda, sans invitation à laquelle répondre.
     */
    public static function forClient(array $appointment, array $config): string
    {
        $timezone = new DateTimeZone(APP_TIMEZONE);
        $utc      = new DateTimeZone('UTC');
        $start    = new DateTime($appointment['start_datetime'], $timezone);
        $end      = new DateTime($appointment['end_datetime'], $timezone);
        $company  = $config['company_name'] ?? 'Crénelio';
        $manage   = EmailTemplates::manageUrl($appointment);

        $lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Crenelio//Prise de rendez-vous//FR',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:' . self::uid($appointment, 'client'),
            'DTSTAMP:' . (new DateTime('now', $utc))->format('Ymd\THis\Z'),
            'DTSTART:' . $start->setTimezone($utc)->format('Ymd\THis\Z'),
            'DTEND:' . $end->setTimezone($utc)->format('Ymd\THis\Z'),
            'SUMMARY:' . self::escape(sprintf('%s — %s', $appointment['service_name'] ?? 'Intervention', $company)),
            'LOCATION:' . self::escape(self::location($appointment)),
            'DESCRIPTION:' . self::escape(self::clientDescription($appointment, $config, $manage)),
            'STATUS:' . ($appointment['status'] === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'),
        ];
        if ($manage !== null) {
            $lines[] = 'URL:' . $manage;
        }
        // Rappel la veille (affiché par la plupart des agendas)
        array_push(
            $lines,
            'BEGIN:VALARM',
            'ACTION:DISPLAY',
            'DESCRIPTION:' . self::escape('Rendez-vous demain : ' . ($appointment['service_name'] ?? 'intervention')),
            'TRIGGER:-P1D',
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        );

        return implode("\r\n", array_map([self::class, 'fold'], $lines)) . "\r\n";
    }

    /** Identifiant stable d'un événement (un par destinataire), pour que les réimports se remplacent. */
    private static function uid(array $appointment, string $for = 'pro'): string
    {
        $domain = substr(strrchr(MAIL_FROM, '@') ?: '@crenelio.local', 1);
        return 'crenelio-rdv-' . $appointment['id'] . ($for === 'client' ? '-client' : '') . '@' . $domain;
    }

    private static function clientDescription(array $appointment, array $config, ?string $manage): string
    {
        $travelFee = (float)($appointment['travel_fee'] ?? 0);
        $price     = (float)($appointment['service_price'] ?? 0);

        $lines = [
            'Prestation : ' . ($appointment['service_name'] ?? '—')
                . ' (' . ($appointment['duration_minutes'] ?? '?') . ' min)',
            // Même libellé que l'email de confirmation pour une prestation gratuite
            'Tarif prestation : ' . ($price > 0 ? number_format($price, 2, ',', ' ') . ' €' : 'Gratuit'),
        ];
        if ($travelFee > 0) {
            $lines[] = 'Frais de déplacement : ' . number_format($travelFee, 2, ',', ' ') . ' €';
            $lines[] = 'Total estimé : ' . number_format($price + $travelFee, 2, ',', ' ') . ' €';
        }

        $lines[] = '';
        $lines[] = $config['company_name'] ?? 'Crénelio';
        foreach (['pro_name' => '', 'pro_phone' => 'Téléphone : ', 'pro_email' => 'Email : '] as $key => $label) {
            if (!empty($config[$key])) {
                $lines[] = $label . $config[$key];
            }
        }

        if ($manage !== null) {
            $lines[] = '';
            $lines[] = 'Gérer ou annuler mon rendez-vous : ' . $manage;
        }

        return implode("\n", $lines);
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
