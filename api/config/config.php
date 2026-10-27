<?php
/**
 * Environment configuration.
 * On OVH shared hosting, set these via a .env file or hardcode
 * after deployment. Never commit real credentials to git.
 *
 * OVH Database credentials are found in your OVH control panel:
 * Web Hosting > Databases > (your database) > "Connection information"
 */

// Try to load .env file if it exists (for local development)
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        [$key, $value] = explode('=', $line, 2);
        $trimmedKey = trim($key);
        if (!getenv($trimmedKey)) {
            $_ENV[$trimmedKey] = trim($value);
        }
    }
}

function env(string $key, mixed $default = null): mixed
{
    $val = getenv($key);
    if ($val !== false) {
        return $val;
    }
    return $_ENV[$key] ?? $default;
}

// Database configuration
define('DB_HOST', env('DB_HOST', 'localhost'));
define('DB_PORT', env('DB_PORT', 3306));
define('DB_NAME', env('DB_NAME', ''));
define('DB_USER', env('DB_USER', ''));
define('DB_PASS', env('DB_PASS', ''));
define('DB_CHARSET', env('DB_CHARSET', 'utf8mb4'));

// Application settings
define('APP_ENV', env('APP_ENV', 'production'));
define('APP_DEBUG', APP_ENV === 'development');

// Fuseau de référence de l'artisan : les datetimes stockés en base sont
// naïfs et s'interprètent dans ce fuseau (créneaux, emails, fichiers iCal).
define('APP_TIMEZONE', env('APP_TIMEZONE', 'Europe/Paris'));
date_default_timezone_set(APP_TIMEZONE);

// URL publique du site, utilisée pour les liens de gestion envoyés par email
define('APP_URL', rtrim(env('APP_URL', ''), '/'));

// Envoi d'emails (SMTP) — jamais stocké en base, uniquement dans api/.env
define('SMTP_HOST',      env('SMTP_HOST', ''));
define('SMTP_PORT',      (int)env('SMTP_PORT', 587));
define('SMTP_USER',      env('SMTP_USER', ''));
define('SMTP_PASS',      env('SMTP_PASS', ''));
// 'starttls' (587, recommandé), 'tls' (465, TLS implicite) ou 'none'
define('SMTP_SECURE',    env('SMTP_SECURE', 'starttls'));
// Expéditeur : à défaut, noreply@ le domaine du site (APP_URL). Chez OVHcloud, ce domaine est
// forcément attaché à l'hébergement, condition pour que l'email soit authentifié.
define('SITE_DOMAIN', (function (): string {
    $host = strtolower((string)parse_url(APP_URL, PHP_URL_HOST));
    $host = preg_replace('/^www\./', '', $host);
    return (str_contains($host, '.') && !filter_var($host, FILTER_VALIDATE_IP)) ? $host : '';
})());
define('MAIL_FROM_AUTO', env('MAIL_FROM', '') === '' && SITE_DOMAIN !== '');
define('MAIL_FROM',      env('MAIL_FROM', '') ?: (SITE_DOMAIN !== '' ? 'noreply@' . SITE_DOMAIN : ''));
define('MAIL_FROM_NAME', env('MAIL_FROM_NAME', 'Crénelio'));

// CORS settings — adjust to your domain in production
define('CORS_ORIGIN', env('CORS_ORIGIN', '*'));
