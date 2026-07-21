import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import Seo from '@/components/Seo';
import PageLoader from '@/components/PageLoader';
import MapView from '@/components/MapView';
import { getCategoryStyle } from '@/utils/styleUtils';
import { useFavorites } from '@/hooks/useFavorites';
import HeartIcon from '@/components/icons/HeartIcon';
import {
  Star, Loader2, Send, Paperclip, X, AlertCircle, CheckCircle,
  ArrowLeft, Share2, ExternalLink, Droplets, Mountain, Route,
  Utensils, Bed, HelpCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  cascada: Droplets,
  mirador: Mountain,
  ruta: Route,
  gastronomia: Utensils,
  hospedaje: Bed,
  otro: HelpCircle,
};

const VIDEO_EXTENSIONS = ['mp4', 'mov', 'avi', 'webm'];
const isVideoUrl = (url = '') => VIDEO_EXTENSIONS.some((ext) => url.toLowerCase().split('?')[0].endsWith(`.${ext}`));

// --- Galería de fotos del lugar ---
const PlaceGallery = ({ place }) => {
  const { t } = useTranslation();
  const media = place.media || [];
  const [active, setActive] = useState(0);
  const categoryKey = (place.category || 'otro').toLowerCase();
  const CategoryIcon = CATEGORY_ICONS[categoryKey] || HelpCircle;

  if (media.length === 0) {
    return (
      <div className={`flex aspect-video w-full items-center justify-center rounded-2xl ${getCategoryStyle(place.category)}`}>
        <CategoryIcon className="h-16 w-16 opacity-40" strokeWidth={1.5} />
      </div>
    );
  }

  const current = media[Math.min(active, media.length - 1)];

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-950">
        <img
          src={current.image}
          alt={current.caption || t('placeDetail.photo_alt', { name: place.name })}
          className="h-full w-full object-cover"
        />
      </div>
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(i)}
              className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? 'border-cyan-400' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Lista de opiniones existentes ---
const ReviewsList = ({ reviews, loading }) => {
  const { t, i18n } = useTranslation();

  const formatDate = (iso) => iso
    ? new Date(iso).toLocaleDateString(i18n.language?.startsWith('en') ? 'en-US' : 'es-BO', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return <p className="text-slate-400">{t('placeDetail.no_reviews')}</p>;
  }

  return (
    <div className="divide-y divide-cyan-500/10">
      {reviews.map((r) => (
        <article key={r.id} className="py-6 first:pt-0">
          <header className="mb-2 flex items-center justify-between gap-2">
            <span className="font-semibold text-white">{r.author_name}</span>
            <div className="flex" title={`${r.rating} / 5`}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
                />
              ))}
            </div>
          </header>
          {r.comment && <p className="text-cyan-100/90">{r.comment}</p>}
          {r.attachment && (
            <div className="mt-3 max-w-xs overflow-hidden rounded-xl border border-cyan-500/20">
              {isVideoUrl(r.attachment) ? (
                <video src={r.attachment} controls className="w-full" />
              ) : (
                <img src={r.attachment} alt="" className="w-full object-cover" />
              )}
            </div>
          )}
          <time className="mt-2 block text-xs text-slate-500">{formatDate(r.created_at)}</time>
        </article>
      ))}
    </div>
  );
};

