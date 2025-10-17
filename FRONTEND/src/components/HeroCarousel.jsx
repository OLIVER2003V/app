import React, { useState, useEffect } from 'react';
import { Carousel } from 'react-responsive-carousel';
import api from '../lib/api';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './HeroCarousel.css';

const HeroCarousel = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery/')
      .then(({ data }) => {
        const galleryItems = data.results || data;
        
        // MENSAJE DE DEPURACIÓN: Esto te dirá si los datos llegaron.
        console.log('Items de la galería recibidos:', galleryItems);
        
        setItems(galleryItems);
      })
      .catch(err => console.error("Error MUY IMPORTANTE al cargar la galería:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="hero-loader">Cargando Galería...</div>;
  }

  // Si no hay items, muestra una imagen estática de respaldo
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
        {items.map(item => (
          <div key={item.id} className="carousel-slide">
            {item.media_type === 'VIDEO' ? (
              <video className="carousel-media" autoPlay loop muted playsInline>
                <source src={item.media_file} type="video/mp4" />
              </video>
            ) : (
              <img src={item.media_file} alt={item.title} className="carousel-media" />
            )}
            <div className="carousel-overlay"></div>
            <div className="carousel-caption">
              <h1>{item.title}</h1>
            </div>
          </div>
        ))}
      </Carousel>
    </section>
  );
};

export default HeroCarousel;