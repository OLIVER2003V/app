import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Arreglo para los iconos de Leaflet (evita el ícono roto)
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
      L.latLng(start[0], start[1]), // Ubicación del usuario (A)
      L.latLng(end[0], end[1])      // Inicio del sendero (B)
    ];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false, 
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      createMarker: () => null, 
      lineOptions: {
        styles: [
          { 
            color: '#0D3B66', // Un azul oscuro profundo para el casing
            opacity: 0.8, 
            weight: 9 
          },
          { 
            color: '#00D8FF', // Cian / Azul Eléctrico brillante para el relleno
            opacity: 1, 
            weight: 5,
          }
        ]
      }
    }).addTo(map);

    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0] && e.routes[0].summary && onRouteFound) {
        const summary = e.routes[0].summary;
        onRouteFound({
          distance: summary.totalDistance, 
          time: summary.totalTime, 
        });
      }
    });

    // --- ¡CORRECCIÓN DEFINITIVA! ---
    return () => {
      try {
        if (map && routingControl) {
          // 1. Primero, le decimos al control que borre sus waypoints.
          // Esto fuerza a la librería a limpiar sus propias líneas y listeners
          // de forma controlada, ANTES de que la petición de red vuelva.
          routingControl.setWaypoints([]);
          
          // 2. Después, removemos el control del mapa.
          map.removeControl(routingControl);
        }
      } catch (e) {
        // Dejamos el catch por si acaso, pero el paso 1 debería
        // prevenir el error de 'removeLayer'
        console.error("Error al limpiar el control de ruteo (ignorable):", e);
      }
    };
  }, [map, start, end, onRouteFound]); 

  return null;
}