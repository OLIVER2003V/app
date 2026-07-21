import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Droplets, Mountain, Route, Utensils, Bed, HelpCircle, Star } from 'lucide-react';
import { getCategoryStyle } from '../utils/styleUtils';
import MapPinIcon from './icons/MapPinIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';
import HeartIcon from './icons/HeartIcon';
import { useFavorites } from '../hooks/useFavorites';

// Antes la tarjeta no mostraba ninguna imagen (ni foto real ni algo que
// distinguiera un lugar de otro a simple vista). Mientras no haya foto
// subida para un lugar, este ícono + color por categoría lo hace
// reconocible igual; en cuanto se suba una foto real, se usa esa.
const CATEGORY_ICONS = {
  cascada: Droplets,
  mirador: Mountain,
  ruta: Route,
  gastronomia: Utensils,
  hospedaje: Bed,
  otro: HelpCircle,
};

export default function PlaceCard({ place, onMapClick }) {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(place.id);
  const categoryKey = (place.category || "otro").toLowerCase();
  const CategoryIcon = CATEGORY_ICONS[categoryKey] || HelpCircle;
  const photo = place.media?.[0]?.image;

  // Manejador de click para el botón del mapa
  const handleMapClick = (e) => {
    e.preventDefault(); // Previene la navegación
    e.stopPropagation();
    onMapClick();
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(place.id);
  };

  return (
    <div className="group relative flex h-full transform flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1">

      {/* Botón Favorito */}
      <button
        onClick={handleFavoriteClick}
        aria-label={favorite ? t('favorites_ui.remove_aria', { name: place.name }) : t('favorites_ui.add_aria', { name: place.name })}
        aria-pressed={favorite}
        title={favorite ? t('favorites_ui.remove_title') : t('favorites_ui.add_title')}
        className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-1 transition-colors ${
          favorite
            ? "bg-red-500 text-white ring-red-500"
            : "bg-white text-gray-600 ring-black/5 hover:bg-red-50 hover:text-red-500"
        }`}
      >
        <HeartIcon className="h-[18px] w-[18px]" filled={favorite} strokeWidth={2.4} />
      </button>

      {/* Imagen (o placeholder por categoría si todavía no hay foto subida) */}
      <div className="relative aspect-video w-full overflow-hidden">
        {photo ? (
          <img
            src={photo}
            alt={place.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center ${getCategoryStyle(place.category)}`}>
            <CategoryIcon className="h-10 w-10 opacity-40" strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* --- Sección de Contenido --- */}
      <div className="flex flex-grow flex-col p-4">

        {/* Etiqueta de Categoría (Reubicada) */}
        <span
          className={`mb-2 self-start whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold uppercase shadow-sm ${getCategoryStyle(place.category)}`}
        >
          {t(`places.category_${(place.category || "otro").toLowerCase()}`)}
        </span>

        <h3 className="mb-1 text-lg font-bold text-gray-900 line-clamp-1">
          {place.name}
        </h3>

        {place.reviews_count > 0 && (
          <div className="mb-1.5 flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-gray-800">{Number(place.avg_rating || 0).toFixed(1)}</span>
            <span>({t('places.reviews_count', { count: place.reviews_count })})</span>
          </div>
        )}

        <p className="mb-4 flex-grow text-sm text-gray-600 line-clamp-2">
          {place.description || t('places.default_description')}
        </p>

        {/* --- Footer con Acciones --- */}
        <div className="mt-auto flex gap-2">
          {/* Botón Principal (Navegación) */}
          <Link
            to={`/places/${place.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:from-emerald-600 hover:to-cyan-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {t('places.discover')}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>

          {/* Botón Secundario (Mapa) */}
          {place.lat && place.lng && (
            <button
              onClick={handleMapClick}
              aria-label={`Ver ${place.name} en el mapa`}
              title={`Ver ${place.name} en el mapa`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700 transition-colors duration-200 ease-in-out hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <MapPinIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}