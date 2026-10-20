<?php
/**
 * Branding — logo et favicon stockés comme fichiers sous leurs noms d'usage.
 *
 * Les fichiers vivent dans `api/storage/branding/` et peuvent aussi y être déposés à la main
 * (FTP) : `logo.svg`, `logo.png`, `favicon.png`, `favicon.svg`, `favicon.ico`.
 * Le premier nom présent, dans l'ordre ci-dessous, est celui servi.
 */

class Branding
{
    /** Noms reconnus par type, par ordre de priorité. */
    public const FILES = [
        'logo'    => ['logo.svg', 'logo.png'],
        'favicon' => ['favicon.png', 'favicon.svg', 'favicon.ico'],
    ];

    public const MIME = [
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'ico' => 'image/x-icon',
    ];

    /** Taille maximale d'un fichier envoyé (octets). */
    public const MAX_BYTES = 2 * 1024 * 1024;

    /** Favicon servi quand aucun fichier n'est présent. */
    private const DEFAULT_FAVICON = __DIR__ . '/assets/default-favicon.svg';

    public static function dir(): string
    {
        return __DIR__ . '/../storage/branding';
    }

    /** Chemin du fichier servi pour un type, éventuellement restreint à une extension. */
    public static function find(string $kind, ?string $ext = null): ?string
    {
        foreach (self::FILES[$kind] ?? [] as $name) {
            if ($ext !== null && pathinfo($name, PATHINFO_EXTENSION) !== $ext) {
                continue;
            }
            $path = self::dir() . '/' . $name;
            if (is_file($path)) {
                return $path;
            }
        }
        return null;
    }

    /** Fichier à servir, avec repli sur le favicon par défaut. */
    public static function resolve(string $kind, ?string $ext = null): ?string
    {
        return self::find($kind, $ext) ?? ($kind === 'favicon' && $ext === null ? self::DEFAULT_FAVICON : null);
    }

    /**
     * URLs publiques versionnées (null si absent), exposées avec la config.
     * Le paramètre `v` change à chaque remplacement pour contourner le cache navigateur.
     */
    public static function urls(): array
    {
        $urls = [];
        foreach (array_keys(self::FILES) as $kind) {
            $path = self::find($kind);
            $urls["branding_{$kind}_url"] = $path ? "/api/branding/$kind?v=" . filemtime($path) : null;
        }
        return $urls;
    }

    /**
     * Vérifie qu'un contenu correspond à son format déclaré.
     * Les SVG porteurs de script ou de gestionnaires d'événements sont refusés.
     */
    public static function isValid(string $ext, string $content): bool
    {
        return match ($ext) {
            'png' => str_starts_with($content, "\x89PNG\r\n\x1a\n"),
            'ico' => str_starts_with($content, "\x00\x00\x01\x00"),
            'svg' => stripos($content, '<svg') !== false
                && !preg_match('/<script|<foreignObject|\son[a-z]+\s*=|javascript:/i', $content),
            default => false,
        };
    }

    /** Supprime tous les fichiers d'un type. */
    public static function clear(string $kind): void
    {
        foreach (self::FILES[$kind] ?? [] as $name) {
            $path = self::dir() . '/' . $name;
            if (is_file($path)) {
                unlink($path);
            }
        }
    }
}
