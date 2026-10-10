import React from 'react';
import { Map, Marker } from 'pigeon-maps';

interface InterventionMapProps {
  coordinates?: [number, number] | null;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  height?: number;
}

export const InterventionMap: React.FC<InterventionMapProps> = ({
  coordinates = null,
  defaultCenter = [48.8000, 2.2625], // Clamart (92140) par défaut
  defaultZoom = 12,
  height = 240,
}) => {
  const center: [number, number] = coordinates || defaultCenter;
  const zoom = coordinates ? 14 : defaultZoom;

  return (
    <div className="map-wrapper">
      <Map
        height={height}
        center={center}
        zoom={zoom}
        attributionPrefix={false}
      >
        {coordinates && (
          <Marker
            width={38}
            anchor={coordinates}
            color="#dc2626"
          />
        )}
      </Map>
    </div>
  );
};

export default InterventionMap;
