import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../lib/api";
import MapView from "../components/MapView";
import "./Places.css";

export default function Places() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [sp] = useSearchParams();
  const q = (sp.get("q") || "").trim();
  
  // ▼▼▼ NUEVO: Estado para el punto seleccionado en el mapa ▼▼▼
  const [selectedPoint, setSelectedPoint] = useState(null);

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

  const filtered = useMemo(() => {
    if (!q) return data;
    const term = q.toLowerCase();
    return data.filter((p) =>
      [p.name, p.category, p.description]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    );
  }, [data, q]);

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
  
  const getCategoryClassName = (category) => {
    return `category--${category}`;
  };

  if (loading) {
    return <div className="places-page-status">Cargando lugares...</div>;
  }
  if (err) {
    return <div className="places-page-status error">{err}</div>;
  }

  return (
    <div className="places-page">
      <div className="places-page-wrapper">
        <header className="places-header">
          <h1>Explora Nuestros Lugares</h1>
          <p className="places-summary">
            {q ? (
              <>Mostrando <b>{filtered.length}</b> resultados para <b>“{q}”</b></>
            ) : (
              <>Total: <b>{filtered.length}</b> lugares para descubrir</>
            )}
          </p>
        </header>

        <div className="map-view-container">
          {/* ▼▼▼ CAMBIO: Pasamos el punto seleccionado al mapa ▼▼▼ */}
          <MapView points={points} selectedPoint={selectedPoint} />
        </div>

        {filtered.length > 0 ? (
          <div className="places-grid">
            {filtered.map((place) => (
              <Link 
                to={`/places/${place.slug}`} 
                key={place.id} 
                className="place-card"
                // ▼▼▼ CAMBIO: Eventos para actualizar el punto seleccionado ▼▼▼
                onMouseEnter={() => setSelectedPoint({ lat: Number(place.lat), lng: Number(place.lng) })}
                onMouseLeave={() => setSelectedPoint(null)}
              >
                <div className="place-card-body">
                  <div className="place-card-header">
                    <h3 className="place-card-title">{place.name}</h3>
                    <span className={`place-card-category ${getCategoryClassName(place.category)}`}>
                      {place.category}
                    </span>
                  </div>
                  <p className="place-card-description">{place.description}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="places-no-results">
            <p>No se encontraron lugares que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}