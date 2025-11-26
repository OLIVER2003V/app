import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../lib/api";

import { LoadingSpinner } from "../components/LoadingSpinner";
import { GuidedTour } from "../components/GuidedTour";

// --- Iconos Lucide ---
import { 
  Clock, 
  Ticket, 
  Trees, 
  Compass, 
  Info, 
  MessageCircle, 
  Newspaper, 
  Star, 
  ChevronDown,
  ArrowRight,
  MapPin,
  Camera,
  Droplets
} from "lucide-react";

const HeroCarousel = lazy(() => 
  import("../components/HeroCarousel").then(module => ({ default: module.HeroCarousel }))
);

// --- Funciones de Utilidad ---
function unwrapResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeGalleryItem(raw, idx) {
  const id = raw?.id ?? raw?.pk ?? idx;
  const title = raw?.title ?? raw?.name ?? raw?.titulo ?? "Slide";
  
  const candidates = [
    raw?.media_file_url, raw?.media_url, raw?.file_url, raw?.url, 
    raw?.image_url, raw?.image, raw?.src, raw?.cover, raw?.video_url
  ];
  const src = candidates.find(Boolean) ?? "";
  const mt = raw?.media_type ?? (src?.match(/\.(mp4|webm|ogg)(\?|$)/i) ? "VIDEO" : "IMAGE");
  const media_type = String(mt).toUpperCase();
  
  return { id, title, media_type, src };
}

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get("reviews/"),
          api.get("gallery/"), 
        ]);
        
        if (results[0].status === "fulfilled") {
          setReviews(unwrapResults(results[0].value.data).slice(0, 6)); 
        }

        if (results[1].status === "fulfilled") {
          const rawItems = unwrapResults(results[1].value.data);
          const normalizedItems = rawItems.map(normalizeGalleryItem).filter(item => item.src);
          setGalleryItems(normalizedItems); 
        }
      } catch (e) {
        console.error("Error crítico:", e);
        setError("No pudimos cargar toda la información. Por favor revisa tu conexión.");
      } finally {
        setLoading(false);
        const hasSeenTour = localStorage.getItem('tourCompletado');
        if (!hasSeenTour) setTimeout(() => setIsTourActive(true), 1000);
      }
    };
    loadInitialData();
  }, []);

  const handleTourComplete = () => {
    setIsTourActive(false);
    localStorage.setItem('tourCompletado', 'true');
  };
  
  if (loading) return (
    <div className="min-h-screen bg-cyan-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-200 via-white to-emerald-200 animate-pulse"></div>
        <div className="text-cyan-600 scale-150 relative z-10"><LoadingSpinner /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 relative overflow-x-hidden">
      
      {isTourActive && <GuidedTour onComplete={handleTourComplete} />}

      {/* --- FONDO AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500 via-white to-emerald-300"></div>
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-sky-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-emerald-200/40 rounded-full blur-[100px] mix-blend-multiply"></div>
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/water.png')] mix-blend-overlay"></div>
      </div>

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-red-100 text-red-800 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      <div className="relative z-10">

        {/* --- HERO SECTION --- */}
<section className="relative min-h-[90vh] flex flex-col items-center justify-start px-4 sm:px-6 text-center pt-6 md:pt-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-800/80 via-white/90 to-transparent text-slate-900 overflow-hidden">
          
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up relative z-10">
            
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/70 border border-cyan-300 text-cyan-800 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md">
  <Trees className="h-4 w-4" /> 
  <span>Sitio Oficial</span>
</div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.05]">
              Bienvenidos al  <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-emerald-600 drop-shadow-sm">
                Jardín de las Delicias
              </span>
            </h1>
            
           <p className="text-xl md:text-2xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
   Un Paraíso por Descubrir ✨
