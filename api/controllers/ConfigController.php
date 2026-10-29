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
            if (!preg_match('/^[a-z][a-z0-9_]{0,63}$/', (string)$key) || str_starts_with((string)$key, 'branding_')
                || str_starts_with((string)$key, Config::UI_STATE_PREFIX)) {
                Response::json(['error' => "Clé de configuration invalide : $key"], 400);
            }
        }

        // Mot de passe et email professionnel : routes dédiées, avec vérification (Item 25)
        if (array_key_exists('admin_password', $body) || array_key_exists('admin_password_hash', $body)) {
            Response::json(['error' => 'Le mot de passe se change depuis la section Sécurité'], 400);
        }
        if (array_key_exists('pro_email', $body) && trim((string)$body['pro_email']) !== trim((string)Config::get('pro_email'))) {
            Response::json(['error' => "L'email professionnel se modifie avec vérification (bouton « Modifier »)"], 400);
        }
        unset($body['pro_email']);

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
        $authenticated = Auth::isAuthenticated();
        Response::json([
            'authenticated'        => $authenticated,
            'two_factor'           => Auth::twoFactorAvailable(),
            // Mot de passe par défaut : changement imposé (toléré en développement, avec avertissement)
            'default_password'     => $authenticated && Auth::usesDefaultPassword(),
            'must_change_password' => $authenticated && Auth::mustChangePassword(),
        ]);
    }

    /** POST /admin/logout */
    public function logout(): void
    {
        Auth::logout();
        Response::json(['success' => true]);
    }

    // -----------------------------------------------------------------
    // Mot de passe & email professionnel (Item 25)
    // -----------------------------------------------------------------

    /** POST /admin/password — Changement depuis l'espace Pro (ancien mot de passe requis). */
    public function changePassword(): void
    {
        $body = Response::body();
        Auth::changePassword((string)($body['current'] ?? ''), (string)($body['password'] ?? ''));
        Response::json(['message' => 'Mot de passe modifié. Les autres sessions ont été fermées.']);
    }

    /** POST /admin/password/forgot — Code de réinitialisation vers l'email professionnel. */
    public function forgotPassword(): void
    {
        Auth::requestReset();
        // Même réponse dans tous les cas : un tiers n'apprend rien
        Response::json(['message' => "Si l'envoi d'emails est configuré, un code vient d'être envoyé à l'email professionnel."]);
    }

    /** POST /admin/password/reset — Code reçu + nouveau mot de passe ; ouvre la session. */
    public function resetPassword(): void
    {
        $body = Response::body();
        $code = preg_replace('/\D/', '', (string)($body['code'] ?? ''));
        if (strlen($code) !== 6) {
            Response::json(['error' => 'Le code comporte 6 chiffres'], 400);
        }
        Auth::completeReset($code, (string)($body['password'] ?? ''));
        Response::json(['status' => 'authenticated', 'two_factor' => Auth::twoFactorAvailable()]);
    }

    /** POST /admin/pro-email — Nouvelle adresse : code envoyé à cette adresse. */
    public function requestProEmail(): void
    {
        $email = trim((string)(Response::body()['email'] ?? ''));
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::json(['error' => 'Adresse email invalide'], 400);
        }
        if (strcasecmp($email, (string)Config::get('pro_email')) === 0) {
            Response::json(['error' => "C'est déjà l'email professionnel"], 400);
        }
        Response::json(Auth::requestEmailChange($email) + ['pro_email' => Config::get('pro_email')]);
    }

    /** POST /admin/pro-email/confirm — Code reçu sur la nouvelle adresse. */
    public function confirmProEmail(): void
    {
        $code = preg_replace('/\D/', '', (string)(Response::body()['code'] ?? ''));
        if (strlen($code) !== 6) {
            Response::json(['error' => 'Le code comporte 6 chiffres'], 400);
        }
        Response::json(['status' => 'saved', 'pro_email' => Auth::confirmEmailChange($code)]);
    }
}
