import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InteractiveTrailMap from '../components/InteractiveTrailMap';
import './ComoLlegar.css';

// Coordenadas del ÚLTIMO PUNTO NAVEGABLE (Plaza de El Torno)
const WAYPOINT_COORDS = { lat: -17.9855, lng: -63.3820 };
// Reemplaza con el ID de tu video de YouTube real
const YOUTUBE_VIDEO_ID = "rMBSyYd7JJE";

export default function ComoLlegar() {
  const [trail, setTrail] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Carga los datos del sendero desde el archivo JSON en la carpeta 'public'
    fetch('/ruta.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el archivo de la ruta (ruta.json no encontrado en la carpeta /public).');
        }
        return response.json();
      })
      .then(geoJsonData => {
        // Validamos que la estructura sea la esperada
        if (!geoJsonData.features || !geoJsonData.features[0] || !geoJsonData.features[0].geometry || !geoJsonData.features[0].geometry.coordinates) {
          throw new Error('El archivo ruta.json no tiene el formato GeoJSON esperado.');
        }

        // Extraemos el array de coordenadas
        const coordinates = geoJsonData.features[0].geometry.coordinates;

        // Leaflet espera [lat, lng], y nuestro GeoJSON está en [lng, lat]
        const leafletCoords = coordinates.map(coord => [coord[1], coord[0]]);
        
        setTrail(leafletCoords);
        setError(null);
      })
      .catch(error => {
        console.error(error);
        setError(error.message);
      });
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${WAYPOINT_COORDS.lat},${WAYPOINT_COORDS.lng}`;
  const wazeUrl = `https://www.waze.com/ul?ll=${WAYPOINT_COORDS.lat}%2C${WAYPOINT_COORDS.lng}&navigate=yes`;

  return (
    <div className="como-llegar-page">
      <header className="como-llegar-header">
        <div className="place-detail-wrapper">
          <h1>¿Cómo Llegar?</h1>
          <p>Tu aventura comienza aquí. Sigue estos pasos para encontrarnos.</p>
        </div>
      </header>

      <div className="place-detail-wrapper">
        <section className="steps-section">
          {/* --- PASO 1 --- */}
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>De Santa Cruz a El Torno <span className="step-duration">(30min - 1h)</span></h3>
              <p>Usa tu aplicación de mapas preferida para llegar hasta la plaza principal de El Torno, el último punto accesible por carreteras convencionales.</p>
              <div className="step-actions">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  🚗 Ir a El Torno con Google Maps
                </a>
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className="btn btn--secondary">
                  🚙 Ir a El Torno con Waze
                </a>
              </div>
            </div>
          </div>

          {/* --- PASO 2 --- */}
          <div className="step-card">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>De El Torno a Jardín de las Delicias <span className="step-duration">(1h - 1.30h)</span></h3>
              <p>Desde El Torno, el camino es rural. Utiliza nuestro mapa interactivo para seguir el sendero y ver tu ubicación en tiempo real.</p>
              
              <div className="interactive-map-container">
                {error ? (
                  <div className="map-error-message">{error}</div>
                ) : (
                  <InteractiveTrailMap trailData={trail} />
                )}
              </div>
              
              <p className="transport-info">Si prefieres, puedes tomar transporte local desde la calle 26 de Enero en El Torno:</p>
              <div className="transport-options">
                <div className="transport-item">
                  <span>🚙 Camioneta 4x4</span>
                  <span className="badge">25 Bs</span>
                </div>
                <div className="transport-item">
                  <span>🛵 Mototaxi</span>
                  <span className="badge badge--alt">100 Bs</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="video-section">
          <h2>Video Explicativo</h2>
          <div className="video-container">
            <iframe
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
              title="Video explicativo de cómo llegar"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      </div>
    </div>
  );
}