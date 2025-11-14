import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, LayersControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingControl from './RoutingControl';
import * as turf from '@turf/turf';

// --- Iconos SVG (Sin Cambios) ---
const CenterIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 9v.01M12 15v.01" />
  </svg>
);
const ExpandIcon = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
    </svg>
);
const InfoIcon = ({ className }) => ( 
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);

// --- Iconos de Leaflet (Sin Cambios) ---
const UserLocationIcon = L.divIcon({
  html: `<div class="relative flex h-6 w-6 items-center justify-center"><span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span><span class="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-500"></span></div>`,
  className: 'bg-transparent border-none',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const StartIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  html: `<img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png" style="filter: hue-rotate(120deg) brightness(1.1);">`,
  className: 'bg-transparent border-none',
});
const DestinationIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// --- Función Auxiliar Haversine (Sin Cambios) ---
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

// --- Constante de Detección (Sin Cambios) ---
const DISTANCE_TO_START_THRESHOLD_METERS = 30;

export default function InteractiveTrailMap({ trailData }) {
  // --- 1. LLAMADA A TODOS LOS HOOKS (INICIO) ---
  const [userPosition, setUserPosition] = useState(null); 
  const [routeStartPos, setRouteStartPos] = useState(null); 
  const [error, setError] = useState(null);
  const [map, setMap] = useState(null);
  const [didInitialZoom, setDidInitialZoom] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStats, setShowStats] = useState(true); 
  const [navMode, setNavMode] = useState('TO_TRAIL');
  const [onTrailStats, setOnTrailStats] = useState(null); 
  const [routeStats, setRouteStats] = useState(null);
  const lastRoutePosition = useRef(null);
  const MIN_DISTANCE_UPDATE_METERS = 50; 
  const MIN_TIME_UPDATE_MS = 10000;
  const lastTimeUpdate = useRef(0);
  const [showLegend, setShowLegend] = useState(false);

  // --- Derivar TODOS los datos dependientes con useMemo ---
  const startPoint = useMemo(() => {
    if (!trailData || trailData.length === 0) return null;
    return trailData[0];
  }, [trailData]);

  const endPoint = useMemo(() => {
    if (!trailData || trailData.length === 0) return null;
    return trailData[trailData.length - 1];
  }, [trailData]);

  const trailLineString = useMemo(() => {
    if (!trailData || trailData.length === 0) return null;
    return turf.lineString(trailData.map(pos => [pos[1], pos[0]]));
  }, [trailData]);
  
  const trailEndPointTurf = useMemo(() => {
    if (!endPoint) return null;
    return turf.point([endPoint[1], endPoint[0]]);
  }, [endPoint]);

  // --- Mover TODOS los useEffect y useCallback aquí ---
  
  // useEffect (GPS)
  useEffect(() => {
    if (!startPoint || !trailLineString || !trailEndPointTurf) {
      return;
    }

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

        const distanceToStart = calculateDistance(latitude, longitude, startPoint[0], startPoint[1]);

        if (distanceToStart < DISTANCE_TO_START_THRESHOLD_METERS && navMode === 'TO_TRAIL') {
            setNavMode('ON_TRAIL');
            setRouteStats(null); 
        }

        if (navMode === 'ON_TRAIL') {
            const userPointTurf = turf.point([longitude, latitude]);
            const nearestPoint = turf.nearestPointOnLine(trailLineString, userPointTurf, { units: 'meters' });
            const remainingLine = turf.lineSlice(nearestPoint, trailEndPointTurf, trailLineString);
            const remainingDistance = turf.length(remainingLine, { units: 'meters' });

            setOnTrailStats({
                distance: remainingDistance,
                time: (remainingDistance / 1000) / 5 * 60 
            });

        } else {
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

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      navigator.geolocation.clearWatch(watcher);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [routeStartPos, navMode, trailLineString, trailEndPointTurf, startPoint]); 

  // useEffect (Initial Zoom)
  useEffect(() => {
    if (userPosition && map && !didInitialZoom) {
      map.flyTo(userPosition, 16);
      setDidInitialZoom(true);
    }
  }, [userPosition, map, didInitialZoom]);
  
  // useCallback (Center User)
  const handleCenterUser = useCallback(() => {
    if (map && userPosition) {
      map.flyTo(userPosition, 18, { animate: true, duration: 0.5 });
    } else if (!userPosition) {
      setError("Aún no hemos encontrado tu ubicación. Intentando de nuevo...");
    }
  }, [map, userPosition]);

  // useCallback (Fullscreen)
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

  // --- 2. RETORNO TEMPRANO (AHORA ES SEGURO) ---
  if (!startPoint || !endPoint) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-slate-400">
        Cargando datos de la ruta...
      </div>
    );
  }

  // --- 3. LÓGICA DE RENDER ---
  // Estilos del Sendero (B -> C) - Verde Original Restaurado
  const trailCasingOptions = { color: '#0d9488', weight: 9, opacity: 0.8 }; 
  const trailFillOptions = { color: '#84cc16', weight: 5, opacity: 1 }; 
  
  // Formateadores de Distancia y Tiempo (Sin Cambios)
  const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';
  const formatTime = (minutes) => {
      if (minutes < 60) {
          return `~ ${Math.round(minutes)} min`;
      }
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `~ ${hours}h ${mins}m`;
  };
  
  // Componente interno para los botones de acción (Sin Cambios)
  const ActionButtons = () => {
    const mapInstance = useMap(); 
    if (!mapInstance) return null; 
    
    return (
        <div className="absolute top-[100px] right-4 z-[1000] flex flex-col gap-2"> 
            <button
                onClick={() => setShowLegend(!showLegend)}
                title="Mostrar Leyenda del Mapa"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-md transition-colors hover:bg-slate-700"
            >
                <InfoIcon className="h-6 w-6" />
            </button>
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

  // Componente para la Leyenda (Sin Cambios)
  const MapLegend = () => {
    const routeToTrailColor = '#00D8FF';
    const trailColor = '#84cc16';

    return (
      <div className={`absolute top-4 left-4 z-[1000] p-4 bg-slate-900/90 rounded-lg shadow-xl border border-slate-700 text-slate-100 transition-opacity duration-300 ${showLegend ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <h4 className="font-bold text-lg mb-2 text-white">Leyenda del Mapa</h4>
        <div className="flex items-center mb-2">
          <span style={{ backgroundColor: routeToTrailColor, width: '20px', height: '10px', display: 'inline-block', marginRight: '8px', borderRadius: '2px' }}></span>
          <span>Tu ubicación &rarr; Inicio del Sendero (SCZ &rarr; El Torno)</span>
        </div>
        <div className="flex items-center">
          <span style={{ backgroundColor: trailColor, width: '20px', height: '10px', display: 'inline-block', marginRight: '8px', borderRadius: '2px' }}></span>
          <span>Sendero Principal (El Torno &rarr; Jardín)</span>
        </div>
        <button 
            onClick={() => setShowLegend(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 text-xl font-bold"
            title="Cerrar Leyenda"
        >
            &times;
        </button>
      </div>
    );
  };
  
  // --- RENDERIZADO (Todo el JSX) ---
  return (
    <div className="relative h-full w-full bg-slate-800">

      {/* Alertas de Estado */}
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

      {/* Contenedor del Mapa */}
      <MapContainer 
        center={startPoint}
        zoom={15} 
        scrollWheelZoom={true}
        touchZoom={true}
        doubleClickZoom={true}
        className="h-full w-full"
        ref={setMap} 
        attributionControl={false}
        // --- ¡CORRECCIÓN! ---
        // Desactivamos el control de capas por defecto para
        // eliminar el cuadro blanco fantasma.
        layersControl={false} 
      >
        
        {/* Este es el ÚNICO control de capas que debe existir. */}
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

        {/* Botones de acción (Info, Fullscreen y Centrar) */}
        <ActionButtons />

        {/* Ruta A -> B (Condicional) */}
        {navMode === 'TO_TRAIL' && routeStartPos && (
          <RoutingControl 
            key={`route-${routeStartPos[0]}-${routeStartPos[1]}`} 
            start={routeStartPos} 
            end={startPoint} 
            onRouteFound={setRouteStats}
          />
        )}

        {/* Ruta B -> C (Sendero Fijo) */}
        <Polyline pathOptions={trailCasingOptions} positions={trailData} />
        <Polyline pathOptions={trailFillOptions} positions={trailData} />
        
        {/* Marcadores */}
        <Marker position={startPoint} icon={StartIcon}>
          <Popup><b>Inicio del Sendero</b></Popup>
        </Marker>
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

      {/* --- Leyenda del Mapa --- */}
      <MapLegend />

      {/* UI: Caja de Estadísticas (Sin Cambios) */}
      
      {/* 1. Stats A->B */}
      {navMode === 'TO_TRAIL' && routeStats && (
        <div className={`absolute bottom-0 left-0 w-full z-[1000] p-4 transition-transform duration-300 ${showStats ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
          <div className="flex flex-col rounded-t-xl border border-sky-700/50 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md">
            <div className="flex justify-center p-2 border-b border-slate-700 cursor-pointer" onClick={() => setShowStats(!showStats)}>
              <span className="w-10 h-1 bg-slate-600 rounded-full"></span>
            </div>
            <div className={`p-4 ${!showStats && 'hidden'}`}>
                <h3 className="text-lg font-bold text-sky-400 mb-2">Al Inicio del Sendero</h3>
                <div className="flex justify-around gap-4 text-center">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">ETA</h4>
                        <span className="text-xl font-bold">{formatTime(routeStats.time / 60)}</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">Distancia</h4>
                        <span className="text-xl font-bold">{formatDistance(routeStats.distance)}</span>
                    </div>
                </div>
            </div>
             {!showStats && (
                <div className="p-2 text-center text-sm font-medium">
                    ETA: <span className="font-bold text-sky-400">{formatTime(routeStats.time / 60)}</span>
                </div>
            )}
          </div>
        </div>
      )}
      
      {/* 2. Stats B->C */}
      {navMode === 'ON_TRAIL' && onTrailStats && (
        <div className={`absolute bottom-0 left-0 w-full z-[1000] p-4 transition-transform duration-300 ${showStats ? 'translate-y-0' : 'translate-y-[calc(100%-40px)]'}`}>
          <div className="flex flex-col rounded-t-xl border border-lime-700/50 bg-slate-900/90 text-slate-100 shadow-2xl backdrop-blur-md">
            <div className="flex justify-center p-2 border-b border-slate-700 cursor-pointer" onClick={() => setShowStats(!showStats)}>
              <span className="w-10 h-1 bg-slate-600 rounded-full"></span>
            </div>
            <div className={`p-4 ${!showStats && 'hidden'}`}>
                <h3 className="text-lg font-bold text-lime-400 mb-2">Hacia el Final</h3>
                <div className="flex justify-around gap-4 text-center">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">ETA (Caminando)</h4>
                        <span className="text-xl font-bold">{formatTime(onTrailStats.time)}</span>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-slate-400">Restante</h4>
                        <span className="text-xl font-bold">{formatDistance(onTrailStats.distance)}</span>
                    </div>
                </div>
            </div>
             {!showStats && (
                <div className="p-2 text-center text-sm font-medium">
                    Restante: <span className="font-bold text-lime-400">{formatDistance(onTrailStats.distance)}</span>
                </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}