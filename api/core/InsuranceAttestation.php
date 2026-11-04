<?php
/**
 * InsuranceAttestation — Attestation d'assurance de responsabilité décennale du professionnel (Item 22,
 * écart n° 10). C. assur. L243-2 : l'attestation, délivrée et signée par l'assureur (A243-2 à A243-5),
 * est **jointe aux devis et factures** des professionnels soumis à l'obligation (L241-1).
 *
 * Fichier PDF déposé tel quel dans api/storage/insurance/ (jamais servi directement, jamais versionné) ;
 * date de fin de validité dans `config.insurance_attestation_until` (non sensible).
 */

require_once __DIR__ . '/../models/Config.php';

class InsuranceAttestation
{
    public const MAX_BYTES = 2 * 1024 * 1024;
    private const FILE = 'attestation-decennale.pdf';

    public static function dir(): string
    {
        return __DIR__ . '/../storage/insurance';
    }

    public static function path(): ?string
    {
        $path = self::dir() . '/' . self::FILE;
        return is_file($path) ? $path : null;
    }

    public static function validUntil(): ?string
    {
        $date = (string)(Config::get('insurance_attestation_until') ?? '');
        return preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date : null;
    }

    /** Joignable à un devis : fichier présent et période de validité non échue. */
    public static function isValid(): bool
    {
        $until = self::validUntil();
        return self::path() !== null && $until !== null && $until >= date('Y-m-d');
    }

    public static function status(): array
    {
        $path = self::path();
        return [
            'exists'      => $path !== null,
            'size'        => $path ? filesize($path) : null,
            'uploaded_at' => $path ? date('Y-m-d H:i:s', filemtime($path)) : null,
            'valid_until' => self::validUntil(),
            'valid'       => self::isValid(),
        ];
    }

    /** Enregistre le PDF (contrôle de la signature `%PDF-` et de la taille) ; message d'erreur ou null. */
    public static function save(string $content): ?string
    {
        if (strlen($content) > self::MAX_BYTES) {
            return 'Fichier trop volumineux (2 Mo maximum).';
        }
        if (!str_starts_with($content, '%PDF-')) {
            return "Le fichier n'est pas un PDF.";
        }
        if (!is_dir(self::dir()) && !mkdir(self::dir(), 0775, true)) {
            return 'Dossier de stockage inaccessible.';
        }
        return file_put_contents(self::dir() . '/' . self::FILE, $content) === false
            ? 'Écriture impossible dans le dossier de stockage.'
            : null;
    }

    public static function clear(): void
    {
        $path = self::path();
        if ($path) {
            unlink($path);
        }
    }

    /** Pièce jointe d'email, ou null sans attestation valide. */
    public static function attachment(): ?array
    {
        if (!self::isValid()) {
            return null;
        }
        return ['filename' => 'attestation-assurance-decennale.pdf', 'mime' => 'application/pdf', 'content' => file_get_contents(self::path())];
    }

    /** Envoie le PDF au navigateur (affichage dans l'onglet). */
    public static function serve(): void
    {
        $path = self::path();
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="attestation-assurance-decennale.pdf"');
        header('Cache-Control: private, no-store');
        header('X-Content-Type-Options: nosniff');
        readfile($path);
        exit;
    }
}
