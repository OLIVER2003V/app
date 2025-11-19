import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Arreglo para los iconos de Leaflet
L.Marker.prototype.options.icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Aceptamos una nueva prop: 'stopover' (Punto B - Inicio del sendero)
export default function RoutingControl({ start, stopover, end, onRouteFound }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Configuramos los puntos de paso: A -> B -> C
    const waypoints = [
      L.latLng(start[0], start[1]), // A: Usuario
      // Si existe stopover (Punto B), lo añadimos, si no, vamos directo a C
      ...(stopover ? [L.latLng(stopover[0], stopover[1])] : []), 
      L.latLng(end[0], end[1])      // C: Destino Final
    ];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false, // Ocultamos las instrucciones de texto por defecto
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      createMarker: () => null, // No creamos marcadores extra (ya tenemos los nuestros)
      lineOptions: {
        styles: [
          // Estilo Neón Azul (A -> C)
          { 
            color: '#0D3B66', 
            opacity: 0.8, 
            weight: 9 
          },
          { 
            color: '#00D8FF', 
            opacity: 1, 
            weight: 5,
            // Sin dashArray para línea sólida continua
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

    return () => {
      try {
        if (map && routingControl) {
          routingControl.setWaypoints([]); // Limpieza para evitar error
          map.removeControl(routingControl);
        }
      } catch (e) {
        console.error("Error al limpiar el control de ruteo:", e);
      }
    };
  }, [map, start, stopover, end, onRouteFound]); 

  return null;
}