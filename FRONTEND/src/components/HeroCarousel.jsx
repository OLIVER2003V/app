import React, { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import api from "@/lib/api";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./HeroCarousel.css";

const ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

const HeroCarousel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper para normalizar URLs de media
  const mediaURL = (url) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${ROOT}${url}`;
  };

  useEffect(() => {
    api
      .get("gallery/") // <- sin slash inicial, respeta baseURL (/api)
      .then(({ data }) => {
        const galleryItems = Array.isArray(data) ? data : (data?.results || []);
        console.log("Items de la galería recibidos:", galleryItems);
        setItems(galleryItems);
      })
      .catch((err) => {
        console.error("Error al cargar la galería:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="hero-loader">Cargando Galería...</div>;
  }

  if (items.length === 0) {
    return (
      <section className="hero-static">
        <div className="hero__content">
          <h1>Jardín de las Delicias</h1>
          <p>Un paraíso por descubrir 🌿 Cascadas, senderos y tours guiados.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="hero-carousel-section">
      <Carousel
        autoPlay
        infiniteLoop
        showThumbs={false}
        showStatus={false}
        interval={5000}
        transitionTime={700}
      >
        {items.map((item) => {
          const src = mediaURL(item.media_file);
          const isVideo = (item.media_type || "").toUpperCase() === "VIDEO";
          return (
            <div key={item.id} className="carousel-slide">
              {isVideo ? (
                <video
                  className="carousel-media"
                  autoPlay
                  loop
                  muted
                  playsInline
                  onError={(e) => {
                    console.warn("Video no disponible:", src);
                    e.currentTarget.style.display = "none";
                  }}
                >
                  <source src={src} type="video/mp4" />
                </video>
              ) : (
                <img
                  src={src}
                  alt={item.title || "imagen"}
                  className="carousel-media"
                  onError={(e) => {
                    console.warn("Imagen no disponible:", src);
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="carousel-overlay"></div>
              <div className="carousel-caption">
                <h1>{item.title}</h1>
                {item.subtitle && <p>{item.subtitle}</p>}
              </div>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default HeroCarousel;
