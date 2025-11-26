import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import InteractiveTrailMap from '../components/InteractiveTrailMap';
import api from '@/lib/api'; 
import { ExternalLink, Copy, X } from 'lucide-react'; 

// --- Constantes (sin cambios) ---
const WAYPOINT_COORDS = { lat: -17.991109, lng: -63.389442 };
const YOUTUBE_VIDEO_ID = "rMBSyYd7JJE";

// --- Iconos SVG (sin cambios) ---
const GoogleMapsIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.012 2.25c-3.42 0-6.398 2.053-7.854 5.031L4 7.39v.002c0 .012 0 .025-.002.037L4 7.55v3.435l2.493-1.246a5.006 5.006 0 0 1 5.514-4.52c2.753.007 4.99 2.25 4.99 5.006s-2.237 5-4.99 5.006a5.006 5.006 0 0 1-5.514-4.52L4 9.47V13.5l.002-.112c0 .01-.002.022-.002.031v.003L4.11 16.5c1.442 2.962 4.41 5 7.89 5 4.41 0 8.02-3.597 8.02-8.019S16.422 2.25 12.012 2.25Z" />
  </svg>
);

const WazeIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.375 12.74a4.49 4.49 0 0 1-3.487 4.48c-1.898.31-3.926-.95-5.388-2.5-1.026-1.1-1.86-2.58-2.31-4.08a4.5 4.5 0 0 1 4.11-5.18c1.89-.3 3.92.96 5.38 2.5 1.03 1.1 1.86 2.58 2.31 4.08m-5.88-.23c.3 0 .54.24.54.54s-.24.54-.54.54-.54-.24-.54-.54.24-.54.54-.54m3 0c.3 0 .54.24.54.54s-.24.54-.54.54-.54-.24-.54-.54.24-.54.54-.54m1.41-3.26a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0m-6 0a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0m-.46 3.23c-.3 0-.54-.24-.54-.54s.24-.54.54-.54.54.24.54.54-.24.54-.54.54m3 0c-.3 0-.54-.24-.54-.54s.24-.54.54-.54.54.24.54.54-.24.54-.54.54m9.06 2.65c.24-1.1.18-2.25-.12-3.33-.5-1.8-1.65-3.37-3.18-4.5a7.53 7.53 0 0 0-7.11-2.04 7.5 7.5 0 0 0-6.18 6.9c-.18 1.14.06 2.3.6 3.36 1.02 1.8 2.7 3.18 4.68 3.9 1.8.66 3.75.9 5.64.66 2.4-.3 4.62-1.5 6.12-3.3a7.33 7.33 0 0 0 1.47-4.65" />
  </svg>
);
// --- Fin Iconos ---

