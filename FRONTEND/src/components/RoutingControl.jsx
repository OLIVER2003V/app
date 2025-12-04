import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { useMap } from 'react-leaflet';

// Fix iconos
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function RoutingControl({ start, stopover, end, onRouteFound }) {
  const map = useMap();
  const routingControlRef = useRef(null);

  const startLat = start?.[0];
  const startLng = start?.[1];
  const endLat = end?.[0];
  const endLng = end?.[1];
  const stopLat = stopover?.[0];
  const stopLng = stopover?.[1];

  useEffect(() => {
    if (!map || !startLat || !endLat) return;

    if (routingControlRef.current) {
        try { map.removeControl(routingControlRef.current); } catch (e) {}
    }

    const waypoints = [
      L.latLng(startLat, startLng),
      ...(stopLat ? [L.latLng(stopLat, stopLng)] : []),
      L.latLng(endLat, endLng)
    ];

    const routingControl = L.Routing.control({
      waypoints: waypoints,
      routeWhileDragging: false,
      
      // --- CORRECCIÓN AQUÍ: ---
      fitSelectedRoutes: false, // ¡IMPORTANTE! Desactivamos esto para que no se mueva solo
      // ------------------------
      
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
      router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'car'
      }),
      createMarker: () => null,
      lineOptions: {
        styles: [
          { color: '#0D3B66', opacity: 0.6, weight: 8 }, 
          { color: '#00D8FF', opacity: 1, weight: 5 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      }
    });

    routingControlRef.current = routingControl;
    routingControl.addTo(map);

    routingControl.on('routesfound', (e) => {
      if (e.routes && e.routes[0] && onRouteFound) {
        const summary = e.routes[0].summary;
        setTimeout(() => {
            onRouteFound({
              distance: summary.totalDistance, 
              time: summary.totalTime, 
            });
            
            // OPCIONAL: Si quieres que SOLO la primera vez que calcula la ruta se centre:
            // Puedes emitir un evento aquí, pero es mejor controlarlo desde MapView.
        }, 0);
      }
    });

    return () => {
      if (routingControlRef.current) {
         try { map.removeControl(routingControlRef.current); } catch (e) {}
      }
      map.eachLayer((layer) => {
        if (layer.options && layer.options.styles && layer.options.styles[0]?.color === '#0D3B66') {
            map.removeLayer(layer);
        }
      });
    };
  }, [map, startLat, startLng, endLat, endLng, stopLat, stopLng]);

  return null;
}