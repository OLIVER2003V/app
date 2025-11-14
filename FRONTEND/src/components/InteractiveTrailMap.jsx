import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, LayersControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingControl from './RoutingControl';

// --- Iconos y Estilos ---
const CenterIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75m-6.75 6.75a6.75 6.75 0 1 0 13.5 0a6.75 6.75 0 1 0-13.5 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25v.01M12 15.75v.01" />
  </svg>
);

// NUEVO: Icono de Pantalla Completa
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStats, setShowStats] = useState(true); 

  // --- ARQUITECTURA: Manejo de GPS y Estabilidad ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    const watchOptions = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserPosition([latitude, longitude]); 
        setError(null); 
      },
      (err) => {
        const errorMsg = err.code === 1 
            ? "Permiso de GPS denegado. Actívalo para navegación." 
            : "Señal GPS débil o perdida. Mostrando última ubicación.";
        setError(errorMsg);
      },
      watchOptions
    );

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      navigator.geolocation.clearWatch(watcher);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Lógica de centrado inicial
  useEffect(() => {
    if (userPosition && map && !didInitialZoom) {
      map.flyTo(userPosition, 16);
      setDidInitialZoom(true);
    }
  }, [userPosition, map, didInitialZoom]);
  
  // Función para Centrar en la Ubicación del Usuario
  const handleCenterUser = useCallback(() => {
    if (map && userPosition) {
      map.flyTo(userPosition, 18, { animate: true, duration: 0.5 });
    } else if (!userPosition) {
      setError("Aún no hemos encontrado tu ubicación. Intentando de nuevo...");
    }
  }, [map, userPosition]);

  // NUEVA FUNCIÓN: Manejar Pantalla Completa
  const handleFullscreen = () => {
    // Pedir el modo de pantalla completa para el contenedor principal
    const container = map.getContainer();
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.mozRequestFullScreen) { // Firefox
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) { // Chrome, Safari and Opera
        container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) { // IE/Edge
        container.msRequestFullscreen();
    }
  };

  if (!trailData || trailData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
        Cargando datos de la ruta...
      </div>
    );
  }

  const startPoint = trailData[0];
  const endPoint = trailData[trailData.length - 1];

  const trailCasingOptions = { color: '#0d9488', weight: 9, opacity: 0.8 }; 
  const trailFillOptions = { color: '#84cc16', weight: 5, opacity: 1 }; 

  const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';
  
  // Componente para agrupar el botón de centrado y pantalla completa
  const ActionButtons = () => {
    // El 'map' se obtiene desde useMap dentro de MapContainer
    const map = useMap(); 
    return (
        // Los botones se mueven a la esquina superior derecha para no interferir con el Centrado Móvil
        <div className="absolute top-[80px] right-4 z-[1000] flex flex-col gap-2">
            {/* Botón de Pantalla Completa (Secundario, útil para escritorio) */}
            <button
                onClick={handleFullscreen}
                title="Ver en pantalla completa"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-md transition-colors hover:bg-slate-700"
            >
                <ExpandIcon className="h-6 w-6" />
            </button>
            {/* Botón de Centrado (Mi Ubicación) - CRÍTICO */}
            <button
                onClick={handleCenterUser}
                title="Centrar en mi ubicación"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-md transition-colors hover:bg-slate-700"
            >
                <CenterIcon className="h-6 w-6" />
            </button>
        </div>
    );
  };
  
  return (
    <div className="relative h-full w-full bg-slate-800">

      {/* --- UI: Barra de Estado (Manejo de Errores - No invasivo) --- */}
      {error && (
        <div className={`absolute top-0 w-full z-[1000] py-2 text-center text-sm font-medium text-red-100 shadow-lg ${isOnline ? 'bg-red-800/90' : 'bg-yellow-800/90'} backdrop-blur-sm`}>
          {error}
        </div>
      )}
      
      {!isOnline && !error && (
        <div className="absolute top-0 w-full z-[1000] bg-yellow-700/90 py-1 text-center text-xs font-medium text-yellow-100 backdrop-blur-sm">
          Modo Sin Conexión. Datos estáticos.
        </div>
      )}

      {/* --- UI: Mapa Contenedor --- */}
      <MapContainer 
        center={startPoint} 
        zoom={15} 
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        className="h-full w-full"
        ref={setMap} 
        attributionControl={false}
      >
        
        {/* Capas de Control */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Detallado (OSM)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite (Esri)">
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Botones de Acción (Centrar y Fullscreen) */}
        <ActionButtons />

        {/* Ruta A -> B (Usuario a Inicio del Sendero) - Se actualiza con userPosition */}
        {userPosition && (
          <RoutingControl 
            key={`route-${userPosition[0]}-${userPosition[1]}`}
            start={userPosition} 
            end={startPoint} 
            onRouteFound={setRouteStats} 
          />
        )}

        {/* Ruta B -> C (Sendero Fijo) */}
        <Polyline pathOptions={trailCasingOptions} positions={trailData} />
        <Polyline pathOptions={trailFillOptions} positions={trailData} />
        
        {/* Marcadores */}
        <Marker position={endPoint} icon={DestinationIcon}>
          <Popup><b>Punto Final</b></Popup>
        </Marker>
        {userPosition && (
          <Marker position={userPosition} icon={UserLocationIcon}>
            <Popup><b>Mi Ubicación</b></Popup>
          </Marker>
        )}
        
        <AttributionControl position="bottomleft" prefix={false} />
      </MapContainer>

      {/* --- UI: Caja de Estadísticas (Mobile Responsive, Tarjeta Retráctil) --- */}
      {routeStats && (
        <div className={`absolute bottom-0 left-0 w-full z-[1000] p-4 transition-transform duration-300 ${showStats ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
          <div 
            className="flex flex-col rounded-t-xl border border-sky-700/50 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md"
          >
            {/* Cabecera (Handle para retraer/expandir) */}
            <div 
                className="flex justify-center p-2 border-b border-slate-700 cursor-pointer"
                onClick={() => setShowStats(!showStats)}
            >
                <span className="w-10 h-1 bg-slate-600 rounded-full"></span>
            </div>
            
            {/* Contenido de la Tarjeta (Visible al expandir) */}
            <div className={`p-4 ${!showStats && 'hidden'}`}>
                <h3 className="text-lg font-bold text-sky-400 mb-2">Ruta Activa A &rarr; B</h3>
                <div className="flex justify-around gap-4 text-center">
                    {/* Dato Crucial #1: Tiempo Estimado */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">ETA</h4>
                        <span className="text-xl font-bold">~ {Math.round(routeStats.time / 60)} min</span>
                    </div>
                    {/* Dato Crucial #2: Distancia Restante */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">Distancia</h4>
                        <span className="text-xl font-bold">{formatDistance(routeStats.distance)}</span>
                    </div>
                    {/* Dato Crucial #3: Estado del Tráfico (Simulado) */}
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">Tráfico</h4>
                        <span className="text-xl font-bold text-lime-400">Fluido</span>
                    </div>
                </div>
            </div>
            
            {/* Versión retraída (solo muestra el ETA) */}
             {!showStats && (
                <div className="p-2 text-center text-sm font-medium">
                    ETA: <span className="font-bold text-sky-400">~ {Math.round(routeStats.time / 60)} min</span>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}