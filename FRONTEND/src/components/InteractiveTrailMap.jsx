import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, LayersControl, AttributionControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotate'; 
import RoutingControl from './RoutingControl'; 

// --- 1. ESTILOS VISUALES: EFECTO GOOGLE MAPS ---
const styles = `
  /* Anillo que se expande suavemente (El efecto de radar) */
  @keyframes google-pulse-ring {
    0% {
      transform: scale(0.8);
      opacity: 0.6;
      box-shadow: 0 0 0 0 rgba(66, 133, 244, 0.4);
    }
    70% {
      transform: scale(2.5); /* Se expande pero en azul suave */
      opacity: 0;
      box-shadow: 0 0 0 10px rgba(66, 133, 244, 0);
    }
    100% {
      transform: scale(0.8);
      opacity: 0;
    }
  }

  /* Animación de entrada para los avisos */
  @keyframes fade-in-down {
    0% { opacity: 0; transform: translate(-50%, -20px); }
    100% { opacity: 1; transform: translate(-50%, 0); }
  }

  /* Efecto vidrio para botones */
  .glass-btn {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }
`;

// --- 2. ÍCONO DE USUARIO (Diseño Google Maps Exacto) ---
const createUserIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
      <style>${styles}</style>
      
      <div style="
        position: absolute;
        width: 16px;
        height: 16px;
        background-color: rgba(66, 133, 244, 0.6);
        border-radius: 50%;
        animation: google-pulse-ring 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 0;
      "></div>

      <div style="
        position: relative;
        width: 18px; 
        height: 18px; 
        background-color: white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
            width: 12px; 
            height: 12px; 
            background-color: #4285F4; 
            border-radius: 50%; 
        "></div>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

// --- ÍCONOS Y BOTONES ---
const DestinationIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ActionButton = ({ onClick, icon, className, disabled, style }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onClick();
    }}
    style={style}
    className={`
        group flex h-12 w-12 items-center justify-center 
        rounded-2xl glass-btn shadow-[0_4px_20px_rgb(0,0,0,0.1)]
        active:scale-95 transition-all duration-300 
        text-slate-700 hover:text-blue-600
        ${className} 
        ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:bg-white'}
    `}
  >
    {icon}
  </button>
);

const Icons = {
    Center: () => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
             <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
    ),
    Expand: () => (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
    ),
    Collapse: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>,
    Offline: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 16.5c-1.5-1.5-2.25-3.5-2.25-5.625 0-1.5.56-2.905 1.5-4.075M21 12c0 2.125-.75 4.125-2.25 5.625M16.5 7.5c1.1.6 1.95 1.65 2.25 2.925M9 9c-.6 1.1-.6 2.35 0 3.45" /></svg>,
    GPSOff: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    Compass: () => (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" className="fill-white/20" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 6L14 12H10L12 6Z" fill="#EF4444" /> 
            <path d="M12 18L10 12H14L12 18Z" fill="#94A3B8" /> 
        </svg>
    )
};

// --- HELPERS ---
const CompassController = ({ onRotate }) => {
    const map = useMapEvents({
        rotate: (e) => {
            onRotate(map.getBearing());
        }
    });
    return null;
};

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

