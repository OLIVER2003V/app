import { useMemo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, EffectFade, Keyboard } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export function HeroCarousel({ items = [] }) {
  const slides = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  if (!slides.length) return null;

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
          pauseOnMouseEnter: true,
        }}
        navigation
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        style={{ width: "100%", height: "100%" }}
        onSwiper={(swiper) => setTimeout(() => syncVideos(swiper), 0)}
        onSlideChange={syncVideos}
      >
        {slides.map((item) => {
          const src = item.src; // ✅ viene de normalizeGalleryItem
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
