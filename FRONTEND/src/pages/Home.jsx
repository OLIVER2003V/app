import React, { useEffect, useState, useMemo, useLayoutEffect, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import "./Home.css";

import { HeroCarousel } from "@/components/HeroCarousel";
const InteractiveTrailMap = lazy(() => import("@/components/InteractiveTrailMap"));

const Star = () => <span className="testimonial-rating-star">⭐</span>;

const LoadingSpinner = () => (
  <div className="loading-container" role="status" aria-label="Cargando contenido">
    <div className="spinner"></div>
  </div>
);

/* ---------------- TOUR: pasos ---------------- */
const tourSteps = [
  { selector: '#novedades', title: 'Novedades y Guías', content: 'Aquí encontrarás las últimas noticias, consejos y guías para inspirar tu próxima aventura en nuestra comunidad.' },
  { selector: '#planifica', title: 'Planifica tu Visita', content: 'Todo lo práctico está aquí: cómo llegar, horarios, tarifas y un acceso directo a WhatsApp para tus consultas.' },
  { selector: '#opiniones', title: 'La Voz de los Visitantes', content: 'Lee las experiencias de otros viajeros como tú para conocer sus lugares favoritos y recomendaciones.' },
  { selector: '#mapa', title: 'Explora el Mapa', content: 'Usa nuestro mapa interactivo para visualizar la ruta principal y ubicar los puntos de interés más importantes.' }
];

/* ---------------- TOUR: scroll robusto ---------------- */
const smoothScrollTo = (element, onScrollEnd) => {
  if (!element) { onScrollEnd(); return; }

  const rect = element.getBoundingClientRect();
  const target = rect.top + window.scrollY - (window.innerHeight / 2) + (rect.height / 2);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const dest = Math.max(0, Math.min(target, max));

  // Habilitar temporalmente el scroll aunque body esté con clase tour-active
  const prevOverflowY = document.body.style.overflowY;
  document.body.style.overflowY = "auto";

  window.scrollTo({ top: dest, behavior: "smooth" });

  let start = performance.now();
  const tick = () => {
    const curr = window.scrollY;
    const elapsed = performance.now() - start;
    if (Math.abs(curr - dest) < 2 || elapsed > 2000) {
      // Restaurar estado y notificar fin
      document.body.style.overflowY = prevOverflowY || "";
      onScrollEnd();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

/* ---------------- TOUR: componente ---------------- */
const GuidedTour = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [styles, setStyles] = useState({ highlight: {}, tooltip: {} });
  const [isExiting, setIsExiting] = useState(false);

  const currentStep = tourSteps[stepIndex];

  useEffect(() => {
    document.body.classList.add('tour-active');
    return () => { document.body.classList.remove('tour-active'); };
  }, []);

  useLayoutEffect(() => {
    const element = document.querySelector(currentStep?.selector);
    if (!element) {
      // Si el objetivo no existe, pasa al siguiente
      setTimeout(() => setStepIndex(i => Math.min(i + 1, tourSteps.length)), 0);
      return;
    }

    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      const tooltipHeight = 210;
      const margin = 20;

      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove = (spaceBelow < (tooltipHeight + margin)) && (rect.top > (tooltipHeight + margin));

      let top = placeAbove ? (rect.top - tooltipHeight - margin) : (rect.top + rect.height + margin);
      if ((top + tooltipHeight) > window.innerHeight) top = window.innerHeight - tooltipHeight - margin;
      if (top < margin) top = margin;

      setStyles({
        highlight: {
          width: `${rect.width + 20}px`,
          height: `${rect.height + 20}px`,
          top: `${rect.top - 10}px`,
          left: `${rect.left - 10}px`,
          opacity: 1,
        },
        tooltip: {
          top: `${top}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%) scale(1)',
          opacity: 1,
        }
      });
    };

    // Desplaza y luego posiciona
    smoothScrollTo(element, updatePosition);

    // Reposiciona al cambiar tamaño o al hacer scroll manual (por si el usuario mueve con rueda/trackpad)
    const onResize = () => updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
    };
  }, [stepIndex, currentStep]);

  const handleComplete = () => {
    setIsExiting(true);
    setTimeout(onComplete, 300);
  };

  const goToStep = (index) => {
    // salida suave del tooltip actual
    setStyles(prev => ({
      highlight: { ...prev.highlight, opacity: 0 },
      tooltip: { ...prev.tooltip, transform: 'translateX(-50%) scale(0.95)', opacity: 0 }
    }));
    setTimeout(() => {
      if (index >= tourSteps.length) {
        handleComplete();
      } else {
        setStepIndex(index);
      }
    }, 300);
  };

  if (!currentStep) return null;

  return (
    <div className={`tour-overlay ${isExiting ? 'exiting' : ''}`} onClick={handleComplete}>
      <div className="tour-highlight" style={styles.highlight} onClick={(e) => e.stopPropagation()} />
      <div className="tour-tooltip" style={styles.tooltip} onClick={(e) => e.stopPropagation()}>
        <h4>{currentStep.title}</h4>
        <p>{currentStep.content}</p>
        <div className="tour-footer">
          <span className="tour-step-indicator">{stepIndex + 1} / {tourSteps.length}</span>
          <button onClick={handleComplete} className="tour-btn-skip">Saltar</button>
          <button onClick={() => goToStep(stepIndex + 1)} className="tour-btn-next">
            {stepIndex === tourSteps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Utilidades (igual que tenías) ---------------- */
function normalizeGalleryItem(raw, idx) {
  const id = raw?.id ?? raw?.pk ?? idx;
  const title = raw?.title ?? raw?.name ?? raw?.titulo ?? "Slide";
  const candidates = [raw?.media_file_url, raw?.media_url, raw?.file_url, raw?.url, raw?.image_url, raw?.image, raw?.src, raw?.cover, raw?.video_url];
  const src = candidates.find(Boolean) ?? "";
  const mt = raw?.media_type ?? (src?.match(/\.(mp4|webm|ogg)(\?|$)/i) ? "VIDEO" : "IMAGE");
  const media_type = String(mt).toUpperCase();
  return { id, title, media_type, src };
}
function unwrapResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}
async function fetchFirstGalleryFound() {
  const CANDIDATES = ["gallery/", "banners/", "home-slides/", "media/", "carousel/"];
  for (const endpoint of CANDIDATES) {
    try {
      const { data } = await api.get(endpoint);
      const arr = unwrapResults(data);
      if (arr.length) {
        const normalized = arr.map(normalizeGalleryItem).filter((x) => !!x.src);
        if (normalized.length) return { items: normalized, usedEndpoint: endpoint };
      }
    } catch (_) { continue; }
  }
  return { items: [], usedEndpoint: null };
}

/* ---------------- Home ---------------- */
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trail, setTrail] = useState([]);
  const [gallery, setGallery] = useState({ items: [], endpoint: null });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTourActive, setIsTourActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get("posts/", { params: { limit: 4 } }),
          api.get("reviews/"),
          fetchFirstGalleryFound(),
          fetch("/ruta.json"),
        ]);
        if (results[0].status === "fulfilled") setPosts(unwrapResults(results[0].value.data));
        if (results[1].status === "fulfilled") setReviews(unwrapResults(results[1].value.data).slice(0, 5));
        if (results[2].status === "fulfilled") setGallery({ items: results[2].value.items, endpoint: results[2].value.usedEndpoint });
        if (results[3].status === "fulfilled") {
          const res = results[3].value;
          if (!res.ok) throw new Error("GeoJSON no encontrado.");
          const geo = await res.json();
          const coords = geo?.features?.[0]?.geometry?.coordinates || [];
          setTrail(coords.map(([lng, lat]) => [lat, lng]));
        }
        results.forEach(r => { if (r.status === 'rejected') console.error("Error en petición:", r.reason); });
      } catch (e) {
        console.error("Error al cargar la página:", e);
        setError("Ocurrió un problema al cargar el contenido. Intenta nuevamente.");
      } finally {
        setLoading(false);
        const hasSeenTour = localStorage.getItem('tourCompletado');
        if (!hasSeenTour) setTimeout(() => setIsTourActive(true), 500);
      }
    };
    loadInitialData();
  }, []);

  const handleTourComplete = () => {
    setIsTourActive(false);
    localStorage.setItem('tourCompletado', 'true');
  };

  const openPost = (post) => {
    if (post?.cta_url) {
      window.open(post.cta_url, "_blank", "noopener,noreferrer");
    } else if (post?.id) {
      navigate(`/posts/${post.id}`);
    }
  };

  const hasCarousel = useMemo(() => Array.isArray(gallery.items) && gallery.items.length > 0, [gallery.items]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="home-page">
      {isTourActive && <GuidedTour onComplete={handleTourComplete} />}

      {error && (
        <div className="alert alert-error" role="alert">
          <span className="alert-icon">⚠️</span> {error}
        </div>
      )}

      {hasCarousel && (
        <section className="home-section hero-section hero-16x9">
          <div className="hero-frame">
            <div className="hero-inner">
              <HeroCarousel items={gallery.items} />
            </div>
          </div>
        </section>
      )}

      <section id="novedades" className="home-section">
        <div className="home-container">
          <header className="section-header">
            <h2>Últimas Novedades</h2>
            <p>Guías, noticias y consejos para tu próxima aventura.</p>
          </header>

          {posts.length > 0 ? (
            <div className="featured-posts-grid">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="post-card"
                  onClick={() => openPost(post)}
                  title={`Leer más sobre ${post.title}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && openPost(post)}
                >
                  <div className="post-card__media">
                    {post.cover ? (<img src={post.cover} alt="" loading="lazy" />) : (
                      <div className="post-card__placeholder" aria-label="Sin imagen disponible">🏞️</div>
                    )}
                  </div>
                  <div className="post-card__body">
                    <h3 className="post-card__title">{post.title}</h3>
                    {post.place?.name && <span className="post-card__place">📍 {post.place.name}</span>}
                    <span className="post-card__read-more">Leer más →</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No hay novedades por el momento. ¡Vuelve pronto!</p>
            </div>
          )}

          <footer className="section-footer">
            <Link to="/posts" className="btn btn--ghost">Ver todas las publicaciones →</Link>
          </footer>
        </div>
      </section>

      <section id="planifica" className="home-section alt-bg">
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
              <h3>Información Útil</h3>
              <p>Horarios, tarifas y contacto.</p>
            </Link>
            <a className="planning-card" href="https://wa.me/59172672767" target="_blank" rel="noreferrer noopener">
              <span className="planning-card__icon">💬</span>
              <h3>WhatsApp</h3>
              <p>Atención turística directa.</p>
            </a>
          </div>
        </div>
      </section>

      {reviews.length > 0 && (
        <section id="opiniones" className="home-section">
          <div className="home-container">
            <header className="section-header">
              <h2>Lo que dicen nuestros visitantes</h2>
            </header>
            <div className="testimonials-grid">
              {reviews.map((review) => (
                <blockquote key={review.id} className="testimonial-card">
                  {review.photo && (
                    <img src={review.photo} alt={`Foto de ${review.author_name}`} className="testimonial-photo" loading="lazy" />
                  )}
                  <p className="testimonial-comment">"{review.comment}"</p>
                  <footer className="testimonial-footer">
                    <cite className="testimonial-author-info">
                      <span className="testimonial-author">{review.author_name}</span>
                      <span className="testimonial-rating">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} />)}
                      </span>
                    </cite>
                    {review.place_name && review.place_slug && (
                      <Link to={`/places/${review.place_slug}`} className="testimonial-place">en {review.place_name}</Link>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="mapa" className="home-section alt-bg">
        <div className="home-container">
          <header className="section-header">
            <h2>Nuestra Ubicación</h2>
            <p>Explora la ruta de ingreso a nuestra comunidad.</p>
          </header>
        </div>
        <div className="home-container">
          <div className="home-map-container">
            <Suspense fallback={<div className="map-loading">Cargando mapa interactivo…</div>}>
              {trail.length > 0 ? (
                <InteractiveTrailMap trailData={trail} />
              ) : (
                <div className="map-error-message">No se pudo cargar la ruta del mapa.</div>
              )}
            </Suspense>
          </div>
          <footer className="section-footer">
            <Link to="/como-llegar" className="btn btn--link">Ver instrucciones detalladas para llegar</Link>
          </footer>
        </div>
      </section>

      <footer className="dev-footer">
        <p>
          Desarrollado por{" "}
          <a href="https://wa.me/59172672767" target="_blank" rel="noopener noreferrer">Oliver Ventura</a> | 2025
        </p>
      </footer>
    </div>
  );
}