// --- COMPONENTE PRINCIPAL ---
export default function InteractiveTrailMap({ trailData, onGpsErrorChange}) {
  const [userPosition, setUserPosition] = useState(null); 
  const [routeStartPos, setRouteStartPos] = useState(null); 
  const [gpsError, setGpsError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [map, setMap] = useState(null);
  const [didInitialZoom, setDidInitialZoom] = useState(false);
  
  // Estado para mostrar/ocultar panel y rotación
  const [showStats, setShowStats] = useState(true); 
  const [routeStats, setRouteStats] = useState(null);
  const [mapBearing, setMapBearing] = useState(0); 
  
  const lastRoutePosition = useRef(null);
  const MIN_DISTANCE_UPDATE_METERS = 50; 
  const MIN_TIME_UPDATE_MS = 15000;
  const lastTimeUpdate = useRef(0);
  
  const mapContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const startPoint = useMemo(() => trailData?.[0], [trailData]);
  const endPoint = useMemo(() => trailData?.[trailData.length - 1], [trailData]);
  const [showSmallGpsError, setShowSmallGpsError] = useState(false);
  
  useEffect(() => {
    if (onGpsErrorChange) {
        onGpsErrorChange(gpsError); 
    }
    setShowSmallGpsError(!!gpsError); 
  }, [gpsError, onGpsErrorChange]);


  // ... Lógica GPS y Eventos ...
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
    if (!navigator.geolocation) { setGpsError("Tu dispositivo no soporta GPS"); return; }
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
        const shouldUpdate = distance >= MIN_DISTANCE_UPDATE_METERS || (currentTime - lastTimeUpdate.current) >= MIN_TIME_UPDATE_MS;
        if (shouldUpdate) {
            lastRoutePosition.current = newPos;
            lastTimeUpdate.current = currentTime;
            setRouteStartPos(newPos);
        }
      },
      (err) => setGpsError("Señal GPS débil o sin permiso."),
      watchOptions
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, [routeStartPos, startPoint, endPoint, isOffline]); 

  
  useEffect(() => {
    if (map && !didInitialZoom && (userPosition || startPoint)) {
        // CORRECCIÓN ZOOM: Priorizamos userPosition si existe, si no, el startPoint
        const target = userPosition || startPoint;
        const timer = setTimeout(() => { map.setView(target, 15); setDidInitialZoom(true); }, 100);
        return () => clearTimeout(timer);
    }
  }, [userPosition, map, didInitialZoom, startPoint]);
  
  useEffect(() => {
      const handleFsChange = () => {
          setIsFullscreen(!!document.fullscreenElement);
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
      if(map && userPosition) map.flyTo(userPosition, 17, { animate: true, duration: 0.8 });
      else if (gpsError) alert(`No podemos ubicarte: ${gpsError}`);
  };

  const handleResetNorth = () => { if (map) map.setBearing(0); };

  if (!startPoint || !endPoint) return <div className="flex h-64 w-full items-center justify-center bg-slate-100 text-slate-400">Cargando mapa...</div>;

  const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';
  const formatTime = (minutes) => {
      if (minutes < 60) return `~ ${Math.round(minutes)} min`;
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `~ ${hours}h ${mins}`;
  };

  // --- NUEVO ESTILO: LÍNEA SÓLIDA ELEGANTE ---
  const staticPathOptions = { color: '#4285F4', weight: 6, opacity: 0.8 }; 

  return (
    <div ref={mapContainerRef} className={`relative w-full bg-slate-800 overflow-hidden rounded-xl shadow-inner transition-all duration-300 ${isFullscreen ? 'fixed inset-0 h-screen z-[9999] rounded-none' : 'h-full'}`}>
      
      {/* --- AVISOS FLOTANTES --- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-2 w-auto max-w-[95%] pointer-events-none">
          <style>{`.animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; } ${styles}`}</style>
          {isOffline && (
             <div className="bg-slate-800/90 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl backdrop-blur-md flex items-center justify-center gap-3 animate-fade-in-down border border-yellow-500/50">
                 <div className="bg-yellow-500 p-1 rounded-full animate-pulse"><Icons.Offline /></div>
                 <div className="flex flex-col items-start leading-tight">
                    <span className="font-bold text-yellow-400">Estás desconectado</span>
                    <span className="text-xs text-slate-300">Mapa en modo sin conexión</span>
                 </div>
             </div>
          )}
          {gpsError && !onGpsErrorChange && (
             <div className="bg-slate-800/90 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl backdrop-blur-md flex items-center justify-center gap-3 animate-fade-in-down border border-red-500/50">
                 <div className="bg-red-500 p-1 rounded-full"><Icons.GPSOff /></div>
                 <span>{gpsError}</span>
             </div>
          )}
      </div>

      <MapContainer 
        center={startPoint} 
        zoom={15} 
        scrollWheelZoom={true}
        rotate={true} 
        touchRotate={true} 
        rotateControl={false}
        className="h-full w-full z-0" 
        ref={setMap} 
        attributionControl={false} 
        zoomControl={false} 
        layersControl={false}
      >
        <CompassController onRotate={setMapBearing} />
        
        {/* Capas Seguras HTTPS */}
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Google Calles">
            <TileLayer 
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
                attribution="Google Maps" 
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Google Híbrido">
            <TileLayer 
                url="https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" 
                attribution="Google Maps" 
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="OpenStreetMap">
             <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
             />
          </LayersControl.BaseLayer>
        </LayersControl>

        {!isOffline && routeStartPos && (
          <RoutingControl 
            key={`route-${routeStartPos[0].toFixed(4)}-${routeStartPos[1].toFixed(4)}`} 
            start={routeStartPos} 
            end={endPoint} 
            onRouteFound={setRouteStats} 
          />
        )}

        {/* CAMBIO AQUÍ: Una sola línea sólida y elegante */}
        {(isOffline || !routeStats) && trailData && trailData.length > 0 && (
            <Polyline positions={trailData} pathOptions={staticPathOptions} />
        )}
        
        <Marker position={endPoint} icon={DestinationIcon}><Popup>Punto Final</Popup></Marker>
        {userPosition && (<Marker position={userPosition} icon={createUserIcon()}><Popup>Tú</Popup></Marker>)}
        <AttributionControl position="bottomright" prefix={false} />
      </MapContainer>

      {/* --- CONTROLES FLOTANTES --- */}
      <div 
        className="absolute right-4 flex flex-col gap-3 z-[1000] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)"
        style={{ 
            bottom: showStats ? '170px' : '80px' 
        }}
      >
          <ActionButton 
            onClick={handleResetNorth} 
            icon={<Icons.Compass />} 
            style={{ transform: `rotate(${-mapBearing}deg)`, transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          <ActionButton 
            onClick={handleCenterMap} 
            icon={<Icons.Center />} 
            disabled={!userPosition} 
          />
          <ActionButton 
            onClick={toggleFullscreen} 
            icon={isFullscreen ? <Icons.Collapse /> : <Icons.Expand />} 
          />
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
                                ? "La ruta estática se muestra en el mapa." 
                                : gpsError ? "Esperando señal GPS..." : "Obteniendo ruta óptima..."}
                          </span>
                      </div>
                )}
            </div>
        </div>
    </div>
  );
}