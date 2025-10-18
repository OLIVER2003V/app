import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import "./CreateEvent.css";

export default function CreateEvent() {
  // --------- Form state ---------
  const [id, setId] = useState(null); // si hay id => edit mode
  const [title, setTitle] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // --------- Aux listas ---------
  const [places, setPlaces] = useState([]);

  // --------- UI / errores ---------
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  // --------- Listado ---------
  const [events, setEvents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [ordering, setOrdering] = useState("-start_date"); // depende del backend
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [prevUrl, setPrevUrl] = useState(null);

  const navigate = useNavigate();

  // =========================
  // Helpers
  // =========================
  const resetForm = () => {
    setId(null);
    setTitle("");
    setPlaceId("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setIsActive(true);
    setError(null);
    setNotice(null);
  };

  const arrayFromApi = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  // =========================
  // Cargar lugares
  // =========================
  useEffect(() => {
    api
      .get("/places/")
      .then(({ data }) => setPlaces(arrayFromApi(data)))
      .catch(() =>
        setError(
          "No se pudieron cargar los lugares. Asegúrate de que la API funciona."
        )
      );
  }, []);

  // =========================
  // Listar eventos (con filtros)
  // =========================
  const fetchEvents = async (opts = {}) => {
    try {
      setLoadingList(true);
      setError(null);

      const params = {
        page: opts.page ?? page,
      };

      if (query.trim()) params.search = query.trim();
      if (ordering) params.ordering = ordering;

      if (statusFilter === "active") params.is_active = true;
      if (statusFilter === "inactive") params.is_active = false;

      const { data } = await api.get("/events/", { params });

      // Compatibilidad DRF y arrays simples
      const list = arrayFromApi(data);
      setEvents(list);

      if (typeof data?.count === "number") setCount(data.count);
      else setCount(list.length);

      setNextUrl(data?.next ?? null);
      setPrevUrl(data?.previous ?? null);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la lista de eventos.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchEvents({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, statusFilter, ordering]);

  // =========================
  // Cargar detalle para editar
  // =========================
  const startEdit = async (eventId) => {
    try {
      setError(null);
      const { data } = await api.get(`/events/${eventId}/`);
      setId(data.id ?? eventId);
      setTitle(data.title ?? "");
      setPlaceId(data.place ?? data.place_id ?? "");
      setStartDate(data.start_date ?? data.date ?? "");
      setEndDate(data.end_date ?? "");
      setDescription(data.description ?? "");
      setIsActive(
        typeof data.is_active === "boolean" ? data.is_active : true
      );
      setNotice("Modo edición activado.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el evento para editar.");
    }
  };

  // =========================
  // Borrar evento
  // =========================
  const deleteEvent = async (eventId) => {
    const ok = window.confirm("¿Eliminar este evento? Esta acción es irreversible.");
    if (!ok) return;
    try {
      await api.delete(`/events/${eventId}/`);
      setNotice("Evento eliminado.");
      if (id === eventId) resetForm();
      fetchEvents();
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar el evento.");
    }
  };

  // =========================
  // Toggle activo/inactivo (PATCH)
  // =========================
  const toggleActive = async (eventItem) => {
    try {
      const newVal = !eventItem.is_active;
      // Optimista:
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventItem.id ? { ...ev, is_active: newVal } : ev
        )
      );
      await api.patch(`/events/${eventItem.id}/`, { is_active: newVal });
    } catch (e) {
      console.error(e);
      setError("No se pudo cambiar el estado del evento.");
      // revert
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventItem.id ? { ...ev, is_active: eventItem.is_active } : ev
        )
      );
    }
  };

  // =========================
  // Submit (crear/actualizar)
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    // Validaciones mínimas
    if (!title.trim()) {
      setError("El título es obligatorio.");
      setIsSubmitting(false);
      return;
    }
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      setError("La fecha de fin no puede ser anterior al inicio.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: title.trim(),
      start_date: startDate || null,
      end_date: endDate || null,
      description: description || "",
      is_active: isActive,
      ...(placeId && { place: placeId }),
    };

    try {
      if (id) {
        // Modo edición — usa PUT completo si prefieres.
        await api.patch(`/events/${id}/`, payload);
        setNotice("Evento actualizado con éxito.");
      } else {
        await api.post("/events/", payload);
        setNotice("¡Evento creado con éxito!");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError(
        "No fue posible guardar. Revisa los datos o verifica tus permisos."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // Paginación DRF
  // =========================
  const goNext = async () => {
    if (!nextUrl) return;
    try {
      setLoadingList(true);
      const { data } = await api.get(nextUrl);
      setEvents(arrayFromApi(data));
      setNextUrl(data?.next ?? null);
      setPrevUrl(data?.previous ?? null);
      setCount(typeof data?.count === "number" ? data.count : null);
      setPage((p) => p + 1);
    } catch (e) {
      console.error(e);
      setError("No se pudo avanzar de página.");
    } finally {
      setLoadingList(false);
    }
  };

  const goPrev = async () => {
    if (!prevUrl) return;
    try {
      setLoadingList(true);
      const { data } = await api.get(prevUrl);
      setEvents(arrayFromApi(data));
      setNextUrl(data?.next ?? null);
      setPrevUrl(data?.previous ?? null);
      setCount(typeof data?.count === "number" ? data.count : null);
      setPage((p) => Math.max(1, p - 1));
    } catch (e) {
      console.error(e);
      setError("No se pudo retroceder de página.");
    } finally {
      setLoadingList(false);
    }
  };

  // Vista previa simple del formulario
  const preview = useMemo(
    () => ({
      title: title || "Nuevo evento",
      place:
        places.find((p) => String(p.id) === String(placeId))?.name || "—",
      start_date: startDate || "—",
      end_date: endDate || "—",
      is_active: isActive,
    }),
    [title, placeId, startDate, endDate, isActive, places]
  );

  return (
    <div className="event-admin-page">
      <div className="event-admin-grid">
        {/* ==== Columna izquierda: listado ==== */}
        <aside className="events-panel">
          <header className="panel-header">
            <h2>Eventos</h2>
            <div className="list-controls">
              <input
                className="input"
                placeholder="Buscar por título…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
              <select
                className="input"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                title="Estado"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
              <select
                className="input"
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                title="Orden"
              >
                <option value="-start_date">Más próximos primero</option>
                <option value="start_date">Más antiguos primero</option>
                <option value="-id">ID desc</option>
                <option value="id">ID asc</option>
              </select>
              <button
                className="btn btn--secondary"
                onClick={() => fetchEvents({ page: 1 })}
                type="button"
              >
                Refrescar
              </button>
            </div>
          </header>

          <div className="events-list">
            {loadingList ? (
              <div className="muted">Cargando eventos…</div>
            ) : events.length === 0 ? (
              <div className="muted">No hay eventos con esos criterios.</div>
            ) : (
              events.map((ev) => (
                <article key={ev.id} className="event-row">
                  <div className="row-main" onClick={() => startEdit(ev.id)}>
                    <h4 className="event-title">
                      {ev.title}{" "}
                      {!ev.is_active && (
                        <span className="badge badge--muted">Inactivo</span>
                      )}
                    </h4>
                    <div className="event-meta">
                      <span>Inicio: {ev.start_date || ev.date || "—"}</span>
                      {ev.end_date && <span> • Fin: {ev.end_date}</span>}
                    </div>
                  </div>
                  <div className="row-actions">
                    <label className="switch" title="Activar/Inactivar">
                      <input
                        type="checkbox"
                        checked={!!ev.is_active}
                        onChange={() => toggleActive(ev)}
                      />
                      <span className="slider" />
                    </label>
                    <button
                      className="icon-btn"
                      title="Editar"
                      onClick={() => startEdit(ev.id)}
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Eliminar"
                      onClick={() => deleteEvent(ev.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer className="list-footer">
            <div className="muted">
              {typeof count === "number" ? `Total: ${count}` : ""}
            </div>
            <div className="pager">
              <button className="btn btn--ghost" disabled={!prevUrl} onClick={goPrev}>
                ◀ Anterior
              </button>
              <button className="btn btn--ghost" disabled={!nextUrl} onClick={goNext}>
                Siguiente ▶
              </button>
            </div>
          </footer>
        </aside>

        {/* ==== Columna derecha: formulario ==== */}
        <main className="form-panel">
          <div className="create-event-container">
            <h1>{id ? "Editar evento" : "Crear Nuevo Evento"}</h1>
            <p>Completa el formulario para añadir o actualizar un evento.</p>

            {notice && <div className="form-notice">{notice}</div>}
            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-group">
                <label htmlFor="title">Título del Evento</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Festival Gastronómico"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="place">Lugar Asociado (Opcional)</label>
                <select
                  id="place"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                >
                  <option value="">-- Ninguno --</option>
                  {places.map((place) => (
                    <option key={place.id} value={place.id}>
                      {place.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start-date">Fecha y Hora de Inicio</label>
                  <input
                    id="start-date"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end-date">Fecha y Hora de Fin (Opcional)</label>
                  <input
                    id="end-date"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Descripción (Opcional)</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="5"
                  placeholder="Añade detalles sobre el evento, como horarios, actividades especiales, etc."
                />
              </div>

              <div className="form-group inline">
                <label htmlFor="is-active">Activo</label>
                <input
                  id="is-active"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    resetForm();
                    navigate("/admin");
                  }}
                >
                  Cancelar
                </button>

                {id && (
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => resetForm()}
                  >
                    Nuevo
                  </button>
                )}

                <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
                  {isSubmitting ? (id ? "Guardando..." : "Creando...") : id ? "Guardar cambios" : "Crear Evento"}
                </button>
              </div>
            </form>

            {/* Vista previa compacta */}
            <div className="preview">
              <div className="preview-header">Vista previa</div>
              <div className="preview-body">
                <div className="row">
                  <span className="label">Título:</span>
                  <span className="val">{preview.title}</span>
                </div>
                <div className="row">
                  <span className="label">Lugar:</span>
                  <span className="val">{preview.place}</span>
                </div>
                <div className="row">
                  <span className="label">Inicio:</span>
                  <span className="val">{preview.start_date}</span>
                </div>
                <div className="row">
                  <span className="label">Fin:</span>
                  <span className="val">{preview.end_date}</span>
                </div>
                <div className="row">
                  <span className="label">Estado:</span>
                  <span className={`chip ${preview.is_active ? "ok" : "off"}`}>
                    {preview.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
