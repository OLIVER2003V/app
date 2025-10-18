// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";
import api from "@/lib/api";
import HeroCarousel from "../components/HeroCarousel";
import InteractiveTrailMap from "../components/InteractiveTrailMap";

const Star = () => <span className="testimonial-rating-star">⭐</span>;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trail, setTrail] = useState([]);
  const [mapError, setMapError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Publicaciones destacadas
    api
      .get("posts/", { params: { limit: 4 } })
      .then(({ data }) => setPosts(data?.results || data || []))
      .catch(() => {});

    // Últimas opiniones
    api
      .get("reviews/")
      .then(({ data }) => setReviews((data?.results || data || []).slice(0, 5)))
      .catch((err) => console.error("Error al cargar opiniones:", err));

    // Datos del mapa (ruta.json en /public)
    fetch("/ruta.json")
      .then((r) => (r.ok ? r.json() : Promise.reject("No se pudo cargar la ruta.")))
      .then((geo) => {
        const coords = geo?.features?.[0]?.geometry?.coordinates || [];
        setTrail(coords.map(([lng, lat]) => [lat, lng]));
      })
      .catch((e) => {
        console.error("Error al cargar ruta.json:", e);
        setMapError(String(e));
      });
  }, []);

  const openPost = (p) => {
    if (p.cta_url) {
      window.open(p.cta_url, "_blank", "noopener,noreferrer");
    } else if (p.id) {
      navigate(`/posts/${p.id}`);
    }
  };

  return (
    <div className="home">
      {/* El carrusel ahora está dentro de un contenedor para limitar su ancho */}
      <section className="home-section">
        <div className="home-container">
          <HeroCarousel />
        </div>
      </section>

      {posts.length > 0 && (
        <section className="home-section">
          <div className="home-container">
            <header className="section-header">
              <h2>Últimas Novedades</h2>
              <p>Guías, noticias y consejos para tu próxima aventura.</p>
            </header>

            <div className="featured-posts-grid">
              {posts.map((p) => (
                <div
                  key={p.id}
                  className="postCard"
                  onClick={() => openPost(p)}
                  title={p.title}
                >
                  <div className="postCard__media">
                    {p.cover ? (
                      <img src={p.cover} alt={p.title} />
                    ) : (
                      <div className="postCard__ph">Sin imagen</div>
                    )}
                  </div>
                  <div className="postCard__body">
                    <h3 className="postCard__title">{p.title}</h3>
                    {p.place?.name && (
                      <span className="postCard__place">📍 {p.place.name}</span>
                    )}
                    <span className="postCard__read-more">Leer más →</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="section-footer">
              <Link to="/posts" className="btn btn--ghost">
                Ver todas las publicaciones →
              </Link>
            </div>
          </div>
        </section>
      )}
      
      <section className="home-section alt-bg">
        <div className="home-container">
          <header className="section-header">
            <h2>Planifica tu Visita</h2>
            <p>Todo lo que necesitas para preparar tu viaje.</p>
          </header>
          <div className="quick__grid">
            <Link className="card" to="/como-llegar">
              <span className="card__icon">🧭</span>
              <h3>¿Cómo llegar?</h3>
              <p>Ruta interactiva y opciones de transporte.</p>
            </Link>
            <Link className="card" to="/informacion">
              <span className="card__icon">ℹ️</span>
              <h3>Información</h3>
              <p>Horarios, tarifas y contacto.</p>
            </Link>
            <a
              className="card"
              href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx"
              target="_blank"
              rel="noreferrer"
            >
              <span className="card__icon">💬</span>
              <h3>WhatsApp</h3>
              <p>Atención turística directa.</p>
            </a>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="home-section alt-bg testimonials">
          <div className="home-container">
            <h2 className="testimonials__title">Lo que dicen nuestros visitantes</h2>
            <div className="testimonials-grid">
              {reviews.map((r) => (
                <div key={r.id} className="testimonial-card">
                  {r.photo && (
                    <img src={r.photo} alt={`Opinión de ${r.author_name}`} className="testimonial-photo" />
                  )}
                  <p className="testimonial-comment">"{r.comment}"</p>
                  <div className="testimonial-footer">
                    <div className="testimonial-author-info">
                      <span className="testimonial-author">{r.author_name}</span>
                      <span className="testimonial-rating">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} />
                        ))}
                      </span>
                    </div>
                    {r.place_name && r.place_slug && (
                      <Link to={`/places/${r.place_slug}`} className="testimonial-place">
                        en {r.place_name}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="mapa" className="home-section">
        <div className="home-container">
          <header className="section-header">
            <h2>Nuestra Ubicación</h2>
            <p>Explora la ruta de ingreso a nuestra comunidad.</p>
          </header>
          <div className="home-map-container">
            {mapError ? (
              <div className="map-error-message">{mapError}</div>
            ) : (
              <InteractiveTrailMap trailData={trail} />
            )}
          </div>
          <div className="map__links">
            <Link to="/como-llegar">Ver instrucciones detalladas para llegar</Link>
          </div>
        </div>
      </section>

      <footer className="dev-footer">
        <p>
          Desarrollado por{" "}
          <a href="https://wa.me/59172672767" target="_blank" rel="noopener noreferrer">
            Oliver Ventura
          </a>{" "}
          | 2025
        </p>
      </footer>
    </div>
  );
}