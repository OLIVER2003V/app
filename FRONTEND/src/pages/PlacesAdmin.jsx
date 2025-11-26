import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Asegúrate de importar el CSS
import api from "@/lib/api";
import { 
  Search, Plus, MapPin, Image as ImageIcon, Save, 
  Trash2, Navigation, Info, Layers, Loader2,
  Mountain, Droplets, Utensils, Bed, Map as MapIcon, HelpCircle
} from "lucide-react";

// -- Configuración Leaflet --
// Fix para iconos perdidos en producción
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const SANTA_CRUZ_CENTER = [-17.7833, -63.1821];

// -- Helpers --
const slugify = (text) => text.toString().toLowerCase().trim()
  .replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

const CATEGORIES = {
  mirador: { label: "Mirador", icon: <EyeIcon className="w-4 h-4" />, color: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
  cascada: { label: "Cascada", icon: <Droplets className="w-4 h-4" />, color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20" },
  ruta: { label: "Ruta", icon: <MapIcon className="w-4 h-4" />, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  gastronomia: { label: "Gastronomía", icon: <Utensils className="w-4 h-4" />, color: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  hospedaje: { label: "Hospedaje", icon: <Bed className="w-4 h-4" />, color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
  otro: { label: "Otro", icon: <HelpCircle className="w-4 h-4" />, color: "text-slate-400 bg-slate-400/10 border-slate-400/20" },
};

// Icono auxiliar para el objeto CATEGORIES
function EyeIcon(props) { return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>; }


// -- Sub-componentes del Mapa --
function MapController({ center, onLocationSelect }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && !isNaN(center[0])) {
      map.flyTo(center, 15, { animate: true, duration: 1.5 });
    }
  }, [center, map]);

  useMapEvents({
    click(e) {
      onLocationSelect({ lat: e.latlng.lat.toFixed(6), lng: e.latlng.lng.toFixed(6) });
    },
  });
  return null;
}

export default function PlacesAdmin() {
  // --- Estados ---
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  
  // Selección y Edición
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [detail, setDetail] = useState(null);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [activeTab, setActiveTab] = useState("info"); // 'info' | 'map' | 'media'

  // Formularios
  const initialForm = {
    name: "", slug: "", category: "otro", description: "",
    address: "", lat: "", lng: "", is_active: true
  };
  const [form, setForm] = useState(initialForm);
  
  // Estados de UI
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // --- API Fetch ---
  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/places/");
      setPlaces(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (slug) => {
    setSaving(true); // Usamos saving como loading local
    try {
      const { data } = await api.get(`/places/${slug}/`);
      setDetail(data);
      setForm({
        name: data.name,
        slug: data.slug,
        category: data.category,
        description: data.description,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        is_active: data.is_active
      });
      setMode("edit");
      setSelectedSlug(slug);
      setActiveTab("info");
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el lugar.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchPlaces(); }, []);

  // --- Handlers ---
  const handleCreateNew = () => {
    setMode("create");
    setSelectedSlug(null);
    setDetail(null);
    setForm(initialForm);
    setActiveTab("info");
    setError(null);
    setSuccessMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg("");

    try {
      if (mode === "create") {
        const { data } = await api.post("/places/", form);
        setSuccessMsg("Lugar creado correctamente");
        fetchPlaces();
        // Pasar a modo edición del nuevo lugar
        setMode("edit");
        setSelectedSlug(data.slug);
        setDetail(data);
      } else {
        const { data } = await api.put(`/places/${selectedSlug}/`, form);
        setSuccessMsg("Cambios guardados");
        setDetail(data);
        // Si cambió el slug, actualizar la lista y el seleccionado
        if (data.slug !== selectedSlug) {
            setSelectedSlug(data.slug);
            fetchPlaces();
        }
        // Actualizar lista localmente para reflejar cambios rápidos
        setPlaces(prev => prev.map(p => p.id === data.id ? data : p));
      }
    } catch (err) {
      const msg = err.response?.data 
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(", ")
        : "Error al guardar.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este lugar permanentemente?")) return;
    try {
      await api.delete(`/places/${selectedSlug}/`);
      fetchPlaces();
      handleCreateNew();
    } catch {
      alert("Error al eliminar");
    }
  };

  const handleLocationSelect = (coords) => {
    setForm(prev => ({ ...prev, ...coords }));
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return alert("GPS no disponible");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6)
        }));
      },
      (err) => alert("Error GPS: " + err.message)
    );
  };

  // Filtros
  const filteredPlaces = useMemo(() => {
    return places.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  }, [places, q]);

  const centerMap = useMemo(() => {
    if (form.lat && form.lng && !isNaN(form.lat)) return [parseFloat(form.lat), parseFloat(form.lng)];
    return SANTA_CRUZ_CENTER;
  }, [form.lat, form.lng]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Fondo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-6 h-full flex flex-col">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-full border border-slate-800 text-emerald-500">
                <Mountain className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">Lugares Turísticos</h1>
                <p className="text-slate-400 text-xs">Gestiona mapas, información y fotos.</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* === COLUMNA IZQUIERDA: LISTA (4 cols) === */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-[calc(100vh-140px)] sticky top-24">
            
            {/* Search Toolbar */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-xl flex gap-2 shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input 
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all" 
                  placeholder="Buscar lugar..." 
                  value={q} 
                  onChange={(e) => setQ(e.target.value)} 
                />
              </div>
              <button onClick={handleCreateNew} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors shadow-lg shadow-emerald-500/20">
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-10">
              {loading ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-emerald-500" /></div>
              ) : (
                filteredPlaces.map((p) => {
                  const catInfo = CATEGORIES[p.category] || CATEGORIES.otro;
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => fetchDetail(p.slug)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all group flex gap-3 items-center
                        ${selectedSlug === p.slug 
                          ? "bg-emerald-900/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                          : "bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900"
                        }`}
                    >
                      {/* Icono Categoría */}
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${catInfo.color}`}>
                        {catInfo.icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${selectedSlug === p.slug ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                          {p.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${p.is_active ? "bg-emerald-500" : "bg-slate-600"}`}></span>
                          <span className="text-xs text-slate-500 capitalize">{catInfo.label}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* === COLUMNA DERECHA: EDITOR (8 cols) === */}
          <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
            
            {/* Header Editor */}
            <div className="border-b border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {mode === 'create' ? <Plus className="h-5 w-5 text-emerald-400" /> : <MapPin className="h-5 w-5 text-emerald-400" />}
                  {mode === 'create' ? "Registrar Nuevo Lugar" : form.name}
                </h2>
              </div>
              
              {/* Tabs */}
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button onClick={() => setActiveTab("info")} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'info' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <div className="flex items-center gap-2"><Info className="h-3 w-3" /> Info</div>
                </button>
                <button onClick={() => setActiveTab("map")} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'map' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    <div className="flex items-center gap-2"><Navigation className="h-3 w-3" /> Mapa</div>
                </button>
                {mode === 'edit' && (
                    <button onClick={() => setActiveTab("media")} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${activeTab === 'media' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <div className="flex items-center gap-2"><ImageIcon className="h-3 w-3" /> Galería</div>
                    </button>
                )}
              </div>
            </div>

            {/* Mensajes */}
            {(error || successMsg) && (
                <div className={`px-6 py-2 text-sm font-medium text-center ${error ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                    {error || successMsg}
                </div>
            )}

            {/* Contenido Tab */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                <form id="placeForm" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
                    
                    {/* --- TAB 1: INFORMACIÓN --- */}
                    {activeTab === 'info' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nombre del Lugar</label>
                                    <input 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                        value={form.name}
                                        onChange={e => setForm({...form, name: e.target.value, slug: slugify(e.target.value)})}
                                        placeholder="Ej. Mirador El Cielo"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Slug (URL)</label>
                                    <input 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-400 focus:border-emerald-500 outline-none font-mono text-sm"
                                        value={form.slug}
                                        onChange={e => setForm({...form, slug: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Categoría</label>
                                    <select 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none appearance-none"
                                        value={form.category}
                                        onChange={e => setForm({...form, category: e.target.value})}
                                    >
                                        {Object.entries(CATEGORIES).map(([key, val]) => (
                                            <option key={key} value={key}>{val.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Dirección (Texto)</label>
                                    <input 
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 outline-none"
                                        value={form.address}
                                        onChange={e => setForm({...form, address: e.target.value})}
                                        placeholder="Ej. A 5km del pueblo..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase">Descripción</label>
                                <textarea 
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-300 focus:border-emerald-500 outline-none min-h-[150px]"
                                    value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    placeholder="Describe qué hace especial a este lugar..."
                                />
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                <input 
                                    type="checkbox" 
                                    checked={form.is_active} 
                                    onChange={e => setForm({...form, is_active: e.target.checked})}
                                    className="w-5 h-5 accent-emerald-500"
                                />
                                <span className="text-sm font-bold text-white">Lugar Activo y Visible</span>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: MAPA --- */}
                    {activeTab === 'map' && (
                        <div className="space-y-4 h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Latitud</label>
                                        <input className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono" value={form.lat} onChange={e => setForm({...form, lat: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase">Longitud</label>
                                        <input className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono" value={form.lng} onChange={e => setForm({...form, lng: e.target.value})} />
                                    </div>
                                </div>
                                <button type="button" onClick={handleGPS} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 h-[38px]">
                                    <Navigation className="h-4 w-4" /> Usar GPS
                                </button>
                            </div>

                            <div className="flex-1 min-h-[400px] bg-slate-950 rounded-xl border border-slate-700 overflow-hidden relative z-0">
                                <MapContainer center={centerMap} zoom={13} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer 
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                    />
                                    {form.lat && form.lng && !isNaN(form.lat) && (
                                        <Marker position={[form.lat, form.lng]} />
                                    )}
                                    <MapController center={centerMap} onLocationSelect={handleLocationSelect} />
                                </MapContainer>
                                <div className="absolute top-2 right-2 z-[1000] bg-black/70 backdrop-blur p-2 rounded text-xs text-white pointer-events-none">
                                    Haz clic en el mapa para fijar la ubicación
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 3: GALERÍA --- */}
                    {activeTab === 'media' && mode === 'edit' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 text-center">
                                <ImageIcon className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                                <h3 className="text-white font-bold">Galería del Lugar</h3>
                                <p className="text-slate-400 text-sm mb-4">Gestiona las fotos específicas de {form.name}</p>
                                
                                {/* Aquí iría tu componente de subida */}
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 hover:border-emerald-500 transition-colors cursor-pointer bg-slate-900/30">
                                    <p className="text-sm text-emerald-400 font-bold">
                                        + Subir nuevas fotos
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        (Funcionalidad pendiente de endpoint backend)
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {detail.media && detail.media.length > 0 ? (
                                    detail.media.map(m => (
                                        <div key={m.id} className="aspect-square bg-slate-900 rounded-xl overflow-hidden border border-slate-800 relative group">
                                            <img src={m.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            <button className="absolute top-2 right-2 bg-red-500/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="col-span-full text-center text-slate-500 text-sm py-10">No hay imágenes asociadas aún.</p>
                                )}
                            </div>
                        </div>
                    )}

                </form>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-slate-800 p-4 bg-slate-900/80 flex justify-end gap-3">
                {mode === 'edit' && (
                    <button 
                        type="button" 
                        onClick={handleDelete}
                        className="mr-auto text-red-400 hover:text-red-300 text-sm font-bold px-4 py-2"
                    >
                        Eliminar Lugar
                    </button>
                )}
                <button 
                    type="submit" 
                    form="placeForm"
                    disabled={saving} 
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {mode === 'create' ? "Crear Lugar" : "Guardar Cambios"}
                </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}