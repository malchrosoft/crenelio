<?php
/**
 * HealthController — État d'installation, public et sans secret (Item 27).
 *
 * Interrogé par `npm run deploy:init` pour savoir si le serveur est déjà installé :
 * - `database` : `ok`, `empty` (base joignable mais socle non importé) ou `error` (connexion impossible) ;
 * - `installed` : base joignable et socle importé (`config` présente) ;
 * - `schema_version` : dernière migration appliquée (clé `config.schema_version`), null si inconnue.
 * - `storage` : `ok`, ou `error` si un dossier de `api/storage/` manque ou n'est pas accessible en écriture
 *   (`storage_unwritable` les nomme : clé de session, logo, zone, attestation, jours fériés en dépendent).
 * Aucun détail d'erreur, de version PHP ni d'identifiant n'est renvoyé.
 */

require_once __DIR__ . '/../core/Response.php';

class HealthController
{
    /** Dossiers de `api/storage/` où PHP doit pouvoir écrire. */
    private const STORAGE_DIRS = ['auth', 'branding', 'zone', 'insurance', 'holidays'];

    /** GET /health */
    public function show(): void
    {
        $database = 'error';
        $schemaVersion = null;

        try {
            // Connexion dédiée : Database::getConnection() interrompt la requête en cas d'échec
            $pdo = new PDO(
                sprintf('mysql:host=%s;port=%s;dbname=%s;charset=%s', DB_HOST, DB_PORT, DB_NAME, DB_CHARSET),
                DB_USER,
                DB_PASS,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 5]
            );
            $database = 'empty';
            $statement = $pdo->prepare('SELECT config_value FROM `config` WHERE config_key = ?');
            $statement->execute(['schema_version']);
            $schemaVersion = $statement->fetchColumn() ?: null;
            $database = 'ok';
        } catch (Throwable $e) {
            error_log('[Crenelio] Contrôle d\'installation : ' . $e->getMessage());
        }

        $unwritable = array_values(array_filter(
            self::STORAGE_DIRS,
            fn(string $dir) => !is_dir(__DIR__ . '/../storage/' . $dir) || !is_writable(__DIR__ . '/../storage/' . $dir)
        ));

        Response::json([
            'app'                => 'crenelio',
            'installed'          => $database === 'ok',
            'database'           => $database,
            'schema_version'     => $schemaVersion,
            'storage'            => $unwritable ? 'error' : 'ok',
            'storage_unwritable' => $unwritable,
        ]);
    }
}
