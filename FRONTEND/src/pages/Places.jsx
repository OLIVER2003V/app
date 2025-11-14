import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api"; // Asumiendo que 'api' está configurado en esa ruta
import MapView from "../components/MapView";
import PlaceCard from "../components/PlaceCard";

// --- Icono de Carga (Spinner) ---
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


export default function Places() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Lógica de carga de datos (sin cambios)
  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setErr(null);
    api.get("/places/", { params: q ? { search: q } : {} })
      .then(({ data }) => {
        if (!cancel) setData(Array.isArray(data) ? data : (data?.results || []));
      })
      .catch((e) => !cancel && setErr(e?.message || "Error al cargar lugares"))
      .finally(() => !cancel && setLoading(false));
    return () => { cancel = true; };
  }, [q]);

  // Lógica de filtrado (sin cambios)
  const filtered = useMemo(() => {
    if (!q) return data;
    const term = q.toLowerCase();
    return data.filter((p) =>
      [p.name, p.category, p.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [data, q]);

  // Lógica de puntos del mapa (sin cambios)
  const points = useMemo(() => {
    return filtered
      .filter((p) => p.lat && p.lng)
      .map((p) => ({
        id: p.id,
        name: p.name,
        lat: Number(p.lat),
        lng: Number(p.lng),
        slug: p.slug,
        category: p.category
      }));
  }, [filtered]);
  
  // --- Manejador de Click para el Mapa ---
  const handleMapScroll = (place) => {
    if (!place.lat || !place.lng) return;
    
    setSelectedPoint({ lat: Number(place.lat), lng: Number(place.lng) });
    
    document.getElementById('mapa-lugares')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center' // 'center' es a menudo mejor que 'start'
    });
  };

  // --- Estados de Carga y Error (Estilo Premium) ---
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-cyan-50 p-4 text-center">
        <LoadingSpinner />
        <p className="mt-4 text-lg font-semibold text-emerald-700">
          Cargando lugares...
        </p>
      </div>
    );
  }
  if (err) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-4 text-center">
        <h2 className="text-2xl font-bold text-red-700">¡Oops! Algo salió mal</h2>
        <p className="mt-2 text-lg text-red-600">{err}</p>
      </div>
    );
  }

  // --- JSX Principal (Estilo Premium) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-cyan-50 px-4 py-12 text-gray-900 md:py-16">
      <div className="mx-auto max-w-7xl">
        
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600 md:text-6xl lg:text-7xl">
            Jardín de las Delicias
          </h1>
          <p className="text-xl text-gray-600 md:text-2xl">
            Descubre la magia en cada rincón.
          </p>
          <p className="mt-4 text-lg text-gray-500">
            {q ? (
              <>
                Mostrando <b className="font-semibold text-emerald-700">{filtered.length}</b> {filtered.length === 1 ? 'resultado' : 'resultados'} para <b className="font-semibold text-emerald-700">“{q}”</b>
              </>
            ) : (
              <>
                Total: <b className="font-semibold text-emerald-700">{filtered.length}</b> {filtered.length === 1 ? 'lugar mágico' : 'lugares mágicos'} por descubrir
              </>
            )}
          </p>
        </header>

        {/* --- Vista del Mapa (Estilo Premium) --- */}
        <div 
          id="mapa-lugares" 
          className="mb-12 h-[350px] overflow-hidden rounded-2xl shadow-xl shadow-emerald-900/10 md:mb-16 md:h-[500px]"
        >
          <MapView points={points} selectedPoint={selectedPoint} />
        </div>

        {/* --- Grid de Lugares --- */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((place) => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                onMapClick={() => handleMapScroll(place)}
              />
            ))}
          </div>
        ) : (
          // --- Estado de No Resultados ---
          <div className="rounded-2xl bg-white/80 p-12 text-center text-gray-600 backdrop-blur-sm md:col-span-2 lg:col-span-3">
            <h3 className="text-2xl font-semibold text-gray-800">No se encontraron lugares</h3>
            <p className="mt-2 text-base">Intenta ajustar tus términos de búsqueda para encontrar más maravillas.</p>
          </div>
        )}
      </div>
    </div>
  );
}