import React from 'react';
import { Link } from 'react-router-dom';
import { getCategoryStyle } from '../utils/styleUtils';
import MapPinIcon from './icons/MapPinIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

export default function PlaceCard({ place, onMapClick }) {
  
  // Manejador de click para el botón del mapa
  const handleMapClick = (e) => {
    e.preventDefault(); // Previene la navegación
    e.stopPropagation();
    onMapClick();
  };
  
  return (
    <div className="group flex h-full transform flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-emerald-900/20 hover:-translate-y-1">
      
      {/* [SECCIÓN DE IMAGEN ELIMINADA] */}

      {/* --- Sección de Contenido --- */}
      <div className="flex flex-grow flex-col p-6">
        
        {/* Etiqueta de Categoría (Reubicada) */}
        <span
          className={`mb-3 self-start whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold uppercase shadow-sm ${getCategoryStyle(place.category)}`}
        >
          {place.category}
        </span>

        <h3 className="mb-2 text-2xl font-bold text-gray-900">
          {place.name}
        </h3>
        
        <p className="mb-6 flex-grow text-base text-gray-600 line-clamp-3">
          {place.description || "Descubre más sobre este increíble lugar."}
        </p>

        {/* --- Footer con Acciones (Sin cambios) --- */}
        <div className="mt-auto flex flex-col gap-3 sm:flex-row">
          {/* Botón Principal (Navegación) */}
          <Link
            to={`/places/${place.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-3 text-center text-sm font-semibold text-white shadow-md transition-all duration-200 ease-in-out hover:shadow-lg hover:from-emerald-600 hover:to-cyan-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Descubrir
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
          
          {/* Botón Secundario (Mapa) */}
          {place.lat && place.lng && (
            <button
              onClick={handleMapClick}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-5 py-3 text-center text-sm font-semibold text-emerald-700 transition-colors duration-200 ease-in-out hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <MapPinIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}