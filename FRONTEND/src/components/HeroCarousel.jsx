import { useMemo, useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard } from "swiper/modules";
import { Volume2, VolumeX } from "lucide-react"; // Importamos iconos de volumen

// CSS de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// Estilos personalizados
import "./HeroCarousel.css"; 

// --- SUB-COMPONENTE PARA MANEJAR CADA SLIDE ---
// Esto permite que cada video maneje su propio sonido de forma independiente
const SlideContent = ({ item, isActive }) => {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const isVideo = String(item.media_type || "").toUpperCase() === "VIDEO";

  // Efecto para asegurar que el video se reproduce cuando el slide es activo
  useEffect(() => {
    if (isVideo && videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0; // Reiniciar video
        setIsMuted(true); // Siempre mutear al salir
      }
    }
  }, [isActive, isVideo]);

  const toggleSound = (e) => {
    e.stopPropagation(); // Evita conflictos con el arrastre del carrusel
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative h-full w-full bg-slate-900 group">
      
      {/* 1. MEDIA (Video o Imagen) */}
      {isVideo ? (
        <>
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={item.src}
            muted={isMuted} // Controlado por estado
            loop
            playsInline
            preload="metadata"
            // Al hacer click en el video, activamos/desactivamos sonido
            onClick={toggleSound} 
          />
          {/* Botón de Volumen Flotante (Feedback visual) */}
          <button 
            onClick={toggleSound}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/40 backdrop-blur-md text-white/80 hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 md:opacity-100"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </>
      ) : (
        <img
          className="h-full w-full object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
          src={item.src}
          alt={item.title || "Slide"}
          loading="lazy"
        />
      )}

      {/* 2. OVERLAY CINEMÁTICO (Degradado para que el texto se lea) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none" />

      {/* 3. TÍTULO EN LA IMAGEN */}
      {(item.title) && (
        <div className="absolute bottom-2 left-0 w-full z-20 px-6 md:px-12 pointer-events-none">
           <div className={`transform transition-all duration-700 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-xl tracking-tight leading-none mb-2">
                {item.title}
              </h2>
              {/* Si quieres mostrar una descripción corta, descomenta esto: */}
              {/* <p className="text-white/80 text-lg md:text-xl font-medium max-w-2xl drop-shadow-md">Explora la naturaleza</p> */}
           </div>
        </div>
      )}
    </div>
  );
};

export function HeroCarousel({ items = [] }) {
  const slides = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  if (!slides.length) return null;

  return (
    <div className="hero-carousel relative h-full w-full select-none rounded-3xl overflow-hidden shadow-2xl" aria-label="Galería principal">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard]}
        slidesPerView={1}
        loop={true}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: 6000, 
          disableOnInteraction: false,
        }}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        className="h-full w-full"
      >
        {slides.map((item) => (
          <SwiperSlide key={item.id}>
            {({ isActive }) => (
              <SlideContent item={item} isActive={isActive} />
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}