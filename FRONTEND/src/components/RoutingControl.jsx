import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Arreglo para los iconos de Leaflet (sin cambios)
L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function RoutingControl({ start, end, onRouteFound }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    const waypoints = [
      L.latLng(start[0], start[1]), // Ubicación del usuario
      L.latLng(end[0], end[1])      // Inicio del sendero
    ];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      createMarker: () => null, 
      lineOptions: {
        // --- 💎 [DISEÑO MEJORADO] ---
        // Ahora usamos "casing": dos líneas para un efecto 3D.
        styles: [
          // 1. El "Casing" (Borde ancho, oscuro)
          { 
            color: '#0369a1', // sky-700
            opacity: 0.8, 
            weight: 8 // Más ancho
          },
          // 2. La "Ruta" (Interior, brillante, punteada)
          { 
            color: '#38bdf8', // sky-400
            opacity: 1, 
            weight: 5, // Más delgado
            dashArray: '10, 10' // Mantenemos el punteado
          }
        ]
        // --- Fin de la Mejora ---
      }
    }).addTo(map);

    // Evento 'routesfound' (sin cambios)
    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0] && e.routes[0].summary && onRouteFound) {
        const summary = e.routes[0].summary;
        onRouteFound({
          distance: summary.totalDistance, 
          time: summary.totalTime, 
        });
      }
    });

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end, onRouteFound]); 

  return null;
}