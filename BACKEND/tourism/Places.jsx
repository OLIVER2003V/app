import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/services/api'; // Asumo que tienes un helper 'api' para las llamadas
import PlaceCard from '@/components/places/PlaceCard';
import PlaceCardSkeleton from '@/components/places/PlaceCardSkeleton';

const CATEGORIES = ["cascada", "mirador", "ruta", "gastronomia", "hospedaje", "otro"];

// --- Componente de Filtro por Categoría ---
const CategoryFilter = ({ currentCategory, onSelectCategory }) => {
  const { t } = useTranslation();

  const categoriesWithAll = [{ key: 'all', label: t('places.filter_all') }].concat(
    CATEGORIES.map(cat => ({ key: cat, label: t(`places.category_${cat}`) }))
  );

  return (
    <div className="w-full overflow-x-auto pb-4 no-scrollbar">
      <div className="flex justify-center items-center gap-2 px-4">
        {categoriesWithAll.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onSelectCategory(key === 'all' ? '' : key)}
            className={`whitespace-nowrap px-5 py-2.5 text-sm rounded-full font-bold transition-all duration-300 ease-out flex-shrink-0 select-none border
              ${(currentCategory === key || (currentCategory === '' && key === 'all'))
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-900/30 scale-105 border-transparent'
                : 'text-cyan-100/90 border-cyan-500/20 bg-cyan-950/30 hover:bg-cyan-900/50 hover:border-cyan-400/50 hover:text-white'
              }`
            }
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

// --- Componente Principal de la Página de Lugares ---
export default function Places() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  const currentCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (currentCategory) params.append('category', currentCategory);
        if (searchQuery) params.append('q', searchQuery);
        
        // El backend ahora filtra, solo pasamos los parámetros
        const response = await api.get(`/places/?${params.toString()}`);
        setPlaces(response.data);
      } catch (err) {
        console.error("Error fetching places:", err);
        setError(t('common.error_generic'));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaces();
  }, [currentCategory, searchQuery, t]);

  // Efecto para obtener la ubicación del usuario una sola vez
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => {
          console.warn("No se pudo obtener la ubicación del usuario:", err.message);
        }
      );
    }
  }, []);

  const handleSelectCategory = (category) => {
    setSearchParams(params => {
      if (category) {
        params.set('category', category);
      } else {
        params.delete('category');
      }
      return params;
    }, { replace: true }); // 'replace' evita ensuciar el historial del navegador
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <PlaceCardSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return <p className="text-center text-red-400 py-16">{error}</p>;
    }

    if (places.length === 0) {
      return (
        <div className="text-center py-16">
          <p className="text-2xl font-bold text-cyan-200 mb-2">{t('places.empty')}</p>
          {searchQuery && <p className="text-slate-400">No se encontraron resultados para "{searchQuery}".</p>}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {places.map(place => <PlaceCard key={place.id} place={place} userPosition={userPosition} />)}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-b from-cyan-950 via-teal-950 to-emerald-950 min-h-screen text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
            {t('places.title')}
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg md:text-xl text-cyan-200/80">
            {t('places.subtitle')}
          </p>
        </header>

        <div className="mb-8 md:mb-12">
          <CategoryFilter currentCategory={currentCategory} onSelectCategory={handleSelectCategory} />
        </div>

        {renderContent()}
      </main>
    </div>
  );
}