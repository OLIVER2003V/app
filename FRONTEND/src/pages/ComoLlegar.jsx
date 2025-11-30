import React, { useEffect, useState } from 'react';
import InteractiveTrailMap from '../components/InteractiveTrailMap';
import { ExternalLink, Copy, X, MapPin, Navigation } from 'lucide-react'; 

// --- Constantes ---
const WAYPOINT_COORDS = { lat: -17.991109, lng: -63.389442 }; // Coordenadas de las cascadas
const YOUTUBE_VIDEO_ID = "rMBSyYd7JJE";

// --- Iconos SVG ---
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

// --- COMPONENTE DE AVISO (FIX PARA TIKTOK) ---
const TikTokFixOverlay = ({ onClose }) => {
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
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
                <div className="mb-4 flex justify-center">
                    <div className="bg-cyan-100 p-4 rounded-full">
                        <ExternalLink className="w-8 h-8 text-cyan-600" />
                    </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                    Navegador no compatible
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                    Estás usando el navegador interno de TikTok/Instagram que bloquea el GPS.
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                        <p className="text-xs text-slate-700">Toca los <strong className="text-slate-900">tres puntos (•••)</strong> arriba a la derecha.</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                        <p className="text-xs text-slate-700">Elige <strong className="text-slate-900">"Abrir en el Navegador"</strong> (Chrome/Safari).</p>
                    </div>
                </div>
                <button 
                    onClick={copyLink}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                        copied 
                        ? "bg-emerald-600 text-white shadow-emerald-600/30" 
                        : "bg-white border border-slate-300 text-slate-900 hover:bg-slate-50"
                    }`}
                >
                    <Copy className="w-4 h-4" /> 
                    {copied ? 'Enlace Copiado' : 'Copiar Enlace'}
                </button>
                <button onClick={onClose} className="mt-4 text-xs text-slate-400 underline">
                    Usar mapa sin GPS
                </button>
            </div>
        </div>
    );
};

export default function ComoLlegar() {
  const [trail, setTrail] = useState([]);
  const [error, setError] = useState(null);
  const [showTikTokOverlay, setShowTikTokOverlay] = useState(false); 
  const [gpsErrorFromMap, setGpsErrorFromMap] = useState(null);

  // Detectar navegador interno o error de GPS
  useEffect(() => {
    const isMobileScreen = window.innerWidth < 768; 
    if (gpsErrorFromMap && isMobileScreen && !showTikTokOverlay) {
        setShowTikTokOverlay(true);
    }
  }, [gpsErrorFromMap]);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInternalApp = (ua.indexOf("TikTok") > -1) || (ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1);
    if (isInternalApp) setShowTikTokOverlay(true);
    
    fetch('/ruta.json')
      .then(r => r.ok ? r.json() : Promise.reject('Error cargando ruta'))
      .then(data => {
        const coords = data.features?.[0]?.geometry?.coordinates;
        if(coords) setTrail(coords.map(c => [c[1], c[0]]));
      })
      .catch(e => setError("No se pudo cargar la ruta del servidor."));
  }, []);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${WAYPOINT_COORDS.lat},${WAYPOINT_COORDS.lng}`;
  const wazeUrl = `https://www.waze.com/ul?ll=${WAYPOINT_COORDS.lat}%2C${WAYPOINT_COORDS.lng}&navigate=yes`;

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 pb-10">
      
      {showTikTokOverlay && <TikTokFixOverlay onClose={() => setShowTikTokOverlay(false)} />}
      
      {/* --- Encabezado Compacto --- */}
      <header className="bg-gradient-to-br from-cyan-700 to-emerald-800 pt-8 pb-16 px-4 text-center shadow-lg">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black text-white md:text-5xl tracking-tight">
            Navegación en Vivo
          </h1>
          <p className="mt-2 text-cyan-100 font-medium text-sm md:text-base">
            El mapa detecta tu ubicación y te guía hasta las cascadas.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 -mt-10">
        
        {/* --- TARJETA PRINCIPAL DE NAVEGACIÓN --- */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Cabecera de la Tarjeta */}
            <div className="bg-white p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-xl">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg leading-tight">Mapa Interactivo</h2>
                        <p className="text-xs text-slate-500 font-medium">Jardín de las Delicias</p>
                    </div>
                </div>
                
                
            </div>

            {/* --- EL MAPA (GIGANTE) --- */}
            <div className="relative w-full h-[60vh] md:h-[65vh] bg-slate-200">
                {error ? (
                  <div className="flex h-full items-center justify-center bg-red-50 p-6 text-center text-red-600 font-medium">
                    {error}
                  </div>
                ) : (
                  <InteractiveTrailMap 
                        trailData={trail} 
                        onGpsErrorChange={setGpsErrorFromMap} 
                    />
                )}
            </div>

            {/* --- INFORMACIÓN INFERIOR --- */}
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Bloque 1: Estado */}
                <div className="p-6 flex items-start gap-4">
                    <Navigation className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">Tu ubicación activa</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            El punto azul eres tú. La línea se actualizará automáticamente a medida que avances hacia el destino.
                        </p>
                    </div>
                </div>

                {/* Bloque 2: Transporte */}
                <div className="p-6 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                        Transporte Local
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">Desde El Torno</span>
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-600">🚙 Camioneta 4x4</span>
                             <span className="font-bold text-emerald-700">25 Bs</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                             <span className="text-slate-600">🛵 Mototaxi</span>
                             <span className="font-bold text-emerald-700">100 Bs</span>
                        </div>
                    </div>
                </div>

                {/* Bloque 3: Video */}
                <div className="p-6 flex flex-col justify-center">
                    <button 
                        onClick={() => document.getElementById('video-section').scrollIntoView({ behavior: 'smooth' })}
                        className="w-full py-3 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Ver Video de la Ruta</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>

            </div>
        </div>

        {/* --- SECCIÓN VIDEO (Separada pero accesible) --- */}
        <section id="video-section" className="mt-16 mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Guía visual del camino</h2>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-xl bg-black aspect-video">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
                    title="Video explicativo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </section>

      </main>
    </div>
  );
}