import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapPin, AlertCircle } from "lucide-react";
import api from "../lib/api";
import MapView from "../components/MapView";
import PlaceCard from "../components/PlaceCard";
import PageLoader from "../components/PageLoader";
import { getCategoryStyle } from "../utils/styleUtils";
import Seo from "../components/Seo";

const CATEGORY_VALUES = ["cascada", "mirador", "ruta", "gastronomia", "hospedaje", "otro"];

export default function Places() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get("/places/", { params: q ? { search: q } : {} })
      .then(({ data }) => { if (!cancel) setData(Array.isArray(data) ? data : (data?.results || [])); })
      .catch((e) => !cancel && setErr(e?.message || "Error al cargar lugares"))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, [q]);

  const availableCategories = useMemo(() => {
    const counts = data.reduce((acc, p) => {
      const key = p.category?.toLowerCase();
      if (key) acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    return CATEGORY_VALUES.filter((value) => counts[value]).map((value) => ({
      value,
      label: t(`places.category_${value}`),
      count: counts[value],
    }));
  }, [data, t]);

  const filtered = useMemo(() => {
    let result = data;
    if (q) {
      const term = q.toLowerCase();
      result = result.filter((p) => [p.name, p.category, p.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)));
    }
    if (activeCategory) {
      result = result.filter((p) => p.category?.toLowerCase() === activeCategory);
    }
    return result;
  }, [data, q, activeCategory]);

  const points = useMemo(() => filtered.filter((p) => p.lat && p.lng).map((p) => ({
        id: p.id, name: p.name, lat: Number(p.lat), lng: Number(p.lng), slug: p.slug, category: p.category
  })), [filtered]);

  const handleSelectPlace = (place) => {
      const target = { ...place, lat: Number(place.lat), lng: Number(place.lng) };
      setSelectedPlace(target);
      document.getElementById('mapa-lugares')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-gray-900 md:py-16 selection:bg-cyan-200">
      <Seo
        title="Lugares y Cascadas"
        description="Explora el mapa interactivo de Jardín de las Delicias: cascadas, miradores, rutas y gastronomía en El Torno, Santa Cruz."
        path="/places"
      />
      <div className="mx-auto max-w-7xl">

        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 md:text-6xl">
            {t('places.title')}
          </h1>
          <p className="text-lg text-gray-600">{t('places.subtitle')}</p>
        </header>

        {/* --- FILTROS POR CATEGORÍA --- */}
        {availableCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              aria-pressed={activeCategory === null}
              className={`rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-sm transition-all ${
                activeCategory === null
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {t('places.filter_all')}
            </button>
            {availableCategories.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setActiveCategory((curr) => (curr === c.value ? null : c.value))}
                aria-pressed={activeCategory === c.value}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wide shadow-sm transition-all ${
                  activeCategory === c.value
                    ? getCategoryStyle(c.value)
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {c.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeCategory === c.value ? "bg-black/15" : "bg-slate-100 text-slate-500"}`}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* --- MAPA (Tamaño controlado para móvil) --- */}
        {/* h-[400px] en móvil es suficiente para ver y deja ver el contenido de abajo */}
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
          <MapPin className="h-4 w-4 text-emerald-600" />
          {t('places.map_hint')}
        </div>
        <div id="mapa-lugares" className="mb-10 h-[400px] md:h-[600px] w-full rounded-3xl shadow-2xl shadow-cyan-900/10 border-4 border-white overflow-hidden relative z-0">
          <MapView
            points={points}
            selectedPoint={selectedPlace}
            onSelectPoint={handleSelectPlace}
          />
        </div>

        {/* --- TARJETAS --- */}
        {filtered.length > 0 && (
          <p className="mb-4 text-sm font-semibold text-slate-500">
            {t('places.results_count', { count: filtered.length })}
          </p>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                onMapClick={() => handleSelectPlace(place)}
              />
            ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">{t('places.empty')}</div>}
      </div>
    </div>
  );
}