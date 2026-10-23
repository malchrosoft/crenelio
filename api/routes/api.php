<?php
/**
 * API routes definition for Crénelio.
 * All routes are prefixed with /api (handled by .htaccess rewrite rules).
 */

require_once __DIR__ . '/../core/Router.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Auth.php';

require_once __DIR__ . '/../controllers/ConfigController.php';
require_once __DIR__ . '/../controllers/ServiceController.php';
require_once __DIR__ . '/../controllers/ScheduleController.php';
require_once __DIR__ . '/../controllers/ZoneController.php';
require_once __DIR__ . '/../controllers/SlotController.php';
require_once __DIR__ . '/../controllers/AppointmentController.php';
require_once __DIR__ . '/../controllers/TravelFeeController.php';
require_once __DIR__ . '/../controllers/BrandingController.php';

$router = new Router();

$configController      = new ConfigController();
$serviceController     = new ServiceController();
$scheduleController    = new ScheduleController();
$slotController        = new SlotController();
$appointmentController = new AppointmentController();
$travelFeeController   = new TravelFeeController();
$brandingController    = new BrandingController();
$zoneController        = new ZoneController();

// Routes de l'espace Pro : refusées (401) sans session ouverte, cf. core/Auth.php
$admin = fn(callable $handler) => Auth::guard($handler);

// -------------------------------------------------------------------
// 1. Configuration & Authentification Pro
// -------------------------------------------------------------------
$router->get('/config',                     [$configController, 'getPublic']);
$router->get('/admin/config',               $admin([$configController, 'getAll']));
$router->put('/admin/config',               $admin([$configController, 'update']));
$router->post('/admin/login',               [$configController, 'login']);
$router->post('/admin/login/code',          [$configController, 'verifyCode']);
$router->get('/admin/session',              [$configController, 'session']);
$router->post('/admin/logout',              [$configController, 'logout']);

// Logo & favicon (fichiers sous leurs noms d'usage, cf. core/Branding.php)
$router->get('/zone',                       [$zoneController, 'show']);
$router->put('/admin/zone',                 $admin([$zoneController, 'update']));
$router->get('/branding/:kind',             [$brandingController, 'show']);
$router->post('/admin/branding/:kind',      $admin([$brandingController, 'upload']));
$router->delete('/admin/branding/:kind',    $admin([$brandingController, 'destroy']));

// -------------------------------------------------------------------
// 2. Prestations / Services
// -------------------------------------------------------------------
$router->get('/services',                   [$serviceController, 'index']);
$router->get('/services/:id',               [$serviceController, 'show']);
$router->post('/services',                  $admin([$serviceController, 'store']));
$router->put('/services/:id',               $admin([$serviceController, 'update']));
$router->delete('/services/:id',            $admin([$serviceController, 'destroy']));

// -------------------------------------------------------------------
// 3. Horaires & Indisponibilités
// -------------------------------------------------------------------
$router->get('/schedules',                  [$scheduleController, 'index']);
$router->put('/schedules/:day',             $admin([$scheduleController, 'update']));
$router->get('/unavailabilities',           $admin([$scheduleController, 'unavailabilities']));
$router->post('/unavailabilities',          $admin([$scheduleController, 'storeUnavailability']));
$router->delete('/unavailabilities/:id',     $admin([$scheduleController, 'destroyUnavailability']));

// -------------------------------------------------------------------
// 4. Moteur de créneaux disponibles
// -------------------------------------------------------------------
$router->get('/slots/availability',         [$slotController, 'availability']);
$router->get('/slots',                      [$slotController, 'index']);

// -------------------------------------------------------------------
// 5. Frais de déplacement (estimation avant réservation)
// -------------------------------------------------------------------
$router->post('/travel-fee/quote',          [$travelFeeController, 'quote']);

// -------------------------------------------------------------------
// 6. Rendez-vous (Public & Gestion)
// -------------------------------------------------------------------
$router->get('/appointments',               $admin([$appointmentController, 'index']));
$router->get('/appointments/:id',           $admin([$appointmentController, 'show']));
$router->post('/appointments',              [$appointmentController, 'store']);
$router->post('/admin/appointments',        $admin([$appointmentController, 'adminStore']));
$router->post('/appointments/exceptional-request', [$appointmentController, 'exceptionalRequest']);
$router->get('/appointments/decision/:token',  [$appointmentController, 'decisionShow']);
$router->post('/appointments/decision/:token', [$appointmentController, 'decide']);
$router->get('/appointments/token/:token',  [$appointmentController, 'showByToken']);
$router->post('/appointments/token/:token/cancel', [$appointmentController, 'cancelByToken']);
$router->put('/appointments/:id/status',    $admin([$appointmentController, 'updateStatus']));
$router->put('/appointments/:id/reschedule',$admin([$appointmentController, 'reschedule']));
$router->get('/appointments/:id/notifications', $admin([$appointmentController, 'notifications']));
$router->post('/appointments/:id/notifications/resend', $admin([$appointmentController, 'resendNotification']));

return $router;
