import React from 'react';
import { Map, Marker } from 'pigeon-maps';

interface InterventionMapProps {
  coordinates?: [number, number] | null;
  defaultCenter?: [number, number];
  height?: number;
}

export const InterventionMap: React.FC<InterventionMapProps> = ({
  coordinates = null,
  defaultCenter = [50.62925, 3.057256], // Lille par défaut
  height = 240,
}) => {
  const center: [number, number] = coordinates || defaultCenter;
  const zoom = coordinates ? 14 : 11;

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
