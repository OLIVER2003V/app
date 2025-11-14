// src/components/HeroCarousel.jsx
import { useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard } from "swiper/modules";

// CSS de Swiper
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

// [NUEVO] Importamos nuestros estilos personalizados para Swiper
import "./HeroCarousel.css"; 

export function HeroCarousel({ items = [] }) {
  const slides = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  if (!slides.length) return null;

  // Tu lógica de sincronización de video es perfecta, no se toca.
  const syncVideos = useCallback((swiper) => {
    if (!swiper?.slides) return;
    swiper.slides.forEach((slideEl) => {
      const vid = slideEl.querySelector("video");
      if (vid && !vid.paused) {
        try { vid.pause(); } catch {}
      }
    });
    const active = swiper.slides[swiper.activeIndex];
    if (active) {
      const v = active.querySelector("video");
      if (v) {
        v.muted = true;
        v.playsInline = true;
        v.play().catch(() => {});
      }
    }
  }, []);

  return (
    // [MODIFICADO] Usamos 'hero-carousel' para aplicar nuestros estilos CSS
    <div className="hero-carousel relative h-full w-full" aria-label="Galería principal">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard]}
        slidesPerView={1}
        loop={true}
        effect="fade"
        speed={700}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        className="h-full w-full" // [MODIFICADO] Reemplaza el style prop
        onSwiper={(swiper) => setTimeout(() => syncVideos(swiper), 0)}
        onSlideChange={syncVideos}
      >
        {slides.map((item) => {
          const src = item.src;
          const isVideo = String(item.media_type || "").toUpperCase() === "VIDEO";

          return (
            <SwiperSlide key={item.id}>
              {/* [MODIFICADO] Clases de Tailwind */}
              <div className="relative h-full w-full">
                {isVideo ? (
                  <video
                    // [MODIFICADO] Clases de Tailwind
                    className="h-full w-full object-cover"
                    src={src}
                    controls={false}
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    // [MODIFICADO] Clases de Tailwind
                    className="h-full w-full object-cover"
                    src={src}
                    alt={item.title || "Slide de la galería"}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                {/* [MODIFICADO] Overlay y Caption con Tailwind */}
                <div
                  className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/10 to-black/70"
                  aria-hidden="true"
                />
                {(item.title || item.caption) && (
                  <div className="absolute bottom-[15%] left-1/2 z-10 w-[90%] max-w-[800px] -translate-x-1/2 text-center">
                    <h1 className="font-bold leading-tight text-white [text-shadow:2px_2px_10px_rgba(0,0,0,0.8)] text-[clamp(2rem,8vw,3.5rem)]">
                      {item.title || item.caption}
                    </h1>
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}