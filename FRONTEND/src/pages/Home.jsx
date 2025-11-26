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
  ExternalLink,
  MapPin
} from "lucide-react";

// Lazy load del Carrusel
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-cyan-100 flex items-center justify-center">
        <div className="text-emerald-600"><LoadingSpinner /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500/30 relative overflow-x-hidden">
      
      {isTourActive && <GuidedTour onComplete={handleTourComplete} />}

      {/* --- FONDO AMBIENTAL VIBRANTE Y CLARO --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-emerald-100 to-cyan-100"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay"
           style={{ backgroundImage: "url('https://images.unsplash.com/photo-1463695973559-943f5502758f?q=80&w=2070&auto=format&fit=crop')" }}
        ></div>
        <div className="absolute top-[-20%] left-[-10%] w-[70vh] h-[70vh] bg-emerald-400/30 rounded-full blur-[128px] animate-pulse mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70vh] h-[70vh] bg-cyan-400/30 rounded-full blur-[128px] mix-blend-multiply"></div>
      </div>

      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce">
          <span className="text-xl">⚠️</span> {error}
        </div>
      )}

      <div className="relative z-10">

        {/* --- HERO SECTION --- */}
        {/* AJUSTE 1: Reduje el padding superior de 'pt-20' a 'pt-12' para subir el contenido */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-0 px-4 sm:px-6 lg:px-8 text-center">
          
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
            
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 border border-emerald-200 backdrop-blur-md text-emerald-700 text-xs font-extrabold uppercase tracking-widest shadow-sm">
              <Trees className="h-4 w-4 text-emerald-600" /> 
              <span>Paraíso Ecoturístico</span>
            </div>
            
            {/* Título Principal */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Descubre el <br className="hidden md:block" />
              <span className="relative inline-block">
                {/* Sombra de color detrás */}
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-cyan-400 blur-xl opacity-30"></span>
                {/* AJUSTE 3: Degradado con más contraste (from-emerald-700) y mejor sombra (drop-shadow) */}
                <span className="relative text-transparent bg-clip-text bg-gradient-to-br from-emerald-700 via-teal-500 to-cyan-600 drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]">
                  Jardín de las Delicias
                </span>
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
              Un Paraíso Por Descubrir
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-6">
              
              {/* Botón Principal */}
              <Link 
                to="/como-llegar"
                className="group relative w-full sm:w-auto overflow-hidden rounded-2xl transition-all hover:-translate-y-1 shadow-lg hover:shadow-emerald-500/30"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex h-full w-full items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white">
                  <Compass className="h-6 w-6" />
                  Cómo Llegar
                  <ArrowRight className="h-5 w-5 opacity-80 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>

              {/* Botón Secundario */}
              <Link 
                to="/posts"
                className="group w-full sm:w-auto relative flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/70 border-2 border-white text-emerald-700 font-extrabold backdrop-blur-md shadow-md transition-all hover:-translate-y-1 hover:bg-white/90 hover:text-emerald-800 hover:border-emerald-200"
              >
                <Newspaper className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                Ver Guías y Tips
              </Link>

            </div>
          </div>

          {/* Flecha Scroll */}
          {/* AJUSTE 2: Cambié 'bottom-10' por 'bottom-4' para bajar la flecha */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce">
            <a href="#info-rapida" className="flex flex-col items-center text-emerald-600/70 hover:text-emerald-800 transition-colors gap-2">
              <ChevronDown className="h-8 w-8" />
            </a>
          </div>
        </section>

        {/* --- INFO RÁPIDA --- */}
        <section id="info-rapida" className="py-16 px-4 relative">
          <div className="max-w-6xl mx-auto">
             <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-cyan-600">
                    Información Esencial
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {/* Card Horario */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl hover:border-emerald-400 transition-all group shadow-xl hover:shadow-2xl hover:shadow-emerald-100/50">
                <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Clock className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Horario de Visita</h3>
                <p className="text-slate-600 font-medium mb-4">Abierto todos los días.</p>
                <div className="text-4xl font-black text-emerald-700">08:00 - 18:00</div>
              </div>

              {/* Card Precio */}
              <div className="bg-gradient-to-br from-white/70 to-cyan-50/70 backdrop-blur-xl border-2 border-cyan-200 p-8 rounded-3xl transition-all group shadow-xl hover:shadow-2xl hover:shadow-cyan-100/50 relative overflow-hidden transform hover:-translate-y-1">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Ticket className="w-32 h-32 text-cyan-600 rotate-12"/></div>
                <div className="w-16 h-16 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm relative z-10">
                   <Ticket className="h-8 w-8 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Ingreso General</h3>
                <div className="flex items-baseline gap-2 relative z-10">
                    <span className="text-5xl font-black text-cyan-700">15 Bs</span>
                    <span className="text-slate-600 font-semibold">/ persona</span>
                </div>
              </div>

              {/* Card Parque */}
              <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-8 rounded-3xl hover:border-orange-400 transition-all group shadow-xl hover:shadow-2xl hover:shadow-orange-100/50">
                 <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <Trees className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Tasa Parque Amboró</h3>
                <div className="space-y-3 text-slate-700 font-medium">
                  <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                    <span>Nacionales</span> <span className="text-orange-700 font-black text-lg">20 Bs</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/50 p-3 rounded-xl">
                    <span>Extranjeros</span> <span className="text-orange-700 font-black text-lg">100 Bs</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- CARRUSEL --- */}
        {galleryItems.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-100/50 border-4 border-white bg-slate-100 aspect-video md:aspect-[21/9]">
                <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-emerald-600"><LoadingSpinner /></div>}>
                  <HeroCarousel items={galleryItems} />
                </Suspense>
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 pointer-events-none">
                  <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                    Galería Multimedia
                  </h2>
                  <p className="text-white text-lg font-medium drop-shadow-md">
                    Explora la belleza natural antes de tu viaje.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- OPINIONES --- */}
        {reviews.length > 0 && (
          <section className="py-20 relative bg-white/40 backdrop-blur-lg my-10">
             <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-cyan-700">
                    Experiencias de Viajeros
                </h2>
                <p className="text-slate-600 mt-3 text-lg">Lo que dicen quienes ya vivieron la aventura.</p>
              </div>

            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white border border-slate-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all flex flex-col">
                     <div className="flex items-center gap-4 mb-6">
                      {review.photo ? (
                        <img src={review.photo} alt={review.author_name} className="w-14 h-14 rounded-full object-cover border-2 border-emerald-200 shadow-sm" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                          {review.author_name.charAt(0)}
                        </div>
                      )}
                        <div>
                           <div className="font-bold text-slate-900 text-lg">{review.author_name}</div>
                           <div className="flex text-amber-400">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"}`} />
                              ))}
                           </div>
                        </div>
                     </div>
                     <p className="text-slate-700 italic flex-grow mb-6 leading-relaxed">"{review.comment}"</p>
                     {review.place_name && (
                      <div className="mt-auto pt-4 border-t border-slate-100 text-sm font-medium">
                        <span className="text-slate-500">Visitó: </span>
                        <Link to={`/places/${review.place_slug}`} className="text-emerald-600 hover:text-emerald-800 hover:underline inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3"/> {review.place_name}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* --- FOOTER CTA --- */}
        <section className="py-24 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-t from-emerald-200/30 to-transparent blur-3xl pointer-events-none"></div>
          <div className="relative max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                ¿Tienes dudas sobre tu <br/> próxima aventura?
            </h2>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <a 
                href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx" 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#1da851] text-white font-extrabold rounded-2xl transition-all shadow-lg shadow-green-500/30 hover:scale-105 hover:shadow-green-500/50"
              >
                <MessageCircle className="h-6 w-6" />
                Unirme al Grupo de WhatsApp
              </a>
              <Link 
                to="/informacion"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all shadow-sm hover:scale-105 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700"
              >
                <Info className="h-6 w-6" />
                Ver Información Completa
              </Link>
            </div>
          </div>
        </section>

        {/* --- FOOTER FINAL --- */}
        <footer className="bg-white/80 backdrop-blur-md py-12 text-center text-slate-600 text-sm border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4">
            <div className="mb-6 flex items-center justify-center gap-2">
                <Trees className="h-6 w-6 text-emerald-500"/>
                <span className="font-black text-xl text-slate-800">Jardín de las Delicias</span>
            </div>
            <div className="flex justify-center gap-8 mb-8 font-bold">
              <Link to="/places" className="hover:text-emerald-600 transition-colors">Lugares</Link>
              <Link to="/events" className="hover:text-emerald-600 transition-colors">Eventos</Link>
              <Link to="/contact" className="hover:text-emerald-600 transition-colors">Contacto</Link>
            </div>
            <p className="mb-4">&copy; {new Date().getFullYear()} Todos los derechos reservados.</p>
            <p className="mt-8 text-xs text-slate-500">
              Hecho por <a href="https://wa.me/59172672767" className="font-bold text-emerald-600 hover:underline">Oliver Ventura</a>
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}