<?php
/**
 * Front Controller — single entry point for all API requests.
 *
 * On OVH shared hosting, .htaccess rewrites all /api/* requests
 * to this file. It bootstraps the config, loads routes, and
 * dispatches the request.
 */

// Error reporting: show errors in dev, log only in production
if (defined('APP_DEBUG') && APP_DEBUG) {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
}

// Load configuration
require_once __DIR__ . '/config/config.php';

// Load core classes
require_once __DIR__ . '/core/Response.php';

// Toute erreur non interceptée : journalisée, et une réponse JSON lisible au lieu d'une page 500 vide
set_exception_handler(function (Throwable $e): void {
    error_log('[Crenelio] Erreur non interceptée : ' . $e->getMessage() . ' (' . basename($e->getFile()) . ':' . $e->getLine() . ')');
    if (!headers_sent()) {
        Response::json(['error' => "Erreur interne du serveur (détail dans le journal d'erreurs de l'hébergement)"], 500);
    }
});
register_shutdown_function(function (): void {
    $error = error_get_last();
    if (!$error || !in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        return;
    }
    error_log('[Crenelio] Erreur fatale : ' . $error['message'] . ' (' . basename($error['file']) . ':' . $error['line'] . ')');
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => "Erreur interne du serveur (détail dans le journal d'erreurs de l'hébergement)"], JSON_UNESCAPED_UNICODE);
    }
});

// Handle CORS preflight
Response::handlePreflight();

// Load and dispatch routes
$router = require_once __DIR__ . '/routes/api.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri    = $_SERVER['REQUEST_URI'];

// Strip the /api prefix if present (depends on .htaccess setup)
$apiPrefix = '/api';
if (str_starts_with($uri, $apiPrefix)) {
    $uri = substr($uri, strlen($apiPrefix));
}

// Ensure URI starts with /
if (!str_starts_with($uri, '/')) {
    $uri = '/' . $uri;
}

$router->dispatch($method, $uri);
