<?php
/**
 * SlotEngine — Calcul des créneaux disponibles d'une journée pour une prestation.
 *
 * Croise les horaires hebdomadaires (`schedules`), la durée de la prestation, les
 * indisponibilités, les rendez-vous existants (protégés par le temps de trajet)
 * et les bornes de réservation (délai minimal, horizon maximal).
 * Source unique de vérité : utilisé pour proposer les créneaux et pour valider une réservation.
 */

require_once __DIR__ . '/../models/Schedule.php';
require_once __DIR__ . '/../models/Unavailability.php';
require_once __DIR__ . '/../models/Appointment.php';

class SlotEngine
{
    /** Paramètres de réservation lus en config, bornés. */
    public static function settings(array $config): array
    {
        return [
            'step'        => max(15, (int)($config['slot_step_minutes'] ?? 30)),
            'buffer'      => max(0, (int)($config['buffer_minutes'] ?? 30)),
            'notice'      => max(0, (int)($config['min_notice_hours'] ?? 12)),
            'max_advance' => max(1, (int)($config['max_advance_days'] ?? 30)),
        ];
    }

    /**
     * Créneaux libres du jour `$date` (YYYY-MM-DD) pour `$service`.
     * `$schedules` (indexés par jour 1..7) évite de relire la table jour après jour.
     */
    public static function forDate(array $service, string $date, array $config, ?array $schedules = null): array
    {
        $settings = self::settings($config);
        $targetDate = strtotime($date);
        $today = strtotime(date('Y-m-d'));

        if ($targetDate < $today || $targetDate > strtotime("+{$settings['max_advance']} days", $today)) {
            return [];
        }

        $dayOfWeek = (int)date('N', $targetDate);
        $schedule = $schedules !== null ? ($schedules[$dayOfWeek] ?? null) : Schedule::getByDay($dayOfWeek);
        if (!$schedule || !$schedule['is_active']) {
            return [];
        }

        $ranges = self::ranges($schedule);
        if (empty($ranges)) {
            return [];
        }

        $buffer = $settings['buffer'];
        $dayStart = "$date 00:00:00";
        $dayEnd = "$date 23:59:59";
        $booked = Appointment::getOverlapping(
            date('Y-m-d H:i:s', strtotime("-$buffer minutes", strtotime($dayStart))),
            date('Y-m-d H:i:s', strtotime("+$buffer minutes", strtotime($dayEnd)))
        );
        $unavailabilities = Unavailability::getForRange($dayStart, $dayEnd);

        $duration = (int)$service['duration_minutes'];
        $minAllowedTime = time() + $settings['notice'] * 3600;
        $slots = [];

        foreach ($ranges as [$rangeStart, $rangeEnd]) {
            for ($cursor = $rangeStart; $cursor + $duration <= $rangeEnd; $cursor += $settings['step']) {
                $startStr = sprintf('%02d:%02d', intdiv($cursor, 60), $cursor % 60);
                $endStr = sprintf('%02d:%02d', intdiv($cursor + $duration, 60), ($cursor + $duration) % 60);
                $slotStart = strtotime("$date $startStr:00");
                $slotEnd = strtotime("$date $endStr:00");

                if ($slotStart < $minAllowedTime
                    || self::overlaps($slotStart, $slotEnd, $unavailabilities, 0)
                    || self::overlaps($slotStart, $slotEnd, $booked, $buffer * 60)) {
                    continue;
                }

                $slots[] = [
                    'start'          => $startStr,
                    'end'            => $endStr,
                    'start_datetime' => "$date $startStr:00",
                    'end_datetime'   => "$date $endStr:00",
                ];
            }
        }

        return $slots;
    }

    /** Vrai si `$startDatetime` correspond exactement à un créneau proposé. */
    public static function isAvailable(array $service, string $startDatetime, array $config): bool
    {
        $time = strtotime($startDatetime);
        if ($time === false) {
            return false;
        }
        $wanted = date('Y-m-d H:i:00', $time);
        foreach (self::forDate($service, date('Y-m-d', $time), $config) as $slot) {
            if ($slot['start_datetime'] === $wanted) {
                return true;
            }
        }
        return false;
    }

    /** Plages de travail [début, fin] en minutes depuis minuit (matin puis après-midi). */
    private static function ranges(array $schedule): array
    {
        $ranges = [];
        foreach ([['morning_start', 'morning_end'], ['afternoon_start', 'afternoon_end']] as [$start, $end]) {
            if (!empty($schedule[$start]) && !empty($schedule[$end])) {
                $ranges[] = [self::toMinutes($schedule[$start]), self::toMinutes($schedule[$end])];
            }
        }
        return $ranges;
    }

    /** Chevauchement de [start, end] avec des périodes élargies de `$margin` secondes de part et d'autre. */
    private static function overlaps(int $start, int $end, array $periods, int $margin): bool
    {
        foreach ($periods as $period) {
            if ($start < strtotime($period['end_datetime']) + $margin
                && $end > strtotime($period['start_datetime']) - $margin) {
                return true;
            }
        }
        return false;
    }

    private static function toMinutes(string $time): int
    {
        [$hours, $minutes] = array_map('intval', explode(':', $time) + [0, 0]);
        return $hours * 60 + $minutes;
    }
}
