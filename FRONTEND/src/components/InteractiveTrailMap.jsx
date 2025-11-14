import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, LayersControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingControl from './RoutingControl';

// --- Iconos y Estilos (Sin Cambios) ---
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

// --- Función Auxiliar para la Distancia Haversine ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371e3; 
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};


export default function InteractiveTrailMap({ trailData }) {
  // Posición actual para el marcador y el centrado
  const [userPosition, setUserPosition] = useState(null); 
  // Posición usada para el ruteo (se actualiza menos frecuentemente)
  const [routeStartPos, setRouteStartPos] = useState(null); 
  
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [routeStats, setRouteStats] = useState(null);
  const [didInitialZoom, setDidInitialZoom] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStats, setShowStats] = useState(true); 

  // Referencia para guardar la última posición usada para el ruteo
  const lastRoutePosition = useRef(null);
  const MIN_DISTANCE_UPDATE_METERS = 50; 
  const MIN_TIME_UPDATE_MS = 10000; // 10 segundos
  const lastTimeUpdate = useRef(0);


  // --- ARQUITECTURA: Manejo de GPS y Estabilidad (CON DEBOUNCING) ---
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    const watchOptions = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPos = [latitude, longitude];
        const currentTime = Date.now();
        
        setUserPosition(currentPos); 
        setError(null); 

        // 1. Inicialización de la primera posición de ruteo
        if (!routeStartPos) {
             setRouteStartPos(currentPos);
             lastRoutePosition.current = currentPos;
             lastTimeUpdate.current = currentTime;
             return;
        }

        // 2. Aplicar Debouncing: Revisar distancia O tiempo
        const lastPos = lastRoutePosition.current;
        const distance = calculateDistance(lastPos[0], lastPos[1], latitude, longitude);
        
        const shouldUpdate = distance >= MIN_DISTANCE_UPDATE_METERS || 
                             (currentTime - lastTimeUpdate.current) >= MIN_TIME_UPDATE_MS;

        if (shouldUpdate) {
            // Si se movió lo suficiente O pasó el tiempo mínimo, actualizar la posición de la ruta
            lastRoutePosition.current = currentPos;
            lastTimeUpdate.current = currentTime;
            setRouteStartPos(currentPos); // Esto provoca un nuevo cálculo de ruta A->B
        }
      },
      (err) => {
        const errorMsg = err.code === 1 
            ? "Permiso de GPS denegado. Actívalo para navegación." 
            : "Señal GPS débil o perdida. Mostrando última ubicación.";
        setError(errorMsg);
      },
      watchOptions
    );

    // Manejo de Conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      navigator.geolocation.clearWatch(watcher);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [routeStartPos]); // Dependencia clave para la inicialización

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

  // Función para Pantalla Completa
  const handleFullscreen = useCallback(() => {
    if (!map) return;
    const container = map.getContainer();
    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    }
  }, [map]);

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
  
  const ActionButtons = () => {
    const map = useMap(); 
    if (!map) return null; // Previene errores si el mapa no se ha inicializado
    
    return (
        <div className="absolute top-[80px] right-4 z-[1000] flex flex-col gap-2">
            <button
                onClick={handleFullscreen}
                title="Ver en pantalla completa"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-md transition-colors hover:bg-slate-700"
            >
                <ExpandIcon className="h-6 w-6" />
            </button>
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

        <ActionButtons />

        {/* Ruta A -> B: AHORA DEPENDE DE routeStartPos (la posición con Debouncing) */}
        {routeStartPos && (
          <RoutingControl 
            key={`route-${routeStartPos[0]}-${routeStartPos[1]}`} // Usa routeStartPos
            start={routeStartPos} 
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
            <div 
                className="flex justify-center p-2 border-b border-slate-700 cursor-pointer"
                onClick={() => setShowStats(!showStats)}
            >
                <span className="w-10 h-1 bg-slate-600 rounded-full"></span>
            </div>
            
            <div className={`p-4 ${!showStats && 'hidden'}`}>
                <h3 className="text-lg font-bold text-sky-400 mb-2">Ruta Activa A &rarr; B</h3>
                <div className="flex justify-around gap-4 text-center">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">ETA</h4>
                        <span className="text-xl font-bold">~ {Math.round(routeStats.time / 60)} min</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">Distancia</h4>
                        <span className="text-xl font-bold">{formatDistance(routeStats.distance)}</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">Tráfico</h4>
                        <span className="text-xl font-bold text-lime-400">Fluido</span>
                    </div>
                </div>
            </div>
            
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