<?php
/**
 * ConfigController — Gestion et lecture de la configuration du pro.
 */

require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/Branding.php';
require_once __DIR__ . '/../core/Response.php';

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
     * POST /admin/login — Vérification du mot de passe admin.
     */
    public function login(): void
    {
        $body = Response::body();
        $password = $body['password'] ?? '';

        if (empty($password)) {
            Response::json(['error' => 'Mot de passe requis'], 400);
        }

        if (Config::verifyPassword($password)) {
            // Token de session d'administration simple
            $token = hash('sha256', $password . DB_NAME . date('Y-m-d'));
            Response::json([
                'success' => true,
                'token'   => $token,
                'message' => 'Connexion réussie'
            ]);
        } else {
            Response::json(['error' => 'Mot de passe incorrect'], 401);
        }
    }
}
