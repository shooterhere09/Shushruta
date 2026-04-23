import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationMarker = ({ onLocationSelected, position }) => {
  useMapEvents({
    click(e) {
      onLocationSelected(e.latlng);
    },
  });

  return position ? <Marker position={position}></Marker> : null;
};

const MapComponent = ({ initialLat, initialLng, onLocationSelected }) => {
  const defaultPosition = [initialLat || 20.5937, initialLng || 78.9629]; // Default to India center

  return (
    <MapContainer center={defaultPosition} zoom={5} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelected={onLocationSelected} position={defaultPosition} />
    </MapContainer>
  );
};

export default MapComponent;