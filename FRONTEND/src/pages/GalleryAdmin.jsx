import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  Eye, 
  EyeOff, 
  UploadCloud, 
  ArrowLeft, 
  Loader2, 
  Save,
  RefreshCw
} from "lucide-react";

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- Estado del Formulario de Subida ---
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // --- CARGA DE DATOS ---
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get("gallery/");
      // Tu backend devuelve una lista ordenada por 'order', así que confiamos en eso
      setItems(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error cargando galería:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  // --- MANEJO DE ARCHIVOS (PREVIEW) ---
  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validar tamaño (ej. 10MB) para no saturar antes de enviar
    if (selected.size > 10 * 1024 * 1024) {
      alert("El archivo es demasiado grande (Máx 10MB)");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // --- SUBIR (POST) ---
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("order", order);
    fd.append("is_active", isActive);
    fd.append("media_file", file); 
    // NOTA: No enviamos 'media_type', tu backend lo detecta solo con mimetypes.guess_type

    try {
      await api.post("gallery/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Limpiar form tras éxito
      setFile(null);
      setPreview(null);
      setTitle("");
      setOrder(0);
      fetchGallery(); // Recargar para ver el nuevo ítem ordenado
    } catch (err) {
      console.error(err);
      setUploadError("Error al subir. Revisa la conexión o el formato.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- ACCIONES RÁPIDAS (PATCH / DELETE) ---
  
  // Actualizar visibilidad
  const toggleVisibility = async (id, currentStatus) => {
    // Optimismo en UI
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_active: !currentStatus } : i));
    try {
      await api.patch(`gallery/${id}/`, { is_active: !currentStatus });
    } catch {
      fetchGallery(); // Revertir si falla
    }
  };

  // Actualizar Orden (al perder foco del input)
  const updateOrder = async (id, newOrder) => {
    try {
      await api.patch(`gallery/${id}/`, { order: parseInt(newOrder) });
      fetchGallery(); // Necesario recargar para reordenar la grilla
    } catch {
      alert("Error al guardar el orden");
    }
  };

  // Eliminar
  const deleteItem = async (id) => {
    if (!confirm("¿Eliminar este ítem permanentemente?")) return;
    setItems(prev => prev.filter(i => i.id !== id)); // UI Inmediata
    try {
      await api.delete(`gallery/${id}/`);
    } catch {
      alert("Error al eliminar");
      fetchGallery();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-x-hidden">
      
      {/* Fondo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-950/20 to-transparent"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Galería Multimedia</h1>
              <p className="text-slate-400 text-sm">Imágenes y videos del Hero Section</p>
            </div>
          </div>
          <button onClick={fetchGallery} className="p-2 text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-colors" title="Recargar">
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8 items-start">
          
          {/* === COLUMNA IZQUIERDA: SUBIDA === */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-orange-500" /> Subir Contenido
            </h2>

            {uploadError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              
              {/* Dropzone */}
              <div className="relative group w-full aspect-video bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileSelect} 
                  accept="image/*,video/mp4,video/webm"
                />
                
                {preview ? (
                  file?.type.startsWith("video") ? (
                    <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Click para seleccionar</span>
                    <span className="text-[10px] opacity-60">JPG, PNG, MP4</span>
                  </div>
                )}
                
                {/* Overlay si hay archivo */}
                {file && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                    <p className="text-xs text-white truncate px-2">{file.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Título (Opcional)</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition-all"
                    placeholder="Ej. Vista aérea"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Orden</label>
                    <input 
                      type="number" 
                      value={order} 
                      onChange={e => setOrder(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-orange-500 outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 h-[38px]">
                      <input 
                        type="checkbox" 
                        checked={isActive} 
                        onChange={e => setIsActive(e.target.checked)}
                        className="accent-orange-500 w-4 h-4"
                      />
                      <span className="text-xs text-slate-300 select-none">Visible</span>
                    </label>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!file || isUploading}
                className="mt-2 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                {isUploading ? "Subiendo..." : "Guardar"}
              </button>
            </form>
          </div>

          {/* === COLUMNA DERECHA: GRID === */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-full py-20 text-center text-slate-500 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-cyan-500" />
                <p>Cargando galería...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="col-span-full py-20 text-center text-slate-600 border-2 border-dashed border-slate-800 rounded-2xl">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay elementos en la galería.</p>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className={`group relative bg-slate-900 border rounded-xl overflow-hidden transition-all duration-300
                    ${item.is_active ? "border-slate-800 hover:border-slate-600" : "border-red-900/30 opacity-75"}`}
                >
                  
                  {/* --- AREA VISUAL (IMAGEN O VIDEO) --- */}
                  <div className="aspect-video w-full bg-black relative">
                    {item.media_type === "VIDEO" ? (
                      <video 
                        src={item.media_file} 
                        className="w-full h-full object-cover" 
                        controls // Permitimos controles para verificar el video
                        preload="metadata"
                      />
                    ) : (
                      <img 
                        src={item.media_file} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    )}

                    {/* Badge Tipo */}
                    <div className="absolute top-2 right-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border border-white/10 ${item.media_type === "VIDEO" ? "bg-purple-500/20 text-purple-200" : "bg-cyan-500/20 text-cyan-200"}`}>
                        {item.media_type}
                      </span>
                    </div>

                    {/* Overlay Estado (Si está oculto) */}
                    {!item.is_active && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none">
                        <span className="text-red-300 text-xs font-bold uppercase tracking-widest border border-red-500/50 px-2 py-1 rounded bg-black/50">Oculto</span>
                      </div>
                    )}
                  </div>

                  {/* --- CONTROLES INFERIORES --- */}
                  <div className="p-3 bg-slate-900 flex items-center justify-between gap-3">
                    
                    {/* Input de Orden (Edición rápida) */}
                    <div className="flex items-center gap-2" title="Cambiar orden">
                      <span className="text-xs text-slate-500 font-mono">#</span>
                      <input 
                        type="number" 
                        defaultValue={item.order}
                        onBlur={(e) => {
                          // Solo actualizar si cambió
                          if (parseInt(e.target.value) !== item.order) {
                            updateOrder(item.id, e.target.value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.target.blur();
                        }}
                        className="w-12 bg-slate-950 border border-slate-700 rounded px-1 py-0.5 text-xs text-center text-white focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div className="h-4 w-px bg-slate-800"></div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-300 truncate" title={item.title}>{item.title || "Sin título"}</p>
                      <p className="text-[10px] text-slate-600 truncate">ID: {item.id}</p>
                    </div>

                    {/* Botones Acción */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleVisibility(item.id, item.is_active)}
                        className={`p-1.5 rounded-md transition-colors ${item.is_active ? "text-slate-500 hover:text-white hover:bg-slate-800" : "text-red-400 hover:bg-red-900/20"}`}
                        title={item.is_active ? "Ocultar" : "Mostrar"}
                      >
                        {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-red-500 hover:bg-slate-800 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}