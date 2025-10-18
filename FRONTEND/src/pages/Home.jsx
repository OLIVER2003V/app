import React, { useEffect, useState, useMemo, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import "./Home.css";

// Componentes importados
import { HeroCarousel } from "@/components/HeroCarousel"; // export nombrado
import { InteractiveTrailMap } from "@/components/InteractiveTrailMap";


// Componente pequeño para las estrellas de calificación
const Star = () => <span className="testimonial-rating-star">⭐</span>;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trail, setTrail] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [mapError, setMapError] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        // Ejecutamos en paralelo
        await Promise.all([
          // 1) Últimas novedades
          api.get("posts/", { params: { limit: 4 } }).then(({ data }) => {
            const arr = Array.isArray(data) ? data : (data?.results || []);
            setPosts(arr);
          }),

          // 2) Opiniones
          api.get("reviews/").then(({ data }) => {
            const arr = Array.isArray(data) ? data : (data?.results || []);
            setReviews(arr.slice(0, 5));
          }),

          // 3) Ítems del carrusel (galería)
          api.get("gallery/").then(({ data }) => {
            const arr = Array.isArray(data) ? data : (data?.results || []);
            setGalleryItems(arr);
          }),

          // 4) Datos del mapa (archivo estático en /public)
          fetch("/ruta.json")
            .then((res) => {
              if (!res.ok) throw new Error("No se pudo cargar la ruta del mapa.");
              return res.json();
            })
            .then((geo) => {
              const coords = geo?.features?.[0]?.geometry?.coordinates || [];
              // Convertimos [lng, lat] -> [lat, lng] si hace falta
              const normalized = coords.map(([lng, lat]) => [lat, lng]);
              setTrail(normalized);
            })
            .catch((e) => {
              // No tumbar toda la página si el mapa falla
              setMapError(e.message || "Error cargando el mapa.");
            }),
        ]);
      } catch (e) {
        console.error("Error al cargar la página de inicio:", e);
        setError("Ocurrió un problema al cargar el contenido. Intenta nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openPost = (post) => {
    const url = post?.cta_url;
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    if (post?.id) navigate(`/posts/${post.id}`);
  };

  const hasCarousel = useMemo(() => Array.isArray(galleryItems) && galleryItems.length > 0, [galleryItems]);

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        Cargando…
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Mensaje de error general (no bloquea del todo la UI) */}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* Sección del Carrusel Principal */}
      {hasCarousel && (
        <section className="home-section hero-section">
          <HeroCarousel items={galleryItems} />
        </section>
      )}

      {/* Sección de Últimas Novedades */}
      {posts.length > 0 && (
        <section className="home-section">
          <div className="home-container">
            <header className="section-header">
              <h2>Últimas Novedades</h2>
              <p>Guías, noticias y consejos para tu próxima aventura.</p>
            </header>

            <div className="featured-posts-grid">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="post-card"
                  onClick={() => openPost(post)}
                  title={post.title}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPost(post)}
                >
                  <div className="post-card__media">
                    {post.cover ? (
                      <img src={post.cover} alt={post.title} loading="lazy" />
                    ) : (
                      <div className="post-card__placeholder" aria-label="Sin imagen">
                        Sin imagen
                      </div>
                    )}
                  </div>
                  <div className="post-card__body">
                    <h3 className="post-card__title">{post.title}</h3>
                    {post.place?.name && (
                      <span className="post-card__place">📍 {post.place.name}</span>
                    )}
                    <span className="post-card__read-more">Leer más →</span>
                  </div>
                </article>
              ))}
            </div>

            <footer className="section-footer">
              <Link to="/posts" className="btn btn--ghost">
                Ver todas las publicaciones →
              </Link>
            </footer>
          </div>
        </section>
      )}

      {/* Sección de Planificación */}
      <section className="home-section alt-bg">
        <div className="home-container">
          <header className="section-header">
            <h2>Planifica tu Visita</h2>
            <p>Todo lo que necesitas para preparar tu viaje.</p>
          </header>
          <div className="planning-grid">
            <Link className="planning-card" to="/como-llegar">
              <span className="planning-card__icon">🧭</span>
              <h3>¿Cómo llegar?</h3>
              <p>Ruta interactiva y opciones de transporte.</p>
            </Link>
            <Link className="planning-card" to="/informacion">
              <span className="planning-card__icon">ℹ️</span>
              <h3>Información</h3>
              <p>Horarios, tarifas y contacto.</p>
            </Link>
            <a
              className="planning-card"
              href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx"
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className="planning-card__icon">💬</span>
              <h3>WhatsApp</h3>
              <p>Atención turística directa.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Sección de Opiniones */}
      {reviews.length > 0 && (
        <section className="home-section">
          <div className="home-container">
            <header className="section-header">
              <h2>Lo que dicen nuestros visitantes</h2>
            </header>
            <div className="testimonials-grid">
              {reviews.map((review) => (
                <div key={review.id} className="testimonial-card">
                  {review.photo && (
                    <img
                      src={review.photo}
                      alt={`Opinión de ${review.author_name}`}
                      className="testimonial-photo"
                      loading="lazy"
                    />
                  )}
                  <p className="testimonial-comment">"{review.comment}"</p>
                  <div className="testimonial-footer">
                    <div className="testimonial-author-info">
                      <span className="testimonial-author">{review.author_name}</span>
                      <span className="testimonial-rating">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} />
                        ))}
                      </span>
                    </div>
                    {review.place_name && review.place_slug && (
                      <Link to={`/places/${review.place_slug}`} className="testimonial-place">
                        en {review.place_name}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sección del Mapa */}
      <section id="mapa" className="home-section alt-bg">
        <div className="home-container">
          <header className="section-header">
            <h2>Nuestra Ubicación</h2>
            <p>Explora la ruta de ingreso a nuestra comunidad.</p>
          </header>
          <div className="home-map-container">
            {mapError ? (
              <div className="map-error-message">{mapError}</div>
            ) : (
              <Suspense fallback={<div className="map-loading">Cargando mapa…</div>}>
                <InteractiveTrailMap trailData={trail} />
              </Suspense>
            )}
          </div>
          <footer className="section-footer">
            <Link to="/como-llegar" className="btn btn--link">
              Ver instrucciones detalladas para llegar
            </Link>
          </footer>
        </div>
      </section>

      {/* Pie de página de desarrollo */}
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
