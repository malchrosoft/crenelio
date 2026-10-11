<?php
/**
 * AppointmentController — Gestion et réservation des rendez-vous.
 */

require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/TravelFee.php';
require_once __DIR__ . '/../core/Notifier.php';
require_once __DIR__ . '/../models/Notification.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/TravelFeeController.php';

class AppointmentController
{
    /**
     * GET /appointments — Liste des rendez-vous (Espace Pro).
     */
    public function index(): void
    {
        $startDate = $_GET['start_date'] ?? null;
        $endDate   = $_GET['end_date'] ?? null;
        $status    = $_GET['status'] ?? null;

        $appointments = Appointment::all($startDate, $endDate, $status);
        Response::json($appointments);
    }

    /**
     * GET /appointments/:id — Détail d'un rendez-vous par son ID.
     */
    public function show(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $appointment = Appointment::find($id);

        if (!$appointment) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        Response::json($appointment);
    }

    /**
     * POST /appointments — Prise de rendez-vous en ligne (Public).
     */
    public function store(): void
    {
        $body = Response::body();

        // Validations obligatoires
        $requiredFields = ['service_id', 'client_name', 'client_email', 'client_phone', 'address', 'postal_code', 'city', 'start_datetime'];
        foreach ($requiredFields as $field) {
            if (empty($body[$field])) {
                Response::json(['error' => "Le champ '$field' est obligatoire"], 400);
            }
        }

        if (!filter_var($body['client_email'], FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Adresse email invalide'], 400);
        }

        $serviceId = (int)$body['service_id'];
        $service = Service::find($serviceId);
        if (!$service || !$service['is_active']) {
            Response::json(['error' => 'Prestation sélectionnée non trouvée ou inactive'], 404);
        }

        $startDatetime = $body['start_datetime'];
        $durationMinutes = (int)$service['duration_minutes'];
        $endDatetime = date('Y-m-d H:i:s', strtotime("+$durationMinutes minutes", strtotime($startDatetime)));

        $config = Config::getAll();

        // Frais de déplacement : recalculés côté serveur, le devis client n'est jamais
        // source de vérité (il n'est qu'un affichage de transparence tarifaire).
        [$latitude, $longitude] = TravelFeeController::readCoordinates($body);
        $travelQuote = TravelFee::quote($service, $latitude, $longitude, $config);

        if ($travelQuote['needs_coordinates']) {
            Response::json([
                'error' => "Cette prestation facture le déplacement à la distance. Veuillez sélectionner votre adresse dans les suggestions proposées pour la localiser précisément."
            ], 400);
        }

        if ($travelQuote['is_out_of_zone']) {
            Response::json([
                'error'      => sprintf(
                    "L'adresse indiquée se situe à %s km du point de départ, au-delà du rayon d'intervention de %s km. La réservation en ligne n'est pas possible, mais une demande exceptionnelle reste envisageable.",
                    self::formatKm($travelQuote['distance_km']),
                    self::formatKm($travelQuote['max_km'])
                ),
                'code'       => 'out_of_zone',
                'travel'     => $travelQuote,
                'pro_email'  => $config['pro_email'] ?? null,
                'pro_phone'  => $config['pro_phone'] ?? null,
            ], 422);
        }

        // Vérification de non-conflit de créneau (avec buffer de trajet)
        $bufferMinutes = max(0, (int)($config['buffer_minutes'] ?? 30));

        $checkStart = date('Y-m-d H:i:s', strtotime("-$bufferMinutes minutes", strtotime($startDatetime)));
        $checkEnd   = date('Y-m-d H:i:s', strtotime("+$bufferMinutes minutes", strtotime($endDatetime)));

        $overlaps = Appointment::getOverlapping($checkStart, $checkEnd);
        if (!empty($overlaps)) {
            Response::json([
                'error' => "Ce créneau n'est plus disponible (conflit de planning ou temps de déplacement insuffisant). Veuillez choisir un autre créneau."
            ], 409);
        }

        $data = [
            'service_id'     => $serviceId,
            'client_name'    => $body['client_name'],
            'client_email'   => $body['client_email'],
            'client_phone'   => $body['client_phone'],
            'address'        => $body['address'],
            'postal_code'    => $body['postal_code'],
            'city'           => $body['city'],
            'travel_fee'     => $travelQuote['travel_fee'],
            'distance_km'    => $travelQuote['distance_km'],
            'is_out_of_zone' => $travelQuote['is_out_of_zone'],
            'notes'          => $body['notes'] ?? null,
            'start_datetime' => $startDatetime,
            'end_datetime'   => $endDatetime,
            'status'         => 'confirmed'
        ];

        $appointment = Appointment::create($data);

        // Notifications : journalisées puis tentées, sans jamais compromettre
        // une réservation déjà enregistrée en base.
        $notifications = Notifier::sendBookingConfirmations($appointment, $config);

        Response::json([
            'message'       => 'Votre rendez-vous a été confirmé avec succès !',
            'appointment'   => $appointment,
            'travel'        => $travelQuote,
            'notifications' => $notifications
        ], 201);
    }

    /**
     * GET /appointments/:id/notifications — Journal d'envoi d'un rendez-vous (Espace Pro).
     */
    public function notifications(array $params): void
    {
        $id = (int)($params['id'] ?? 0);

        if (!Appointment::find($id)) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        Response::json(Notification::forAppointment($id));
    }

    /**
     * POST /appointments/:id/notifications/resend — Relance manuelle d'un envoi.
     */
    public function resendNotification(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $appointment = Appointment::find($id);

        if (!$appointment) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        $type = Response::body()['type'] ?? '';
        if (!in_array($type, Notification::TYPES, true)) {
            Response::json(['error' => 'Type de notification inconnu'], 400);
        }

        try {
            $result = Notifier::resend($appointment, Config::getAll(), $type);
        } catch (InvalidArgumentException $e) {
            Response::json(['error' => $e->getMessage()], 400);
        }

        Response::json([
            'result'        => $result,
            'notifications' => Notification::forAppointment($id)
        ]);
    }

    /**
     * Formatage français d'une distance (« 23,4 »), tolérant aux valeurs absentes.
     */
    private static function formatKm(?float $km): string
    {
        if ($km === null) {
            return '—';
        }

        return rtrim(rtrim(number_format($km, 1, ',', ' '), '0'), ',');
    }

    /**
     * GET /appointments/token/:token — Consultation d'un rdv via son token client.
     */
    public function showByToken(array $params): void
    {
        $token = $params['token'] ?? '';
        $appointment = Appointment::findByToken($token);

        if (!$appointment) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        Response::json($appointment);
    }

    /**
     * POST /appointments/token/:token/cancel — Annulation par le client via son lien sécurisé.
     */
    public function cancelByToken(array $params): void
    {
        $token = $params['token'] ?? '';
        $appointment = Appointment::findByToken($token);

        if (!$appointment) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        if ($appointment['status'] === 'cancelled') {
            Response::json(['message' => 'Ce rendez-vous est déjà annulé', 'appointment' => $appointment]);
        }

        $body = Response::body();
        $reason = $body['reason'] ?? 'Annulé par le client';

        Appointment::updateStatus((int)$appointment['id'], 'cancelled', $reason);
        $updated = Appointment::find((int)$appointment['id']);

        Response::json([
            'message'     => 'Rendez-vous annulé avec succès',
            'appointment' => $updated
        ]);
    }

    /**
     * PUT /appointments/:id/status — Mise à jour du statut par le pro.
     */
    public function updateStatus(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $appointment = Appointment::find($id);

        if (!$appointment) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        $body = Response::body();
        $status = $body['status'] ?? '';
        $allowed = ['pending', 'confirmed', 'completed', 'cancelled'];

        if (!in_array($status, $allowed, true)) {
            Response::json(['error' => 'Statut invalide'], 400);
        }

        $reason = $body['reason'] ?? null;
        Appointment::updateStatus($id, $status, $reason);

        Response::json(Appointment::find($id));
    }

    /**
     * PUT /appointments/:id/reschedule — Reprogrammation de la date et l'heure par le pro.
     */
    public function reschedule(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $appointment = Appointment::find($id);

        if (!$appointment) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }

        $body = Response::body();
        $startDatetime = $body['start_datetime'] ?? '';

        if (empty($startDatetime)) {
            Response::json(['error' => 'Nouvelle date et heure requises'], 400);
        }

        $startTime = strtotime($startDatetime);
        if (!$startTime) {
            Response::json(['error' => 'Format de date invalide'], 400);
        }

        // Calcul de la nouvelle heure de fin selon la durée de la prestation
        $service = Service::find((int)$appointment['service_id']);
        $durationMinutes = $service ? (int)$service['duration_minutes'] : 60;
        $endTime = $startTime + ($durationMinutes * 60);

        $newStart = date('Y-m-d H:i:s', $startTime);
        $newEnd   = date('Y-m-d H:i:s', $endTime);

        Appointment::reschedule($id, $newStart, $newEnd);

        // Si le rendez-vous était échu ou annulé, on peut réactiver son statut à confirmed
        $newStatus = $body['status'] ?? null;
        if ($newStatus && in_array($newStatus, ['pending', 'confirmed'], true)) {
            Appointment::updateStatus($id, $newStatus);
        }

        Response::json(Appointment::find($id));
    }
}

