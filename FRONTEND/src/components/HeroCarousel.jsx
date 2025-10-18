// src/components/HeroCarousel.jsx
import { useMemo } from "react";

export function HeroCarousel({ items = [] }) {
  // Evita renders vacíos si no hay items
  const safeItems = useMemo(() => Array.isArray(items) ? items : [], [items]);

  if (!safeItems.length) {
    return null; // o un skeleton/placeholder
  }

  return (
    <div className="hero-carousel">
      {safeItems.map((item) => {
        const src = item.media_file_url || item.media_file;
        const isVideo = (item.media_type || "").toUpperCase() === "VIDEO";

        return (
          <div key={item.id} className="carousel-item">
            {isVideo ? (
              <video
                src={src}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="carousel-video"
              />
            ) : (
              <img
                src={src}
                alt={item.title}
                className="carousel-image"
                loading="lazy"
              />
            )}
            <div className="carousel-caption">
              <h2>{item.title}</h2>
            </div>
          </div>
        );
      })}
    </div>
  );
}
