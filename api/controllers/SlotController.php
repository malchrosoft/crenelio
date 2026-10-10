<?php
/**
 * SlotController — Moteur de calcul des créneaux de rendez-vous disponibles.
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../models/Schedule.php';
require_once __DIR__ . '/../models/Unavailability.php';
require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../core/Response.php';

class SlotController
{
    /**
     * GET /slots?service_id=X&date=YYYY-MM-DD
     * Calcule la liste des créneaux disponibles pour une date et une prestation.
     */
    public function index(): void
    {
        $serviceId = isset($_GET['service_id']) ? (int)$_GET['service_id'] : 0;
        $dateStr   = isset($_GET['date']) ? trim($_GET['date']) : '';

        if (!$serviceId) {
            Response::json(['error' => 'Paramètre service_id requis'], 400);
        }

        if (!$dateStr || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateStr)) {
            Response::json(['error' => 'Paramètre date invalide (format YYYY-MM-DD attendu)'], 400);
        }

        $service = Service::find($serviceId);
        if (!$service || !$service['is_active']) {
            Response::json(['error' => 'Prestation non trouvée ou inactive'], 404);
        }

        $config = Config::getAll();
        $slotStepMinutes = max(15, (int)($config['slot_step_minutes'] ?? 30));
        $bufferMinutes   = max(0, (int)($config['buffer_minutes'] ?? 30));
        $minNoticeHours  = max(0, (int)($config['min_notice_hours'] ?? 12));
        $maxAdvanceDays  = max(1, (int)($config['max_advance_days'] ?? 30));

        $targetDate = strtotime($dateStr);
        $today      = strtotime(date('Y-m-d'));

        // Vérification des bornes de réservation
        if ($targetDate < $today) {
            Response::json(['date' => $dateStr, 'slots' => []]);
        }

        $maxDate = strtotime("+$maxAdvanceDays days", $today);
        if ($targetDate > $maxDate) {
            Response::json(['date' => $dateStr, 'slots' => []]);
        }

        // Jour de la semaine (1 = Lundi, 7 = Dimanche)
        $dayOfWeek = (int)date('N', $targetDate);
        $schedule  = Schedule::getByDay($dayOfWeek);

        if (!$schedule || !$schedule['is_active']) {
            Response::json(['date' => $dateStr, 'slots' => []]);
        }

        // Définition des plages de travail de la journée
        $ranges = [];
        if (!empty($schedule['morning_start']) && !empty($schedule['morning_end'])) {
            $ranges[] = [
                'start' => $this->timeToMinutes($schedule['morning_start']),
                'end'   => $this->timeToMinutes($schedule['morning_end'])
            ];
        }
        if (!empty($schedule['afternoon_start']) && !empty($schedule['afternoon_end'])) {
            $ranges[] = [
                'start' => $this->timeToMinutes($schedule['afternoon_start']),
                'end'   => $this->timeToMinutes($schedule['afternoon_end'])
            ];
        }

        if (empty($ranges)) {
            Response::json(['date' => $dateStr, 'slots' => []]);
        }

        // Récupération des rendez-vous existants et des indisponibilités
        $dayStart = "$dateStr 00:00:00";
        $dayEnd   = "$dateStr 23:59:59";

        $bookedAppointments = Appointment::getOverlapping(
            date('Y-m-d H:i:s', strtotime("-$bufferMinutes minutes", strtotime($dayStart))),
            date('Y-m-d H:i:s', strtotime("+$bufferMinutes minutes", strtotime($dayEnd)))
        );

        $unavailabilities = Unavailability::getForRange($dayStart, $dayEnd);

        $durationMinutes = (int)$service['duration_minutes'];
        $now = time();
        $minAllowedTime = $now + ($minNoticeHours * 3600);

        $availableSlots = [];

        foreach ($ranges as $range) {
            $cursor = $range['start'];
            $rangeEnd = $range['end'];

            while (($cursor + $durationMinutes) <= $rangeEnd) {
                $slotStartMinutes = $cursor;
                $slotEndMinutes   = $cursor + $durationMinutes;

                $startHourStr = sprintf('%02d:%02d:00', floor($slotStartMinutes / 60), $slotStartMinutes % 60);
                $endHourStr   = sprintf('%02d:%02d:00', floor($slotEndMinutes / 60), $slotEndMinutes % 60);

                $slotStartDtStr = "$dateStr $startHourStr";
                $slotEndDtStr   = "$dateStr $endHourStr";
                $slotStartTime  = strtotime($slotStartDtStr);
                $slotEndTime    = strtotime($slotEndDtStr);

                // Rejet si le créneau est dans le passé ou viole le délai minimum de préavis
                if ($slotStartTime < $minAllowedTime) {
                    $cursor += $slotStepMinutes;
                    continue;
                }

                // Vérification du conflit avec les indisponibilités
                $conflict = false;
                foreach ($unavailabilities as $unavail) {
                    $unavailStart = strtotime($unavail['start_datetime']);
                    $unavailEnd   = strtotime($unavail['end_datetime']);

                    if ($slotStartTime < $unavailEnd && $slotEndTime > $unavailStart) {
                        $conflict = true;
                        break;
                    }
                }

                if ($conflict) {
                    $cursor += $slotStepMinutes;
                    continue;
                }

                // Vérification du conflit avec les rendez-vous existants (en incluant le buffer de trajet)
                foreach ($bookedAppointments as $app) {
                    $appStart = strtotime($app['start_datetime']);
                    $appEnd   = strtotime($app['end_datetime']);

                    // Le créneau [slotStartTime, slotEndTime] ne doit pas empiéter sur [appStart - buffer, appEnd + buffer]
                    $protectedAppStart = $appStart - ($bufferMinutes * 60);
                    $protectedAppEnd   = $appEnd + ($bufferMinutes * 60);

                    if ($slotStartTime < $protectedAppEnd && $slotEndTime > $protectedAppStart) {
                        $conflict = true;
                        break;
                    }
                }

                if (!$conflict) {
                    $availableSlots[] = [
                        'start'          => substr($startHourStr, 0, 5),
                        'end'            => substr($endHourStr, 0, 5),
                        'start_datetime' => $slotStartDtStr,
                        'end_datetime'   => $slotEndDtStr
                    ];
                }

                $cursor += $slotStepMinutes;
            }
        }

        Response::json([
            'date'            => $dateStr,
            'service'         => $service,
            'buffer_minutes'  => $bufferMinutes,
            'slots'           => $availableSlots
        ]);
    }

    /**
     * Convertit 'HH:MM:SS' ou 'HH:MM' en minutes depuis minuit.
     */
    private function timeToMinutes(string $timeStr): int
    {
        $parts = explode(':', $timeStr);
        $hours = (int)($parts[0] ?? 0);
        $minutes = (int)($parts[1] ?? 0);
        return ($hours * 60) + $minutes;
    }
}
