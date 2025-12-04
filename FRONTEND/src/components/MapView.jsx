import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMapEvents, Tooltip } from 'react-leaflet';
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
  .glass-panel {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  }
  .custom-popup .leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 0;
  }
  .custom-popup .leaflet-popup-tip { background: rgba(255, 255, 255, 0.95); }
  .map-label {
    background-color: rgba(255, 255, 255, 0.9) !important;
    border: 1px solid rgba(0,0,0,0.1) !important;
    border-radius: 6px !important;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
    color: #1e293b !important;
    font-weight: 700 !important;
    font-size: 11px !important;
    padding: 2px 6px !important;
    white-space: nowrap !important;
    margin-top: 2px !important;
  }
  .map-label:before { display: none; }
`;

// --- ICONOS ---
const createUserIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <style>${styles}</style>
      <div style="width: 16px; height: 16px; background-color: #06b6d4; border: 2px solid white; border-radius: 50%; animation: user-pulse 2s infinite; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"></div>
    </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

const createDestinationIcon = (isSelected) => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 40px; height: 40px; display: flex; justify-content: center; transition: transform 0.3s ease; ${isSelected ? 'transform scale-125' : ''}">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 4px 4px rgba(0,0,0,0.25));">
        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${isSelected ? '#f97316' : '#10b981'}"/>
        <circle cx="12" cy="9" r="3.5" fill="white"/>
      </svg>
    </div>`,
  iconSize: [40, 40], iconAnchor: [20, 36], popupAnchor: [0, -38]
});

