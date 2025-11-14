import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
// [CORREGIDO] Intentando con rutas relativas
import api from "../lib/api";

// [CORREGIDO] Intentando con rutas relativas
import { LoadingSpinner } from "../components/LoadingSpinner";
import { GuidedTour } from "../components/GuidedTour";

// [NUEVO] Importamos el carrusel con "lazy loading"
// Asegúrate de que la ruta coincida con donde guardaste el archivo anterior.
const HeroCarousel = lazy(() => 
  import("../components/HeroCarousel").then(module => ({ default: module.HeroCarousel }))
);

// --- Iconos SVG Profesionales ---
const ImageIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 8h.01" /><path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" /><path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" /><path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l2 2" />
  </svg>
);
const CompassIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 16l2 -6l6 -2l-2 6l-6 2" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 3l0 2" /><path d="M12 19l0 2" /><path d="M3 12l2 0" /><path d="M19 12l2 0" />
  </svg>
);
const InfoIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9l0 3" /><path d="M12 16l.01 0" />
  </svg>
);
const WhatsappIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" /><path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
  </svg>
);
const NewspaperIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16 6h3a1 1 0 0 1 1 1v11a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a1 1 0 0 1 1 -1h3" /><path d="M10 16h4" /><path d="M10 12h4" /><path d="M10 8h4" /><path d="M6 4h8a1 1 0 0 1 1 1v3h-10v-3a1 1 0 0 1 1 -1z" />
  </svg>
);
const Star = () => <span className="text-amber-400">⭐</span>;

const ClockIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 7l0 5l3 3" />
  </svg>
);
const LeafIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 21c.5 -4.5 2.5 -8 7 -8s6.5 3.5 7 8" /><path d="M12 18c-5.413 -2.373 -8 -7.144 -8 -13" /><path d="M12 18c5.413 -2.373 8 -7.144 8 -13" />
  </svg>
);
const MountainIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 20h18l-6.921 -14.612a2.3 2.3 0 0 0 -4.158 0l-6.921 14.612z" /><path d="M7.5 11l2.5 4l2.5 -4l2.5 4l2 -3.5" />
  </svg>
);
/* ---------------- Fin de Iconos ---------------- */


/* ---------------- Función de Utilidad ---------------- */
function unwrapResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

// ▼▼▼ INICIO DE LA CORRECCIÓN ▼▼▼
// Esta función "traduce" los datos de tu API al formato que HeroCarousel espera ({ id, src, title, media_type })
function normalizeGalleryItem(raw, idx) {
  const id = raw?.id ?? raw?.pk ?? idx;
  const title = raw?.title ?? raw?.name ?? raw?.titulo ?? "Slide";
  
  // Busca la URL en todas las propiedades posibles
  const candidates = [
    raw?.media_file_url, 
    raw?.media_url, 
    raw?.file_url, 
    raw?.url, 
    raw?.image_url, 
    raw?.image, 
    raw?.src, 
    raw?.cover, 
    raw?.video_url
  ];
  const src = candidates.find(Boolean) ?? "";

  // Determina si es video o imagen
  const mt = raw?.media_type ?? (src?.match(/\.(mp4|webm|ogg)(\?|$)/i) ? "VIDEO" : "IMAGE");
  const media_type = String(mt).toUpperCase();
  
  // Devuelve el objeto "traducido" que HeroCarousel entiende
  return { id, title, media_type, src };
}
// ▲▲▲ FIN DE LA CORRECCIÓN ▲▲▲

/* ---------------- Fin de Utilidades ---------------- */


