<?php
/**
 * ServiceController — CRUD des prestations de l'artisan.
 */

require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../core/Response.php';

class ServiceController
{
    /**
     * GET /services — Liste des prestations.
     */
    public function index(): void
    {
        $all = isset($_GET['all']) && $_GET['all'] === '1';
        $services = Service::all(!$all);
        Response::json($services);
    }

    /**
     * GET /services/:id — Détail d'une prestation.
     */
    public function show(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $service = Service::find($id);

        if (!$service) {
            Response::json(['error' => 'Prestation non trouvée'], 404);
        }

        Response::json($service);
    }

    /**
     * POST /services — Création d'une prestation.
     */
    public function store(): void
    {
        $body = Response::body();

        if (empty($body['name'])) {
            Response::json(['error' => 'Le nom de la prestation est requis'], 400);
        }

        $id = Service::create($body);
        $service = Service::find($id);

        Response::json($service, 201);
    }

    /**
     * PUT /services/:id — Mise à jour d'une prestation.
     */
    public function update(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $service = Service::find($id);

        if (!$service) {
            Response::json(['error' => 'Prestation non trouvée'], 404);
        }

        $body = Response::body();
        Service::update($id, $body);

        Response::json(Service::find($id));
    }

    /**
     * DELETE /services/:id — Suppression d'une prestation.
     */
    public function destroy(array $params): void
    {
        $id = (int)($params['id'] ?? 0);
        $service = Service::find($id);

        if (!$service) {
            Response::json(['error' => 'Prestation non trouvée'], 404);
        }

        try {
            Service::delete($id);
            Response::json(['message' => 'Prestation supprimée avec succès']);
        } catch (PDOException $e) {
            // Clé étrangère si des rendez-vous sont liés
            if ($e->getCode() === '23000') {
                Response::json([
                    'error' => 'Impossible de supprimer cette prestation car des rendez-vous y sont associés. Vous pouvez plutôt la désactiver.'
                ], 409);
            }
            throw $e;
        }
    }
}
