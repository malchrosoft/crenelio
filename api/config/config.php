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

// CORS settings — adjust to your domain in production
define('CORS_ORIGIN', env('CORS_ORIGIN', '*'));
