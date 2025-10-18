import { useMemo } from "react";

export function HeroCarousel({ items = [] }) {
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  if (!safeItems.length) return null;

  return (
    <div className="hero-carousel">
      {safeItems.map((item) => {
        const src = item.media_file_url || item.media_file || item.url || item.image;
        const isVideo = String(item.media_type || "").toUpperCase() === "VIDEO";

        return (
          <div key={item.id} className="carousel-slide">
            {isVideo ? (
              <video
                className="carousel-media"
                src={src}
                controls
                autoPlay
                loop
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
        );
      })}
    </div>
  );
}
