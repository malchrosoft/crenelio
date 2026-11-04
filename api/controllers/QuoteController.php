<?php
/**
 * QuoteController — Devis en ligne (Item 22) : gestion dans l'Espace Artisan, consultation et
 * réponse du client par lien à jeton.
 */

require_once __DIR__ . '/../models/Quote.php';
require_once __DIR__ . '/../models/Appointment.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../models/QuoteNotification.php';
require_once __DIR__ . '/../core/QuoteNotifier.php';
require_once __DIR__ . '/../core/InsuranceAttestation.php';
require_once __DIR__ . '/../core/QuotePdf.php';
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

    /**
     * POST /quotes/:id/send — Numéro, lien client et échéance, puis email au client avec le lien
     * de réponse. Exige l'email du client et l'adresse du site (APP_URL) : sans lien, le client ne
     * pourrait ni répondre ni se rétracter en ligne.
     */
    public function send(array $params): void
    {
        $quote = self::findOr404((int)($params['id'] ?? 0));
        if (!filter_var(trim((string)$quote['client_email']), FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => "Renseignez l'email du client : le devis lui est envoyé avec un lien pour répondre."], 400);
        }
        // Informations précontractuelles obligatoires (C. consom. L221-5 3°, R221-2 4°)
        if (trim((string)$quote['execution_terms']) === '') {
            Response::json(['error' => "Indiquez la date ou le délai d'exécution des travaux (information obligatoire)."], 400);
        }
        if (trim((string)$quote['payment_terms']) === '') {
            Response::json(['error' => 'Indiquez les modalités de paiement (information obligatoire).'], 400);
        }
        // Travaux relevant des garanties des constructeurs : attestation décennale jointe (C. assur. L243-2)
        if ((int)$quote['builder_works'] && !InsuranceAttestation::isValid()) {
            Response::json(['error' => "Déposez une attestation d'assurance décennale en cours de validité (écran Entreprise) : elle doit être jointe au devis (C. assur. L243-2)."], 400);
        }
        if (APP_URL === '') {
            Response::json(['error' => "Adresse du site inconnue (APP_URL dans api/.env) : impossible de créer le lien du devis."], 503);
        }
        if (!Quote::markSent((int)$quote['id'])) {
            Response::json(['error' => 'Devis déjà envoyé.'], 409);
        }
        $quote = Quote::find((int)$quote['id']);
        $quote['notifications'] = QuoteNotifier::sendQuote($quote, Config::getAll());
        Response::json($quote);
    }

    /**
     * GET /quotes/token/:token/attestation — Attestation d'assurance décennale jointe au devis (L243-2),
     * pour un devis de travaux relevant des garanties des constructeurs.
     */
    public function attestation(array $params): void
    {
        $quote = Quote::findByToken((string)($params['token'] ?? ''));
        if (!$quote || !(int)$quote['builder_works'] || !InsuranceAttestation::path()) {
            Response::json(['error' => 'Attestation indisponible.'], 404);
        }
        InsuranceAttestation::serve();
    }

    /**
     * GET /quotes/token/:token/:document.pdf — `devis` (devis complet), `mandat` (mandat de débours),
     * `formulaire` (formulaire type de rétractation remplissable, annexe R221-1), `declaration`
     * (déclaration de rétractation validée en ligne, L221-21 et D221-5).
     */
    public function withdrawalPdf(array $params): void
    {
        $quote = Quote::findByToken((string)($params['token'] ?? ''));
        $document = (string)($params['document'] ?? '');
        $available = $quote !== null && match ($document) {
            'devis'       => true,
            'mandat'      => (float)$quote['total_debours'] > 0,
            'formulaire'  => in_array($quote['status'], ['accepted', 'withdrawn'], true) && !(int)$quote['urgent'],
            'declaration' => $quote['status'] === 'withdrawn',
            default       => false,
        };
        if (!$available) {
            Response::json(['error' => 'Document indisponible.'], 404);
        }
        $config = Config::getAll();
        [$pdf, $name] = match ($document) {
            'devis'       => [QuotePdf::quote($quote, $config), 'devis'],
            'mandat'      => [QuotePdf::mandate($quote, $config), 'mandat-debours'],
            'formulaire'  => [QuotePdf::withdrawalForm($quote, $config, EmailTemplates::quoteWithdrawalUrl($quote)), 'formulaire-retractation'],
            'declaration' => [QuotePdf::withdrawalDeclaration($quote, $config), 'declaration-retractation'],
        };
        header('Content-Type: application/pdf');
        header(sprintf('Content-Disposition: attachment; filename="%s-%s.pdf"', $name, $quote['number']));
        header('Cache-Control: private, no-store');
        echo $pdf;
        exit;
    }

    /** GET /quotes/:id/notifications — Journal des emails du devis. */
    public function notifications(array $params): void
    {
        $quote = self::findOr404((int)($params['id'] ?? 0));
        Response::json(QuoteNotification::forQuote((int)$quote['id']));
    }

    /** GET /quotes/token/:token — Consultation par le client (sans IP ni lien interne). */
    public function showByToken(array $params): void
    {
        $quote = Quote::findByToken((string)($params['token'] ?? ''));
        if (!$quote) {
            Response::json(['error' => 'Devis introuvable.'], 404);
        }
        unset($quote['decision_ip'], $quote['mandate_ip'], $quote['withdrawal_ip'], $quote['appointment_id'], $quote['token']);
        $quote['can_withdraw'] = Quote::canWithdraw($quote);
        Response::json($quote);
    }

    /**
     * POST /quotes/token/:token/decision — `action` accept | refuse.
     * Accepter exige : la réponse sur les pièces remplacées (`keep_parts`, arrêté du 24 janvier 2017,
     * annexe 2 ; refuser de les garder vaut décharge) ; s'il y a des débours, une réponse distincte au
     * mandat de débours (`debours_mandate` true / false : document séparé, le client peut fournir
     * lui-même les pièces) ; hors urgence, la prise de connaissance du droit de rétractation
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
        $hasDebours = (float)$quote['total_debours'] > 0;
        $mandate = $hasDebours && isset($body['debours_mandate']) ? (bool)$body['debours_mandate'] : null;
        if ($accepted && $keepParts === null) {
            Response::json(['error' => 'Indiquez si vous souhaitez conserver les pièces remplacées.'], 400);
        }
        if ($accepted && $hasDebours && $mandate === null) {
            Response::json(['error' => "Répondez au mandat de débours : le professionnel achète les pièces en votre nom, ou vous les fournissez."], 400);
        }
        if ($accepted && !$quote['urgent'] && empty($body['withdrawal_ack'])) {
            Response::json(['error' => 'Confirmez avoir pris connaissance de votre droit de rétractation.'], 400);
        }
        $early = $accepted && !$quote['urgent'] && !empty($body['early_execution']);
        $reason = $accepted ? null : (trim((string)($body['reason'] ?? '')) ?: null);

        if (!Quote::decide((int)$quote['id'], $accepted, $keepParts, $accepted ? $mandate : null, $early, $reason)) {
            Response::json(['error' => 'Ce devis a déjà reçu une réponse.'], 409);
        }
        $quote = Quote::find((int)$quote['id']);
        Response::json([
            'status'        => $quote['status'],
            'notifications' => QuoteNotifier::sendDecision($quote, Config::getAll()),
        ]);
    }

    /**
     * POST /quotes/token/:token/withdraw — Fonction de rétractation en ligne (« Renoncer au contrat
     * ici » puis « Confirmer la rétractation », obligatoire depuis le 19 juin 2026) : le client
     * indique ou confirme son nom et l'email de l'accusé de réception, envoyé sur support durable
     * avec le contenu de la déclaration, sa date et son heure.
     */
    public function withdraw(array $params): void
    {
        if (!RateLimit::hit(RateLimit::ipBucket('quote-withdrawal'), 10, 3600)) {
            Response::json(['error' => 'Trop de tentatives. Réessayez plus tard.'], 429);
        }
        $quote = Quote::findByToken((string)($params['token'] ?? ''));
        if (!$quote) {
            Response::json(['error' => 'Devis introuvable.'], 404);
        }
        if (!Quote::canWithdraw($quote)) {
            Response::json(['error' => 'La rétractation n\'est plus possible pour ce devis (délai dépassé, intervention urgente ou devis non accepté).'], 409);
        }
        $body = Response::body();
        $name = trim((string)($body['name'] ?? ''));
        $email = trim((string)($body['email'] ?? ''));
        if ($name === '') {
            Response::json(['error' => 'Indiquez votre nom et prénom.'], 400);
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => "Indiquez l'adresse email où recevoir l'accusé de réception."], 400);
        }
        $address = trim((string)($body['address'] ?? ''));
        if (!Quote::withdraw((int)$quote['id'], mb_substr($name, 0, 255), mb_substr($email, 0, 255), $address === '' ? null : mb_substr($address, 0, 500))) {
            Response::json(['error' => 'La rétractation n\'est plus possible pour ce devis.'], 409);
        }
        $quote = Quote::find((int)$quote['id']);
        Response::json([
            'status'        => 'withdrawn',
            'withdrawn_at'  => $quote['withdrawn_at'],
            'notifications' => QuoteNotifier::sendWithdrawal($quote, Config::getAll()),
        ]);
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
