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
     * Champs multipart attendus : un fichier par extension (`png`, `svg`, `ico`),
     * plus `email` pour le logo (copie PNG allégée destinée aux emails).
     */
    public function upload(array $params): void
    {
        $kind    = $this->kind($params);
        $allowed = array_map(fn($name) => pathinfo($name, PATHINFO_EXTENSION), Branding::FILES[$kind]);

        // Champ multipart => [extension attendue, nom du fichier enregistré]
        $fields = [];
        foreach ($allowed as $ext) {
            $fields[$ext] = [$ext, "$kind.$ext"];
        }
        if ($kind === 'logo') {
            $fields['email'] = ['png', Branding::EMAIL_LOGO_FILE];
        }

        $files = [];
        foreach ($fields as $field => [$ext, $name]) {
            $file = $_FILES[$field] ?? null;
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
            $files[$name] = $content;
        }

        if (!array_diff_key($files, [Branding::EMAIL_LOGO_FILE => true])) {
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