// --- ICONOS SVG ---
const SvgIcons = {
    North: () => <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 9H9L12 2Z" fill="#EF4444"/><path d="M12 22L9 15H15L12 22Z" fill="#94A3B8"/></svg>,
    Center: () => <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>,
    Expand: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
    Collapse: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 10L4 15m0 0v-4m0 4h4m5-5l5 5m0 0v-4m0 4h-4M9 14l-5-5m0 0h4m-4 0v4m16-4v4m0-4h-4m-5 5l5-5" /></svg>,
    WifiOff: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 16.5c-1.5-1.5-2.25-3.5-2.25-5.625 0-1.5.56-2.905 1.5-4.075M21 12c0 2.125-.75 4.125-2.25 5.625M16.5 7.5c1.1.6 1.95 1.65 2.25 2.925M9 9c-.6 1.1-.6 2.35 0 3.45" /></svg>,
    ChevronUp: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>,
    ChevronDown: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
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
  
  // Estados de control
  const [hasCenteredRoute, setHasCenteredRoute] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true); // Panel empieza abierto

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Conexión y GPS
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

  // Reset del centrado si cambiamos de destino
  useEffect(() => {
      setHasCenteredRoute(false);
      setIsPanelOpen(true); // Abrir panel al seleccionar nuevo lugar
  }, [selectedPoint?.id]);

  // Centrado Inteligente (Solo UNA vez cuando hay ruta)
  useEffect(() => {
    if (mapRef.current && selectedPoint && userPos && !hasCenteredRoute) {
        // Tenemos usuario y destino -> Encuadrar toda la ruta
        const bounds = L.latLngBounds([userPos, [selectedPoint.lat, selectedPoint.lng]]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        setHasCenteredRoute(true);
    } else if (mapRef.current && selectedPoint && !userPos) {
        // Solo tenemos destino (modo ver)
        mapRef.current.flyTo([selectedPoint.lat, selectedPoint.lng], 15);
    }
  }, [selectedPoint, userPos, hasCenteredRoute]);

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
        mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
        document.exitFullscreen().then(() => setIsFullscreen(false));
    }
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
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] glass-panel px-4 py-2 rounded-full flex items-center gap-2 text-amber-600 animate-in fade-in slide-in-from-top-4">
              <SvgIcons.WifiOff /> <span className="text-xs font-bold">Sin Conexión</span>
          </div>
      )}

      <div className="absolute top-4 right-3 flex flex-col gap-3 z-[400]">
        <button onClick={handleResetNorth} className="glass-panel w-10 h-10 rounded-full flex items-center justify-center shadow-lg" style={{ transform: `rotate(${-mapBearing}deg)` }}><SvgIcons.North /></button>
        <button onClick={handleCenterUser} disabled={!userPos} className={`glass-panel w-10 h-10 rounded-full flex items-center justify-center text-cyan-600 shadow-lg ${!userPos && 'opacity-50'}`}><SvgIcons.Center /></button>
        <button onClick={toggleFullscreen} className="glass-panel w-10 h-10 rounded-full flex items-center justify-center text-slate-600 shadow-lg">{isFullscreen ? <SvgIcons.Collapse /> : <SvgIcons.Expand />}</button>
      </div>

      <MapContainer
        center={[-17.7833, -63.1821]}
        zoom={13}
        className="h-full w-full z-0"
        ref={mapRef}
        rotate={true} touchRotate={true} rotateControl={false} zoomControl={false} attributionControl={false}
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
                <Marker key={p.id} position={[p.lat, p.lng]} icon={createDestinationIcon(isSelected)} eventHandlers={{ click: () => onSelectPoint(p) }} zIndexOffset={isSelected ? 1000 : 0}>
                    <Popup className="custom-popup">
                        <div className="p-3 text-center min-w-[150px]">
                            <h3 className="font-bold text-slate-800 text-base mb-1">{p.name}</h3>
                            <span className="inline-block px-2 py-0.5 bg-cyan-100 text-cyan-800 text-[10px] font-bold uppercase rounded-full">{p.category}</span>
                        </div>
                    </Popup>
                    <Tooltip permanent direction="bottom" offset={[0, 10]} opacity={1} className="map-label">{p.name}</Tooltip>
                </Marker>
            );
        })}

        {userPos && selectedPoint && !isOffline && (
             <RoutingControl start={userPos} end={[selectedPoint.lat, selectedPoint.lng]} onRouteFound={setRouteStats}/>
        )}
      </MapContainer>

      {/* --- PANEL DESPLEGABLE (BOTTOM SHEET) --- */}
      <div 
        className={`absolute bottom-0 left-0 right-0 z-[1000] glass-panel rounded-t-3xl transition-transform duration-500 ease-in-out
        ${selectedPoint ? 'translate-y-0' : 'translate-y-[110%]'}`}
      >
          {/* Handle para arrastrar/clickear */}
          <div 
            className="w-full flex items-center justify-center py-2 cursor-pointer active:opacity-70"
            onClick={() => setIsPanelOpen(!isPanelOpen)}
          >
             {isPanelOpen ? <div className="text-slate-400"><SvgIcons.ChevronDown /></div> : <div className="text-slate-400"><SvgIcons.ChevronUp /></div>}
          </div>

          {/* Contenido del panel */}
          <div className={`px-6 pb-6 transition-all duration-500 ${isPanelOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
              <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Destino</span>
                      <span className="text-lg font-bold text-slate-900 line-clamp-1">{selectedPoint?.name}</span>
                  </div>
              </div>

              {routeStats ? (
                  <div className="flex gap-4">
                      <div className="flex-1 bg-cyan-50 rounded-xl p-3 flex flex-col items-center">
                          <span className="text-2xl font-black text-cyan-600">{formatTime(routeStats.time)}</span>
                          <span className="text-[10px] text-cyan-800 font-bold uppercase">Tiempo</span>
                      </div>
                      <div className="flex-1 bg-slate-50 rounded-xl p-3 flex flex-col items-center">
                          <span className="text-2xl font-black text-slate-700">{formatDistance(routeStats.distance)}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Distancia</span>
                      </div>
                  </div>
              ) : (
                  <div className="text-center py-2 text-slate-500 text-sm font-medium animate-pulse">
                      {userPos ? "Calculando ruta óptima..." : "Esperando señal GPS..."}
                  </div>
              )}
          </div>
      </div>

    </div>
  );
}