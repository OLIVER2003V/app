import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, AttributionControl, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotate';
import RoutingControl from './RoutingControl';

// --- 1. ICONO DE USUARIO (GPS) ---
const createUserIcon = () => L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 14px; height: 14px; background-color: #06b6d4; border: 3px solid white; border-radius: 50%; animation: user-pulse 2s infinite; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>
    </div>`,
  iconSize: [24, 24], iconAnchor: [12, 12],
});

// --- 2. ICONO DE DESTINO ---
// Mismos colores que getCategoryStyle() (utils/styleUtils.js) para que el
// pin en el mapa coincida con la insignia de categoría de las tarjetas y
// los filtros de arriba: antes todos los pines eran iguales y no se podía
// distinguir una cascada de un mirador sin hacer clic en cada uno. Antes
// además tenían un disco blanco translúcido detrás ("halo") que se veía
// borroso/sucio sobre todo con el fondo satelital; se sacó y quedan solo
// la gota de color + su sombra, más nítidas.
const CATEGORY_META = {
  mirador: { color: '#0284c7', glyph: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>' },
  cascada: { color: '#1d4ed8', glyph: '<path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/>' },
  ruta: { color: '#059669', glyph: '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>' },
  gastronomia: { color: '#d97706', glyph: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>' },
  hospedaje: { color: '#9333ea', glyph: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>' },
  otro: { color: '#64748b', glyph: '' },
};

const createDestinationIcon = (isSelected, category = 'otro') => {
  const meta = CATEGORY_META[category] || CATEGORY_META.otro;
  const pinColor = isSelected ? '#f97316' : meta.color;
  const size = isSelected ? 46 : 38;
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div style="
          position: relative;
          width: 48px; height: 48px;
          display: flex; justify-content: center; align-items: flex-end;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      ">
        <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 4px rgba(0,0,0,0.35));">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="${pinColor}" stroke="white" stroke-width="1.3"/>
          <circle cx="12" cy="9" r="3.5" fill="white"/>
          ${meta.glyph ? `<g transform="translate(12 9) scale(0.24) translate(-12 -12)" fill="none" stroke="${pinColor}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">${meta.glyph}</g>` : ''}
        </svg>
      </div>`,
    iconSize: [48, 48], iconAnchor: [24, 45],
  });
};

// --- ICONOS SVG ---
const SvgIcons = {
    North: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M12 2L15 9H9L12 2Z" fill="#EF4444"/><path d="M12 22L9 15H15L12 22Z" fill="#94A3B8"/></svg>,
    Center: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>,
    Maximize: () => <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
    Minimize: () => <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>,
    WifiOff: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M4.5 16.5c-1.5-1.5-2.25-3.5-2.25-5.625 0-1.5.56-2.905 1.5-4.075M21 12c0 2.125-.75 4.125-2.25 5.625M16.5 7.5c1.1.6 1.95 1.65 2.25 2.925M9 9c-.6 1.1-.6 2.35 0 3.45" /></svg>,
    Car: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Plus: () => <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
    Minus: () => <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" /></svg>,
    Hand: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 12.75V6a1.5 1.5 0 0 1 3 0v4.5m0-3V4.5a1.5 1.5 0 0 1 3 0v6m0-4.5a1.5 1.5 0 0 1 3 0v6m0-3a1.5 1.5 0 0 1 3 0v6c0 3.728-3.022 6.75-6.75 6.75h-1.5c-2.174 0-4.078-1.028-5.309-2.625L3.6 15.375A1.5 1.5 0 1 1 5.8 13.267l1.7 1.983" /></svg>,
};

