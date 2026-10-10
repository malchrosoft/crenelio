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
        Schedule::updateDay($day, $body);

        Response::json(Schedule::getByDay($day));
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