/* ---------------- Home ---------------- */
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
          setReviews(unwrapResults(results[0].value.data).slice(0, 5));
        }

        // ▼▼▼ INICIO DE LA CORRECCIÓN ▼▼▼
        if (results[1].status === "fulfilled") {
          const rawItems = unwrapResults(results[1].value.data);
          // Usamos el "traductor" para normalizar los datos antes de guardarlos
          const normalizedItems = rawItems.map(normalizeGalleryItem).filter(item => item.src);
          setGalleryItems(normalizedItems); 
        }
        // ▲▲▲ FIN DE LA CORRECCIÓN ▲▲▲

        results.forEach(r => { if (r.status === 'rejected') console.error("Error en petición:", r.reason); });
      } catch (e) {
        console.error("Error al cargar la página:", e);
        setError("Ocurrió un problema al cargar el contenido. Intenta nuevamente.");
      } finally {
        setLoading(false);
        const hasSeenTour = localStorage.getItem('tourCompletado');
        if (!hasSeenTour) setTimeout(() => setIsTourActive(true), 500);
      }
    };
    loadInitialData();
  }, []);

  const handleTourComplete = () => {
    setIsTourActive(false);
    localStorage.setItem('tourCompletado', 'true');
  };
  
  if (loading) return <LoadingSpinner />;

  // El resto de tu JSX está perfecto y no necesita cambios.
  return (
    <div className="font-sans text-slate-800 antialiased motion-safe:scroll-smooth bg-gray-50">
      {isTourActive && <GuidedTour onComplete={handleTourComplete} />}

      {error && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 my-6 rounded-lg border border-red-300 bg-red-50 p-4 text-center font-medium text-red-800" role="alert">
          <span className="mr-2 inline-block text-lg" aria-hidden="true">⚠️</span> {error}
        </div>
      )}

      {/* --- Sección Hero de Información (Móvil-First) --- */}
      <section 
        className="relative flex items-center justify-center text-white pt-2 pb-20 sm:pt-16 sm:pb-28"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-600 to-emerald-700"></div>
        <div className="absolute inset-0 w-full h-full bg-black/50"></div>
        
        <div className="relative z-10 p-4 max-w-4xl mx-auto w-full">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg text-left">
            Tu Aventura te Espera
          </h1>
          <p className="mt-4 max-w-xl text-base md:text-lg text-cyan-100 drop-shadow-md text-left">
            Descubre un paraíso natural de cascadas, senderos y maravillas inolvidables.
          </p>
          
          {/* --- Panel de Información Vital (Compacto) --- */}
          <div className="mt-8 max-w-3xl">
            
            {/* Horarios (Píldora destacada) */}
            <div className="flex items-center justify-start gap-3 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm p-2 border border-cyan-400/30">
                <ClockIcon className="h-5 w-5 text-cyan-300" />
              </div>
              <span className="text-base font-semibold text-white">
                Abierto todos los días: 08:00 - 18:00
              </span>
            </div>

            {/* Grid de Precios Simplificado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              
              {/* Tarjeta 1: Ingreso Jardín */}
              <div className="group relative rounded-xl border border-white/20 bg-black/30 p-5 text-left backdrop-blur-md transition-all duration-300 hover:bg-black/50 hover:border-white/30 hover:scale-[1.02] will-change-transform">
                <div className="flex items-center gap-4">
                  <div className="inline-flex rounded-full bg-cyan-500/20 p-3">
                    <LeafIcon className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Ingreso al Jardín</h3>
                    <p className="text-xs text-slate-200">
                      Incluye: Parqueo, Guías, Salvavidas, Baños y Senderos.
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <span className="block text-4xl font-extrabold text-cyan-300">15 Bs</span>
                  <span className="block text-sm font-medium text-white">Nacionales y Extranjeros</span>
                </div>
              </div>

              {/* Tarjeta 2: Ingreso P.N. Amboró */}
              <div className="group relative rounded-xl border border-white/20 bg-black/30 p-5 text-left backdrop-blur-md transition-all duration-300 hover:bg-black/50 hover:border-white/30 hover:scale-[1.02] will-change-transform">
                <div className="flex items-center gap-4">
                  <div className="inline-flex rounded-full bg-cyan-500/20 p-3">
                    <MountainIcon className="h-6 w-6 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Ingreso al P.N. Amboró</h3>
                    <p className="text-xs text-slate-200">
                      Tasa del SERNAP (SISCO) para áreas protegidas.
                    </p>
                  </div>
                </div>
                {/* Mini-grid de precios */}
                <div className="mt-4 grid grid-cols-2 divide-x divide-cyan-400/30 text-center">
                  <div className="px-2">
                    <span className="block text-4xl font-extrabold text-cyan-300">20 Bs</span>
                    <span className="block text-sm font-medium text-white">Nacionales</span>
                  </div>
                  <div className="px-2">
                    <span className="block text-4xl font-extrabold text-cyan-300">100 Bs</span>
                    <span className="block text-sm font-medium text-white">Extranjeros</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          {/* --- Fin Panel de Información --- */}

        </div>
        
        {/* --- [NUEVO] Indicador de Scroll --- */}
        <a 
          href="#cta-links" 
          className="absolute z-20 bottom-6 left-1/2 -translate-x-1/2 animate-bounce p-2 rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-white/20"
          aria-label="Deslizar hacia abajo"
        >
          <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </a>
      </section>

      {/* --- [NUEVO] Sección de Botones CTA (MOVIBLES) --- */}
      <section id="cta-links" className="bg-gray-50 pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 justify-center">
            
            {/* Botón 1: Posts (Guías) - [TAMAÑO AJUSTADO] */}
            <Link 
              to="/posts"
              className="group flex-1 flex items-center justify-center gap-4 text-center px-6 py-4 rounded-xl bg-gradient-to-r from-lime-500 to-green-600 text-white text-lg md:text-xl font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-lime-300"
            >
              <NewspaperIcon className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[-5deg]" />
              <span>Ver Guías y Artículos</span>
            </Link>

            {/* Botón 2: Ubicación (Cómo Llegar) - [TAMAÑO AJUSTADO] */}
            <Link 
              to="/como-llegar"
              className="group flex-1 flex items-center justify-center gap-4 text-center px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white text-lg md:text-xl font-bold shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300"
            >
              <CompassIcon className="h-7 w-7 transition-transform duration-300 group-hover:rotate-[10deg]" />
              <span>Nuestra Ubicación</span>
            </Link>

          </div>
        </div>
      </section>

      {/* --- Sección de Accesos Rápidos (Colores Modificados) --- */}
      <section id="accesos" className="bg-white py-16 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-900">
              Planifica tu Visita
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
              Todo lo que necesitas saber en un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 text-center md:grid-cols-3">
            <Link className="group block rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-300/30 hover:border-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" to="/como-llegar">
              <span className="mb-4 inline-block rounded-full bg-cyan-100 p-4 text-cyan-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white">
                <CompassIcon className="h-10 w-10" />
              </span>
              <h3 className="mb-2 text-xl font-bold text-emerald-900 transition-colors group-hover:text-emerald-700">¿Cómo llegar?</h3>
              <p className="text-slate-500">Ruta interactiva y opciones de transporte.</p>
            </Link>
            
            <Link className="group block rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-300/30 hover:border-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" to="/informacion">
              <span className="mb-4 inline-block rounded-full bg-cyan-100 p-4 text-cyan-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white">
                <InfoIcon className="h-10 w-10" />
              </span>
              <h3 className="mb-2 text-xl font-bold text-emerald-900 transition-colors group-hover:text-emerald-700">Información Útil</h3>
              <p className="text-slate-500">Horarios, tarifas y contacto.</p>
            </Link>
            
            <a className="group block rounded-xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-300/30 hover:border-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500" href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx" target="_blank" rel="noreferrer noopener">
              <span className="mb-4 inline-block rounded-full bg-cyan-100 p-4 text-cyan-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-cyan-600 group-hover:text-white">
                <WhatsappIcon className="h-10 w-10" />
              </span>
              <h3 className="mb-2 text-xl font-bold text-emerald-900 transition-colors group-hover:text-emerald-700">WhatsApp</h3>
              <p className="text-slate-500">Atención turística directa.</p>
            </a>
          </div>
        </div>
      </section>

      
      {/* --- [NUEVA SECCIÓN DE CARRUSEL] --- */}
      {galleryItems.length > 0 && (
        <section id="gallery-carousel" className="bg-gray-50 py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-900">
                Nuestra Galería
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
                Un vistazo a las maravillas que te esperan.
              </p>
            </div>
            
            <div className="relative h-[300px] sm:h-[400px] md:h-[550px] w-full rounded-xl overflow-hidden shadow-2xl bg-slate-200 border border-slate-200">
              <Suspense fallback={<LoadingSpinner />}>
                <HeroCarousel items={galleryItems} />
              </Suspense>
            </div>
          </div>
        </section>
      )}
      {/* --- [FIN DE LA NUEVA SECCIÓN] --- */}


      {/* --- Sección Opiniones (Colores Modificados) --- */}
      {reviews.length > 0 && (
        <section id="opiniones" className="bg-white py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="mb-12 text-center md:mb-16">
              <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-5xl md:text-6xl">
                Lo que dicen nuestros visitantes
              </h2>
            </header>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <blockquote key={review.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-7 text-center shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {review.photo && (
                    <img src={review.photo} alt={`Foto de ${review.author_name}`} className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg" loading="lazy" />
                  )}
                  <p className="flex-grow mb-5 italic text-slate-700">"{review.comment}"</p>
                  <footer className="mt-auto">
                    <cite className="flex flex-col items-center not-italic">
                      <span className="font-bold text-emerald-800">{review.author_name}</span>
                      <span>
                        {[...Array(review.rating)].map((_, i) => <Star key={i} />)}
                      </span>
                    </cite>
                    {review.place_name && review.place_slug && (
                      <Link to={`/places/${review.place_slug}`} className="mt-2 inline-block text-sm font-semibold text-cyan-700 hover:underline">
                        en {review.place_name}
                      </Link>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Footer (Colores Modificados) --- */}
      <footer className="bg-emerald-950 text-slate-300"> {/* Un poco más oscuro para contraste */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-200">
                Jardín de las Delicias
              </h3>
              <p className="mt-4 text-sm text-emerald-100">
                Desarrollado por{" "}
                <a href="https://wa.me/59172672767" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-300 hover:text-cyan-200 hover:underline">
                  Oliver Ventura
                </a> | 2025
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white tracking-wider">Navegación</h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/places" className="hover:text-white hover:underline">Lugares</Link></li>
                <li><Link to="/events" className="hover:text-white hover:underline">Eventos</Link></li>
                <li><Link to="/contact" className="hover:text-white hover:underline">Contacto</Link></li>
                <li><Link to="/como-llegar" className="hover:text-white hover:underline">Cómo Llegar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white tracking-wider">Contacto Rápido</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx" target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline">
                    Grupo de WhatsApp
                  </a>
                </li>
                <li>
                  <a href="mailto:jardindelasdelicias@gmail.com" className="hover:text-white hover:underline">
                    jardindelasdelicias@gmail.com"
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}