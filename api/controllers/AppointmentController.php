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
require_once __DIR__ . '/../core/SlotEngine.php';
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

        self::purgeExpiredOncePerDay();
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

        // Sans déplacement, le rendez-vous a lieu dans les locaux : l'adresse est celle de l'entreprise
        $config = Config::getAll();
        if (TravelFee::isPremisesOnly($config)) {
            $body['address']     = $config['premises_address'] ?? '';
            $body['postal_code'] = $config['premises_postal_code'] ?? '';
            $body['city']        = $config['premises_city'] ?? '';
            unset($body['latitude'], $body['longitude']);
            if ($body['address'] === '' || $body['city'] === '') {
                Response::json(['error' => "L'adresse des locaux n'est pas renseignée : réservation impossible pour le moment."], 503);
            }
        }

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

        // Frais de déplacement : recalculés côté serveur, le devis client n'est jamais
        // source de vérité (il n'est qu'un affichage de transparence tarifaire).
        [$latitude, $longitude] = TravelFeeController::readCoordinates($body);
        $travelQuote = TravelFee::quote($service, $latitude, $longitude, $config);

        if ($travelQuote['needs_coordinates']) {
            Response::json([
                'error' => "Veuillez sélectionner votre adresse dans les suggestions proposées pour la localiser précisément (zone d'intervention ou frais de déplacement)."
            ], 400);
        }

        if ($travelQuote['is_out_of_zone']) {
            Response::json([
                'error'      => $travelQuote['out_of_zone_reason'] === 'commune'
                    ? "L'adresse indiquée se situe dans une commune qui ne fait pas partie de la zone d'intervention. La réservation en ligne n'est pas possible, mais une demande exceptionnelle reste envisageable."
                    : sprintf(
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

        // Le créneau doit faire partie de ceux proposés : horaires de travail, durée de la prestation,
        // indisponibilités, rendez-vous existants avec temps de trajet, délai minimal et horizon
        if (!SlotEngine::isAvailable($service, $startDatetime, $config)) {
            Response::json([
                'error' => "Ce créneau n'est plus disponible (hors horaires, conflit de planning ou temps de déplacement insuffisant). Veuillez choisir un autre créneau."
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
    /**
     * POST /admin/appointments — Rendez-vous saisi par l'artisan depuis l'espace Artisan.
     * Toute saisie est acceptée : email et adresse facultatifs, heure libre, hors zone forcé
     * (signalé par `is_out_of_zone`). Confirmations envoyées seulement si `notify` est vrai.
     */
    public function adminStore(): void
    {
        $body = Response::body();
        foreach (['service_id', 'client_name', 'client_phone', 'start_datetime'] as $field) {
            if (empty($body[$field]) || !is_scalar($body[$field])) {
                Response::json(['error' => "Le champ '$field' est obligatoire"], 400);
            }
        }
        $email = trim((string)($body['client_email'] ?? ''));
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Adresse email invalide'], 400);
        }
        $startDatetime = (string)$body['start_datetime'];
        if (!preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $startDatetime) || strtotime($startDatetime) === false) {
            Response::json(['error' => 'Date et heure invalides'], 400);
        }

        $service = Service::find((int)$body['service_id']);
        if (!$service) {
            Response::json(['error' => 'Prestation introuvable'], 404);
        }

        $config = Config::getAll();
        $address = (string)($body['address'] ?? '');
        $postalCode = (string)($body['postal_code'] ?? '');
        $city = (string)($body['city'] ?? '');
        if (TravelFee::isPremisesOnly($config)) {
            $address = $config['premises_address'] ?? '';
            $postalCode = $config['premises_postal_code'] ?? '';
            $city = $config['premises_city'] ?? '';
        }

        [$latitude, $longitude] = TravelFeeController::readCoordinates($body);
        $quote = TravelFee::quote($service, $latitude, $longitude, $config);
        $durationMinutes = (int)$service['duration_minutes'];

        $appointment = Appointment::create([
            'service_id'     => (int)$service['id'],
            'client_name'    => mb_substr((string)$body['client_name'], 0, 255),
            'client_email'   => $email,
            'client_phone'   => mb_substr((string)$body['client_phone'], 0, 50),
            'address'        => $address,
            'postal_code'    => mb_substr($postalCode, 0, 20),
            'city'           => mb_substr($city, 0, 100),
            'travel_fee'     => $quote['travel_fee'],
            'distance_km'    => $quote['distance_km'],
            'is_out_of_zone' => $quote['is_out_of_zone'],
            'notes'          => isset($body['notes']) ? mb_substr((string)$body['notes'], 0, 2000) : null,
            'start_datetime' => $startDatetime,
            'end_datetime'   => date('Y-m-d H:i:s', strtotime("+$durationMinutes minutes", strtotime($startDatetime))),
            'status'         => 'confirmed',
        ]);

        $notifications = !empty($body['notify']) ? Notifier::sendBookingConfirmations($appointment, $config) : [];

        Response::json([
            'message'       => 'Rendez-vous enregistré',
            'appointment'   => $appointment,
            'travel'        => $quote,
            'notifications' => $notifications,
        ], 201);
    }

    /**
     * POST /appointments/exceptional-request — Demande d'intervention hors zone (Public).
     * Réservée aux adresses hors zone à moins du rayon + 10 % ; au-delà, l'adresse n'est pas desservie.
     * Crée un rendez-vous « pending » qui bloque le créneau, envoie l'accusé de réception au client
     * et la demande à l'artisan, qui accepte ou refuse via le lien de l'email.
     */
    public function exceptionalRequest(): void
    {
        $body = Response::body();
        foreach (['service_id', 'client_name', 'client_email', 'client_phone', 'address', 'postal_code', 'city', 'start_datetime'] as $field) {
            if (empty($body[$field]) || !is_scalar($body[$field])) {
                Response::json(['error' => "Le champ '$field' est obligatoire"], 400);
            }
        }
        if (!filter_var($body['client_email'], FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Adresse email invalide'], 400);
        }

        $service = Service::find((int)$body['service_id']);
        if (!$service || !$service['is_active']) {
            Response::json(['error' => 'Prestation sélectionnée non trouvée ou inactive'], 404);
        }

        $config = Config::getAll();
        [$latitude, $longitude] = TravelFeeController::readCoordinates($body);
        $quote = TravelFee::quote($service, $latitude, $longitude, $config);
        if (!$quote['is_out_of_zone'] || !$quote['can_request_exception']) {
            Response::json([
                'error' => $quote['is_out_of_zone']
                    ? "Cette adresse n'est pas desservie."
                    : "Cette adresse est dans la zone d'intervention : vous pouvez réserver directement.",
            ], 422);
        }

        $startDatetime = (string)$body['start_datetime'];
        if (!SlotEngine::isAvailable($service, $startDatetime, $config)) {
            Response::json([
                'error' => "Ce créneau n'est plus disponible. Veuillez choisir un autre créneau."
            ], 409);
        }

        $durationMinutes = (int)$service['duration_minutes'];
        $appointment = Appointment::create([
            'service_id'     => (int)$service['id'],
            'client_name'    => mb_substr((string)$body['client_name'], 0, 255),
            'client_email'   => (string)$body['client_email'],
            'client_phone'   => mb_substr((string)$body['client_phone'], 0, 50),
            'address'        => (string)$body['address'],
            'postal_code'    => mb_substr((string)$body['postal_code'], 0, 20),
            'city'           => mb_substr((string)$body['city'], 0, 100),
            'travel_fee'     => $quote['travel_fee'],
            'distance_km'    => $quote['distance_km'],
            'is_out_of_zone' => true,
            'notes'          => isset($body['notes']) ? mb_substr((string)$body['notes'], 0, 2000) : null,
            'start_datetime' => $startDatetime,
            'end_datetime'   => date('Y-m-d H:i:s', strtotime("+$durationMinutes minutes", strtotime($startDatetime))),
            'status'         => 'pending',
            'decision_token' => bin2hex(random_bytes(32)),
        ]);

        // Ne lève jamais : un échec d'envoi est journalisé et visible dans l'espace Artisan
        $notifications = Notifier::sendExceptionRequest($appointment, $config);

        Response::json([
            'message'       => 'Demande transmise',
            'notifications' => $notifications,
        ], 201);
    }

    /**
     * GET /appointments/decision/:token — Récapitulatif d'une demande exceptionnelle à décider (lien de l'email artisan).
     */
    public function decisionShow(array $params): void
    {
        $appointment = Appointment::findByDecisionToken((string)($params['token'] ?? ''));
        if (!$appointment) {
            Response::json(['error' => 'Demande introuvable ou déjà traitée.'], 404);
        }
        unset($appointment['cancel_token'], $appointment['decision_token']);
        Response::json($appointment);
    }

    /**
     * POST /appointments/decision/:token — Acceptation ou refus par l'artisan.
     * Accepter : rendez-vous confirmé et confirmations habituelles (client + artisan avec .ics).
     * Refuser : rendez-vous annulé, créneau libéré, client informé.
     */
    public function decide(array $params): void
    {
        $appointment = Appointment::findByDecisionToken((string)($params['token'] ?? ''));
        if (!$appointment) {
            Response::json(['error' => 'Demande introuvable ou déjà traitée.'], 404);
        }

        $action = Response::body()['action'] ?? '';
        if (!in_array($action, ['accept', 'refuse'], true)) {
            Response::json(['error' => 'Action invalide (accept ou refuse attendu)'], 400);
        }

        $accepted = $action === 'accept';
        $id = (int)$appointment['id'];
        if (!Appointment::decide($id, $accepted ? 'confirmed' : 'cancelled', $accepted ? null : "Demande hors zone refusée par l'artisan")) {
            Response::json(['error' => 'Demande déjà traitée.'], 409);
        }

        $config = Config::getAll();
        $appointment = Appointment::find($id);
        $notifications = $accepted
            ? Notifier::sendBookingConfirmations($appointment, $config)
            : [Notifier::sendExceptionRefused($appointment, $config)];

        Response::json([
            'status'        => $appointment['status'],
            'notifications' => $notifications,
        ]);
    }

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

        // Glisser-déposer du calendrier : le créneau doit être proposable (mêmes règles que la
        // réservation en ligne, le rendez-vous déplacé étant ignoré) ; `force` permet de passer outre
        if (!empty($body['check']) && empty($body['force']) && $service
            && !SlotEngine::isAvailable($service, date('Y-m-d H:i:s', $startTime), Config::getAll(), $id)) {
            Response::json([
                'error' => "Ce créneau n'est pas proposable (hors horaires, indisponibilité, délai minimal ou chevauchement avec un autre rendez-vous)",
                'code'  => 'slot_unavailable',
            ], 409);
        }
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

    /**
     * POST /appointments/:id/anonymize — Efface les données du client (demande d'effacement RGPD).
     */
    public function anonymize(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        if (!Appointment::find($id)) {
            Response::json(['error' => 'Rendez-vous non trouvé'], 404);
        }
        Appointment::anonymize($id);
        Response::json(['message' => 'Données du client effacées', 'appointment' => Appointment::find($id)]);
    }

    /**
     * Purge RGPD : anonymise les rendez-vous au-delà de la durée de conservation
     * (`rgpd_retention_months`, 36 par défaut). Lancée à l'ouverture du planning, une fois par jour
     * au plus : pas de tâche planifiée nécessaire sur un hébergement mutualisé.
     */
    private static function purgeExpiredOncePerDay(): void
    {
        $today = date('Y-m-d');
        if (Config::get('rgpd_last_purge') === $today) {
            return;
        }
        $months = (int)(Config::get('rgpd_retention_months') ?: Appointment::DEFAULT_RETENTION_MONTHS);
        $count = Appointment::purgeOlderThan(max(1, $months));
        Config::set('rgpd_last_purge', $today);
        if ($count > 0) {
            error_log("[Crenelio] RGPD : $count rendez-vous anonymisés (conservation $months mois)");
        }
    }
}
