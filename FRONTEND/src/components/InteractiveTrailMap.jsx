import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import './InteractiveTrailMap.css';

// --- Componente para centrar el mapa en la ubicación del usuario ---
function LocationMarker({ userPosition }) {
  const map = useMap();
  useEffect(() => {
    if (userPosition) {
      map.flyTo(userPosition, 16); // Centra el mapa con una animación suave
    }
  }, [userPosition, map]);

  return null;
}

// --- Componente para crear el ícono personalizado del usuario ---
const UserLocationIcon = L.divIcon({
  html: `<div class="user-location-marker"><div class="pulsating-circle"></div></div>`,
  className: 'user-location-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// --- Componente para crear el ícono de destino ---
const DestinationIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


export default function InteractiveTrailMap({ trailData }) {
  const [userPosition, setUserPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Verificar si el navegador soporta geolocalización
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    // 2. Iniciar el seguimiento de la posición del usuario
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);
        setError(null);
      },
      (err) => {
        // Manejo de errores comunes
        if (err.code === 1) {
          setError("Permiso denegado. Por favor, activa la geolocalización en tu navegador para usar esta función.");
        } else {
          setError("No se pudo obtener tu ubicación. Intenta recargar la página.");
        }
      },
      {
        enableHighAccuracy: true, // Solicita la máxima precisión posible
        timeout: 10000,
        maximumAge: 0
      }
    );

    // 3. Limpiar el watcher cuando el componente se desmonte
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  if (!trailData || trailData.length === 0) {
    return <div className="map-loading">Cargando datos de la ruta...</div>;
  }
  
  const startPoint = trailData[0];
  const endPoint = trailData[trailData.length - 1];

  return (
    <div className="map-wrapper">
      {error && <div className="tracking-error">{error}</div>}
      <MapContainer center={startPoint} zoom={15} scrollWheelZoom={true} className="leaflet-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Dibuja la línea del sendero */}
        <Polyline pathOptions={{ color: 'red', weight: 5 }} positions={trailData} />
        
        {/* Marcador del punto final */}
        <Marker position={endPoint} icon={DestinationIcon}>
          <Popup>
            <b>Jardín de las Delicias - Punto Final</b><br />
            ¡Has llegado a tu destino!
          </Popup>
        </Marker>

        {/* Muestra la ubicación del usuario si está disponible */}
        {userPosition && (
          <Marker position={userPosition} icon={UserLocationIcon}>
            <Popup><b>Mi Ubicación</b></Popup>
          </Marker>
        )}
        
        {/* Componente para auto-centrar el mapa */}
        <LocationMarker userPosition={userPosition} />
      </MapContainer>
    </div>
  );
}