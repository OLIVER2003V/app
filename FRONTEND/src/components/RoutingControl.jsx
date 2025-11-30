import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Fix para iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function RoutingControl({ start, stopover, end, onRouteFound }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // 1. Definimos los puntos (Waypoints)
    const waypoints = [
      L.latLng(start[0], start[1]),
      ...(stopover ? [L.latLng(stopover[0], stopover[1])] : []),
      L.latLng(end[0], end[1])
    ];

    // 2. Creamos el control de ruta
    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      fitSelectedRoutes: false, // IMPORTANTE: Evita el zoom loco
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false, // Ocultar panel de texto
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'foot'
      }),
      createMarker: () => null, // Sin marcadores extraños
      lineOptions: {
        styles: [
          { color: '#0D3B66', opacity: 0.6, weight: 8 }, 
          { color: '#00D8FF', opacity: 1, weight: 5 }
        ]
      }
    });

    // 3. Lo añadimos al mapa
    routingControl.addTo(map);

    // 4. Escuchamos cuando encuentra la ruta para actualizar datos
    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0] && onRouteFound) {
        const summary = e.routes[0].summary;
        onRouteFound({
          distance: summary.totalDistance, 
          time: summary.totalTime, 
        });
      }
    });

    // 5. LIMPIEZA CRÍTICA (Aquí estaba el error)
    return () => {
      // No usamos map.hasLayer porque es un Control, no una Layer.
      // Lo removemos directamente sin preguntar.
      try {
          map.removeControl(routingControl);
      } catch (e) {
          console.warn("Error limpiando ruta:", e);
      }

      // LIMPIEZA EXTRA DE SEGURIDAD
      // A veces Leaflet deja líneas "fantasmas", esto las busca y destruye
      map.eachLayer((layer) => {
        // Si la capa tiene opciones de línea de ruta, es un residuo -> borrar
        if (layer.options && layer.options.styles && layer.options.styles[0]?.color === '#0D3B66') {
            map.removeLayer(layer);
        }
      });
    };
  }, [map, start, stopover, end, onRouteFound]);

  return null;
}