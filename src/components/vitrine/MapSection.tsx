import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../api';
import { AppConfig } from '../../types';
import ZoneMap from '../ZoneMap';
import { LatLng, ZoneFeature } from '../../utils/serviceArea';
import { geocode, isPremisesOnly, premisesLabel, premisesPosition } from '../../utils/zone';

interface MapSectionProps {
  config: AppConfig;
}

const parse = (value: string | null | undefined, fallback: number) => {
  const n = value ? parseFloat(value) : NaN;
  return isNaN(n) ? fallback : n;
};

/**
 * Section carte (pigeon-maps / OpenStreetMap).
 * Artisan qui se déplace : communes de la zone d'intervention et rayon.
 * Artisan qui reçoit : adresse des locaux seule.
 */
const MapSection: React.FC<MapSectionProps> = ({ config }) => {
  const premises = isPremisesOnly(config);
  const [features, setFeatures] = useState<ZoneFeature[]>([]);

  // Locaux : leur position ; déplacement : le point de départ (centre du rayon)
  const lat = parse(config.default_latitude, 48.8);
  const lon = parse(config.default_longitude, 2.2625);
  const center = useMemo<LatLng>(() => [lat, lon], [lat, lon]);
  // Locaux : vue de quartier ; zone : zoom de la configuration (cadrage auto sur les communes)
  const zoom = premises ? 16 : parse(config.default_zoom, 11);
  // Repère : adresse de l'entreprise, sinon siège social (géocodé), sinon aucun.
  // Le point de départ (centre du rayon) reste interne : ni repère ni cercle sur la vitrine.
  // Mémorisée sur ses coordonnées : une nouvelle référence à chaque rendu recentrerait la carte
  const premisesPos = useMemo(
    () => premisesPosition(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.premises_latitude, config.premises_longitude]
  );
  const [siegePos, setSiegePos] = useState<LatLng | null>(null);
  const legalAddress = config.legal_adresse?.trim() ?? '';

  useEffect(() => {
    if (premisesPos || !legalAddress) return;
    let cancelled = false;
    geocode(legalAddress)
      .then((pos) => !cancelled && setSiegePos(pos))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [legalAddress, premisesPos]);

  const marker = premisesPos ?? siegePos;

  useEffect(() => {
    if (premises) return;
    api
      .getZone()
      .then((zone) => setFeatures(zone.features))
      .catch(() => setFeatures([]));
  }, [premises]);

  return (
    <section className="vitrine-section" id="zone" aria-labelledby="map-title">
      <div className="vitrine-container">
        <div className="section-header">
          <h2 className="section-title" id="map-title">
            {premises ? 'Nous trouver' : "Zone d'intervention"}
          </h2>
          {premises
            ? premisesLabel(config) && <p className="section-subtitle">{premisesLabel(config)}</p>
            : config.service_area && <p className="section-subtitle">{config.service_area}</p>}
        </div>

        <div className="vitrine-map-section">
          <ZoneMap
            center={premises && marker ? marker : center}
            zoom={zoom}
            features={premises ? [] : features}
            marker={marker}
            autoFit={!premises && features.length > 0}
          />
        </div>
      </div>
    </section>
  );
};

export default MapSection;
