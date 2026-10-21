/**
 * Calcul des communes de la zone d'intervention à partir de l'API Géo officielle
 * (geo.api.gouv.fr) : commune de départ, communes limitrophes, communes touchées par le rayon.
 */

export type LatLng = [number, number];
type Ring = number[][]; // [[lon, lat], ...]

export type ZoneCoverage = 'full' | 'partial';

export interface ZoneFeature {
  type: 'Feature';
  properties: { nom: string; code: string; coverage: ZoneCoverage };
  geometry: { type: 'Polygon' | 'MultiPolygon'; coordinates: number[][][] | number[][][][] };
}

export interface ZoneCollection {
  type: 'FeatureCollection';
  features: ZoneFeature[];
}

/** Commune proposée, avec la raison de sa présence. */
export interface CommuneCandidate {
  feature: ZoneFeature;
  reasons: ('home' | 'neighbour' | 'radius')[];
  /** Distance du point de départ au point le plus proche de la commune (0 si dedans). */
  distanceKm: number;
}

const GEO_API = 'https://geo.api.gouv.fr';
/** Deux communes sont limitrophes si leurs contours se rapprochent à moins de 50 m. */
const NEIGHBOUR_TOLERANCE_KM = 0.05;

// Projection locale équirectangulaire (km) autour du point de départ : précise à l'échelle d'une zone
function projector([lat0, lon0]: LatLng) {
  const kx = 111.32 * Math.cos((lat0 * Math.PI) / 180);
  const ky = 110.574;
  return ([lon, lat]: number[]): [number, number] => [(lon - lon0) * kx, (lat - lat0) * ky];
}

/** Point situé à `km` du départ dans la direction `angle` (radians). */
function offset([lat, lon]: LatLng, km: number, angle: number): LatLng {
  return [lat + (km * Math.sin(angle)) / 110.574, lon + (km * Math.cos(angle)) / (111.32 * Math.cos((lat * Math.PI) / 180))];
}

/** Cercle du rayon d'intervention, en polygone GeoJSON [lon, lat] pour l'affichage. */
export function circleRing(center: LatLng, km: number, steps = 96): Ring {
  const ring = Array.from({ length: steps }, (_, i) => {
    const [lat, lon] = offset(center, km, (2 * Math.PI * i) / steps);
    return [lon, lat];
  });
  return [...ring, ring[0]];
}

export function rings(feature: ZoneFeature): Ring[] {
  return feature.geometry.type === 'Polygon'
    ? (feature.geometry.coordinates as Ring[])
    : (feature.geometry.coordinates as Ring[][]).flat();
}

function segmentDistance(p: number[], a: number[], b: number[]): number {
  const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len)) : 0;
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}

