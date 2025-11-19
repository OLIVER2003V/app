import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, LayersControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingControl from './RoutingControl';
import * as turf from '@turf/turf';

// --- 1. ESTILOS CSS EN JS ---
const pulseAnimation = `
  @keyframes pulse-ring {
    0% { transform: scale(0.33); opacity: 1; }
    80%, 100% { transform: scale(2.5); opacity: 0; }
  }
  @keyframes pulse-dot {
    0% { transform: scale(0.8); }
    50% { transform: scale(1); }
    100% { transform: scale(0.8); }
  }
`;

// --- 2. ICONOS ---
const createUserIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 24px; height: 24px;">
      <style>${pulseAnimation}</style>
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: rgba(66, 133, 244, 0.5); animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
      <div style="position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; background-color: white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      <div style="position: absolute; top: 5px; left: 5px; width: 14px; height: 14px; background-color: #4285F4; border-radius: 50%; animation: pulse-dot 2.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) -0.4s infinite;"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const DestinationIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- 3. COMPONENTES DE UI ---
const ActionButton = ({ onClick, icon, className }) => (
  <button
    type="button"
    onClick={(e) => {
        e.stopPropagation();
        onClick();
    }}
    className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg active:scale-95 transition-transform border border-slate-100 ${className}`}
  >
    {icon}
  </button>
);

const Icons = {
    Center: () => <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>,
    Expand: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" /></svg>,
    Collapse: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>
};

// --- 4. FUNCIONES AUXILIARES ---
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

const DISTANCE_TO_START_THRESHOLD_METERS = 30;

export default function InteractiveTrailMap({ trailData }) {
  const [userPosition, setUserPosition] = useState(null); 
  const [routeStartPos, setRouteStartPos] = useState(null); 
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [didInitialZoom, setDidInitialZoom] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStats, setShowStats] = useState(true); // Panel stats abierto/cerrado
  
  const [navMode, setNavMode] = useState('TO_TRAIL');
  
  const [routeStats, setRouteStats] = useState(null);
  const lastRoutePosition = useRef(null);
  const MIN_DISTANCE_UPDATE_METERS = 50; 
  const MIN_TIME_UPDATE_MS = 10000;
  const lastTimeUpdate = useRef(0);
  
  // Referencia al contenedor del mapa para Fullscreen
  const mapContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startPoint = useMemo(() => trailData?.[0], [trailData]);
  const endPoint = useMemo(() => trailData?.[trailData.length - 1], [trailData]);

  // --- GPS y Lógica de Ruteo ---
  useEffect(() => {
    if (!startPoint) return;
    if (!navigator.geolocation) { setError("GPS no soportado"); return; }

    const watchOptions = { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 };

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPos = [latitude, longitude];
        const currentTime = Date.now();
        
        setUserPosition(currentPos); 
        setError(null); 

        const distanceToStart = calculateDistance(latitude, longitude, startPoint[0], startPoint[1]);
        
        if (distanceToStart < DISTANCE_TO_START_THRESHOLD_METERS && navMode === 'TO_TRAIL') {
            setNavMode('ON_TRAIL');
        }

        if (!routeStartPos) {
            setRouteStartPos(currentPos);
            lastRoutePosition.current = currentPos;
            lastTimeUpdate.current = currentTime;
            return;
        }
        const lastPos = lastRoutePosition.current;
        const distance = calculateDistance(lastPos[0], lastPos[1], latitude, longitude);
        const shouldUpdate = distance >= MIN_DISTANCE_UPDATE_METERS || 
                                (currentTime - lastTimeUpdate.current) >= MIN_TIME_UPDATE_MS;
        if (shouldUpdate) {
            lastRoutePosition.current = currentPos;
            lastTimeUpdate.current = currentTime;
            setRouteStartPos(currentPos); 
        }
      },
      (err) => setError("GPS Error"),
      watchOptions
    );
    
    return () => navigator.geolocation.clearWatch(watcher);
  }, [routeStartPos, navMode, startPoint]); 

  // --- Zoom Inicial ---
  useEffect(() => {
    if (userPosition && map && !didInitialZoom) {
      map.setView(userPosition, 16);
      setDidInitialZoom(true);
    }
  }, [userPosition, map, didInitialZoom]);
  
  // --- Fullscreen Handler ---
  useEffect(() => {
      const handleFsChange = () => {
          const isFs = !!document.fullscreenElement;
          setIsFullscreen(isFs);
          // Forzar a Leaflet a recalcular tamaño al cambiar modo
          setTimeout(() => { if(map) map.invalidateSize(); }, 100);
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [map]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    
    if (!document.fullscreenElement) {
        // Solicitamos fullscreen AL CONTENEDOR ESPECÍFICO DEL MAPA, no a todo el documento
        mapContainerRef.current.requestFullscreen().catch(err => {
            console.error(`Error al intentar activar pantalla completa: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
  };

  const handleCenterMap = () => {
      if(map && userPosition) {
          map.flyTo(userPosition, 17, { animate: true, duration: 0.8 });
      }
  };

  if (!startPoint || !endPoint) {
    return <div className="flex h-64 w-full items-center justify-center bg-slate-100 text-slate-400">Cargando mapa...</div>;
  }

  const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';
  const formatTime = (minutes) => {
      if (minutes < 60) return `~ ${Math.round(minutes)} min`;
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `~ ${hours}h ${mins}`;
  };

  return (
    // Usamos una ref aquí para decirle al navegador QUE ESTO ES LO QUE QUEREMOS EN FULLSCREEN
    <div ref={mapContainerRef} className="relative h-full w-full bg-slate-800 overflow-hidden rounded-xl shadow-inner">
      
      {error && (
        <div className="absolute top-0 left-0 right-0 z-[2000] bg-red-500/90 text-white text-xs py-1 text-center backdrop-blur-sm">
          {error}
        </div>
      )}

      <MapContainer 
        center={startPoint}
        zoom={15} 
        scrollWheelZoom={true}
        touchZoom={true}
        className="h-full w-full z-0"
        ref={setMap} 
        attributionControl={false}
        zoomControl={false} // Quitamos el zoom por defecto
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Google Calles">
            <TileLayer url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} maxZoom={20} attribution="Google Maps" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Híbrido">
            <TileLayer url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} maxZoom={20} attribution="Google Maps" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Ruta Azul A->B->C */}
        {routeStartPos && (
          <RoutingControl 
            key={`route-${routeStartPos[0]}-${routeStartPos[1]}`} 
            start={routeStartPos} 
            stopover={startPoint} 
            end={endPoint}        
            onRouteFound={setRouteStats}
          />
        )}
        
        {/* Marcador Final */}
        <Marker position={endPoint} icon={DestinationIcon}>
          <Popup>Punto Final</Popup>
        </Marker>
        
        {/* Usuario */}
        {userPosition && (
          <Marker position={userPosition} icon={createUserIcon()}>
            <Popup>Tú</Popup>
          </Marker>
        )}
        
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>

      {/* --- CONTROLES FLOTANTES --- */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[1000]">
          <ActionButton onClick={handleCenterMap} icon={<Icons.Center />} />
          <ActionButton onClick={toggleFullscreen} icon={isFullscreen ? <Icons.Collapse /> : <Icons.Expand />} />
      </div>

      {/* --- PANEL DESPLEGABLE (Bottom Sheet) --- */}
      {routeStats && (
        <div className={`absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out ${showStats ? 'h-36' : 'h-12'}`}>
            
            {/* Barra de Agarre */}
            <div 
                className="w-full h-8 flex items-center justify-center cursor-pointer active:opacity-50"
                onClick={() => setShowStats(!showStats)}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Contenido */}
            <div className="px-6 flex flex-row justify-between items-start">
                <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Tiempo Estimado</span>
                        <div className="text-3xl font-black text-slate-800 mt-1">
                        {formatTime(routeStats.time / 60)}
                        </div>
                        <span className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        Tráfico Fluido
                        </span>
                </div>

                <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Distancia</span>
                        <div className="text-3xl font-black text-blue-600 mt-1">
                        {formatDistance(routeStats.distance)}
                        </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}