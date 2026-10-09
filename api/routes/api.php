<?php
/**
 * API routes definition.
 * All routes are prefixed with /api (handled by .htaccess rewrite rules).
 */

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../controllers/UserController.php';
require_once __DIR__ . '/../core/Response.php';

$router = new Router();
$userController = new UserController();

// Users CRUD routes
$router->get('/users',        [$userController, 'index']);
$router->get('/users/:id',    [$userController, 'show']);
$router->post('/users',       [$userController, 'store']);
$router->put('/users/:id',    [$userController, 'update']);
$router->delete('/users/:id', [$userController, 'destroy']);

return $router;
