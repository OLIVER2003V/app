import React, { useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Tooltip, 
  Popup, 
  useMap,
  LayersControl // 👈 1. Importamos el control de capas
} from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Corrección del Icono por Defecto de Leaflet (Fallback) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Constantes del Mapa (Sin cambios) ---
const SANTA_CRUZ_CENTER = [-17.7833, -63.1821];
const DEFAULT_ZOOM = 13;
const SELECTED_ZOOM = 16;

// --- Icono de Pin Personalizado (Sin cambios) ---
const createCustomIcon = (isSelected = false) => {
  const pinColor = isSelected ? "text-cyan-500" : "text-emerald-700";
  const pinSize = isSelected ? "h-10 w-10" : "h-8 w-8";
  const animation = isSelected ? "animate-bounce" : "";
  const shadow = "drop-shadow-lg";
  const innerDot = isSelected ? "<div class='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-5px] w-2 h-2 rounded-full bg-white'></div>" : "";

  return L.divIcon({
    html: `
      <div class="relative ${animation} ${shadow}">
        <svg 
          class="${pinSize} ${pinColor}" 
          fill="currentColor" 
          viewBox="0 0 20 20" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fill-rule="evenodd" 
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
            clip-rule="evenodd" 
          />
        </svg>
        ${innerDot}
      </div>
    `,
    className: 'bg-transparent border-none',
    iconSize: isSelected ? [40, 40] : [32, 32],
    iconAnchor: isSelected ? [20, 40] : [16, 32],
  });
};


// --- Componentes de Control de Vista (Sin cambios) ---
function ChangeSelectedView({ point }) {
  const map = useMap();
  useEffect(() => {
    if (map && point && !isNaN(point.lat) && !isNaN(point.lng)) {
      map.flyTo([point.lat, point.lng], SELECTED_ZOOM, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [point, map]);
  return null;
}

function FitBoundsToPoints({ points, hasSelectedPoint }) {
  const map = useMap();
  useEffect(() => {
    if (!hasSelectedPoint && points && points.length > 0) {
      const bounds = L.latLngBounds(points.map(p => [p.lat, p.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    }
  }, [points, hasSelectedPoint, map]);
  return null;
}


// --- Componente Principal MapView ---
export default function MapView({ points, selectedPoint }) {
  const navigate = useNavigate();

  const handleMarkerClick = (slug) => {
    navigate(`/places/${slug}`);
  };

  return (
    <MapContainer 
      center={SANTA_CRUZ_CENTER} 
      zoom={DEFAULT_ZOOM} 
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      
      {/* 💎 2. AÑADIMOS EL CONTROLADOR DE CAPAS */}
      <LayersControl position="topright">
        
        {/* 💎 Capa Base 1: Calles (Por defecto) */}
        <LayersControl.BaseLayer checked name="Calles (Detallado)">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </LayersControl.BaseLayer>

        {/* 💎 Capa Base 2: Satélite (Opcional) */}
        <LayersControl.BaseLayer name="Satélite (Visual)">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            maxZoom={18} // Límite para no ver "data not available"
          />
        </LayersControl.BaseLayer>

      </LayersControl>
      
      {/* Los marcadores y controles se quedan fuera del LayersControl */}
      {/* para que se apliquen a AMBAS vistas del mapa */}
      {points.map((point) => {
        const isSelected = selectedPoint && 
                           point.lat === selectedPoint.lat && 
                           point.lng === selectedPoint.lng;
        
        return (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            icon={createCustomIcon(isSelected)}
            zIndexOffset={isSelected ? 1000 : 0}
            eventHandlers={{
              click: () => { handleMarkerClick(point.slug); },
            }}
          >
            <Tooltip
              permanent={true} 
              direction="right"
              offset={[10, 0]}
              opacity={isSelected ? 1 : 0.8}
              className="map-tooltip-premium"
            >
              <span className="font-semibold">{point.name}</span>
            </Tooltip>
            
            <Popup>
              <div className="flex flex-col gap-2">
                <strong className="text-base text-emerald-800">{point.name}</strong>
                <span className="text-sm text-gray-600">Categoría: {point.category}</span>
                <button 
                  onClick={() => handleMarkerClick(point.slug)}
                  className="mt-1.5 cursor-pointer rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-3 py-1.5 text-sm font-semibold text-white shadow-md transition-all hover:from-emerald-600 hover:to-cyan-700 focus:outline-none"
                >
                  Ver detalles
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}

      <FitBoundsToPoints points={points} hasSelectedPoint={!!selectedPoint} />
      <ChangeSelectedView point={selectedPoint} />
    </MapContainer>
  );
}