import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertCircle, MapPin } from "lucide-react";
import api from "../lib/api";
import MapView from "../components/MapView";
import PlaceCard from "../components/PlaceCard";
import PageLoader from "../components/PageLoader";
import Seo from "../components/Seo";
import HeartIcon from "../components/icons/HeartIcon";
import { useFavorites } from "../hooks/useFavorites";

export default function Favorites() {
  const { t } = useTranslation();
  const { favorites } = useFavorites();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get("/places/")
      .then(({ data }) => { if (!cancel) setPlaces(Array.isArray(data) ? data : (data?.results || [])); })
      .catch((e) => !cancel && setErr(e?.message || "Error al cargar lugares"))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, []);

  const favoritePlaces = useMemo(
    () => places.filter((p) => favorites.includes(p.id)),
    [places, favorites]
  );

  const points = useMemo(() => favoritePlaces.filter((p) => p.lat && p.lng).map((p) => ({
    id: p.id, name: p.name, lat: Number(p.lat), lng: Number(p.lng), slug: p.slug, category: p.category,
  })), [favoritePlaces]);

  const handleSelectPlace = (place) => {
    const target = { ...place, lat: Number(place.lat), lng: Number(place.lng) };
    setSelectedPlace(target);
    document.getElementById('mapa-favoritos')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) return <PageLoader />;
  if (err) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-center text-red-600">
        <AlertCircle className="h-9 w-9" />
        <p className="font-bold">{err}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-gray-900 md:py-16">
      <Seo title={t('favorites.title')} path="/favoritos" noindex />
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 md:text-5xl">
            {t('favorites.title')}
          </h1>
          <p className="text-lg text-gray-600">{t('favorites.subtitle')}</p>
        </header>

        {favoritePlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/70 py-20 text-center shadow-sm">
            <HeartIcon className="h-14 w-14 text-slate-300" />
            <p className="text-lg font-semibold text-slate-600">{t('favorites.empty_title')}</p>
            <p className="max-w-sm text-slate-500">
              {t('favorites.empty_sub')}
            </p>
            <Link
              to="/places"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              {t('favorites.explore_cta')}
            </Link>
          </div>
        ) : (
          <>
            {points.length > 0 && (
              <>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  {t('favorites.map_hint')}
                </div>
                <div id="mapa-favoritos" className="mb-8 h-[400px] md:h-[500px] w-full rounded-3xl shadow-2xl shadow-cyan-900/10 border-4 border-white overflow-hidden relative z-0">
                  <MapView
                    points={points}
                    selectedPoint={selectedPlace}
                    onSelectPoint={handleSelectPlace}
                  />
                </div>
              </>
            )}

            <p className="mb-4 text-sm font-semibold text-slate-500">
              {t('favorites.count', { count: favoritePlaces.length })}
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {favoritePlaces.map((place) => (
                <PlaceCard key={place.id} place={place} onMapClick={() => handleSelectPlace(place)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
