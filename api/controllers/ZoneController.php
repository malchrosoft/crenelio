<?php
/**
 * ZoneController — Communes de la zone d'intervention affichées sur la vitrine.
 *
 * Calculées dans l'espace Artisan (communes limitrophes, rayon d'intervention) puis
 * enregistrées en GeoJSON dans `api/storage/zone/service-area.geojson`.
 */

require_once __DIR__ . '/../core/Response.php';

class ZoneController
{
    private const MAX_FEATURES = 2000;
    private const COVERAGES = ['full', 'partial'];

    private static function path(): string
    {
        return __DIR__ . '/../storage/zone/service-area.geojson';
    }

    /**
     * GET /zone — Communes enregistrées (FeatureCollection vide si aucune).
     */
    public function show(): void
    {
        $path = self::path();
        if (!is_file($path)) {
            Response::json(['type' => 'FeatureCollection', 'features' => []]);
        }
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-cache');
        readfile($path);
        exit;
    }

    /**
     * PUT /admin/zone — Remplace les communes. Le GeoJSON est reconstruit champ par champ :
     * seuls nom, code, couverture et géométrie (Polygon / MultiPolygon) sont conservés.
     */
    public function update(): void
    {
        $features = Response::body()['features'] ?? null;
        if (!is_array($features) || count($features) > self::MAX_FEATURES) {
            Response::json(['error' => 'Liste de communes invalide'], 400);
        }

        $clean = [];
        foreach ($features as $feature) {
            $props = $feature['properties'] ?? [];
            $geometry = $feature['geometry'] ?? [];
            $type = $geometry['type'] ?? '';
            $coverage = $props['coverage'] ?? 'full';
            if (!is_string($props['nom'] ?? null) || !is_string($props['code'] ?? null)
                || !in_array($coverage, self::COVERAGES, true)
                || !in_array($type, ['Polygon', 'MultiPolygon'], true)
                || !self::validCoordinates($geometry['coordinates'] ?? null, $type === 'Polygon' ? 3 : 4)) {
                Response::json(['error' => 'Commune invalide dans la liste'], 400);
            }
            $clean[] = [
                'type'       => 'Feature',
                'properties' => [
                    'nom'      => mb_substr($props['nom'], 0, 120),
                    'code'     => mb_substr($props['code'], 0, 10),
                    'coverage' => $coverage,
                ],
                'geometry'   => ['type' => $type, 'coordinates' => $geometry['coordinates']],
            ];
        }

        $path = self::path();
        if (!$clean) {
            is_file($path) && unlink($path);
        } elseif (file_put_contents($path, json_encode(['type' => 'FeatureCollection', 'features' => $clean])) === false) {
            Response::json(['error' => "Impossible d'enregistrer la zone (dossier api/storage/zone/ non accessible en écriture)"], 500);
        }

        Response::json(['count' => count($clean)]);
    }

    /** Tableaux imbriqués sur `$depth` niveaux, terminés par des paires [lon, lat] numériques. */
    private static function validCoordinates($value, int $depth): bool
    {
        if (!is_array($value) || !$value) {
            return false;
        }
        if ($depth === 1) {
            return count($value) === 2 && is_numeric($value[0]) && is_numeric($value[1])
                && abs($value[0]) <= 180 && abs($value[1]) <= 90;
        }
        foreach ($value as $item) {
            if (!self::validCoordinates($item, $depth - 1)) {
                return false;
            }
        }
        return true;
    }
}