// --- COMPONENTE DE AVISO (FIX PARA TIKTOK) ---
const TikTokFixOverlay = ({ onClose }) => {
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        // Esta es la acción de copiar que funciona 100% en todos los navegadores
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center relative overflow-hidden">
                
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
                
                {/* Ícono y título */}
                <div className="mb-4 flex justify-center">
                    <div className="bg-cyan-100 p-4 rounded-full">
                        <ExternalLink className="w-8 h-8 text-cyan-600" />
                    </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                    ¡La solución es el Menú Nativo!
                </h3>
                
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                    El botón "Abrir en Navegador" no funciona, pero el menú de la aplicación sí. Sigue estos dos pasos para activar el GPS:
                </p>

                {/* --- INSTRUCCIONES CLARAS BASADAS EN EL MENÚ NATIVO (•••) --- */}
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                        <p className="text-xs text-slate-700">Toca el ícono de <strong className="text-slate-900">tres puntos (•••)</strong> o el botón de flecha en la esquina superior.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                        <p className="text-xs text-slate-700">Elige la opción <strong className="text-slate-900">"Abrir en Chrome/Safari"</strong>.</p>
                    </div>
                </div>

                {/* --- BOTÓN DE COPIAR ENLACE (PLAN B DISCRETO Y FUNCIONAL) --- */}
                <button 
                    onClick={copyLink}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                        copied 
                        ? "bg-emerald-600 text-white shadow-emerald-600/30" 
                        : "bg-white border border-slate-300 text-slate-900 hover:bg-slate-50"
                    }`}
                >
                    <Copy className="w-4 h-4" /> 
                    {copied ? '¡Enlace Copiado! ✅' : 'Copiar Enlace (Método Alternativo)'}
                </button>
                
                {/* --- BOTÓN DE CONTINUAR --- */}
                <button 
                    onClick={onClose}
                    className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline"
                >
                    Continuar sin GPS (Solo mapa estático)
                </button>
            </div>
        </div>
    );
};

export default function ComoLlegar() {
  const [trail, setTrail] = useState([]);
  const [error, setError] = useState(null);
  const [showTikTokOverlay, setShowTikTokOverlay] = useState(false); // Estado para el aviso
  const [gpsErrorFromMap, setGpsErrorFromMap] = useState(null);

    // Lógica para disparar el modal de forma robusta
    useEffect(() => {
        // Si hay error de GPS reportado Y estamos en un móvil (pantalla pequeña)
        const isMobileScreen = window.innerWidth < 768; 

        if (gpsErrorFromMap && isMobileScreen) {
            // Solo mostramos el modal si no ha sido cerrado manualmente
            if (!showTikTokOverlay) { 
                setShowTikTokOverlay(true);
            }
        }
    }, [gpsErrorFromMap]);

  // Lógica de carga del JSON (sin cambios)
  useEffect(() => {
    // Detección inicial de app interna
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInternalApp = (ua.indexOf("TikTok") > -1) || (ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1);
    
    if (isInternalApp) {
        setShowTikTokOverlay(true);
    }
    
    // Carga de la ruta (continúa igual)
    fetch('/ruta.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('No se pudo cargar el archivo de la ruta (ruta.json no encontrado en la carpeta /public).');
        }
        return response.json();
      })
      .then(geoJsonData => {
        if (!geoJsonData.features || !geoJsonData.features[0] || !geoJsonData.features[0].geometry || !geoJsonData.features[0].geometry.coordinates) {
          throw new Error('El archivo ruta.json no tiene el formato GeoJSON esperado.');
        }
        const coordinates = geoJsonData.features[0].geometry.coordinates;
        const leafletCoords = coordinates.map(coord => [coord[1], coord[0]]);
        setTrail(leafletCoords);
        setError(null);
      })
      .catch(error => {
        console.error(error);
        setError(error.message);
      });
  }, []);

  // URL de Google Maps y Waze (sin cambios)
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${WAYPOINT_COORDS.lat},${WAYPOINT_COORDS.lng}`;
  const wazeUrl = `https://www.waze.com/ul?ll=${WAYPOINT_COORDS.lat}%2C${WAYPOINT_COORDS.lng}&navigate=yes`;

  // --- Estilos de Botones (Vibrantes) ---
  const btnBase = "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2";
  const btnGoogle = `${btnBase} bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500`;
  const btnWaze = `${btnBase} bg-blue-500 hover:bg-blue-600 focus:ring-blue-500`;

  return (
    // --- Contenedor Principal ---
    <div className="min-h-screen bg-gray-100 pb-16 text-gray-900">
      
      {/* RENDERIZADO DEL AVISO DE TIKTOK: Se superpone a todo si se detecta */}
      {showTikTokOverlay && <TikTokFixOverlay onClose={() => setShowTikTokOverlay(false)} />}
      
      {/* --- Encabezado --- */}
      <header className="bg-gradient-to-r from-cyan-600 to-emerald-700 py-16 px-4 text-center text-white shadow-lg">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-extrabold md:text-5xl">¿Cómo Llegar?</h1>
          <p className="mt-2 text-lg text-cyan-100">Tu aventura comienza aquí. Sigue estos pasos para encontrarnos.</p>
        </div>
      </header>

      {/* --- Contenedor de Contenido --- */}
      <div className="mx-auto max-w-6xl">
        <section className="mt-8 flex flex-col gap-6 px-4 md:mt-12 md:gap-10">
          
          {/* --- PASO 1 --- */}
          <div className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-lg md:flex-row md:gap-8 md:p-8">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white">
              1
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">
                De Santa Cruz a El Torno
                <span className="ml-2 text-lg font-normal text-gray-500">(30min - 1h)</span>
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                Usa tu aplicación de mapas preferida para llegar hasta la plaza principal de El Torno, el último punto accesible por carreteras convencionales.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className={btnGoogle}>
                  <GoogleMapsIcon className="h-5 w-5" />
                  <span>Ir a El Torno (Google Maps)</span>
                </a>
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer" className={btnWaze}>
                  <WazeIcon className="h-5 w-5" />
                  <span>Ir a El Torno (Waze)</span>
                </a>
              </div>
            </div>
          </div>

          {/* --- PASO 2 (Tu Mapa Exclusivo) --- */}
          <div className="flex flex-col gap-6 rounded-lg bg-white p-6 shadow-lg md:flex-row md:gap-8 md:p-8">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-3xl font-bold text-white">
              2
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 md:text-3xl">
                De El Torno a Jardín de las Delicias
                <span className="ml-2 text-lg font-normal text-gray-500">(1h - 1.30h)</span>
              </h3>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700 md:text-lg">
                Desde El Torno, el camino es rural. Utiliza nuestro mapa interactivo para seguir el sendero y ver tu ubicación en tiempo real.
              </p>
              
              <div className="mt-6 h-96 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-200">
                {error ? (
                  <div className="flex h-full items-center justify-center rounded-md bg-red-100 p-6 text-center text-red-700">
                    {error}
                  </div>
                ) : (
                  <InteractiveTrailMap 
                        trailData={trail} 
                        onGpsErrorChange={setGpsErrorFromMap} 
                    />
                )}
              </div>
              
              <p className="mt-8 font-semibold text-gray-800">
                Si prefieres, puedes tomar transporte local desde la calle 26 de Enero en El Torno:
              </p>
              <div className="mt-4 flex flex-wrap gap-6">
                <div className="flex items-center gap-3 text-lg text-gray-800">
                  <span>🚙 Camioneta 4x4</span>
                  <span className="rounded-full bg-green-400 px-3 py-1 text-sm font-bold text-green-900">
                    25 Bs
                  </span>
                </div>
                <div className="flex items-center gap-3 text-lg text-gray-800">
                  <span>🛵 Mototaxi</span>
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-sm font-bold text-white">
                    100 Bs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Sección de Video --- */}
        <section className="mt-12 px-4 text-center md:mt-16">
          <h2 className="mb-8 text-3xl font-bold text-gray-900 md:text-4xl">
            Video Explicativo
          </h2>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-lg border border-gray-200 shadow-2xl shadow-gray-400/30 aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
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