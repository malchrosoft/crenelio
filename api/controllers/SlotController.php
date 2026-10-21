<?php
/**
 * SlotController — Créneaux de rendez-vous disponibles (calcul délégué à SlotEngine).
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../models/Schedule.php';
require_once __DIR__ . '/../core/SlotEngine.php';
require_once __DIR__ . '/../core/Response.php';

class SlotController
{
    /**
     * GET /slots?service_id=X&date=YYYY-MM-DD
     * Liste des créneaux disponibles pour une date et une prestation.
     */
    public function index(): void
    {
        $service = $this->service();
        $dateStr = $this->date('date');
        $config = Config::getAll();

        Response::json([
            'date'           => $dateStr,
            'service'        => $service,
            'buffer_minutes' => SlotEngine::settings($config)['buffer'],
            'slots'          => SlotEngine::forDate($service, $dateStr, $config),
        ]);
    }

    /**
     * GET /slots/availability?service_id=X
     * Jours offrant au moins un créneau sur toute la fenêtre de réservation,
     * pour griser les autres dans le calendrier.
     */
    public function availability(): void
    {
        $service = $this->service();
        $config = Config::getAll();
        $maxAdvance = SlotEngine::settings($config)['max_advance'];

        $schedules = [];
        foreach (Schedule::all() as $schedule) {
            $schedules[(int)$schedule['day_of_week']] = $schedule;
        }

        $dates = [];
        for ($i = 0; $i <= $maxAdvance; $i++) {
            $date = date('Y-m-d', strtotime("+$i days", strtotime(date('Y-m-d'))));
            if (SlotEngine::forDate($service, $date, $config, $schedules)) {
                $dates[] = $date;
            }
        }

        Response::json(['max_advance_days' => $maxAdvance, 'dates' => $dates]);
    }

    private function service(): array
    {
        $serviceId = isset($_GET['service_id']) ? (int)$_GET['service_id'] : 0;
        if (!$serviceId) {
            Response::json(['error' => 'Paramètre service_id requis'], 400);
        }
        $service = Service::find($serviceId);
        if (!$service || !$service['is_active']) {
            Response::json(['error' => 'Prestation non trouvée ou inactive'], 404);
        }
        return $service;
    }

    private function date(string $param): string
    {
        $dateStr = isset($_GET[$param]) ? trim($_GET[$param]) : '';
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateStr)) {
            Response::json(['error' => "Paramètre $param invalide (format YYYY-MM-DD attendu)"], 400);
        }
        return $dateStr;
    }
}
