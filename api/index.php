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
