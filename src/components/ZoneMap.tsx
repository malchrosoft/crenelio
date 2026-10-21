import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GeoJson, Map, Marker } from 'pigeon-maps';
import { ArrowsInIcon } from '@phosphor-icons/react';
import { boundsOf, circleRing, LatLng, rings, ZoneFeature } from '../utils/serviceArea';

interface ZoneMapProps {
  center: LatLng;
  zoom: number;
  features: ZoneFeature[];
  /** Rayon d'intervention tracé en pointillés (absent : pas de cercle). */
  radiusKm?: number | null;
  /** Cadre automatiquement la vue sur les communes à chaque changement. */
  autoFit?: boolean;
  /** Communes retirées (codes INSEE) : tracées en rouge. */
  excluded?: Set<string>;
  /** Clic droit sur une commune : la retire ou la réintègre. Absent : carte en lecture seule. */
  onToggleFeature?: (code: string) => void;
  /** Position du repère ; absent : le centre ; null : aucun repère. */
  marker?: LatLng | null;
  /** Occupe toute la hauteur du conteneur parent (espace Artisan). */
  fill?: boolean;
}

// Couleurs SVG des tracés (pigeon-maps les attend en attributs) : $primary, $warning, $danger
const COLORS = {
  full: { fill: 'rgba(37, 99, 235, 0.18)', hover: 'rgba(37, 99, 235, 0.38)', stroke: '#2563eb' },
  partial: { fill: 'rgba(217, 119, 6, 0.18)', hover: 'rgba(217, 119, 6, 0.38)', stroke: '#d97706' },
  excluded: { fill: 'rgba(220, 38, 38, 0.2)', hover: 'rgba(220, 38, 38, 0.4)', stroke: '#dc2626' },
  marker: '#dc2626',
};

// Projection Web Mercator en pixels au zoom 0 (tuile de 256 px), celle des tuiles OpenStreetMap
const toPixel = ([lat, lng]: LatLng): [number, number] => {
  const sin = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * 256, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256];
};

/** Centre et zoom cadrant l'emprise dans une carte de la taille donnée (marge de 10 %). */
function fit([sw, ne]: [LatLng, LatLng], width: number, height: number): { center: LatLng; zoom: number } {
  const [x1, y1] = toPixel(sw);
  const [x2, y2] = toPixel(ne);
  const zoom = Math.log2(Math.min(width / Math.max(x2 - x1, 1e-9), height / Math.max(y1 - y2, 1e-9)) * 0.9);
  return { center: [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2], zoom: Math.min(16, zoom) };
}

/**
 * Carte de la zone d'intervention : communes en bleu si entièrement dans le rayon,
 * en orange si partiellement, cercle du rayon en pointillés, bouton de recadrage.
 */
const ZoneMap: React.FC<ZoneMapProps> = ({ center, zoom, features, radiusKm, autoFit = false, excluded, onToggleFeature, fill = false, marker }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<{ center: LatLng; zoom: number }>({ center, zoom });
  const [hovered, setHovered] = useState<string | null>(null);

  const circle = useMemo(() => (radiusKm && radiusKm > 0 ? circleRing(center, radiusKm) : null), [center, radiusKm]);
  const bounds = useMemo(
    () => boundsOf(features.length ? features.flatMap(rings) : circle ? [circle] : []),
    [features, circle]
  );

  // Config chargée après le premier rendu : la vue suit le point de départ et le zoom
  useEffect(() => {
    setView({ center, zoom });
  }, [center, zoom]);

  function recenter() {
    const el = wrapperRef.current;
    if (el && bounds) setView(fit(bounds, el.clientWidth, el.clientHeight));
  }

  useEffect(() => {
    if (autoFit) recenter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFit, bounds]);

  const data = useMemo(() => ({ type: 'FeatureCollection', features }), [features]);

  return (
    <div className={fill ? 'zone-map zone-map--fill' : 'zone-map'}>
      <div
        className="zone-map__canvas"
        ref={wrapperRef}
        role="img"
        aria-label="Carte de la zone d'intervention"
        // Carte éditable : le clic droit sert à retirer / réintégrer une commune, pas au menu du navigateur
        onContextMenu={onToggleFeature ? (e) => e.preventDefault() : undefined}
      >
        <Map center={view.center} zoom={view.zoom} onBoundsChanged={({ center: c, zoom: z }) => setView({ center: c, zoom: z })} attribution={false}>
          {circle && (
            <GeoJson
              data={{ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [circle] } }] }}
              styleCallback={() => ({ fill: 'none', stroke: COLORS.full.stroke, strokeWidth: '1.5', strokeDasharray: '8 6', pointerEvents: 'none' })}
            />
          )}
          <GeoJson
            data={data}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            styleCallback={(feature: any, hover: boolean) => {
              const code = feature?.properties?.code;
              const colors = excluded?.has(code)
                ? COLORS.excluded
                : COLORS[feature?.properties?.coverage === 'partial' ? 'partial' : 'full'];
              const isHovered = hover || hovered === feature?.properties?.nom;
              return {
                fill: isHovered ? colors.hover : colors.fill,
                stroke: colors.stroke,
                strokeWidth: isHovered ? '2.5' : '1.2',
                cursor: 'pointer',
              };
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onMouseOver={({ payload }: any) => payload?.properties?.nom && setHovered(payload.properties.nom)}
            onMouseOut={() => setHovered(null)}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onContextMenu={({ event, payload }: any) => {
              if (!onToggleFeature || !payload?.properties?.code) return;
              event.preventDefault();
              onToggleFeature(payload.properties.code);
            }}
          />
          {marker !== null && <Marker width={40} anchor={marker ?? center} color={COLORS.marker} />}
        </Map>
      </div>

      <div className="zone-map__footer">
        <p className="zone-map__hover" aria-live="polite">
          {hovered && <>{onToggleFeature ? hovered : <>Commune couverte : {hovered}</>}</>}
        </p>
        {bounds && (
          <button type="button" className="zone-map__recenter" onClick={recenter}>
            <ArrowsInIcon size={18} weight="fill" aria-hidden="true" />
            Centrer sur toutes les communes
          </button>
        )}
      </div>
    </div>
  );
};

export default ZoneMap;
