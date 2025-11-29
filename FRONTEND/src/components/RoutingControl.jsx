import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Fix para iconos por defecto de Leaflet que a veces desaparecen
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function RoutingControl({ start, stopover, end, onRouteFound }) {
  const map = useMap();
  // Usamos una referencia para guardar el control y NO recrearlo en cada render
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Puntos: Inicio -> (Parada) -> Fin
    const waypoints = [
      L.latLng(start[0], start[1]),
      ...(stopover ? [L.latLng(stopover[0], stopover[1])] : []),
      L.latLng(end[0], end[1])
    ];

    // LÓGICA CLAVE: Si ya existe el control, solo actualizamos los puntos.
    // Esto evita el error "removeLayer of null" y el parpadeo.
    if (routingControlRef.current) {
      routingControlRef.current.setWaypoints(waypoints);
      return;
    }

    // Si no existe, lo creamos (solo la primera vez)
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      fitSelectedRoutes: false, // IMPORTANTE: Evita que el mapa haga zoom loco
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false, 
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'foot' // Perfil peatonal
      }),
      createMarker: () => null, // Sin marcadores extraños
      lineOptions: {
        styles: [
          { color: '#0D3B66', opacity: 0.6, weight: 8 }, 
          { color: '#00D8FF', opacity: 1, weight: 5 }
        ]
      }
    });

    routingControl.addTo(map);
    routingControlRef.current = routingControl;

    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0] && onRouteFound) {
        const summary = e.routes[0].summary;
        onRouteFound({
          distance: summary.totalDistance, 
          time: summary.totalTime, 
        });
      }
    });

    // Limpieza segura
    return () => {
      // Solo removemos si el mapa sigue vivo para evitar el crash
      if (map && routingControlRef.current) {
        try {
            // Verificamos si el control sigue en el mapa antes de quitarlo
            if (map.hasLayer && map.hasLayer(routingControlRef.current)) {
                map.removeControl(routingControlRef.current);
            }
        } catch (e) {
            console.warn("Limpieza de ruta ignorada para evitar crash visual");
        }
        routingControlRef.current = null;
      }
    };
  }, [map, start, stopover, end, onRouteFound]);

  return null;
}