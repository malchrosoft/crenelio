<?php
/**
 * ConfigController — Gestion et lecture de la configuration du pro.
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/Branding.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Auth.php';

class ConfigController
{
    /**
     * GET /config — Configuration publique accessible à tous (clients).
     */
    public function getPublic(): void
    {
        Response::json(Config::getPublic() + Branding::urls());
    }

    /**
     * GET /admin/config — Configuration complète pour l'espace pro.
     */
    public function getAll(): void
    {
        $config = Config::getAll();
        unset($config['admin_password_hash']);
        Response::json($config + Branding::urls());
    }

    /**
     * PUT /admin/config — Mise à jour des paramètres.
     */
    public function update(): void
    {
        $body = Response::body();
        if (empty($body)) {
            Response::json(['error' => 'Aucune donnée fournie'], 400);
        }

        // Clés libres (ex. vitrine_engagement_N) au format strict de `config_key` VARCHAR(64) ;
        // `branding_*` est calculé à la lecture (cf. Branding::urls), jamais stocké
        foreach (array_keys($body) as $key) {
            if (!preg_match('/^[a-z][a-z0-9_]{0,63}$/', (string)$key) || str_starts_with((string)$key, 'branding_')) {
                Response::json(['error' => "Clé de configuration invalide : $key"], 400);
            }
        }

        Config::updateMany($body);
        $updated = Config::getAll() + Branding::urls();
        unset($updated['admin_password_hash']);

        Response::json([
            'message' => 'Configuration mise à jour avec succès',
            'config'  => $updated
        ]);
    }

    /**
     * POST /admin/login — Mot de passe, puis session ouverte ou code envoyé par email.
     * Réponse : `status` = `authenticated` ou `otp_required` (avec `email_hint`).
     */
    public function login(): void
    {
        $body = Response::body();
        $password = (string)($body['password'] ?? '');

        if ($password === '') {
            Response::json(['error' => 'Mot de passe requis'], 400);
        }

        Auth::checkThrottle();
        if (!Config::verifyPassword($password)) {
            Auth::recordFailure();
            Response::json(['error' => 'Mot de passe incorrect'], 401);
        }
        Auth::clearFailures();

        Response::json(Auth::afterPassword() + ['two_factor' => Auth::twoFactorAvailable()]);
    }

    /** POST /admin/login/code — Code à 6 chiffres reçu par email. */
    public function verifyCode(): void
    {
        $code = preg_replace('/\D/', '', (string)(Response::body()['code'] ?? ''));
        if (strlen($code) !== 6) {
            Response::json(['error' => 'Le code comporte 6 chiffres'], 400);
        }
        Auth::verifyCode($code);
        Response::json(['status' => 'authenticated', 'two_factor' => true]);
    }

    /** GET /admin/session — État de la session (rechargement de page). */
    public function session(): void
    {
        Response::json([
            'authenticated' => Auth::isAuthenticated(),
            'two_factor'    => Auth::twoFactorAvailable(),
        ]);
    }

    /** POST /admin/logout */
    public function logout(): void
    {
        Auth::logout();
        Response::json(['success' => true]);
    }
}
