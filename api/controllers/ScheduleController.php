<?php
/**
 * ScheduleController — Gestion des horaires d'ouverture et indisponibilités.
 */

require_once __DIR__ . '/../models/Schedule.php';
require_once __DIR__ . '/../models/Unavailability.php';
require_once __DIR__ . '/../core/Response.php';

class ScheduleController
{
    /**
     * GET /schedules — Liste des horaires habituels pour chaque jour.
     */
    public function index(): void
    {
        $schedules = Schedule::all();
        Response::json($schedules);
    }

    /**
     * PUT /schedules/:day — Mise à jour des horaires d'un jour (1=Lundi..7=Dimanche).
     */
    public function update(array $params): void
    {
        $day = (int)($params['day'] ?? 0);
        if ($day < 1 || $day > 7) {
            Response::json(['error' => 'Jour invalide (doit être entre 1 et 7)'], 400);
        }

        $body = Response::body();
        $error = self::validateDay($body);
        if ($error !== null) {
            Response::json(['error' => $error], 400);
        }
        Schedule::updateDay($day, $body);

        Response::json(Schedule::getByDay($day));
    }

    /**
     * Plages cohérentes : heures HH:MM, chaque plage complète ou vide, début < fin,
     * matin terminé avant l'après-midi, au moins une plage si le jour est ouvert.
     */
    private static function validateDay(array &$body): ?string
    {
        $labels = ['morning' => 'du matin', 'afternoon' => "de l'après-midi"];
        $ranges = [];
        foreach ($labels as $part => $label) {
            $start = $body["{$part}_start"] ?? null;
            $end = $body["{$part}_end"] ?? null;
            $start = $start === '' ? null : $start;
            $end = $end === '' ? null : $end;
            $body["{$part}_start"] = $start;
            $body["{$part}_end"] = $end;

            if ($start === null && $end === null) {
                continue;
            }
            foreach ([$start, $end] as $time) {
                if ($time === null || !preg_match('/^([01]\d|2[0-3]):[0-5]\d(:00)?$/', $time)) {
                    return "Plage $label incomplète ou heure invalide (format HH:MM)";
                }
            }
            if (substr($start, 0, 5) >= substr($end, 0, 5)) {
                return "La plage $label doit commencer avant de finir";
            }
            $ranges[] = [substr($start, 0, 5), substr($end, 0, 5)];
        }

        if (count($ranges) === 2 && $ranges[0][1] > $ranges[1][0]) {
            return "La plage du matin doit se terminer avant le début de l'après-midi";
        }
        if (!empty($body['is_active']) && !$ranges) {
            return 'Un jour travaillé doit avoir au moins une plage horaire';
        }
        return null;
    }

    /**
     * GET /unavailabilities — Liste des indisponibilités.
     */
    public function unavailabilities(): void
    {
        $list = Unavailability::all();
        Response::json($list);
    }

    /**
     * POST /unavailabilities — Ajout d'une indisponibilité.
     */
    public function storeUnavailability(): void
    {
        $body = Response::body();

        if (empty($body['start_datetime']) || empty($body['end_datetime'])) {
            Response::json(['error' => 'Les dates de début et de fin sont obligatoires'], 400);
        }

        if ($body['start_datetime'] >= $body['end_datetime']) {
            Response::json(['error' => 'La date de début doit être antérieure à la date de fin'], 400);
        }

        $id = Unavailability::create($body);
        Response::json([
            'id'             => $id,
            'title'          => $body['title'] ?? 'Indisponible',
            'start_datetime' => $body['start_datetime'],
            'end_datetime'   => $body['end_datetime']
        ], 201);
    }

    /**
     * DELETE /unavailabilities/:id — Suppression d'une indisponibilité.
     */
    public function destroyUnavailability(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        Unavailability::delete($id);

        Response::json(['message' => 'Indisponibilité supprimée']);
    }
}
