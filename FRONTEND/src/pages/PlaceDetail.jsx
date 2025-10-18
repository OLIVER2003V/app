import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api";
import MapView from "../components/MapView";
import "./PlaceDetail.css";

/* ---------- Calificación por estrellas (accesible + táctil) ---------- */
const StarRating = ({ rating, setRating }) => (
  <div className="star-rating" role="radiogroup" aria-label="Calificación">
    {[...Array(5)].map((_, index) => {
      const value = index + 1;
      const checked = value <= rating;
      return (
        <button
          type="button"
          key={value}
          className={checked ? "on" : "off"}
          onClick={() => setRating(value)}
          role="radio"
          aria-checked={checked}
          aria-label={`${value} estrella${value > 1 ? "s" : ""}`}
        >
          <span className="star">&#9733;</span>
        </button>
      );
    })}
  </div>
);

export default function PlaceDetail() {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialReviewState = { rating: 5, comment: "", author_name: "" };
  const [review, setReview] = useState(initialReviewState);
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlace = () => {
    setLoading(true);
    api
      .get(`/places/${slug}/`)
      .then(({ data }) => setPlace(data))
      .catch(() => setError("No se pudo encontrar el lugar solicitado."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPlace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleSendReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim() || !review.author_name.trim()) {
      alert("Por favor, completa tu nombre y comentario.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("place", place.id);
    formData.append("rating", review.rating);
    formData.append("comment", review.comment);
    formData.append("author_name", review.author_name);
    if (photoFile) formData.append("photo", photoFile);

    try {
      await api.post("/reviews/", formData);
      setReview(initialReviewState);
      setPhotoFile(null);
      const fileInput = document.getElementById("photo");
      if (fileInput) fileInput.value = "";
      alert("¡Gracias por tu opinión! Tu comentario está pendiente de aprobación.");
    } catch (err) {
      let errorMessage = "Hubo un error al enviar tu opinión. Inténtalo de nuevo.";
      if (err.response && err.response.data && typeof err.response.data === "object") {
        const errors = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n");
        errorMessage = `Por favor corrige los siguientes errores:\n${errors}`;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="place-detail-status">Cargando…</div>;
  if (error) return <div className="place-detail-status error">{error}</div>;
  if (!place) return null;

  const points =
    place.lat && place.lng
      ? [
          {
            id: place.id,
            name: place.name,
            lat: Number(place.lat),
            lng: Number(place.lng),
            category: place.category,
          },
        ]
      : [];

  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  return (
    <div className="place-detail-page">
      <header
        className="place-detail-hero"
        style={place.cover_image ? { backgroundImage: `url(${place.cover_image})` } : undefined}
      >
        <div className="place-detail-hero-overlay">
          <div className="place-detail-wrapper">
            {place.category && (
              <span className={`place-detail-category category--${place.category}`}>
                {place.category}
              </span>
            )}
            <h1>{place.name}</h1>
          </div>
        </div>
      </header>

      <div className="place-detail-wrapper content-grid">
        <main className="main-content">
          <section className="description-section">
            <h2>Descripción</h2>
            <p>{place.description || "No hay descripción disponible para este lugar."}</p>
          </section>

          <section className="reviews-section">
            <h2>Opiniones ({place.reviews?.length || 0})</h2>
            <div className="reviews-list">
              {place.reviews && place.reviews.length > 0 ? (
                place.reviews.map((r) => (
                  <article key={r.id} className="review-card">
                    <header className="review-card-header">
                      <span className="review-author">{r.author_name}</span>
                      <span className="review-rating">{"⭐".repeat(r.rating)}</span>
                    </header>
                    <p className="review-comment">"{r.comment}"</p>
                    {r.photo && (
                      <img
                        src={r.photo}
                        alt={`Opinión de ${r.author_name}`}
                        className="review-photo"
                        loading="lazy"
                      />
                    )}
                    <time className="review-date">{formatDate(r.created_at)}</time>
                  </article>
                ))
              ) : (
                <p>Todavía no hay opiniones para este lugar. ¡Sé el primero!</p>
              )}
            </div>
          </section>

          <section className="add-review-section">
            <h2>Deja tu opinión</h2>
            <form onSubmit={handleSendReview} className="review-form">
              <div className="form-group rating-group">
                <label>Tu calificación:</label>
                <StarRating
                  rating={review.rating}
                  setRating={(r) => setReview((prev) => ({ ...prev, rating: r }))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="author_name">Tu nombre</label>
                <input
                  id="author_name"
                  type="text"
                  value={review.author_name}
                  onChange={(e) => setReview((r) => ({ ...r, author_name: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  required
                  inputMode="text"
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Comentario</label>
                <textarea
                  id="comment"
                  value={review.comment}
                  onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                  placeholder="¿Qué te pareció este lugar?"
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="photo">Añadir una foto (opcional)</label>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>

              <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar Opinión"}
              </button>
            </form>
          </section>
        </main>

        <aside className="sidebar">
          <div className="sidebar-widget">
            <h3>Ubicación</h3>
            <div className="map-container-detail">
              {points.length > 0 ? (
                <MapView points={points} center={[points[0].lat, points[0].lng]} zoom={15} />
              ) : (
                <p>No hay datos de ubicación disponibles.</p>
              )}
            </div>
            {place.address && <p className="address-info">{place.address}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
