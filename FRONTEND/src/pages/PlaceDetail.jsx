import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/api"; // Asumiendo que está en ../lib/api
import MapView from "../components/MapView";
import { getCategoryStyle } from "../utils/styleUtils"; // Asumiendo esta ruta

// --- Componentes UI y de Iconos ---
import StarRating from "../components/ui/StarRating";
import StarIcon from "../components/icons/StarIcon";
import UserIcon from "../components/icons/UserIcon";
import ChatBubbleIcon from "../components/icons/ChatBubbleIcon";
import CheckIcon from "../components/icons/CheckIcon";

// --- Spinner de Carga ---
const LoadingSpinner = () => (
  <svg 
    className="h-12 w-12 animate-spin text-emerald-600" 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle 
      className="opacity-25" 
      cx="12" 
      cy="12" 
      r="10" 
      stroke="currentColor" 
      strokeWidth="4" 
    />
    <path 
      className="opacity-75" 
      fill="currentColor" 
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
    />
  </svg>
);

export default function PlaceDetail() {
  const { slug } = useParams();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialReviewState = { rating: 5, comment: "", author_name: "" };
  const [review, setReview] = useState(initialReviewState);
  
  // [MODIFICADO] 'photoFile' eliminado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const fetchPlace = () => {
    setLoading(true);
    setFormSuccess(false);
    setFormError(null);

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
    setFormError(null);
    
    if (!review.comment.trim() || !review.author_name.trim()) {
      setFormError("Por favor, completa tu nombre y comentario.");
      return;
    }
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("place", place.id);
    formData.append("rating", review.rating);
    formData.append("comment", review.comment);
    formData.append("author_name", review.author_name);
    // [MODIFICADO] Lógica de 'photoFile' eliminada

    try {
      await api.post("/reviews/", formData);
      setReview(initialReviewState);
      // [MODIFICADO] 'setPhotoFile(null)' eliminado
      setFormSuccess(true);
    } catch (err) {
      let errorMessage = "Hubo un error al enviar tu opinión. Inténtalo de nuevo.";
      if (err.response && err.response.data && typeof err.response.data === "object") {
        const errors = Object.entries(err.response.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join("\n");
        errorMessage = `Por favor corrige los siguientes errores:\n${errors}`;
      }
      setFormError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Estados de Carga y Error Premium ---
  if (loading) return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-cyan-50 p-4 text-center">
      <LoadingSpinner />
      <p className="mt-4 text-lg font-semibold text-emerald-700">Cargando detalles...</p>
    </div>
  );
  if (error) return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-red-50 p-4 text-center">
      <h2 className="text-2xl font-bold text-red-700">¡Error!</h2>
      <p className="mt-2 text-lg text-red-600">{error}</p>
    </div>
  );
  if (!place) return null;

  // --- Puntos del Mapa (Lógica sin cambios) ---
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

  // --- Formateo de Fecha (Lógica sin cambios) ---
  const formatDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "";

  return (
    // --- 💎 Fondo con Gradiente Premium ---
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cyan-50 pb-16">
      
      {/* --- 💎 Header de Gradiente (Sin Imagen) --- */}
      <header className="bg-gradient-to-br from-emerald-700 to-cyan-800 shadow-2xl">
        <div className="relative mx-auto max-w-7xl flex-col items-start px-4 py-16 md:py-24 lg:px-8">
          {place.category && (
            <span
              className={`mb-4 w-fit rounded-full px-4 py-1.5 text-sm font-bold uppercase shadow-lg ${getCategoryStyle(place.category)}`}
            >
              {place.category}
            </span>
          )}
          {/* --- 💎 Título con Gradiente --- */}
          <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 shadow-lg md:text-6xl lg:text-7xl">
            {place.name}
          </h1>
        </div>
      </header>

      {/* --- Grid de Contenido --- */}
      <div className="mx-auto max-w-7xl p-4 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* --- Columna Principal --- */}
          <main className="flex flex-col gap-8 lg:col-span-2">
            
            {/* --- 💎 Tarjeta de Descripción (Glassmorphism) --- */}
            <section className="rounded-2xl bg-white/70 p-6 shadow-xl shadow-emerald-900/10 backdrop-blur-md md:p-8">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Descubre el Lugar
              </h2>
              <p className="whitespace-pre-wrap text-lg leading-relaxed text-gray-700">
                {place.description || "No hay descripción disponible para este lugar."}
              </p>
            </section>

            {/* --- 💎 Tarjeta de Opiniones --- */}
            <section className="rounded-2xl bg-white/70 p-6 shadow-xl shadow-emerald-900/10 backdrop-blur-md md:p-8">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Opiniones ({place.reviews?.length || 0})
              </h2>
              <div className="divide-y divide-emerald-200/50">
                {place.reviews && place.reviews.length > 0 ? (
                  place.reviews.map((r) => (
                    <article key={r.id} className="py-6">
                      <header className="mb-3 flex flex-col items-start gap-2">
                        <span className="text-lg font-semibold text-gray-900">{r.author_name}</span>
                        <div className="flex items-center" title={`${r.rating} de 5 estrellas`}>
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className={`h-5 w-5 ${i < r.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </header>
                      {/* --- 💎 Estilo de Cita Premium --- */}
                      <blockquote className="my-2 border-l-4 border-emerald-500 py-1 pl-4">
                        <p className="italic text-gray-800 md:text-lg">"{r.comment}"</p>
                      </blockquote>
                      {/* [MODIFICADO] 'r.photo' <img> eliminado */}
                      <time className="mt-3 block text-xs text-gray-500">{formatDate(r.created_at)}</time>
                    </article>
                  ))
                ) : (
                  <p className="py-4 text-lg text-gray-600">
                    Todavía no hay opiniones para este lugar. ¡Sé el primero!
                  </p>
                )}
              </div>
            </section>

            {/* --- 💎 Tarjeta de Formulario de Opinión --- */}
            <section className="rounded-2xl bg-white/70 p-6 shadow-xl shadow-emerald-900/10 backdrop-blur-md md:p-8">
              <h2 className="mb-6 text-3xl font-bold text-gray-900">Deja tu opinión</h2>
              
              {formSuccess ? (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-500 bg-emerald-50 p-10 text-center">
                  <CheckIcon className="h-16 w-16 text-emerald-600" />
                  <h3 className="mt-4 text-2xl font-semibold text-emerald-800">
                    ¡Gracias por tu opinión!
                  </h3>
                  <p className="mt-1 text-gray-700">Tu comentario será visible pronto.</p>
                  <button
                    onClick={() => setFormSuccess(false)}
                    className="mt-6 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700"
                  >
                    Escribir otra opinión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendReview} className="flex flex-col gap-5">
                  <div className="flex flex-col items-center">
                    <label className="text-sm font-medium text-gray-700">Tu calificación</label>
                    <StarRating
                      rating={review.rating}
                      setRating={(r) => setReview((prev) => ({ ...prev, rating: r }))}
                      className="justify-center"
                      starClassName="h-10 w-10" // Estrellas más grandes en el formulario
                    />
                  </div>

                  {/* Campo de Nombre */}
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="author_name"
                      type="text"
                      value={review.author_name}
                      onChange={(e) => setReview((r) => ({ ...r, author_name: e.target.value }))}
                      placeholder="Tu nombre"
                      required
                      className="w-full rounded-lg border-gray-300 !bg-white py-3 pl-12 pr-4 shadow-sm placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500" // 👈 AÑADIDO 'placeholder:text-gray-500'
                    />
                  </div>

                  {/* Campo de Comentario */}
                  <div className="relative">
                    <ChatBubbleIcon className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />
                    <textarea
                      id="comment"
                      value={review.comment}
                      onChange={(e) => setReview((r) => ({ ...r, comment: e.target.value }))}
                      placeholder="¿Qué te pareció este lugar?"
                      rows={4}
                      required
                      className="w-full rounded-lg border-gray-300 !bg-white py-3 pl-12 pr-4 shadow-sm placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500" // 👈 AÑADIDO 'placeholder:text-gray-500'
                    />
                  </div>
                  
                  {/* [MODIFICADO] Campo de foto eliminado */}
                  
                  {formError && (
                    <div className="rounded-lg bg-red-50 p-4 text-center text-sm font-medium text-red-700">
                      {formError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl hover:from-emerald-600 hover:to-cyan-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:hover:-translate-y-0" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Opinión"}
                  </button>
                </form>
              )}
            </section>
          </main>

          {/* --- 💎 Columna Lateral (Sidebar) --- */}
          <aside className="sticky top-6 flex flex-col gap-6 lg:top-8">
            <div className="overflow-hidden rounded-2xl bg-white/70 shadow-xl shadow-emerald-900/10 backdrop-blur-md">
              <div className="border-b border-gray-200 p-5">
                <h3 className="text-xl font-bold text-gray-900">Ubicación</h3>
              </div>
              <div className="h-72 lg:h-80">
                {points.length > 0 ? (
                  <MapView 
                    points={points} 
                    // [MODIFICADO] Pasamos el 'selectedPoint' en lugar de 'center'
                    // para que nuestro MapView.jsx vuele al punto
                    selectedPoint={{ lat: points[0].lat, lng: points[0].lng }} 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-gray-600">
                    No hay datos de ubicación disponibles.
                  </div>
                )}
              </div>
              {place.address && (
                <p className="border-t border-gray-200 p-5 text-sm text-gray-700">
                  {place.address}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}