// --- CAPAS BASE ---
// Vuelve a Google Maps por preferencia explícita. OJO: al no pasar por la
// API oficial de Google (esto carga los tiles "crudos"), no hay una cadena
// de atribución válida que mostrar, y los propios tiles de Google traen
// pines de sus negocios (hospitales, centros comerciales) horneados en la
// imagen — no hay forma de ocultarlos desde acá, es una limitación del
// proveedor, no un bug de esta app.
const TILE_LAYERS = {
  map: { label: 'Mapa', url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', attribution: '' },
  satellite: { label: 'Satélite', url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', attribution: '' },
  terrain: { label: 'Relieve', url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | &copy; OpenTopoMap (CC-BY-SA)' },
};
// En la lista de lugares no hace falta "Relieve": es una capa pensada para
// planear una caminata puntual (Cómo Llegar / detalle de un lugar), no
// para explorar el mapa general.
const LAYER_KEYS_BY_MODE = { list: ['map', 'satellite'], detail: ['map', 'satellite', 'terrain'] };

const CompassController = ({ onRotate }) => {
    const map = useMapEvents({ rotate: () => onRotate(map.getBearing()) });
    return null;
};

export default function MapView({ points, selectedPoint, onSelectPoint, detailMode = false }) {
  const [userPos, setUserPos] = useState(null);
  const [mapBearing, setMapBearing] = useState(0);
  const [routeStats, setRouteStats] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [hasCenteredRoute, setHasCenteredRoute] = useState(false);
  const [activeLayer, setActiveLayer] = useState('map');
  const [showRouteStats, setShowRouteStats] = useState(true);
  // El mapa va incrustado en una página que se scrollea; sin esto, pasar el
  // mouse por encima mientras el usuario baja la página lo atrapa y hace
  // zoom en vez de dejarlo seguir scrolleando. Se activa recién con el
  // primer clic (patrón estándar de Google Maps embebido).
  const [mapActive, setMapActive] = useState(false);

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const layerKeys = LAYER_KEYS_BY_MODE[detailMode ? 'detail' : 'list'];

  // --- LÓGICA ---
  useEffect(() => {
      const handleStatus = () => setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleStatus);
      window.addEventListener('offline', handleStatus);
      return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  useEffect(() => {
    if (isFullscreen) setMapActive(true);
  }, [isFullscreen]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watcher = navigator.geolocation.watchPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("GPS Error:", err),
      { enableHighAccuracy: true, timeout: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  useEffect(() => {
    setHasCenteredRoute(false);
    setShowRouteStats(true);
  }, [selectedPoint?.id]);

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
  const handleCenterUser = () => { if (!userPos) return; setMapActive(true); mapRef.current?.flyTo(userPos, 16); };
  const handleZoomIn = () => { setMapActive(true); mapRef.current?.zoomIn(); };
  const handleZoomOut = () => { setMapActive(true); mapRef.current?.zoomOut(); };

  const formatTime = (s) => {
      const min = Math.round(s / 60);
      return min > 60 ? `${Math.floor(min/60)}h ${min%60}m` : `${min} min`;
  };
  const formatDistance = (m) => (m / 1000).toFixed(1) + ' km';

  return (
    <div ref={mapContainerRef} className={`relative w-full bg-slate-100 overflow-hidden rounded-3xl shadow-xl transition-all duration-300 ${isFullscreen ? 'fixed inset-0 h-screen z-[9999] rounded-none' : 'h-full'}`}>

      {isOffline && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] map-info-pill px-4 py-2 flex items-center gap-2 text-amber-600 animate-pulse">
              <SvgIcons.WifiOff /> <span className="text-xs font-bold uppercase">Sin Conexión</span>
          </div>
      )}

      {/* Selector de capa: un único control compacto, igual en ambos modos
          (antes el modo lista usaba el widget nativo de Leaflet, con otra
          estética, y el de detalle uno propio — dos sistemas distintos). */}
      <div className="absolute left-3 top-3 z-[400] flex rounded-full bg-white/95 p-1 shadow-lg shadow-slate-900/15 backdrop-blur">
        {layerKeys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveLayer(key)}
            className={`h-8 rounded-full px-3 text-[11px] font-black transition ${
              activeLayer === key ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {TILE_LAYERS[key].label}
          </button>
        ))}
      </div>

      {/* Brújula: solo tiene sentido en el mapa de un lugar puntual
          (rotación al estilo "navegación"); en la vista de lista, con
          varios pines, rotar el mapa solo desorienta y sumaba un botón
          más al ya apretado grupo de controles. */}
      {detailMode && (
        <div className="absolute top-3 right-3 z-[400]">
          <button onClick={handleResetNorth} aria-label="Reiniciar orientación al norte" className="map-action-btn w-9 h-9 text-slate-700" style={{ transform: `rotate(${-mapBearing}deg)` }}>
              <SvgIcons.North />
          </button>
        </div>
      )}

      {/* Overlay "toca para interactuar": evita que el scroll de la página
          quede atrapado haciendo zoom al mapa por accidente. Desaparece
          apenas el usuario hace clic (o siempre, en pantalla completa). */}
      {!mapActive && (
        <button
          type="button"
          onClick={() => setMapActive(true)}
          aria-label="Activar interacción con el mapa"
          className="absolute inset-0 z-[350] flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px] transition-opacity hover:bg-slate-900/15"
        >
          <span className="map-info-pill flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-700">
            <SvgIcons.Hand /> Toca para interactuar
          </span>
        </button>
      )}

      <MapContainer
        center={[-17.7833, -63.1821]}
        zoom={13}
        className="h-full w-full z-0"
        ref={mapRef}
        rotate={detailMode}
        touchRotate={detailMode}
        rotateControl={false}
        zoomControl={false}
        attributionControl={false}
        // SOLUCIÓN BUG CORTES: Aumentamos padding del renderer para que dibuje más allá de la pantalla
        renderer={L.canvas({ padding: 0.5 })}
      >
        <AttributionControl position="bottomleft" prefix={false} />
        {detailMode && <CompassController onRotate={setMapBearing} />}
        <TileLayer key={activeLayer} url={TILE_LAYERS[activeLayer].url} attribution={TILE_LAYERS[activeLayer].attribution} />

        {userPos && <Marker position={userPos} icon={createUserIcon()} />}

        {points.map((p) => {
            const isSelected = selectedPoint?.id === p.id;
            return (
                <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                    icon={createDestinationIcon(isSelected, p.category?.toLowerCase())}
                    // SOLUCIÓN: Quitamos Popup, solo selecciona y traza ruta
                    eventHandlers={onSelectPoint ? { click: () => onSelectPoint(p) } : undefined}
                    zIndexOffset={isSelected ? 1000 : 0}
                >
                    {/* Nombre visible siempre solo para el pin seleccionado;
                        el resto lo muestra al pasar el mouse. Antes todos
                        los nombres estaban siempre visibles, lo que con
                        varios lugares cerca se veía saturado. */}
                    {!detailMode && <Tooltip
                        permanent={isSelected}
                        direction="bottom"
                        offset={[0, 2]}
                        opacity={1}
                        className="map-label"
                    >
                        {p.name}
                    </Tooltip>}
                </Marker>
            );
        })}

        {userPos && selectedPoint && !isOffline && (
             <RoutingControl start={userPos} end={[selectedPoint.lat, selectedPoint.lng]} onRouteFound={setRouteStats}/>
        )}
      </MapContainer>

      {detailMode && selectedPoint && showRouteStats && (
        <div className="absolute bottom-4 left-4 right-16 z-[400] max-w-sm">
          <div className="map-info-pill px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <h3 className="truncate text-sm font-black text-slate-950">{selectedPoint.name}</h3>
              <button
                type="button"
                onClick={() => setShowRouteStats(false)}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-500 transition hover:bg-slate-200"
                aria-label="Ocultar datos de ruta"
              >
                x
              </button>
            </div>
            {routeStats ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-emerald-50 px-3 py-2">
                  <span className="block text-[10px] font-black uppercase tracking-wide text-emerald-700">Tiempo</span>
                  <span className="mt-0.5 block text-base font-black text-slate-950">{formatTime(routeStats.time)}</span>
                </div>
                <div className="rounded-xl bg-cyan-50 px-3 py-2">
                  <span className="block text-[10px] font-black uppercase tracking-wide text-cyan-700">Distancia</span>
                  <span className="mt-0.5 block text-base font-black text-slate-950">{formatDistance(routeStats.distance)}</span>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-xs font-semibold text-slate-500">
                {userPos ? "Calculando ruta..." : "Activa el GPS para calcular tu ruta."}
              </p>
            )}
          </div>
        </div>
      )}

      {detailMode && selectedPoint && !showRouteStats && (
        <button
          type="button"
          onClick={() => setShowRouteStats(true)}
          className="absolute bottom-4 left-4 z-[400] rounded-full bg-white/95 px-4 py-2 text-xs font-black text-slate-700 shadow-lg shadow-slate-900/15 backdrop-blur transition hover:bg-white"
        >
          Ver datos de ruta
        </button>
      )}

      {/* PANEL DE CONTROLES: antes eran 3 grupos flotantes separados
          (zoom, ubicación, pantalla completa) apilados con espacio entre
          sí — se sentía como una torre de botones. Ahora es un único
          panel compacto. */}
      <div className={`absolute right-3 z-[400] flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.18)] border border-black/5 ${detailMode ? 'bottom-4' : 'bottom-36'}`}>
        <button onClick={handleZoomIn} aria-label="Acercar" className="map-control-cell h-10 w-10 text-slate-700">
            <SvgIcons.Plus />
        </button>
        <div className="h-px w-full bg-slate-100" />
        <button onClick={handleZoomOut} aria-label="Alejar" className="map-control-cell h-10 w-10 text-slate-700">
            <SvgIcons.Minus />
        </button>
        <div className="h-px w-full bg-slate-100" />
        <button onClick={handleCenterUser} disabled={!userPos} aria-label="Mi ubicación" className={`map-control-cell h-10 w-10 text-blue-600 ${!userPos && 'opacity-40'}`}>
            <SvgIcons.Center />
        </button>
        <div className="h-px w-full bg-slate-100" />
        <button onClick={toggleFullscreen} aria-label="Pantalla completa" className="map-control-cell h-10 w-10 text-slate-700">
            {isFullscreen ? <SvgIcons.Minimize /> : <SvgIcons.Maximize />}
        </button>
      </div>

      {/* TARJETA INFO */}
      {!detailMode && <div className={`absolute bottom-6 left-4 right-4 z-[1000] transition-all duration-500 ease-out transform ${selectedPoint ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <div className="map-info-pill p-4 flex items-center justify-between">
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
      </div>}

    </div>
  );
}
