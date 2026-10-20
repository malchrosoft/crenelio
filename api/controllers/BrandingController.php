<?php
/**
 * BrandingController — Lecture, remplacement et suppression du logo et du favicon.
 */

require_once __DIR__ . '/../core/Branding.php';
require_once __DIR__ . '/../core/Response.php';

class BrandingController
{
    /**
     * GET /branding/:kind — Sert le fichier (favicon par défaut si absent).
     * `?format=ico|png|svg` restreint à une extension.
     */
    public function show(array $params): void
    {
        $kind = $this->kind($params);
        $ext  = isset($_GET['format']) ? (string)$_GET['format'] : null;
        $path = Branding::resolve($kind, $ext);
        if (!$path) {
            Response::json(['error' => 'Aucun fichier'], 404);
        }

        $type = pathinfo($path, PATHINFO_EXTENSION);
        header('Content-Type: ' . Branding::MIME[$type]);
        header('Cache-Control: public, max-age=300');
        header('X-Content-Type-Options: nosniff');
        if ($type === 'svg') {
            // Neutralise tout script si le SVG est ouvert directement
            header("Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox");
        }
        readfile($path);
        exit;
    }

    /**
     * POST /admin/branding/:kind — Remplace tous les fichiers du type par ceux envoyés.
     * Champs multipart attendus : un fichier par extension (`png`, `svg`, `ico`).
     */
    public function upload(array $params): void
    {
        $kind    = $this->kind($params);
        $allowed = array_map(fn($name) => pathinfo($name, PATHINFO_EXTENSION), Branding::FILES[$kind]);

        $files = [];
        foreach ($allowed as $ext) {
            $file = $_FILES[$ext] ?? null;
            if (!$file || $file['error'] === UPLOAD_ERR_NO_FILE) {
                continue;
            }
            if ($file['error'] !== UPLOAD_ERR_OK || $file['size'] > Branding::MAX_BYTES) {
                Response::json(['error' => 'Fichier trop volumineux (2 Mo maximum)'], 400);
            }
            $content = file_get_contents($file['tmp_name']);
            if (!Branding::isValid($ext, $content)) {
                Response::json(['error' => "Fichier $ext invalide ou non autorisé"], 400);
            }
            $files["$kind.$ext"] = $content;
        }

        if (!$files) {
            Response::json(['error' => 'Aucun fichier reçu'], 400);
        }
        if (!is_dir(Branding::dir()) && !mkdir(Branding::dir(), 0775, true)) {
            Response::json(['error' => 'Dossier de stockage inaccessible'], 500);
        }

        Branding::clear($kind);
        foreach ($files as $name => $content) {
            if (file_put_contents(Branding::dir() . "/$name", $content) === false) {
                Response::json(['error' => 'Écriture impossible dans le dossier de stockage'], 500);
            }
        }

        clearstatcache();
        Response::json(Branding::urls());
    }

    /** DELETE /admin/branding/:kind — Supprime le fichier (retour au repli). */
    public function destroy(array $params): void
    {
        Branding::clear($this->kind($params));
        clearstatcache();
        Response::json(Branding::urls());
    }

    private function kind(array $params): string
    {
        $kind = $params['kind'] ?? '';
        if (!isset(Branding::FILES[$kind])) {
            Response::json(['error' => 'Type inconnu'], 404);
        }
        return $kind;
    }
}
