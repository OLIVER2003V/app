import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  FileText, 
  LayoutTemplate, 
  Eye, 
  EyeOff, 
  AlertCircle,
  CheckCircle
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function CreatePost() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // --- ESTADOS ---
  const [form, setForm] = useState({
    title: "",
    body: "", // Ojo: Tu backend usa 'body', el front anterior usaba 'content'. Lo unificamos a 'body'.
    is_published: true,
  });
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});
  const [serverMsg, setServerMsg] = useState(null);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Limpiar error al escribir
    if (errs[name]) setErrs((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrs = {};
    if (!form.title.trim()) newErrs.title = "El título es obligatorio.";
    if (!form.body.trim()) newErrs.body = "El contenido no puede estar vacío.";
    return newErrs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg(null);
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrs(validationErrors);
      return;
    }

    if (!token) {
      setServerMsg({ type: "error", text: "Sesión expirada. Por favor inicia sesión nuevamente." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401) throw new Error("No autorizado.");
        if (res.status === 403) throw new Error("Permisos insuficientes.");
        
        // Manejo de errores de DRF
        const errorDetail = data.detail || Object.values(data).flat().join(" ") || "Error al guardar.";
        throw new Error(errorDetail);
      }

      // Éxito
      setServerMsg({ type: "success", text: "¡Publicación creada con éxito!" });
      
      // Redirigir después de un breve delay para que el usuario vea el éxito
      setTimeout(() => {
        // Si tu backend devuelve el objeto creado, úsalo para redirigir
        // Asumimos que devuelve { id: 123, ... }
        if (data.id) {
            // Puedes redirigir al admin de posts o al detalle público
            navigate(`/admin/posts`); 
        } else {
            navigate("/admin/posts");
        }
      }, 1500);

    } catch (err) {
      setServerMsg({ type: "error", text: err.message || "Error de conexión con el servidor." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Fondo Decorativo (Coherente con el Dashboard) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/posts" 
              className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Nueva Publicación</h1>
              <p className="text-slate-400 text-xs">Redacta y publica contenido para el blog.</p>
            </div>
          </div>
        </header>

        {/* --- CONTENIDO PRINCIPAL (Grid) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-2xl">
            
            {/* Mensajes del Servidor */}
            {serverMsg && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${
                serverMsg.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                {serverMsg.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <p className="text-sm font-medium">{serverMsg.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Título */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <LayoutTemplate className="h-4 w-4 text-cyan-500" /> Título
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-lg font-semibold text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${errs.title ? "border-red-500" : "border-slate-700"}`}
                  placeholder="Ej. Los 5 mejores miradores..."
                  autoFocus
                />
                {errs.title && <span className="text-xs text-red-400 font-medium">{errs.title}</span>}
              </div>

              {/* Contenido */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="h-4 w-4 text-cyan-500" /> Contenido
                </label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleChange}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all min-h-[300px] resize-y ${errs.body ? "border-red-500" : "border-slate-700"}`}
                  placeholder="Escribe aquí el contenido de tu artículo..."
                />
                {errs.body && <span className="text-xs text-red-400 font-medium">{errs.body}</span>}
              </div>

              {/* Estado (Toggle) */}
              <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.is_published ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-500"}`}>
                    {form.is_published ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Visibilidad</p>
                    <p className="text-xs text-slate-400">{form.is_published ? "Público inmediatamente" : "Guardar como borrador"}</p>
                  </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="is_published" 
                    checked={form.is_published} 
                    onChange={handleChange} 
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Botones Acción */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  {loading ? "Guardando..." : "Publicar Artículo"}
                </button>
              </div>

            </form>
          </div>

          {/* COLUMNA DERECHA: PREVIEW EN VIVO */}
          <div className="hidden lg:block space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Vista Previa</h3>
            
            {/* Tarjeta Preview (Simula cómo se verá en la lista) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="h-48 bg-slate-950 flex items-center justify-center border-b border-slate-800 relative">
                 <span className="text-slate-600 text-sm flex items-col gap-2 items-center">
                    <div className="bg-slate-800 p-3 rounded-full"><Eye className="h-6 w-6 opacity-50" /></div>
                    (Imagen de portada)
                 </span>
                 {/* Badge Estado */}
                 <div className={`absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-bold uppercase border ${form.is_published ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                    {form.is_published ? "Publicado" : "Borrador"}
                 </div>
              </div>
              <div className="p-5">
                <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {form.title || <span className="text-slate-600 italic">Sin título...</span>}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                  {form.body || <span className="text-slate-600 italic">El contenido aparecerá aquí...</span>}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-xs text-slate-500">Hace un momento</span>
                    <span className="text-xs font-medium text-cyan-400">Leer más →</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                <p>💡 <strong>Tip Pro:</strong> Usa títulos cortos y atractivos para mejorar el SEO y la legibilidad en móviles.</p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}