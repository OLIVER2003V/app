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
  Filter, 
  ArrowLeft,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

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
      
      // Scroll suave al formulario en móvil
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setMsg({ type: 'error', text: "No se pudo cargar el evento." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMsg(null);

    const payload = {
      title,
      start_date: startDate || null,
      end_date: endDate || null,
      description,
      is_active: isActive,
      place: placeId || null
    };

    try {
      let res;
      if (id) {
        res = await api.patch(`/events/${id}/`, payload);
        setEvents(prev => prev.map(ev => ev.id === id ? res.data : ev));
        setMsg({ type: 'success', text: "Evento actualizado correctamente" });
      } else {
        res = await api.post("/events/", payload);
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

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este evento permanentemente?")) return;
    try {
      await api.delete(`/events/${id}/`);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      resetForm();
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
                <button onClick={resetForm} className="bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg transition-colors shadow-lg shadow-orange-500/20" title="Nuevo Evento">
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
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-sm ${id === ev.id ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                            {ev.title}
                        </h3>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${ev.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {ev.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                    
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
                <button onClick={handleDelete} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Eliminar">
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