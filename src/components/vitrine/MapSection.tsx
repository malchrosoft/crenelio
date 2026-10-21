import React, { useRef, useState } from 'react';
import { Map, Marker, GeoJson } from 'pigeon-maps';
import { ArrowsInIcon } from '@phosphor-icons/react';
import { AppConfig } from '../../types';
import serviceAreaGeoJson from '../../data/serviceAreaGeoJson.json';

type LatLng = [number, number];

// Projection Web Mercator en pixels au zoom 0 (tuile de 256 px), celle des tuiles OpenStreetMap
const toPixel = ([lat, lng]: LatLng): [number, number] => {
  const sin = Math.sin((lat * Math.PI) / 180);
  return [((lng + 180) / 360) * 256, (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * 256];
};

/** Emprise [sud-ouest, nord-est] de toutes les communes couvertes. */
const COMMUNES_BOUNDS = (() => {
  const points = serviceAreaGeoJson.features.flatMap((f) => f.geometry.coordinates.flat() as number[][]);
  const lats = points.map(([, lat]) => lat);
  const lngs = points.map(([lng]) => lng);
  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ] as [LatLng, LatLng];
})();

/** Centre et zoom cadrant l'ensemble des communes dans une carte de la taille donnée (marge de 10 %). */
function fitCommunes(width: number, height: number): { center: LatLng; zoom: number } {
  const [sw, ne] = COMMUNES_BOUNDS;
  const [x1, y1] = toPixel(sw);
  const [x2, y2] = toPixel(ne);
  const zoom = Math.log2(Math.min(width / (x2 - x1), height / (y1 - y2)) * 0.9);
  return { center: [(sw[0] + ne[0]) / 2, (sw[1] + ne[1]) / 2], zoom: Math.min(18, zoom) };
}

interface MapSectionProps {
  config: AppConfig;
}

/**
 * Section carte d'intervention (pigeon-maps / OpenStreetMap).
 * Centre, zoom et polygones des communes couvertes.
 */
const MapSection: React.FC<MapSectionProps> = ({ config }) => {
  const [hoveredCommune, setHoveredCommune] = useState<string | null>(null);

  const lat = config.default_latitude ? parseFloat(config.default_latitude) : 48.8000;
  const lon = config.default_longitude ? parseFloat(config.default_longitude) : 2.2625;
  const zoom = config.default_zoom ? parseInt(config.default_zoom, 10) : 11;

  const center: [number, number] = [
    isNaN(lat) ? 48.8000 : lat,
    isNaN(lon) ? 2.2625 : lon,
  ];
  const safeZoom = isNaN(zoom) ? 11 : zoom;

  // Vue pilotée : l'utilisateur déplace librement la carte, le bouton la recadre sur les communes
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<{ center: LatLng; zoom: number }>({ center, zoom: safeZoom });

  function recenter() {
    const el = wrapperRef.current;
    if (el) setView(fitCommunes(el.clientWidth, el.clientHeight));
  }

  return (
    <section
      className="vitrine-section"
      id="zone"
      aria-labelledby="map-title"
    >
      <div className="vitrine-container">
        <div className="section-header">
          <h2 className="section-title" id="map-title">
            Zone d'intervention
          </h2>
          {config.service_area && (
            <p className="section-subtitle">{config.service_area}</p>
          )}
        </div>

        <div className="vitrine-map-section">
          <div className="vitrine-map-wrapper" ref={wrapperRef}>
            <div role="img" aria-label="Carte de la zone d'intervention" className="vitrine-map-canvas">
            <Map
              center={view.center}
              zoom={view.zoom}
              onBoundsChanged={({ center: c, zoom: z }) => setView({ center: c, zoom: z })}
              attribution={false}
            >
              <GeoJson
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data={serviceAreaGeoJson as any}
                styleCallback={(feature: any, hover: boolean) => {
                  const isHovered = hover || hoveredCommune === feature?.properties?.nom;
                  return {
                    fill: isHovered ? 'rgba(37, 99, 235, 0.35)' : 'rgba(37, 99, 235, 0.15)',
                    stroke: '#2563eb',
                    strokeWidth: isHovered ? '2.5' : '1.5',
                    strokeDasharray: '4 3',
                    cursor: 'pointer',
                    transition: 'fill 0.2s ease, stroke-width 0.2s ease',
                  };
                }}
                onMouseOver={({ payload }: any) => {
                  if (payload?.properties?.nom) {
                    setHoveredCommune(payload.properties.nom);
                  }
                }}
                onMouseOut={() => setHoveredCommune(null)}
              />

              <Marker
                width={40}
                anchor={center}
                color="#dc2626"
              />
            </Map>
            </div>
          </div>

          <div className="vitrine-map-footer">
            <p className="vitrine-map-hover-commune" aria-live="polite">
              {hoveredCommune && <>Commune couverte : {hoveredCommune}</>}
            </p>
            <button type="button" className="vitrine-map-recenter" onClick={recenter}>
              <ArrowsInIcon size={18} weight="fill" aria-hidden="true" />
              Voir toutes les communes
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;
