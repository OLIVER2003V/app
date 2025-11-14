import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; 
import RoutingControl from './RoutingControl'; 

// --- Iconos (Sin cambios) ---
const CenterIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75m-6.75 6.75a6.75 6.75 0 1 0 13.5 0a6.75 6.75 0 1 0-13.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v.01M12 15.75v.01" />
  </svg>
);
const ExpandIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
  </svg>
);
const UserLocationIcon = L.divIcon({
  html: `<div class="relative flex h-6 w-6 items-center justify-center"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-500"></span></div>`,
  className: 'bg-transparent border-none',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const DestinationIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});


export default function InteractiveTrailMap({ trailData }) {
  const [userPosition, setUserPosition] = useState(null);
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [didInitialZoom, setDidInitialZoom] = useState(false);

  // Geolocalización (sin cambios)
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }
    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]);
        setError(null);
      },
      (err) => {
        setError(err.code === 1 ? "Permiso denegado. Por favor, activa la geolocalización." : "No se pudo obtener tu ubicación.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Lógica de centrado inicial (sin cambios)
  useEffect(() => {
    if (userPosition && map && !didInitialZoom) {
      map.flyTo(userPosition, 16);
      setDidInitialZoom(true);
    }
  }, [userPosition, map, didInitialZoom]);

  // Estado de carga (sin cambios)
  if (!trailData || trailData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
        Cargando datos de la ruta...
      </div>
    );
  }
  
  const startPoint = trailData[0];
  const endPoint = trailData[trailData.length - 1];

  // --- 💎 [DISEÑO MEJORADO] Nuevos estilos para la ruta principal ---
  const trailCasingOptions = { color: '#0d9488', weight: 9, opacity: 0.8 }; // teal-600
  const trailFillOptions = { color: '#84cc16', weight: 5, opacity: 1 }; // lime-500
  // --- Fin de la Mejora ---

  // Función de Distancia (sin cambios)
  const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';

  // Handlers de botones (sin cambios)
  const handleCenterUser = () => {
    if (map && userPosition) {
      map.flyTo(userPosition, 16);
    } else if (!userPosition) {
      setError("Aún no hemos encontrado tu ubicación.");
    }
  };
  const handleFullscreen = () => {
    if (map) {
      map.getContainer().requestFullscreen();
    }
  };
  
  return (
    <div className="relative h-full w-full bg-slate-800">
      
      {error && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2 rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-red-100 shadow-lg border border-red-600">
          {error}
        </div>
      )}

      <MapContainer 
        center={startPoint} 
        zoom={15} 
        scrollWheelZoom={false}
        touchZoom={true}
        doubleClickZoom={true}
        className="h-full w-full"
        ref={setMap} 
      >
        
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Detallado">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Modo Oscuro">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Ruta A -> B (Usuario al inicio del sendero) */}
        {userPosition && (
          <RoutingControl 
            start={userPosition} 
            end={startPoint} 
            onRouteFound={setRouteStats} 
          />
        )}

        {/* --- 💎 [DISEÑO MEJORADO] Ruta B -> C (Sendero Fijo) --- */}
        {/* Renderizamos DOS polilíneas para el efecto "casing" */}
        <Polyline pathOptions={trailCasingOptions} positions={trailData} />
        <Polyline pathOptions={trailFillOptions} positions={trailData} />
        {/* --- Fin de la Mejora --- */}
        
        <Marker position={endPoint} icon={DestinationIcon}>
          <Popup>
            <b>Jardín de las Delicias - Punto Final</b><br />
            ¡Has llegado a tu destino!
          </Popup>
        </Marker>

        {userPosition && (
          <Marker position={userPosition} icon={UserLocationIcon}>
            <Popup><b>Mi Ubicación</b></Popup>
          </Marker>
        )}

      </MapContainer>

      {/* Controles de Mapa (Estilo Oscuro - sin cambios) */}
      <div className="absolute top-[80px] right-2.5 z-[1000] flex flex-col gap-2">
        <button
          onClick={handleCenterUser}
          title="Centrar en mi ubicación"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-md transition-colors hover:bg-slate-700"
        >
          <CenterIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleFullscreen}
          title="Ver en pantalla completa"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-md transition-colors hover:bg-slate-700"
        >
          <ExpandIcon className="h-6 w-6" />
        </button>
      </div>

      {/* --- 💎 [DISEÑO MEJORADO] Caja de Estadísticas (Glassmorphism) --- */}
      {routeStats && (
        <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2 rounded-lg border border-slate-700/50 bg-slate-900/80 p-3 text-center text-sm text-slate-100 shadow-lg backdrop-blur-sm">
          <h4 className="text-xs font-semibold uppercase text-slate-400">Distancia al sendero</h4>
          <div className="mt-1">
            <span className="font-bold">{formatDistance(routeStats.distance)}</span>
          </div>
        </div>
      )}
    </div>
  );
}