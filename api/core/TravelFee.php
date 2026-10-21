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

require_once __DIR__ . '/ServiceArea.php';

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
    /** Vrai si l'artisan ne se déplace pas : les rendez-vous ont lieu à l'adresse de l'entreprise. */
    public static function isPremisesOnly(array $config): bool
    {
        return ($config['travel_mode'] ?? 'onsite') === 'premises';
    }

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
            // Motif du hors zone : `radius` (au-delà du rayon) ou `commune` (commune non desservie)
            'out_of_zone_reason' => null,
            // Hors zone mais à moins du rayon + 10 % : demande exceptionnelle possible
            'can_request_exception' => false,
            'tiers'             => $mode === 'distance_tiers' ? self::tiers($config) : [],
        ];

        // Artisan qui reçoit dans ses locaux : aucun déplacement, quelle que soit la prestation.
        if (self::isPremisesOnly($config)) {
            $quote['mode'] = 'none';
            $quote['tiers'] = [];
            return $quote;
        }

        // Communes desservies : contrôle pour toute prestation dès qu'une zone est enregistrée
        if (ServiceArea::features()) {
            if ($latitude === null || $longitude === null) {
                $quote['needs_coordinates'] = true;
                return $quote;
            }
            // Hors communes : signalé, mais les frais restent calculés (rendez-vous forcé par l'artisan,
            // demande exceptionnelle acceptée)
            if (!ServiceArea::contains($latitude, $longitude)) {
                $quote['is_out_of_zone'] = true;
                $quote['out_of_zone_reason'] = 'commune';
                $quote['distance_km'] = self::distanceFrom($latitude, $longitude, self::startPoint($config));
                $quote['can_request_exception'] = self::withinMargin($quote['distance_km'], $maxKm);
            }
        }

        // Prestation sans déplacement facturé : ni frais, ni contrôle de rayon.
        if ($mode === 'none') {
            return $quote;
        }

        // Frais : depuis l'origine choisie (point de départ ou adresse de l'entreprise) ;
        // zone : toujours depuis le point de départ, centre du rayon d'intervention.
        $distanceKm = self::distanceFrom($latitude, $longitude, self::feeOrigin($config));
        $zoneKm     = self::distanceFrom($latitude, $longitude, self::startPoint($config));
        $quote['distance_km'] = $distanceKm ?? $quote['distance_km'];

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
        if ($zoneKm !== null && $maxKm !== null && $zoneKm > $maxKm) {
            $quote['is_out_of_zone'] = true;
            $quote['out_of_zone_reason'] ??= 'radius';
            $quote['can_request_exception'] = self::withinMargin($zoneKm, $maxKm);
        }

        $quote['total'] = round($servicePrice + $quote['travel_fee'], 2);

        return $quote;
    }

    /** Marge au-delà du rayon où une demande exceptionnelle reste proposée (10 %). */
    public const EXCEPTION_MARGIN = 0.10;

    /** Vrai si la distance au point de départ reste sous le rayon + 10 % (rayon défini). */
    private static function withinMargin(?float $distanceKm, ?float $maxKm): bool
    {
        return $distanceKm !== null && $maxKm !== null && $distanceKm <= $maxKm * (1 + self::EXCEPTION_MARGIN);
    }

    /** Point de départ (centre du rayon d'intervention). */
    private static function startPoint(array $config): array
    {
        return [$config['default_latitude'] ?? null, $config['default_longitude'] ?? null];
    }

    /**
     * Origine du calcul des frais (`travel_fee_origin`) : `start` (défaut), le point de départ ;
     * `company`, l'adresse de l'entreprise si elle est géolocalisée, sinon le point de départ.
     *
     * @return array{0: mixed, 1: mixed}
     */
    private static function feeOrigin(array $config): array
    {
        if (($config['travel_fee_origin'] ?? 'start') === 'company'
            && ($config['premises_latitude'] ?? '') !== '' && ($config['premises_longitude'] ?? '') !== '') {
            return [$config['premises_latitude'], $config['premises_longitude']];
        }
        return [$config['default_latitude'] ?? null, $config['default_longitude'] ?? null];
    }

    /**
     * Distance entre une origine [lat, lon] et le client, ou null si l'une des deux positions est inconnue.
     */
    private static function distanceFrom(?float $latitude, ?float $longitude, array $origin): ?float
    {
        if ($latitude === null || $longitude === null) {
            return null;
        }

        [$baseLat, $baseLon] = $origin;

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
