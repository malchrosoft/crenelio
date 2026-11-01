<?php
/**
 * QuoteController — Devis en ligne (Item 22) : gestion dans l'Espace Artisan, consultation et
 * réponse du client par lien à jeton.
 */

require_once __DIR__ . '/../models/Quote.php';
require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/RateLimit.php';
require_once __DIR__ . '/../core/Response.php';

class QuoteController
{
    /** GET /quotes */
    public function index(): void
    {
        Response::json(Quote::all());
    }

    /** GET /quotes/:id */
    public function show(array $params): void
    {
        Response::json(self::findOr404((int)($params['id'] ?? 0)));
    }

    /**
     * POST /quotes — Brouillon. Avec `appointment_id` seul, prérempli depuis le rendez-vous
     * (client, prestation, frais de déplacement) ; les champs fournis priment.
     */
    public function store(): void
    {
        $body = Response::body();
        $appointmentId = isset($body['appointment_id']) ? (int)$body['appointment_id'] : null;
        if ($appointmentId !== null) {
            $appointment = Appointment::find($appointmentId);
            if (!$appointment) {
                Response::json(['error' => 'Rendez-vous non trouvé'], 404);
            }
            $body = array_merge(Quote::draftFromAppointment($appointment), array_filter($body, fn($v) => $v !== null));
        }

        $vatMode = Config::get('quote_vat_mode', 'franchise') === 'vat' ? 'vat' : 'franchise';
        $error = Quote::validate($body, $vatMode);
        if ($error !== null) {
            Response::json(['error' => $error], 400);
        }
        Response::json(Quote::find(Quote::create($body, $vatMode)), 201);
    }

    /** PUT /quotes/:id — Brouillon uniquement : un devis envoyé ne change plus. */
    public function update(array $params): void
    {
        $quote = self::findOr404((int)($params['id'] ?? 0));
        if (Quote::isLocked($quote)) {
            Response::json(['error' => 'Devis déjà envoyé : il ne peut plus être modifié. Créez-en un nouveau.'], 409);
        }
        $body = Response::body();
        $error = Quote::validate($body, $quote['vat_mode']);
        if ($error !== null) {
            Response::json(['error' => $error], 400);
        }
        if (!Quote::update((int)$quote['id'], $body)) {
            Response::json(['error' => 'Devis déjà envoyé : il ne peut plus être modifié.'], 409);
        }
        Response::json(Quote::find((int)$quote['id']));
    }

    /** DELETE /quotes/:id — Brouillon uniquement (un devis envoyé reste comme trace). */
    public function destroy(array $params): void
    {
        if (!Quote::deleteDraft((int)($params['id'] ?? 0))) {
            Response::json(['error' => 'Seul un brouillon peut être supprimé.'], 409);
        }
        Response::json(['deleted' => true]);
    }

    /** POST /quotes/:id/send — Numéro, lien client et échéance (l'email suit à l'étape 3 de l'Item 22). */
    public function send(array $params): void
    {
        $quote = self::findOr404((int)($params['id'] ?? 0));
        if (!Quote::markSent((int)$quote['id'])) {
            Response::json(['error' => 'Devis déjà envoyé.'], 409);
        }
        Response::json(Quote::find((int)$quote['id']));
    }

    /** GET /quotes/token/:token — Consultation par le client (sans IP ni lien interne). */
    public function showByToken(array $params): void
    {
        $quote = Quote::findByToken((string)($params['token'] ?? ''));
        if (!$quote) {
            Response::json(['error' => 'Devis introuvable.'], 404);
        }
        unset($quote['decision_ip'], $quote['appointment_id'], $quote['token']);
        Response::json($quote);
    }

    /**
     * POST /quotes/token/:token/decision — `action` accept | refuse.
     * Accepter exige : la réponse sur les pièces remplacées (`keep_parts`, arrêté du 24 janvier 2017,
     * annexe 2 ; refuser de les garder vaut décharge) ; le mandat d'achat au nom du client si le devis
     * contient des débours ; hors urgence, la prise de connaissance du droit de rétractation
     * (`withdrawal_ack`). `early_execution` : demande expresse de commencer avant la fin du délai.
     */
    public function decide(array $params): void
    {
        if (!RateLimit::hit(RateLimit::ipBucket('quote-decision'), 20, 3600)) {
            Response::json(['error' => 'Trop de tentatives. Réessayez plus tard.'], 429);
        }
        $quote = Quote::findByToken((string)($params['token'] ?? ''));
        if (!$quote) {
            Response::json(['error' => 'Devis introuvable.'], 404);
        }
        if ($quote['status'] !== 'sent') {
            Response::json(['error' => $quote['status'] === 'expired' ? 'Ce devis a expiré.' : 'Ce devis a déjà reçu une réponse.'], 409);
        }

        $body = Response::body();
        $action = $body['action'] ?? '';
        if (!in_array($action, ['accept', 'refuse'], true)) {
            Response::json(['error' => 'Action invalide (accept ou refuse attendu)'], 400);
        }
        $accepted = $action === 'accept';
        $keepParts = isset($body['keep_parts']) ? (bool)$body['keep_parts'] : null;
        $mandate = (bool)($body['debours_mandate'] ?? false);
        if ($accepted && $keepParts === null) {
            Response::json(['error' => 'Indiquez si vous souhaitez conserver les pièces remplacées.'], 400);
        }
        if ($accepted && (float)$quote['total_debours'] > 0 && !$mandate) {
            Response::json(['error' => "L'achat des pièces en votre nom nécessite votre mandat."], 400);
        }
        if ($accepted && !$quote['urgent'] && empty($body['withdrawal_ack'])) {
            Response::json(['error' => 'Confirmez avoir pris connaissance de votre droit de rétractation.'], 400);
        }
        $early = $accepted && !$quote['urgent'] && !empty($body['early_execution']);
        $reason = $accepted ? null : (trim((string)($body['reason'] ?? '')) ?: null);

        if (!Quote::decide((int)$quote['id'], $accepted, $keepParts, $accepted && $mandate, $early, $reason)) {
            Response::json(['error' => 'Ce devis a déjà reçu une réponse.'], 409);
        }
        Response::json(['status' => $accepted ? 'accepted' : 'refused']);
    }

    private static function findOr404(int $id): array
    {
        $quote = Quote::find($id);
        if (!$quote) {
            Response::json(['error' => 'Devis non trouvé'], 404);
        }
        return $quote;
    }
}
