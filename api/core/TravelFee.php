<?php
/**
 * TravelFee — Moteur de calcul des frais de déplacement.
 *
 * Trois modes portés par la prestation (`services.travel_fee_mode`) :
 *   - none           : déplacement inclus, aucun frais, aucun contrôle de zone.
 *   - fixed          : forfait fixe (`services.travel_fee_amount`).
 *   - distance_tiers : paliers kilométriques globaux définis dans `config`.
 *
 * La distance est géodésique (Haversine) entre le point de base de l'artisan
 * (`config.default_latitude` / `default_longitude`) et l'adresse du client
 * géocodée par la Base Adresse Nationale côté tunnel de réservation.
 */

class TravelFee
{
    /** Nombre maximal de paliers lus dans la table `config`. */
    private const MAX_TIERS = 10;

    /** Rayon moyen de la Terre en kilomètres. */
    private const EARTH_RADIUS_KM = 6371.0;

    /**
     * Distance géodésique entre deux points GPS, en kilomètres (formule de Haversine).
     */
    public static function haversineKm(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
           + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return self::EARTH_RADIUS_KM * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * Paliers kilométriques configurés, triés par distance maximale croissante.
     *
     * @return array<int, array{max_km: float, fee: float}>
     */
    public static function tiers(array $config): array
    {
        $tiers = [];

        for ($i = 1; $i <= self::MAX_TIERS; $i++) {
            $maxKm = $config["travel_tier_{$i}_max_km"] ?? null;
            if ($maxKm === null || $maxKm === '') {
                continue;
            }

            $maxKm = (float)$maxKm;
            if ($maxKm <= 0) {
                continue;
            }

            $tiers[] = [
                'max_km' => $maxKm,
                'fee'    => (float)($config["travel_tier_{$i}_fee"] ?? 0),
            ];
        }

        usort($tiers, static fn(array $a, array $b): int => $a['max_km'] <=> $b['max_km']);

        return $tiers;
    }

    /**
     * Calcule le détail tarifaire d'un déplacement pour une prestation donnée.
     *
     * @param array        $service   Ligne de la table `services`.
     * @param float|null   $latitude  Latitude du client (null si non géocodé).
     * @param float|null   $longitude Longitude du client.
     * @param array        $config    Paires clé-valeur de la table `config`.
     *
     * @return array{
     *     mode: string, service_price: float, travel_fee: float, total: float,
     *     distance_km: float|null, is_out_of_zone: bool, max_km: float|null,
     *     needs_coordinates: bool, tiers: array
     * }
     */
    public static function quote(array $service, ?float $latitude, ?float $longitude, array $config): array
    {
        $mode         = $service['travel_fee_mode'] ?? 'none';
        $servicePrice = (float)($service['price'] ?? 0);
        $maxKm        = isset($config['travel_max_km']) && $config['travel_max_km'] !== ''
            ? (float)$config['travel_max_km']
            : null;

        $quote = [
            'mode'              => $mode,
            'service_price'     => round($servicePrice, 2),
            'travel_fee'        => 0.0,
            'total'             => round($servicePrice, 2),
            'distance_km'       => null,
            'is_out_of_zone'    => false,
            'max_km'            => $maxKm,
            'needs_coordinates' => false,
            'tiers'             => $mode === 'distance_tiers' ? self::tiers($config) : [],
        ];

        // Prestation sans déplacement facturé : ni frais, ni contrôle de zone.
        if ($mode === 'none') {
            return $quote;
        }

        $distanceKm = self::distanceFromBase($latitude, $longitude, $config);
        $quote['distance_km'] = $distanceKm;

        if ($mode === 'fixed') {
            $quote['travel_fee'] = round((float)($service['travel_fee_amount'] ?? 0), 2);
        } else {
            // distance_tiers : la distance est indispensable au calcul.
            if ($distanceKm === null) {
                $quote['needs_coordinates'] = true;
                return $quote;
            }
            $quote['travel_fee'] = round(self::feeForDistance($distanceKm, $quote['tiers']), 2);
        }

        // Hors zone : la réservation directe est bloquée au-delà du rayon maximal.
        if ($distanceKm !== null && $maxKm !== null && $distanceKm > $maxKm) {
            $quote['is_out_of_zone'] = true;
        }

        $quote['total'] = round($servicePrice + $quote['travel_fee'], 2);

        return $quote;
    }

    /**
     * Distance entre le point de base de l'artisan et le client, ou null si
     * l'une des deux positions est inconnue.
     */
    private static function distanceFromBase(?float $latitude, ?float $longitude, array $config): ?float
    {
        if ($latitude === null || $longitude === null) {
            return null;
        }

        $baseLat = $config['default_latitude']  ?? null;
        $baseLon = $config['default_longitude'] ?? null;

        if ($baseLat === null || $baseLat === '' || $baseLon === null || $baseLon === '') {
            return null;
        }

        return round(self::haversineKm((float)$baseLat, (float)$baseLon, $latitude, $longitude), 2);
    }

    /**
     * Frais correspondant à une distance : premier palier dont la borne couvre
     * la distance ; au-delà du dernier palier, le tarif du palier le plus élevé.
     *
     * @param array<int, array{max_km: float, fee: float}> $tiers
     */
    private static function feeForDistance(float $distanceKm, array $tiers): float
    {
        if (empty($tiers)) {
            return 0.0;
        }

        foreach ($tiers as $tier) {
            if ($distanceKm <= $tier['max_km']) {
                return $tier['fee'];
            }
        }

        return end($tiers)['fee'];
    }
}
