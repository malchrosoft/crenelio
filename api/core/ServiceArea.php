<?php
/**
 * ServiceArea — Communes desservies (GeoJSON enregistré depuis l'espace Artisan).
 *
 * Sert à refuser une réservation dont l'adresse n'est dans aucune commune cochée,
 * comme pour une adresse hors du rayon d'intervention.
 */

class ServiceArea
{
    public static function path(): string
    {
        return __DIR__ . '/../storage/zone/service-area.geojson';
    }

    /** Communes enregistrées (features GeoJSON), tableau vide si aucune zone. */
    public static function features(): array
    {
        static $features = null;
        if ($features === null) {
            $path = self::path();
            $data = is_file($path) ? json_decode((string)file_get_contents($path), true) : null;
            $features = is_array($data['features'] ?? null) ? $data['features'] : [];
        }
        return $features;
    }

    /** Vrai si le point [lat, lon] est dans l'une des communes enregistrées. */
    public static function contains(float $latitude, float $longitude): bool
    {
        foreach (self::features() as $feature) {
            $geometry = $feature['geometry'] ?? [];
            $polygons = ($geometry['type'] ?? '') === 'Polygon' ? [$geometry['coordinates']] : ($geometry['coordinates'] ?? []);
            foreach ($polygons as $rings) {
                if (self::inRings($longitude, $latitude, $rings)) {
                    return true;
                }
            }
        }
        return false;
    }

    /** Lancer de rayon pair-impair : contour extérieur et trous éventuels d'un polygone. */
    private static function inRings(float $x, float $y, array $rings): bool
    {
        $inside = false;
        foreach ($rings as $ring) {
            $count = count($ring);
            for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
                [$xi, $yi] = $ring[$i];
                [$xj, $yj] = $ring[$j];
                if (($yi > $y) !== ($yj > $y) && $x < ($xj - $xi) * ($y - $yi) / ($yj - $yi) + $xi) {
                    $inside = !$inside;
                }
            }
        }
        return $inside;
    }
}
