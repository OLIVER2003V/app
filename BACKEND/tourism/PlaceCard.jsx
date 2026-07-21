import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Zap, Waves, ShieldCheck, MapPin } from 'lucide-react';

// --- Componentes Helper ---

const calculateDistance = (pos1, pos2) => {
  if (!pos1 || !pos2 || !pos1.length || !pos2.length) return null;
  const R = 6371; // Radio de la Tierra en km
  const dLat = (pos2[0] - pos1[0]) * (Math.PI / 180);
  const dLon = (pos2[1] - pos1[1]) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pos1[0] * (Math.PI / 180)) * Math.cos(pos2[0] * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const StarRating = ({ rating = 0, count = 0 }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.4;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => <Star key={`f-${i}`} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
        {halfStar && <Star key="h" className="h-4 w-4 text-amber-400 fill-amber-400" style={{ clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)' }} />}
        {[...Array(emptyStars)].map((_, i) => <Star key={`e-${i}`} className="h-4 w-4 text-slate-600" />)}
      </div>
      <span className="text-xs text-slate-400 font-medium">({count})</span>
    </div>
  );
};

const KeyFeatures = ({ features = [] }) => {
  const featureIcons = {
    'Fácil Acceso': <ShieldCheck size={14} />,
    'Se puede nadar': <Waves size={14} />,
    'Vista 360°': <Zap size={14} />,
  };

  if (features.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-auto pt-4">
      {features.slice(0, 3).map((feature, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-cyan-200 bg-cyan-500/10 px-2.5 py-1 rounded-full">
          {featureIcons[feature] || <Zap size={14} />}
          <span>{feature}</span>
        </div>
      ))}
    </div>
  );
};

const CategoryBadge = ({ category }) => {
  const { t } = useTranslation();
  const categoryColors = {
    cascada: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    mirador: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    ruta: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    gastronomia: 'bg-red-500/20 text-red-300 border-red-500/30',
    hospedaje: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    otro: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };

  return (
    <span className={`absolute top-3 right-3 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${categoryColors[category] || categoryColors.otro}`}>
      {t(`places.category_${category}`, category)}
    </span>
  );
};

export default function PlaceCard({ place, userPosition }) {
  const { t } = useTranslation();
  const imageUrl = place.media?.[0]?.image || '/images/placeholder.png';
  const distance = calculateDistance(userPosition, [place.lat, place.lng]);

  return (
    <Link
      to={`/places/${place.slug}`}
      className="group relative flex flex-col bg-cyan-900/30 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-700/20 hover:scale-105 border border-cyan-500/10"
    >
      <div className="relative h-56 w-full">
        <img
          src={imageUrl}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        <CategoryBadge category={place.category} />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-xl font-bold text-cyan-100 group-hover:text-white transition-colors">{place.name}</h3>
          {distance !== null && (
            <div className="flex-shrink-0 flex items-center gap-1 text-xs font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full">
              <MapPin size={12} />
              {distance.toFixed(1)} km
            </div>
          )}
        </div>

        {place.reviews_count > 0 && (
          <div className="mt-2">
            <StarRating rating={place.avg_rating} count={place.reviews_count} />
          </div>
        )}
        <p className="text-sm text-cyan-300/70 mt-2 line-clamp-2">{place.description || t('places.default_description')}</p>
        <KeyFeatures features={place.key_features} />
      </div>
    </Link>
  );
}