import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './HeroCarousel.css';

// Este componente ahora es más simple. Recibe los items como un prop.
export default function HeroCarousel({ items = [] }) {
  
  // Si no hay items, muestra un mensaje estático o de carga.
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
          // CORRECCIÓN: Usamos el campo nuevo 'media_file_url'
          const src = item.media_file_url;
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