// --- Formulario de Opinión ---
const ReviewForm = ({ placeId, onReviewSubmitted }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState('');
  const [comment, setComment] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError(t('placeDetail.file_too_large', { size: 50 }));
        setAttachment(null);
        e.target.value = null;
        return;
      }
      setError('');
      setAttachment(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) {
      setError(t('placeDetail.validation_required'));
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('place', placeId);
    formData.append('rating', rating);
    formData.append('author_name', authorName);
    formData.append('comment', comment);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      const response = await api.post('/reviews/', formData);
      setSuccess(t('placeDetail.thanks_sub'));
      setRating(5);
      setAuthorName('');
      setComment('');
      setAttachment(null);
      document.querySelector('input[type="file"]').value = null;
      if (onReviewSubmitted) onReviewSubmitted(response.data);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.detail || t('placeDetail.submit_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cyan-900/30 border border-cyan-500/20 rounded-2xl p-6">
      <h3 className="text-2xl font-bold text-white mb-4">{t('placeDetail.leave_review')}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-3 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 p-3 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle className="h-5 w-5" /> {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-cyan-200 mb-2">{t('placeDetail.your_rating')}</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-8 w-8 cursor-pointer transition-colors ${
                  rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder={t('placeDetail.name_placeholder')}
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />

        <textarea
          placeholder={t('placeDetail.comment_placeholder')}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />

        <div className="space-y-2">
          <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-cyan-600 cursor-pointer transition-colors">
            <Paperclip className="h-5 w-5" />
            <span className="text-sm font-medium">{t('placeDetail.upload_prompt')}</span>
            <input type="file" onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
          </label>
          {attachment && (
            <div className="flex items-center justify-between p-2 pl-4 bg-slate-800 rounded-lg text-sm">
              <span className="text-slate-300 truncate">{attachment.name}</span>
              <button
                type="button"
                onClick={() => { setAttachment(null); document.querySelector('input[type="file"]').value = null; }}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {loading ? t('placeDetail.submitting') : t('placeDetail.submit')}
        </button>
      </form>
    </div>
  );
};

export default function PlaceDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/places/${slug}/`)
      .then(({ data }) => setPlace(data))
      .catch((err) => {
        console.error('Error fetching place details:', err);
        setError(t('placeDetail.not_found'));
      })
      .finally(() => setLoading(false));
  }, [slug, t]);

  useEffect(() => {
    if (!place?.id) return;
    setReviewsLoading(true);
    api.get('/reviews/', { params: { place: place.id } })
      .then(({ data }) => setReviews(Array.isArray(data) ? data : (data.results || [])))
      .catch((err) => console.error('Error fetching reviews:', err))
      .finally(() => setReviewsLoading(false));
  }, [place?.id]);

  const handleNewReview = (newReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  const handleShare = async () => {
    const shareData = { title: place?.name, text: place?.name, url: window.location.href };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelado */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard no disponible */ }
  };

  if (loading) return <PageLoader />;

  if (error || !place) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-950 via-teal-950 to-emerald-950 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">{t('common.error_title')}</h2>
          <p className="text-slate-400 mb-4">{error || t('placeDetail.not_found')}</p>
          <Link to="/places" className="inline-block px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors">
            {t('placeDetail.back_to_places')}
          </Link>
        </div>
      </div>
    );
  }

  const favorite = isFavorite(place.id);
  const points = place.lat && place.lng
    ? [{ id: place.id, name: place.name, lat: Number(place.lat), lng: Number(place.lng), category: place.category }]
    : [];
  const googleMapsUrl = points.length > 0
    ? `https://www.google.com/maps/search/?api=1&query=${points[0].lat},${points[0].lng}`
    : null;

  return (
    <div className="bg-gradient-to-b from-cyan-950 via-teal-950 to-emerald-950 min-h-screen text-white py-12">
      <Seo
        title={place.name}
        description={place.description?.slice(0, 160) || undefined}
        path={`/places/${place.slug}`}
        image={place.media?.[0]?.image || undefined}
      />

      <main className="max-w-6xl mx-auto px-4">
        <Link
          to="/places"
          className="mb-6 inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-full bg-slate-900/40 border border-slate-800 hover:border-slate-600 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" /> {t('placeDetail.back_to_places')}
        </Link>

        <PlaceGallery place={place} />

        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            {place.category && (
              <span className={`mb-3 inline-block rounded-full px-3 py-1.5 text-xs font-bold uppercase shadow-sm ${getCategoryStyle(place.category)}`}>
                {t(`places.category_${(place.category || 'otro').toLowerCase()}`, place.category)}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold">{place.name}</h1>
            {(place.reviews_count > 0) && (
              <div className="mt-2 flex items-center gap-2 text-cyan-200/80">
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="font-semibold text-white">{Number(place.avg_rating || 0).toFixed(1)}</span>
                <span>· {t('placeDetail.reviews_count', { count: place.reviews_count })}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(place.id)}
              aria-pressed={favorite}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                favorite ? 'bg-red-500 text-white' : 'bg-slate-900/40 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
            >
              <HeartIcon className="h-4 w-4" filled={favorite} />
              {favorite ? t('placeDetail.saved') : t('placeDetail.save')}
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold bg-slate-900/40 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              {copied ? t('placeDetail.link_copied') : t('placeDetail.share')}
            </button>
          </div>
        </div>

        <p className="mt-6 text-lg text-cyan-200/80 whitespace-pre-wrap">
          {place.description || t('placeDetail.no_description')}
        </p>

        {place.key_features?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-cyan-300 mb-2">{t('placeDetail.key_features_title')}</h2>
            <div className="flex flex-wrap gap-2">
              {place.key_features.map((feature, i) => (
                <span key={i} className="rounded-full bg-cyan-900/40 border border-cyan-500/20 px-3 py-1.5 text-sm text-cyan-100">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* --- Ubicación y dirección: info práctica, antes de las opiniones --- */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 overflow-hidden rounded-2xl bg-cyan-900/30 border border-cyan-500/20">
            <div className="border-b border-cyan-500/20 p-5">
              <h3 className="text-lg font-bold text-white">{t('placeDetail.location_title')}</h3>
            </div>
            <div className="h-72">
              {points.length > 0 ? (
                <MapView points={points} selectedPoint={points[0]} detailMode />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-slate-400">
                  {t('placeDetail.no_location')}
                </div>
              )}
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 border-t border-cyan-500/20 p-3 text-sm font-semibold text-cyan-300 hover:text-white hover:bg-cyan-900/40 transition-colors"
              >
                {t('placeDetail.open_in_maps')} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <div className="rounded-2xl bg-cyan-900/30 border border-cyan-500/20 p-5">
            <h3 className="text-lg font-bold text-white mb-2">{t('placeDetail.address_title')}</h3>
            <p className="text-sm text-cyan-100/80">
              {place.address || t('placeDetail.no_address')}
            </p>
          </div>
        </div>

        {/* --- Opiniones existentes: prueba social, después de la info práctica --- */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold mb-6">
            {t('placeDetail.reviews_title')}
            {reviews.length > 0 && <span className="text-cyan-400"> ({reviews.length})</span>}
          </h2>
          <ReviewsList reviews={reviews} loading={reviewsLoading} />
        </section>

        {/* --- Dejar tu opinión: acción del usuario, va al final --- */}
        <div className="mt-8">
          <ReviewForm placeId={place.id} onReviewSubmitted={handleNewReview} />
        </div>
      </main>
    </div>
  );
}
