<?php
/**
 * TravelFeeController — Estimation publique des frais de déplacement.
 *
 * Interrogé par le tunnel de réservation dès que l'adresse du client est
 * géocodée, afin d'afficher la décomposition tarifaire avant confirmation.
 */

require_once __DIR__ . '/../models/Service.php';
require_once __DIR__ . '/../models/Config.php';
require_once __DIR__ . '/../core/TravelFee.php';
require_once __DIR__ . '/../core/Response.php';

class TravelFeeController
{
    /**
     * POST /travel-fee/quote — Devis de déplacement pour une prestation et une adresse.
     *
     * Corps attendu : { service_id, latitude?, longitude? }
     */
    public function quote(): void
    {
        $body = Response::body();

        $serviceId = (int)($body['service_id'] ?? 0);
        if ($serviceId <= 0) {
            Response::json(['error' => "L'identifiant de la prestation est obligatoire"], 400);
        }

        $service = Service::find($serviceId);
        if (!$service || !$service['is_active']) {
            Response::json(['error' => 'Prestation sélectionnée non trouvée ou inactive'], 404);
        }

        [$latitude, $longitude] = self::readCoordinates($body);

        Response::json(TravelFee::quote($service, $latitude, $longitude, Config::getAll()));
    }

    /**
     * Lit et valide le couple de coordonnées GPS d'une requête.
     * Retourne [null, null] si l'adresse n'a pas été géocodée.
     *
     * @return array{0: float|null, 1: float|null}
     */
    public static function readCoordinates(array $body): array
    {
        $latitude  = $body['latitude']  ?? null;
        $longitude = $body['longitude'] ?? null;

        if (!is_numeric($latitude) || !is_numeric($longitude)) {
            return [null, null];
        }

        $latitude  = (float)$latitude;
        $longitude = (float)$longitude;

        if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
            Response::json(['error' => 'Coordonnées GPS invalides'], 400);
        }

        return [$latitude, $longitude];
    }
}
