import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Arreglo para los iconos de Leaflet (Se mantiene)
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

    // Crea el control de ruteo
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      // Ocultar la interfaz para mantener la UI limpia
      show: false, 
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      createMarker: () => null, // No crear marcadores redundantes
      lineOptions: {
        styles: [
          // 1. El "Casing" (Borde ancho, oscuro)
          { 
            color: '#0369a1', 
            opacity: 0.8, 
            weight: 8 
          },
          // 2. La "Ruta" (Interior, brillante, punteada para simular 'Activa')
          { 
            color: '#38bdf8', 
            opacity: 1, 
            weight: 5, 
            dashArray: '10, 10' 
          }
        ]
      }
    }).addTo(map);

    // Evento 'routesfound' para obtener Distancia y Tiempo
    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0] && e.routes[0].summary && onRouteFound) {
        const summary = e.routes[0].summary;
        onRouteFound({
          distance: summary.totalDistance, 
          time: summary.totalTime, 
        });
      }
    });

    // Cleanup: Eliminar el control de ruteo al desmontar/actualizar
    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start, end, onRouteFound]); 

  return null;
}