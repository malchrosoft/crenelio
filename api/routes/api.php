<?php
/**
 * API routes definition for Crénelio.
 * All routes are prefixed with /api (handled by .htaccess rewrite rules).
 */

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Response.php';

require_once __DIR__ . '/../controllers/ConfigController.php';
require_once __DIR__ . '/../controllers/ServiceController.php';
require_once __DIR__ . '/../controllers/ScheduleController.php';
require_once __DIR__ . '/../controllers/SlotController.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';

$router = new Router();

$configController      = new ConfigController();
$serviceController     = new ServiceController();
$scheduleController    = new ScheduleController();
$slotController        = new SlotController();
$appointmentController = new AppointmentController();

// -------------------------------------------------------------------
// 1. Configuration & Authentification Pro
// -------------------------------------------------------------------
$router->get('/config',                     [$configController, 'getPublic']);
$router->get('/admin/config',               [$configController, 'getAll']);
$router->put('/admin/config',               [$configController, 'update']);
$router->post('/admin/login',               [$configController, 'login']);

// -------------------------------------------------------------------
// 2. Prestations / Services
// -------------------------------------------------------------------
$router->get('/services',                   [$serviceController, 'index']);
$router->get('/services/:id',               [$serviceController, 'show']);
$router->post('/services',                  [$serviceController, 'store']);
$router->put('/services/:id',               [$serviceController, 'update']);
$router->delete('/services/:id',            [$serviceController, 'destroy']);

// -------------------------------------------------------------------
// 3. Horaires & Indisponibilités
// -------------------------------------------------------------------
$router->get('/schedules',                  [$scheduleController, 'index']);
$router->put('/schedules/:day',             [$scheduleController, 'update']);
$router->get('/unavailabilities',           [$scheduleController, 'unavailabilities']);
$router->post('/unavailabilities',          [$scheduleController, 'storeUnavailability']);
$router->delete('/unavailabilities/:id',     [$scheduleController, 'destroyUnavailability']);

// -------------------------------------------------------------------
// 4. Moteur de créneaux disponibles
// -------------------------------------------------------------------
$router->get('/slots',                      [$slotController, 'index']);

// -------------------------------------------------------------------
// 5. Rendez-vous (Public & Gestion)
// -------------------------------------------------------------------
$router->get('/appointments',               [$appointmentController, 'index']);
$router->get('/appointments/:id',           [$appointmentController, 'show']);
$router->post('/appointments',              [$appointmentController, 'store']);
$router->get('/appointments/token/:token',  [$appointmentController, 'showByToken']);
$router->post('/appointments/token/:token/cancel', [$appointmentController, 'cancelByToken']);
$router->put('/appointments/:id/status',    [$appointmentController, 'updateStatus']);

return $router;
