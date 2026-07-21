import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import {
  Search,
  Plus,
  CalendarDays,
  MapPin,
  Clock,
  Save,
  Trash2,
  Pencil,
  Filter,
  ArrowLeft,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  X,
  Star,
  MessageCircle,
} from "lucide-react";

const MAX_IMAGE_MB = 8;

export default function CreateEvent() {
  const navigate = useNavigate();

  // --- Estados ---
  const [id, setId] = useState(null);
  const [title, setTitle] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [whatsappUrl, setWhatsappUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState(null);

  const [places, setPlaces] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState(null); // { type: 'success' | 'error', text: '' }

  // --- Cargar Datos Iniciales ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [placesRes, eventsRes] = await Promise.all([
          api.get("/places/"),
          api.get("/events/")
        ]);
        
        const placesData = Array.isArray(placesRes.data) ? placesRes.data : (placesRes.data.results || []);
        setPlaces(placesData);

        const eventsData = Array.isArray(eventsRes.data) ? eventsRes.data : (eventsRes.data.results || []);
        setEvents(eventsData);
      } catch (err) {
        console.error("Error cargando datos:", err);
        setMsg({ type: 'error', text: "Error de conexión al cargar datos." });
      } finally {
        setLoadingList(false);
      }
    };
    fetchData();
  }, []);

  // --- Filtrado Local ---
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesQuery = ev.title.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : statusFilter === 'active' ? ev.is_active 
        : !ev.is_active;
      return matchesQuery && matchesStatus;
    });
  }, [events, query, statusFilter]);

  // --- Acciones ---
  const resetForm = () => {
    setId(null);
    setTitle("");
    setPlaceId("");
    setStartDate("");
    setEndDate("");
    setDescription("");
    setIsActive(true);
    setWhatsappUrl("");
    setIsFeatured(false);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setImageError(null);
    setMsg(null);
  };

  const handleSelectEvent = async (eventId) => {
    try {
      setMsg(null);
      // Cargar detalle fresco por si acaso, o usar el de la lista
      const { data } = await api.get(`/events/${eventId}/`);
      setId(data.id);
      setTitle(data.title);
      setPlaceId(data.place || "");
      // Formatear fechas para input datetime-local (YYYY-MM-DDTHH:mm)
      setStartDate(data.start_date ? data.start_date.substring(0, 16) : "");
      setEndDate(data.end_date ? data.end_date.substring(0, 16) : "");
      setDescription(data.description || "");
      setIsActive(data.is_active);
      setWhatsappUrl(data.whatsapp_url || "");
      setIsFeatured(!!data.is_featured);
      setImageFile(null);
      setImagePreview(data.image || null);
      setRemoveImage(false);
      setImageError(null);

      // Scroll suave al formulario en móvil
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMsg({ type: 'error', text: "No se pudo cargar el evento." });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      setImageError(`La imagen supera el máximo permitido (${MAX_IMAGE_MB}MB).`);
      e.target.value = "";
      return;
    }
    setImageError(null);
    setImageFile(file);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    let payload;
    let config;

    if (imageFile) {
      // Con archivo adjunto tiene que viajar como multipart, no JSON.
      const fd = new FormData();
      fd.append("title", title);
      fd.append("start_date", startDate);
      if (endDate) fd.append("end_date", endDate);
      fd.append("description", description);
      fd.append("is_active", String(isActive));
      fd.append("is_featured", String(isFeatured));
      if (placeId) fd.append("place", String(placeId));
      if (whatsappUrl.trim()) fd.append("whatsapp_url", whatsappUrl.trim());
      fd.append("image", imageFile);
      payload = fd;
      config = { headers: { "Content-Type": "multipart/form-data" } };
    } else {
      payload = {
        title,
        start_date: startDate || null,
        end_date: endDate || null,
        description,
        is_active: isActive,
        is_featured: isFeatured,
        place: placeId || null,
        whatsapp_url: whatsappUrl.trim(),
        ...(removeImage ? { image: null } : {}),
      };
      config = undefined;
    }

    try {
      let res;
      if (id) {
        res = await api.patch(`/events/${id}/`, payload, config);
        setEvents(prev => prev.map(ev => ev.id === id ? res.data : ev));
        setMsg({ type: 'success', text: "Evento actualizado correctamente" });
        setImageFile(null);
        setRemoveImage(false);
        setImagePreview(res.data.image || null);
      } else {
        res = await api.post("/events/", payload, config);
        setEvents(prev => [res.data, ...prev]);
        setMsg({ type: 'success', text: "Evento creado exitosamente" });
        resetForm(); // Limpiar tras crear para hacer otro
      }
    } catch (err) {
      console.error(err);
      setMsg({ type: 'error', text: "Error al guardar. Revisa los campos." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Recibe el id explícito (no toma el "id" seleccionado por defecto) para
  // poder borrar tanto desde el encabezado del editor como directo desde
  // cada fila de la lista, sin tener que cargar el evento primero.
  const handleDelete = async (eventId, e) => {
    e?.stopPropagation();
    if (!eventId) return;
    if (!window.confirm("¿Eliminar este evento permanentemente?")) return;
    try {
      await api.delete(`/events/${eventId}/`);
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      if (eventId === id) resetForm();
      setMsg({ type: 'success', text: "Evento eliminado" });
    } catch (err) {
      setMsg({ type: 'error', text: "No se pudo eliminar." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Fondo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-6 h-full flex flex-col">
        
        {/* --- Header --- */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Gestión de Eventos</h1>
              <p className="text-slate-400 text-xs">Agenda y actividades de la comunidad.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --- LISTA (Izquierda - 4 cols) --- */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-[calc(100vh-140px)] sticky top-24">
            
            {/* Toolbar */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-xl flex flex-col gap-3 shadow-lg">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-all" 
                    placeholder="Buscar evento..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                  />
                </div>
                <button onClick={resetForm} className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg transition-colors shadow-lg shadow-orange-500/20" title="Nuevo Evento" aria-label="Nuevo Evento">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              {/* Filtros Rápidos */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['all', 'active', 'inactive'].map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-3 py-1 rounded-full text-xs font-bold capitalize border transition-colors ${
                            statusFilter === filter 
                            ? 'bg-slate-800 text-white border-slate-600' 
                            : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-900'
                        }`}
                    >
                        {filter === 'all' ? 'Todos' : filter === 'active' ? 'Activos' : 'Inactivos'}
                    </button>
                ))}
              </div>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-10">
              {loadingList ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange-500" /></div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-sm">No hay eventos.</div>
              ) : (
                filteredEvents.map((ev) => (
                  <div 
                    key={ev.id} 
                    onClick={() => handleSelectEvent(ev.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all group flex flex-col gap-2
                      ${id === ev.id 
                        ? "bg-orange-900/20 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]" 
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900"
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                        <h3 className={`font-bold text-sm flex items-center gap-1.5 ${id === ev.id ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                            {ev.is_featured && <Star className="h-3.5 w-3.5 shrink-0 text-amber-400" fill="currentColor" />}
                            <span className="truncate">{ev.title}</span>
                        </h3>
                        <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${ev.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {ev.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {new Date(ev.start_date).toLocaleDateString()}
                            </span>
                            {ev.place && (
                                <span className="flex items-center gap-1 truncate max-w-[120px]">
                                    <MapPin className="h-3 w-3" />
                                    {places.find(p => p.id === ev.place)?.name || "Lugar ID " + ev.place}
                                </span>
                            )}
                        </div>

                        {/* Acciones directas: antes había que seleccionar el
                            evento y buscar el botón de borrar arriba del
                            editor para darse cuenta de que existía; ahora
                            "editar" y "eliminar" están a la vista en cada
                            fila. */}
                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleSelectEvent(ev.id); }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                                title="Editar evento"
                                aria-label={`Editar ${ev.title}`}
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => handleDelete(ev.id, e)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                title="Eliminar evento"
                                aria-label={`Eliminar ${ev.title}`}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- EDITOR (Derecha - 8 cols) --- */}
          <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
            
            {/* Header Editor */}
            <div className="border-b border-slate-800 p-6 flex justify-between items-center bg-slate-900/80">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {id ? <CalendarDays className="h-5 w-5 text-orange-400" /> : <Plus className="h-5 w-5 text-orange-400" />}
                  {id ? "Editar Evento" : "Nuevo Evento"}
                </h2>
                {id && <p className="text-slate-500 text-xs mt-1">ID: {id}</p>}
              </div>
              
              {id && (
                <button onClick={() => handleDelete(id)} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Eliminar" aria-label="Eliminar evento">
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Feedback Msg */}
            {msg && (
              <div className={`mx-6 mt-6 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {msg.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {msg.text}
              </div>
            )}

            {/* Formulario */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="eventForm" onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                    
                    {/* Título */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Título del Evento</label>
                        <input 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:border-orange-500 transition-all"
                            placeholder="Ej. Feria de la Miel 2025"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    {/* Arte del Evento (opcional) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                            <ImagePlus className="h-3 w-3" /> Arte / Foto del Evento (Opcional)
                        </label>
                        {imageError && (
                            <p className="text-xs font-medium text-red-400">{imageError}</p>
                        )}
                        {imagePreview ? (
                            <div className="relative w-full max-w-sm overflow-hidden rounded-xl border border-slate-700">
                                <img src={imagePreview} alt="Vista previa del evento" className="aspect-video w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/80 text-white hover:bg-red-600 transition-colors"
                                    aria-label="Quitar imagen"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 px-4 py-8 text-slate-500 transition-colors hover:border-orange-500 hover:text-slate-300">
                                <ImagePlus className="h-6 w-6" />
                                <span className="text-xs font-semibold">Subir afiche o foto (máx. {MAX_IMAGE_MB}MB)</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Inicio
                            </label>
                            <input 
                                type="datetime-local"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <Clock className="h-3 w-3" /> Fin (Opcional)
                            </label>
                            <input 
                                type="datetime-local"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                min={startDate}
                            />
                        </div>
                    </div>

                    {/* Lugar y Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Lugar
                            </label>
                            <select 
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none appearance-none"
                                value={placeId}
                                onChange={e => setPlaceId(e.target.value)}
                            >
                                <option value="">-- General / Sin lugar --</option>
                                {places.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end pb-2">
                            <label className="flex items-center justify-between w-full p-3 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer group hover:border-slate-600">
                                <span className="text-sm font-bold text-slate-300 group-hover:text-white">Evento Activo</span>
                                <div className={`w-10 h-5 flex items-center bg-slate-700 rounded-full p-1 transition-colors ${isActive ? 'bg-emerald-600' : ''}`}>
                                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${isActive ? 'translate-x-5' : ''}`}></div>
                                    <input type="checkbox" className="hidden" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* WhatsApp y Destacado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                                <MessageCircle className="h-3 w-3" /> Link de WhatsApp (Opcional)
                            </label>
                            <input
                                type="url"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-orange-500 outline-none"
                                placeholder="https://wa.me/591..."
                                value={whatsappUrl}
                                onChange={e => setWhatsappUrl(e.target.value)}
                            />
                        </div>

                        <div className="flex items-end pb-2">
                            <label className="flex items-center justify-between w-full p-3 bg-slate-950 border border-slate-700 rounded-lg cursor-pointer group hover:border-slate-600">
                                <span className="text-sm font-bold text-slate-300 group-hover:text-white flex items-center gap-1.5">
                                    <Star className="h-3.5 w-3.5 text-amber-400" /> Destacar como Anuncio
                                </span>
                                <div className={`w-10 h-5 flex items-center bg-slate-700 rounded-full p-1 transition-colors shrink-0 ${isFeatured ? 'bg-amber-500' : ''}`}>
                                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${isFeatured ? 'translate-x-5' : ''}`}></div>
                                    <input type="checkbox" className="hidden" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                                </div>
                            </label>
                        </div>
                    </div>
                    <p className="-mt-3 text-xs text-slate-500">
                        El evento destacado aparece como un anuncio emergente al entrar al sitio (solo uno a la vez; si marcás varios, se muestra el más próximo).
                    </p>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase">Descripción</label>
                        <textarea 
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-orange-500 transition-all min-h-[150px]"
                            placeholder="Detalles del evento, recomendaciones, precios..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 p-4 bg-slate-900/80 flex justify-end gap-3">
                {id && (
                    <button 
                        type="button" 
                        onClick={resetForm}
                        className="mr-auto text-slate-500 hover:text-white text-sm font-bold px-4 py-2 transition-colors"
                    >
                        Cancelar Edición
                    </button>
                )}
                <button 
                    type="submit" 
                    form="eventForm"
                    disabled={isSubmitting} 
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {id ? "Guardar Cambios" : "Crear Evento"}
                </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}