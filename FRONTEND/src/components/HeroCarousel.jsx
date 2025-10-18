import React, { useState, useEffect } from "react";
import { Carousel } from "react-responsive-carousel";
import api from "@/lib/api";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./HeroCarousel.css";

const HeroCarousel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("gallery/")
      .then(({ data }) => {
        const galleryItems = (Array.isArray(data) ? data : data?.results || []).filter(item => item.is_active);
        setItems(galleryItems);
      })
      .catch((err) => {
        console.error("Error al cargar la galería:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="hero-placeholder">Cargando Galería...</div>;
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
          // REVERTIDO
          const src = item.media_file; 
          const isVideo = (item.media_type || "").toUpperCase() === "VIDEO";
          
          return (
            <div key={item.id} className="carousel-slide">
              {isVideo ? (
                <video className="carousel-media" autoPlay loop muted playsInline>
                  <source src={src} type="video/mp4" />
                </video>
              ) : (
                <img src={src} alt={item.title || "imagen"} className="carousel-media" />
              )}
              <div className="carousel-overlay"></div>
              <div className="carousel-caption">
                <h1>{item.title}</h1>
              </div>
            </div>
          );
        })}
      </Carousel>
    </section>
  );
};

export default HeroCarousel;