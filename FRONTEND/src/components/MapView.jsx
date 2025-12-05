import React, { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, LayersControl, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotate'; 
import RoutingControl from './RoutingControl';

// --- ESTILOS CSS ---
const styles = `
  @keyframes user-pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(6, 182, 212, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
  }
  
  .info-pill {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-radius: 24px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.8);
  }

  .action-btn {
    background: white;
    border-radius: 50%;
    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    display: flex; align-items: center; justify-content: center;
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border: 1px solid rgba(0,0,0,0.05);
  }
  .action-btn:active { transform: scale(0.9); }

  /* Etiqueta de texto (Tooltip) mejorada */
  .map-label {
    background: rgba(255, 255, 255, 0.95) !important;
    border: 1px solid rgba(0,0,0,0.05) !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1) !important;
    color: #0f172a !important;
    font-weight: 800 !important;
    font-size: 12px !important;
    padding: 4px 8px !important;
    white-space: nowrap !important;
    margin-top: 6px !important;
    transition: opacity 0.2s;
  }
  .map-label:before { display: none; }
`;

// --- 1. ICONO DE USUARIO (GPS) ---
const createUserIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <style>${styles}</style>
      <div style="width: 14px; height: 14px; background-color: #06b6d4; border: 3px solid white; border-radius: 50%; animation: user-pulse 2s infinite; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
    </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

// --- 2. ICONO DE DESTINO ---
const createDestinationIcon = (isSelected) => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="
        position: relative; 
        width: 48px; height: 48px; 
        display: flex; justify-content: center; align-items: center;
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
        ${isSelected ? 'transform scale-125 -translate-y-2' : ''}
    ">
      <div style="position: absolute; width: 36px; height: 36px; background: white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); top: 2px;"></div>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="position: relative; z-index: 10; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${isSelected ? '#f97316' : '#059669'}"/>
        <circle cx="12" cy="9" r="3.5" fill="white"/>
      </svg>
    </div>`,
  iconSize: [48, 48], iconAnchor: [24, 42],
});

// --- ICONOS SVG ---
const SvgIcons = {
    North: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 9H9L12 2Z" fill="#EF4444"/><path d="M12 22L9 15H15L12 22Z" fill="#94A3B8"/></svg>,
    Center: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>,
    Maximize: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
    Minimize: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>,
    WifiOff: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 16.5c-1.5-1.5-2.25-3.5-2.25-5.625 0-1.5.56-2.905 1.5-4.075M21 12c0 2.125-.75 4.125-2.25 5.625M16.5 7.5c1.1.6 1.95 1.65 2.25 2.925M9 9c-.6 1.1-.6 2.35 0 3.45" /></svg>,
    Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
};

const CompassController = ({ onRotate }) => {
    const map = useMapEvents({ rotate: () => onRotate(map.getBearing()) });
    return null;
};

export default function MapView({ points, selectedPoint, onSelectPoint }) {
  const [userPos, setUserPos] = useState(null);
  const [mapBearing, setMapBearing] = useState(0);
  const [routeStats, setRouteStats] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasCenteredRoute, setHasCenteredRoute] = useState(false);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // --- LÓGICA ---
  useEffect(() => {
      const handleStatus = () => setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleStatus);
      window.addEventListener('offline', handleStatus);
      return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  useEffect(() => { setHasCenteredRoute(false); }, [selectedPoint?.id]);

  useEffect(() => {
    if (mapRef.current && selectedPoint && userPos && !hasCenteredRoute) {
        const bounds = L.latLngBounds([userPos, [selectedPoint.lat, selectedPoint.lng]]);
        mapRef.current.fitBounds(bounds, { padding: [80, 80], maxZoom: 16 });
        setHasCenteredRoute(true);
    } else if (mapRef.current && selectedPoint && !userPos) {
        mapRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 15);
    }
  }, [selectedPoint, userPos, hasCenteredRoute]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    else document.exitFullscreen().then(() => setIsFullscreen(false));
  };

  const handleResetNorth = () => mapRef.current?.setBearing(0);
  const handleCenterUser = () => userPos && mapRef.current?.flyTo(userPos, 16);

  const formatTime = (s) => {
      const min = Math.round(s / 60);
      return min > 60 ? `${Math.floor(min/60)}h ${min%60}m` : `${min} min`;
  };
  const formatDistance = (m) => (m / 1000).toFixed(1) + ' km';

  return (
    <div ref={mapContainerRef} className={`relative w-full bg-slate-100 overflow-hidden rounded-3xl shadow-xl transition-all duration-300 ${isFullscreen ? 'fixed inset-0 h-screen z-[9999] rounded-none' : 'h-full'}`}>
      
      {isOffline && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] info-pill px-4 py-2 flex items-center gap-2 text-amber-600 animate-pulse">
              <SvgIcons.WifiOff /> <span className="text-xs font-bold uppercase">Sin Conexión</span>
          </div>
      )}

      <div className="absolute top-4 right-3 z-[400]">
        <button onClick={handleResetNorth} className="action-btn w-10 h-10 text-slate-700" style={{ transform: `rotate(${-mapBearing}deg)` }}>
            <SvgIcons.North />
        </button>
      </div>

      <MapContainer
        center={[-17.7833, -63.1821]}
        zoom={13}
        className="h-full w-full z-0"
        ref={mapRef}
        rotate={true} 
        touchRotate={true} 
        rotateControl={false} 
        zoomControl={false} 
        attributionControl={false}
        // SOLUCIÓN BUG CORTES: Aumentamos padding del renderer para que dibuje más allá de la pantalla
        renderer={L.canvas({ padding: 0.5 })} 
      >
        <CompassController onRotate={setMapBearing} />
        <LayersControl position="topleft">
          <LayersControl.BaseLayer checked name="Google"><TileLayer url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satélite"><TileLayer url="https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" /></LayersControl.BaseLayer>
        </LayersControl>

        {userPos && <Marker position={userPos} icon={createUserIcon()} />}

        {points.map((p) => {
            const isSelected = selectedPoint?.id === p.id;
            return (
                <Marker 
                    key={p.id} 
                    position={[p.lat, p.lng]} 
                    icon={createDestinationIcon(isSelected)} 
                    // SOLUCIÓN: Quitamos Popup, solo selecciona y traza ruta
                    eventHandlers={{ click: () => onSelectPoint(p) }} 
                    zIndexOffset={isSelected ? 1000 : 0}
                >
                    {/* Tooltip Permanente. Si está seleccionado, ocultamos el título para que no estorbe (opcional, o dejarlo siempre) */}
                    <Tooltip 
                        permanent 
                        direction="bottom" 
                        offset={[0, 5]} 
                        opacity={1} 
                        className="map-label"
                    >
                        {p.name}
                    </Tooltip>
                </Marker>
            );
        })}

        {userPos && selectedPoint && !isOffline && (
             <RoutingControl start={userPos} end={[selectedPoint.lat, selectedPoint.lng]} onRouteFound={setRouteStats}/>
        )}
      </MapContainer>

      {/* BOTONES ACCIÓN */}
      <div className="absolute bottom-36 right-4 z-[400] flex flex-col gap-3">
        <button onClick={handleCenterUser} disabled={!userPos} className={`action-btn w-12 h-12 text-blue-600 ${!userPos && 'opacity-50 grayscale'}`}>
            <SvgIcons.Center />
        </button>
        <button onClick={toggleFullscreen} className="action-btn w-12 h-12 text-slate-700">
            {isFullscreen ? <SvgIcons.Minimize /> : <SvgIcons.Maximize />}
        </button>
      </div>

      {/* TARJETA INFO */}
      <div className={`absolute bottom-6 left-4 right-4 z-[1000] transition-all duration-500 ease-out transform ${selectedPoint ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="info-pill p-4 flex items-center justify-between">
              <div className="flex-1 pr-4 min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-0.5">Destino</span>
                  <h3 className="text-base font-bold text-slate-900 truncate leading-tight">{selectedPoint?.name}</h3>
              </div>
              {routeStats ? (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                      <div className="text-right">
                          <div className="text-xl font-black text-cyan-600 leading-none">{formatTime(routeStats.time)}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{formatDistance(routeStats.distance)}</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700">
                          <SvgIcons.Car />
                      </div>
                  </div>
              ) : (
                  <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
                      <div className="text-xs text-slate-400 italic text-right">
                          {userPos ? "Calculando..." : "Sin GPS"}
                      </div>
                  </div>
              )}
          </div>
      </div>

    </div>
  );
}