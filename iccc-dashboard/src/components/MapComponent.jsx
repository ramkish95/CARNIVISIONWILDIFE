import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fixing the default marker icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = ({ sightings }) => {
  const centerPosition = [11.6667, 76.6285]; // Bandipur NP

  return (
    <MapContainer center={centerPosition} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='&copy; Esri'
      />
      
      {/* Loop through real sightings from the database */}
      {sightings.map((sighting) => {
        // PostGIS Points store coordinates as [Long, Lat]
        // Leaflet needs [Lat, Long]
        const lat = sighting.location.coordinates[1];
        const lng = sighting.location.coordinates[0];

        return (
          <Marker key={sighting.id} position={[lat, lng]}>
            <Popup>
              <div style={{color: 'black'}}>
                <strong>{sighting.species} Detected!</strong><br />
                Confidence: {(sighting.confidence * 100).toFixed(1)}%<br />
                Time: {new Date(sighting.timestamp).toLocaleTimeString()}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default MapComponent;