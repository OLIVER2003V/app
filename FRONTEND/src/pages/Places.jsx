import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import MapView from "../components/MapView";
import PlaceCard from "../components/PlaceCard";

const LoadingSpinner = () => (
  <svg className="h-12 w-12 animate-spin text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default function Places() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();
  const [selectedPlace, setSelectedPlace] = useState(null);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.get("/places/", { params: q ? { search: q } : {} })
      .then(({ data }) => { if (!cancel) setData(Array.isArray(data) ? data : (data?.results || [])); })
      .catch((e) => !cancel && setErr(e?.message || "Error al cargar lugares"))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, [q]);

  const filtered = useMemo(() => {
    if (!q) return data;
    const term = q.toLowerCase();
    return data.filter((p) => [p.name, p.category, p.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(term)));
  }, [data, q]);

  const points = useMemo(() => filtered.filter((p) => p.lat && p.lng).map((p) => ({
        id: p.id, name: p.name, lat: Number(p.lat), lng: Number(p.lng), slug: p.slug, category: p.category
  })), [filtered]);

  const handleSelectPlace = (place) => {
      const target = { ...place, lat: Number(place.lat), lng: Number(place.lng) };
      setSelectedPlace(target);
      document.getElementById('mapa-lugares')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) return <div className="flex min-h-screen flex-col items-center justify-center bg-emerald-50"><LoadingSpinner /><p className="mt-4 text-emerald-700 font-bold">Cargando...</p></div>;
  if (err) return <div className="flex min-h-screen items-center justify-center bg-red-50 text-red-600 font-bold">{err}</div>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 text-gray-900 md:py-16 selection:bg-cyan-200">
      <div className="mx-auto max-w-7xl">
        
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 md:text-6xl">
            Jardín de las Delicias
          </h1>
          <p className="text-lg text-gray-600">Explora la magia y traza tu ruta.</p>
        </header>

        {/* --- MAPA PREMIUM (Tamaño controlado para móvil) --- */}
        {/* h-[400px] en móvil es suficiente para ver y deja ver el contenido de abajo */}
        <div id="mapa-lugares" className="mb-10 h-[400px] md:h-[600px] w-full rounded-3xl shadow-2xl shadow-cyan-900/10 border-4 border-white overflow-hidden relative z-0">
          <MapView 
            points={points} 
            selectedPoint={selectedPlace} 
            onSelectPoint={handleSelectPlace} 
          />
        </div>

        {/* --- TARJETAS --- */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((place) => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                onMapClick={() => handleSelectPlace(place)} 
              />
            ))}
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">No se encontraron lugares.</div>}
      </div>
    </div>
  );
}