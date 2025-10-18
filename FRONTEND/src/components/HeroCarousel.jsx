// src/components/HeroCarousel.jsx
import { useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard } from "swiper/modules";

// Estilos base de Swiper (necesarios)
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export function HeroCarousel({ items = [] }) {
  const slides = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  if (!slides.length) return null;

  // Función para pausar todos los videos y reproducir solo el del slide activo
  const syncVideos = useCallback((swiper) => {
    if (!swiper?.slides) return;
    // Pausar todos
    swiper.slides.forEach((slideEl) => {
      const vid = slideEl.querySelector("video");
      if (vid && !vid.paused) {
        try { vid.pause(); } catch {}
      }
    });
    // Reproducir el actual (si es video)
    const active = swiper.slides[swiper.activeIndex];
    if (active) {
      const v = active.querySelector("video");
      if (v) {
        // Aseguramos mute/inline para autoplay en móviles
        v.muted = true;
        v.playsInline = true;
        // Iniciar sin bloquear autoplay global
        v.play().catch(() => {});
      }
    }
  }, []);

  return (
    <div className="hero-carousel" aria-label="Galería principal">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard]}
        slidesPerView={1}
        loop={true}
        effect="fade"
        speed={700}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // pausa si el usuario deja el mouse encima
        }}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        // Mantener el 16:9: el Swiper ocupa 100% del contenedor .hero-inner
        style={{ width: "100%", height: "100%" }}
        onSwiper={(swiper) => {
          // pequeña espera para que el DOM esté listo
          setTimeout(() => syncVideos(swiper), 0);
        }}
        onSlideChange={syncVideos}
      >
        {slides.map((item) => {
          const src = item.media_file_url || item.media_file || item.url || item.image;
          const isVideo = String(item.media_type || "").toUpperCase() === "VIDEO";

          return (
            <SwiperSlide key={item.id}>
              <div className="carousel-slide">
                {isVideo ? (
                  <video
                    className="carousel-media"
                    src={src}
                    controls
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="carousel-media"
                    src={src}
                    alt={item.title || "Slide"}
                    loading="lazy"
                    decoding="async"
                  />
                )}

                {/* Overlay + título */}
                <div className="carousel-overlay" />
                {(item.title || item.caption) && (
                  <div className="carousel-caption">
                    <h1>{item.title || item.caption}</h1>
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
