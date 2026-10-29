<?php
/**
 * HealthController — État d'installation, public et sans secret (Item 27).
 *
 * Interrogé par `npm run deploy:init` pour savoir si le serveur est déjà installé :
 * - `database` : `ok`, `empty` (base joignable mais socle non importé) ou `error` (connexion impossible) ;
 * - `installed` : base joignable et socle importé (`config` présente) ;
 * - `schema_version` : dernière migration appliquée (clé `config.schema_version`), null si inconnue.
 * Aucun détail d'erreur, de version PHP ni d'identifiant n'est renvoyé.
 */

require_once __DIR__ . '/../core/Response.php';

class HealthController
{
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

        Response::json([
            'app'            => 'crenelio',
            'installed'      => $database === 'ok',
            'database'       => $database,
            'schema_version' => $schemaVersion,
        ]);
    }
}