function pointInRings(p: number[], polygonRings: number[][][]): boolean {
  let inside = false;
  for (const ring of polygonRings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

function minDistanceToRings(p: number[], projected: number[][][]): number {
  let min = Infinity;
  for (const ring of projected) {
    for (let i = 1; i < ring.length; i++) min = Math.min(min, segmentDistance(p, ring[i - 1], ring[i]));
  }
  return min;
}

interface Box {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function bbox(projected: number[][][]): Box {
  const pts = projected.flat();
  return {
    minX: Math.min(...pts.map((p) => p[0])),
    minY: Math.min(...pts.map((p) => p[1])),
    maxX: Math.max(...pts.map((p) => p[0])),
    maxY: Math.max(...pts.map((p) => p[1])),
  };
}

const boxesTouch = (a: Box, b: Box, margin: number) =>
  a.minX - margin <= b.maxX && b.minX - margin <= a.maxX && a.minY - margin <= b.maxY && b.minY - margin <= a.maxY;

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API Géo indisponible (${res.status})`);
  return res.json();
}

/** Départements touchés : échantillonnage du départ, d'un anneau proche (limitrophes) et du cercle. */
async function departmentsAround(center: LatLng, radiusKm: number): Promise<string[]> {
  const points: LatLng[] = [center];
  const ringsKm = [3, ...(radiusKm > 0 ? [radiusKm / 2, radiusKm] : [])];
  ringsKm.forEach((km, r) => {
    const steps = r === 0 ? 8 : 16;
    for (let i = 0; i < steps; i++) points.push(offset(center, km, (2 * Math.PI * i) / steps));
  });
  const results = await Promise.all(
    points.map(([lat, lon]) =>
      getJson<{ codeDepartement: string }[]>(`${GEO_API}/communes?lat=${lat}&lon=${lon}&fields=codeDepartement`).catch(
        () => []
      )
    )
  );
  return [...new Set(results.flat().map((c) => c.codeDepartement))];
}

/**
 * Communes proposées : commune de départ, limitrophes (si demandé) et toute commune
 * au moins partiellement dans le rayon. Couverture « full » si entièrement dans le cercle.
 */
export async function computeCommunes(center: LatLng, radiusKm: number, includeNeighbours: boolean): Promise<CommuneCandidate[]> {
  const departments = await departmentsAround(center, radiusKm);
  const collections = await Promise.all(
    departments.map((d) =>
      getJson<{ features: { properties: { nom: string; code: string }; geometry: ZoneFeature['geometry'] }[] }>(
        `${GEO_API}/departements/${d}/communes?fields=nom,code&format=geojson&geometry=contour`
      )
    )
  );

  const project = projector(center);
  const origin = [0, 0];
  const communes = collections
    .flatMap((c) => c.features)
    .filter((f) => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
    .map((f) => {
      const feature: ZoneFeature = {
        type: 'Feature',
        properties: { nom: f.properties.nom, code: f.properties.code, coverage: 'full' },
        geometry: f.geometry,
      };
      const projected = rings(feature).map((ring) => ring.map(project));
      return { feature, projected, box: bbox(projected) };
    });

  const home = communes.find((c) => pointInRings(origin, c.projected));
  const result: CommuneCandidate[] = [];

  for (const c of communes) {
    const reasons: CommuneCandidate['reasons'] = [];
    const isHome = c === home;
    const distanceKm = isHome || pointInRings(origin, c.projected) ? 0 : minDistanceToRings(origin, c.projected);

    if (isHome) reasons.push('home');
    if (
      includeNeighbours &&
      home &&
      !isHome &&
      boxesTouch(c.box, home.box, NEIGHBOUR_TOLERANCE_KM) &&
      c.projected.flat().some((p) => minDistanceToRings(p, home.projected) <= NEIGHBOUR_TOLERANCE_KM)
    ) {
      reasons.push('neighbour');
    }
    if (radiusKm > 0 && distanceKm <= radiusKm) reasons.push('radius');
    if (!reasons.length) continue;

    // Entièrement dans le cercle : tous les sommets du contour à moins du rayon
    const full = radiusKm > 0 && c.projected.flat().every((p) => Math.hypot(p[0], p[1]) <= radiusKm);
    c.feature.properties.coverage = full ? 'full' : 'partial';
    result.push({ feature: c.feature, reasons, distanceKm });
  }

  return result.sort((a, b) => a.distanceKm - b.distanceKm || a.feature.properties.nom.localeCompare(b.feature.properties.nom, 'fr'));
}

/** Distance (km) du point au bord le plus proche de la commune, 0 s'il est dedans. */
export function distanceToFeature(center: LatLng, feature: ZoneFeature): number {
  const project = projector(center);
  const projected = rings(feature).map((ring) => ring.map(project));
  return pointInRings([0, 0], projected) ? 0 : minDistanceToRings([0, 0], projected);
}

/** Emprise [sud-ouest, nord-est] d'un ensemble de contours. */
export function boundsOf(ringsList: Ring[]): [LatLng, LatLng] | null {
  const pts = ringsList.flat();
  if (!pts.length) return null;
  const lats = pts.map((p) => p[1]);
  const lngs = pts.map((p) => p[0]);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

/** Arrondi à 5 décimales (~1 m) : allège le fichier enregistré. */
export function compactFeature(feature: ZoneFeature): ZoneFeature {
  const round = (v: unknown): unknown => (Array.isArray(v) ? v.map(round) : Math.round((v as number) * 1e5) / 1e5);
  return { ...feature, geometry: { ...feature.geometry, coordinates: round(feature.geometry.coordinates) as ZoneFeature['geometry']['coordinates'] } };
}