</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-10">
              <Link 
                to="/como-llegar"
                className="group relative w-full sm:w-auto overflow-hidden rounded-xl shadow-lg shadow-cyan-600/20 transition-all hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-sky-600 transition-transform group-hover:scale-105"></div>
                <span className="relative flex h-full w-full items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white">
                  <Compass className="h-6 w-6" />
                  Cómo Llegar
                  <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>

              <Link 
                to="/posts"
                className="group w-full sm:w-auto relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-white/90 backdrop-blur-sm border-2 border-cyan-200 text-cyan-700 font-bold shadow-sm transition-all hover:-translate-y-1 hover:bg-white hover:border-cyan-400"
              >
                <Newspaper className="h-5 w-5 text-cyan-600" />
                Guías y Tips
              </Link>
            </div>
          </div>

          {/* FLECHA ANIMADA CORREGIDA */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <a href="#info-rapida" className="text-cyan-700/60 hover:text-cyan-900 transition-colors p-2">
              <ChevronDown className="h-10 w-10" />
            </a>
          </div>
        </section>

        {/* --- INFO RÁPIDA --- */}
        <section id="info-rapida" className="py-24 px-4 relative">
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
                  Información Esencial
               </h2>
               <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Card Horario */}
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-[0_5px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(6,182,212,0.15)] transition-all group border border-slate-100">
                <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-cyan-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Horario de Visita</h3>
                <p className="text-slate-500 font-medium mb-4">Abierto todos los días</p>
                <div className="text-3xl font-black text-cyan-800">08:00 - 18:00</div>
              </div>

              {/* Card Precio */}
              <div className="bg-gradient-to-br from-cyan-600 to-sky-700 p-8 rounded-3xl shadow-2xl shadow-cyan-700/20 text-white relative overflow-hidden transform md:-translate-y-4 hover:-translate-y-6 transition-all">
                <Ticket className="absolute -right-6 -top-6 h-36 w-36 text-cyan-400/30 rotate-12" />
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 relative z-10">
                   <Ticket className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-cyan-50 relative z-10">Ingreso General</h3>
                <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-5xl font-black text-white drop-shadow-sm">15 Bs</span>
                    <span className="text-cyan-200 font-medium">/ persona</span>
                </div>
                <p className="mt-6 text-sm font-medium text-cyan-100 border-t border-cyan-500/50 pt-4">
                   Pago en efectivo al ingresar.
                </p>
              </div>

              {/* Card Parque (MEJORADA - Estilo Premium Verde) */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 rounded-3xl shadow-2xl shadow-emerald-700/20 text-white relative overflow-hidden transform md:-translate-y-4 hover:-translate-y-6 transition-all">
                 
                 {/* Decoración de fondo */}
                 <Trees className="absolute -right-6 -top-6 h-36 w-36 text-emerald-400/30 rotate-12" />
                 
                 {/* Icono Principal */}
                 <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 relative z-10">
                  <Trees className="h-7 w-7 text-white" />
                </div>
                
                {/* Título */}
                <h3 className="text-xl font-bold mb-6 text-emerald-50 relative z-10">Tasa Parque Nacional Amboró</h3>
                
                {/* Lista de Precios */}
                <div className="space-y-3 relative z-10 font-medium">
                  <div className="flex justify-between items-center border-b border-emerald-500/30 pb-2">
                    <span className="text-emerald-100">Estudiantes</span> 
                    <span className="text-white font-black text-lg">10 Bs</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-emerald-500/30 pb-2">
                    <span className="text-emerald-100">Nacionales</span> 
                    <span className="text-white font-black text-lg">20 Bs</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-emerald-500/30 pb-2">
                    <span className="text-emerald-100">Extranjeros</span> 
                    <span className="text-white font-black text-lg">100 Bs</span>
                  </div>
                  
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- CARRUSEL --- */}
        {galleryItems.length > 0 && (
          <section className="py-16 relative z-10">
            <div className="max-w-[1400px] mx-auto px-4">
              <div className="relative rounded-3xl p-3 bg-white shadow-[0_20px_50px_rgba(6,182,212,0.1)] border border-cyan-100">
                <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-video md:aspect-[21/9] group">
                  <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-cyan-600"><LoadingSpinner /></div>}>
                    <HeroCarousel items={galleryItems} />
                  </Suspense>
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full pointer-events-none">
                     <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-2 uppercase tracking-wider">
                        <Camera className="w-4 h-4" /> Galería
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight drop-shadow-md">
                        Vistas que te dejarán sin aliento
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* --- OPINIONES --- */}
        {reviews.length > 0 && (
          <section className="py-24 relative">
             <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-black text-slate-900 mb-4">
                        Lo que dicen los viajeros
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {reviews.map((review) => (
                    <div key={review.id} className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-xl hover:shadow-cyan-100 transition-all hover:-translate-y-1 group">
                        <div className="flex items-center gap-4 mb-6">
                            {review.photo ? (
                                <img src={review.photo} alt={review.author_name} className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-100" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg">
                                {review.author_name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-slate-900 text-lg">{review.author_name}</div>
                                <div className="flex text-emerald-400 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="relative flex-grow">
                            <p className="text-slate-700 italic relative z-10 mb-6 text-base leading-relaxed">
                                "{review.comment}"
                            </p>
                        </div>
                        {review.place_name && (
                        <div className="mt-auto pt-4 border-t border-slate-100">
                            <Link to={`/places/${review.place_slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-cyan-600 uppercase tracking-wider group-hover:text-cyan-800 transition-colors">
                                <MapPin className="h-4 w-4"/> 
                                {review.place_name}
                            </Link>
                        </div>
                        )}
                    </div>
                    ))}
                </div>
            </div>
          </section>
        )}

        {/* --- FOOTER CTA (RECUPERADO) --- */}
        {/* Aquí es donde están los botones de WhatsApp e Información */}
        <section className="py-24 text-center relative overflow-hidden bg-gradient-to-r from-cyan-800 to-slate-900 text-white">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent opacity-40 pointer-events-none"></div>
           <div className="relative max-w-3xl mx-auto px-4 z-10 space-y-8">
             <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                 ¿Listo para refrescar tus ideas?
             </h2>
             <p className="text-cyan-100 text-lg md:text-xl mx-auto font-medium leading-relaxed max-w-lg">
                 Únete a nuestro grupo y planifica tu escapada perfecta.
             </p>
             <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
               <a 
                 href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx" 
                 target="_blank" 
                 rel="noreferrer"
                 className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-1"
               >
                 <MessageCircle className="h-6 w-6 fill-current" />
                 Grupo de WhatsApp
               </a>
               <Link 
                 to="/informacion"
                 className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 hover:bg-cyan-50"
               >
                 <Info className="h-6 w-6 text-cyan-600" />
                 Más Información
               </Link>
             </div>
           </div>
        </section>

        <footer className="bg-slate-950 py-10 text-center text-slate-400 text-sm relative z-20">
             <div className="max-w-6xl mx-auto px-4">
            <div className="mb-6 flex items-center justify-center gap-3">
                <Droplets className="h-6 w-6 text-cyan-400"/>
                <span className="font-bold text-xl text-white tracking-wider">Jardín de las Delicias</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 font-medium text-slate-300">
              <Link to="/places" className="hover:text-white transition-colors">Lugares</Link>
              <Link to="/events" className="hover:text-white transition-colors">Eventos</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contacto</Link>
            </div>
            <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; {new Date().getFullYear()} Asociación Turística Jardín de las Delicias</p>
                <p className="flex items-center gap-1">
                    Desarrollado por 
                    <a href="https://wa.me/59172672767" className="font-bold text-cyan-400 hover:text-white transition-colors ml-1">
                        Oliver Ventura
                    </a>
                </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}