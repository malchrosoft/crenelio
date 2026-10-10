import React, { useState } from 'react';
import { Map, Marker, GeoJson } from 'pigeon-maps';
import { AppConfig } from '../../types';
import serviceAreaGeoJson from '../../data/serviceAreaGeoJson.json';

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
          <div className="vitrine-map-wrapper" role="img" aria-label="Carte de la zone d'intervention">
            <Map
              height={420}
              center={center}
              zoom={safeZoom}
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

          {hoveredCommune && (
            <div className="vitrine-map-hover-commune">
              Commune couverte : {hoveredCommune}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MapSection;
