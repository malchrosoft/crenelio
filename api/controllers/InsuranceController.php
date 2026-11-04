<?php
/**
 * InsuranceController — Attestation d'assurance décennale du professionnel (Espace Artisan) : état,
 * consultation, dépôt du PDF avec sa date de fin de validité, suppression (C. assur. L243-2).
 */

require_once __DIR__ . '/../core/InsuranceAttestation.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/Response.php';

class InsuranceController
{
    /** GET /admin/insurance-attestation */
    public function status(): void
    {
        Response::json(InsuranceAttestation::status());
    }

    /** GET /admin/insurance-attestation/file */
    public function file(): void
    {
        if (!InsuranceAttestation::path()) {
            Response::json(['error' => 'Aucune attestation'], 404);
        }
        InsuranceAttestation::serve();
    }

    /** POST /admin/insurance-attestation — multipart : `file` (PDF, facultatif si déjà déposé), `valid_until` (AAAA-MM-JJ). */
    public function upload(): void
    {
        $until = (string)($_POST['valid_until'] ?? '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $until)) {
            Response::json(['error' => "Indiquez la date de fin de validité de l'attestation."], 400);
        }
        $file = $_FILES['file'] ?? null;
        if ($file && $file['error'] !== UPLOAD_ERR_NO_FILE) {
            if ($file['error'] !== UPLOAD_ERR_OK) {
                Response::json(['error' => 'Envoi du fichier impossible (2 Mo maximum).'], 400);
            }
            $error = InsuranceAttestation::save((string)file_get_contents($file['tmp_name']));
            if ($error !== null) {
                Response::json(['error' => $error], 400);
            }
        } elseif (!InsuranceAttestation::path()) {
            Response::json(['error' => "Joignez le PDF de l'attestation remise par votre assureur."], 400);
        }
        Config::set('insurance_attestation_until', $until);
        clearstatcache();
        Response::json(InsuranceAttestation::status());
    }

    /** DELETE /admin/insurance-attestation */
    public function destroy(): void
    {
        InsuranceAttestation::clear();
        Config::set('insurance_attestation_until', '');
        clearstatcache();
        Response::json(InsuranceAttestation::status());
    }
}
