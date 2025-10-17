import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';

const SANTA_CRUZ_CENTER = [-17.7833, -63.1821];

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componente para cambiar la vista del mapa dinámicamente
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || 15);
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapView({ points, selectedPoint, center, zoom = 13 }) {
  const navigate = useNavigate();

  const handleMarkerClick = (slug) => {
    navigate(`/places/${slug}`);
  };

  // Determina el punto focal: el punto seleccionado tiene prioridad
  const focusPoint = selectedPoint ? { lat: selectedPoint.lat, lng: selectedPoint.lng } : null;
  const initialCenter = center || SANTA_CRUZ_CENTER;

  return (
    <MapContainer center={initialCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {points.map((point) => {
        const isSelected = focusPoint && point.lat === focusPoint.lat && point.lng === focusPoint.lng;
        
        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            opacity={focusPoint ? (isSelected ? 1.0 : 0.6) : 1.0}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => { handleMarkerClick(point.slug); },
            }}
          >
            <Tooltip
              permanent
              direction="right"
              offset={[10, 0]}
              className="map-label"
              opacity={focusPoint ? (isSelected ? 1.0 : 0.7) : 1.0}
            >
              {point.name}
            </Tooltip>
            <Popup>
              <b>{point.name}</b><br />
              Categoría: {point.category}<br />
              <button onClick={() => handleMarkerClick(point.slug)} style={{ marginTop: '5px', cursor: 'pointer' }}>
                Ver detalles
              </button>
            </Popup>
          </Marker>
        );
      })}

      <ChangeMapView center={focusPoint ? [focusPoint.lat, focusPoint.lng] : center} zoom={focusPoint ? 16 : zoom} />
    </MapContainer>
  );
}