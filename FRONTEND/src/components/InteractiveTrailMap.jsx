import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, LayersControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingControl from './RoutingControl'; 
import * as turf from '@turf/turf';

// --- 1. ESTILOS CSS (Animaciones) ---
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
  @keyframes fade-in-down {
    0% { opacity: 0; transform: translate(-50%, -20px); }
    100% { opacity: 1; transform: translate(-50%, 0); }
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

// --- 3. COMPONENTES UI ---
const ActionButton = ({ onClick, icon, className, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
    }}
    className={`flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg active:scale-95 transition-transform border border-slate-100 ${className} ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
  >
    {icon}
  </button>
);

const Icons = {
    Center: () => (
        <svg className="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    ),
    // ICONO EXPANDIR CON FLECHA CENTRAL (arreglado)
    Expand: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l7.5 7.5m0 0l7.5 7.5M12 12L4.5 19.5M12 12l7.5-7.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6V9M9 3H3v6m0 6v6h6m6 0h6v-6" />
        </svg>
    ),
    // ICONO COLAPSAR (se revirtió al original que ya estaba bien)
    Collapse: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>,
    Offline: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 16.5c-1.5-1.5-2.25-3.5-2.25-5.625 0-1.5.56-2.905 1.5-4.075M21 12c0 2.125-.75 4.125-2.25 5.625M16.5 7.5c1.1.6 1.95 1.65 2.25 2.925M9 9c-.6 1.1-.6 2.35 0 3.45" /></svg>,
    GPSOff: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
};

// --- 4. HELPERS ---
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
  const [userPosition, setUserPosition] = useState(null); 
  const [routeStartPos, setRouteStartPos] = useState(null); 
  
  const [gpsError, setGpsError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [map, setMap] = useState(null);
  const [didInitialZoom, setDidInitialZoom] = useState(false);
  const [showStats, setShowStats] = useState(true); 
  const [routeStats, setRouteStats] = useState(null);
  
  const lastRoutePosition = useRef(null);
  const MIN_DISTANCE_UPDATE_METERS = 50; 
  const MIN_TIME_UPDATE_MS = 15000;
  const lastTimeUpdate = useRef(0);
  
  const mapContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startPoint = useMemo(() => trailData?.[0], [trailData]);
  const endPoint = useMemo(() => trailData?.[trailData.length - 1], [trailData]);

  useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  useEffect(() => {
    if (!startPoint || !endPoint) return;
    
    if (!navigator.geolocation) { 
        setGpsError("Tu dispositivo no soporta GPS"); 
        return; 
    }

    const watchOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 2000 };

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = [latitude, longitude];
        
        setUserPosition(newPos); 
        setGpsError(null); 

        if (isOffline) return;

        if (!routeStartPos) {
            setRouteStartPos(newPos);
            lastRoutePosition.current = newPos;
            lastTimeUpdate.current = Date.now();
            return;
        }

        const currentTime = Date.now();
        const lastPos = lastRoutePosition.current;
        const distance = calculateDistance(lastPos[0], lastPos[1], latitude, longitude);
        const shouldUpdate = distance >= MIN_DISTANCE_UPDATE_METERS || 
                             (currentTime - lastTimeUpdate.current) >= MIN_TIME_UPDATE_MS;

        if (shouldUpdate) {
            lastRoutePosition.current = newPos;
            lastTimeUpdate.current = currentTime;
            setRouteStartPos(newPos);
        }
      },
      (err) => {
          let msg = "Error de GPS desconocido";
          if (err.code === 1) msg = "Permiso de ubicación denegado.";
          else if (err.code === 2) msg = "Señal GPS débil o perdida.";
          else if (err.code === 3) msg = "Tiempo de espera agotado.";
          setGpsError(msg);
      },
      watchOptions
    );
    
    return () => navigator.geolocation.clearWatch(watcher);
  }, [routeStartPos, startPoint, endPoint, isOffline]); 

  useEffect(() => {
    if (map && !didInitialZoom) {
        const target = userPosition || startPoint;
        if (target) {
             const timer = setTimeout(() => { 
                 map.setView(target, 15); 
                 setDidInitialZoom(true); 
             }, 100);
             return () => clearTimeout(timer);
        }
    }
  }, [userPosition, map, didInitialZoom, startPoint]);
  
  useEffect(() => {
      const handleFsChange = () => {
          const isFs = !!document.fullscreenElement;
          setIsFullscreen(isFs);
          setTimeout(() => { if(map) map.invalidateSize(); }, 100);
      };
      document.addEventListener('fullscreenchange', handleFsChange);
      return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [map]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) mapContainerRef.current.requestFullscreen().catch(e => console.log(e));
    else document.exitFullscreen();
  };

  const handleCenterMap = () => {
      if(map && userPosition) {
          map.flyTo(userPosition, 17, { animate: true, duration: 0.8 });
      } else if (gpsError) {
          alert(`No podemos ubicarte: ${gpsError}`);
      }
  };

  if (!startPoint || !endPoint) return <div className="flex h-64 w-full items-center justify-center bg-slate-100 text-slate-400">Cargando mapa...</div>;

  const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';
  const formatTime = (minutes) => {
      if (minutes < 60) return `~ ${Math.round(minutes)} min`;
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `~ ${hours}h ${mins}`;
  };

  const offlineRouteCasing = { color: '#1E8449', weight: 8, opacity: 0.8 }; 
  const offlineRouteFill = { color: '#7CFC00', weight: 5, opacity: 1, dashArray: '10, 15' }; 

  return (
    <div ref={mapContainerRef} className={`relative w-full bg-slate-800 overflow-hidden rounded-xl shadow-inner transition-all duration-300 ${isFullscreen ? 'fixed inset-0 h-screen z-[9999] rounded-none' : 'h-full'}`}>
      
      {/* --- AVISOS FLOTANTES --- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-2 w-auto max-w-[95%] pointer-events-none">
          <style>{`
              .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
              ${pulseAnimation}
          `}</style>
          
          {isOffline && (
             <div className="bg-slate-800/90 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl backdrop-blur-md flex items-center justify-center gap-3 animate-fade-in-down border border-yellow-500/50">
                 <div className="bg-yellow-500 p-1 rounded-full animate-pulse">
                    <Icons.Offline />
                 </div>
                 <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-yellow-400">Estás desconectado</span>
                    <span className="text-xs text-slate-300">Sigue la ruta verde punteada</span>
                 </div>
             </div>
          )}

          {gpsError && (
             <div className="bg-slate-800/90 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl backdrop-blur-md flex items-center justify-center gap-3 animate-fade-in-down border border-red-500/50">
                 <div className="bg-red-500 p-1 rounded-full">
                    <Icons.GPSOff />
                 </div>
                 <span>{gpsError}</span>
             </div>
          )}
      </div>

      <MapContainer 
        center={startPoint}
        zoom={15} 
        scrollWheelZoom={true}
        touchZoom={true}
        className="h-full w-full z-0"
        ref={setMap} 
        attributionControl={false}
        zoomControl={false}
        layersControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Google Calles">
            <TileLayer url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} maxZoom={20} attribution="Google Maps" />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Híbrido">
            <TileLayer url="http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} maxZoom={20} attribution="Google Maps" />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* RUTA ONLINE (Azul Sólida) */}
        {!isOffline && routeStartPos && (
          <RoutingControl 
            key={`route-${routeStartPos[0]}-${routeStartPos[1]}`} 
            start={routeStartPos} 
            stopover={startPoint} 
            end={endPoint}        
            onRouteFound={setRouteStats}
          />
        )}

        {/* RUTA OFFLINE (Verde Punteada Brillante) */}
        {(isOffline || !routeStats) && (
            <>
             <Polyline positions={trailData} pathOptions={offlineRouteCasing} />
             <Polyline positions={trailData} pathOptions={offlineRouteFill} />
            </>
        )}
        
        <Marker position={endPoint} icon={DestinationIcon}>
          <Popup>Punto Final</Popup>
        </Marker>
        
        {userPosition && (
          <Marker position={userPosition} icon={createUserIcon()}>
            <Popup>Tú</Popup>
          </Marker>
        )}
        
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>

      {/* --- CONTROLES FLOTANTES --- */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[1000]">
          <ActionButton 
            onClick={handleCenterMap} 
            icon={<Icons.Center />} 
            disabled={!userPosition} 
            className={!userPosition ? "opacity-50 grayscale" : ""}
          />
          <ActionButton onClick={toggleFullscreen} icon={isFullscreen ? <Icons.Collapse /> : <Icons.Expand />} />
      </div>

      {/* --- PANEL DESPLEGABLE --- */}
      <div className={`absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.15)] transition-all duration-300 ease-out ${showStats ? 'h-36' : 'h-12'}`}>
            <div 
                className="w-full h-8 flex items-center justify-center cursor-pointer active:opacity-50"
                onClick={() => setShowStats(!showStats)}
            >
                <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            <div className="px-6 flex flex-row justify-between items-start">
                {routeStats && !isOffline ? (
                    <>
                        <div className="flex flex-col">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Tiempo Estimado</span>
                                <div className="text-3xl font-black text-slate-800 mt-1">
                                {formatTime(routeStats.time / 60)}
                                </div>
                                <span className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Ruta Activa
                                </span>
                        </div>
                        <div className="flex flex-col items-end">
                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide">Distancia</span>
                                <div className="text-3xl font-black text-blue-600 mt-1">
                                {formatDistance(routeStats.distance)}
                                </div>
                        </div>
                    </>
                ) : (
                     <div className="flex flex-col w-full items-center text-center pt-2 gap-1">
                         <span className="text-slate-700 font-bold text-lg">
                             {isOffline ? "Estás desconectado" : "Calculando ruta..."}
                         </span>
                         <span className="text-xs text-slate-500 font-medium">
                             {isOffline 
                                ? "Sigue la ruta verde punteada en el mapa." 
                                : gpsError ? "Esperando señal GPS..." : "Obteniendo ruta óptima..."}
                         </span>
                     </div>
                )}
            </div>
        </div>
    </div>
  );
}
