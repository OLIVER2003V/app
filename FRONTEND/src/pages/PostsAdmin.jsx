import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Search, 
  Plus, 
  FileText, 
  Image as ImageIcon, 
  Save, 
  Trash2, 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  Loader2,
  MoreHorizontal
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// --- HELPERS (Manteniendo tu lógica original) ---
function normalizeErrors(obj) {
  if (!obj || typeof obj !== "object") return "Error 400. Revisa los campos.";
  const parts = [];
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v)) parts.push(`${k}: ${v.join(" | ")}`);
    else if (typeof v === "object" && v !== null) {
      for (const [kk, vv] of Object.entries(v)) {
        parts.push(`${k}.${kk}: ${Array.isArray(vv) ? vv.join(" | ") : vv}`);
      }
    } else if (typeof v === "string") parts.push(`${k}: ${v}`);
  }
  return parts.length ? parts.join(" · ") : "Error 400. Revisa los campos.";
}

function toAbsolute(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.href;
  } catch {
    const base = BASE_URL?.replace(/\/+$/, "");
    const path = String(url).startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  }
}

function renameFileIfTooLong(file, maxLength = 100) {
  if (!file || file.name.length <= maxLength) return file;
  const fileName = file.name;
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return new File([file], fileName.substring(0, maxLength), { type: file.type });
  const extension = fileName.substring(lastDot);
  const baseName = fileName.substring(0, lastDot);
  const maxBaseNameLength = maxLength - extension.length;
  const truncatedBaseName = baseName.substring(0, maxBaseNameLength);
  return new File([file], truncatedBaseName + extension, { type: file.type });
}

// --- COMPONENTE PRINCIPAL ---
export default function PostsAdmin() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  // --- ESTADOS ---
  const [posts, setPosts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("create"); // 'create' | 'edit'

  // CREATE FORM
  const [createForm, setCreateForm] = useState({
    title: "", body: "", is_published: true, is_featured: false,
    place_id: "", cta_url: "", cta_label: "", cover_file: null,
  });
  const [createPreview, setCreatePreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [createErrs, setCreateErrs] = useState({});

  // EDIT FORM
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailMsg, setDetailMsg] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", body: "", is_published: true, is_featured: false,
    place_id: "", cta_url: "", cta_label: "", cover_file: null,
  });
  const [editPreview, setEditPreview] = useState(null);
  const [updatingPut, setUpdatingPut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editErrs, setEditErrs] = useState({});

  // --- MEMOS ---
  const authHeaders = useMemo(() => {
    const h = { "Content-Type": "application/json", Accept: "application/json" };
    if (token) h.Authorization = `Token ${token}`;
    return h;
  }, [token]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(
      (p) => String(p?.id).includes(term) || (p?.title || "").toLowerCase().includes(term)
    );
  }, [posts, q]);

  const validatePost = (obj) => {
    const e = {};
    if (!obj.title?.trim()) e.title = "El título es obligatorio.";
    if (!obj.body?.trim()) e.body = "El contenido no puede estar vacío.";
    if (obj.cta_url?.trim()) {
      try { new URL(obj.cta_url.trim()); } catch { e.cta_url = "URL inválida (debe incluir http:// o https://)"; }
    }
    return e;
  };

  const fileToPreview = (file) => (file ? URL.createObjectURL(file) : null);

  // Cleanups
  useEffect(() => () => { if (createPreview) URL.revokeObjectURL(createPreview); }, [createPreview]);
  useEffect(() => () => { if (editPreview) URL.revokeObjectURL(editPreview); }, [editPreview]);

  // --- API FETCH ---
  async function fetchList() {
    setLoadingList(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts/`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  }

  async function fetchDetail(id) {
    setLoadingDetail(true);
    setDetailMsg("");
    setMode("edit");
    setSelectedId(id);
    
    // Scroll to top on mobile mainly
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}/`);
      if (!res.ok) throw new Error("Not found");
      const data = await res.json();
      setDetail(data);
      setEditForm({
        title: data?.title || "",
        body: (data?.body ?? data?.content) || "",
        is_published: !!data?.is_published,
        is_featured: !!data?.is_featured,
        place_id: data?.place ?? "",
        cta_url: data?.cta_url || "",
        cta_label: data?.cta_label || "",
        cover_file: null,
      });
      setEditPreview(null);
    } catch {
      setDetailMsg("Error al cargar detalle");
    } finally {
      setLoadingDetail(false);
    }
  }

  function buildFormData(obj) {
    const fd = new FormData();
    fd.append("title", obj.title.trim());
    fd.append("body", obj.body.trim());
    fd.append("is_published", String(!!obj.is_published));
    fd.append("is_featured", String(!!obj.is_featured));
    if (obj.place_id) fd.append("place", String(obj.place_id));
    if (obj.cta_url?.trim()) fd.append("cta_url", obj.cta_url.trim());
    if (obj.cta_label?.trim()) fd.append("cta_label", obj.cta_label.trim());
    if (obj.cover_file) fd.append("cover", obj.cover_file);
    return fd;
  }

  function buildJsonPayload(obj) {
    return {
      title: obj.title.trim(),
      body: obj.body.trim(),
      is_published: !!obj.is_published,
      is_featured: !!obj.is_featured,
      ...(obj.place_id ? { place: Number(obj.place_id) } : {}),
      ...(obj.cta_url?.trim() ? { cta_url: obj.cta_url.trim() } : {}),
      ...(obj.cta_label?.trim() ? { cta_label: obj.cta_label.trim() } : {}),
    };
  }

  // --- ACTIONS ---
  const switchToCreate = () => {
    setMode("create");
    setSelectedId(null);
    setDetail(null);
    setCreateMsg("");
    setCreateErrs({});
    // Limpiar form
    setCreateForm({
        title: "", body: "", is_published: true, is_featured: false,
        place_id: "", cta_url: "", cta_label: "", cover_file: null,
    });
    setCreatePreview(null);
  };

  async function createPost() {
    setCreateMsg("");
    const errs = validatePost(createForm);
    setCreateErrs(errs);
    if (Object.keys(errs).length) return;

    setCreating(true);
    try {
      const hasFile = !!createForm.cover_file;
      const url = `${BASE_URL}/api/posts/`;
      let res;
      
      if (hasFile) {
        const fd = buildFormData(createForm);
        res = await fetch(url, { method: "POST", headers: { Authorization: `Token ${token}` }, body: fd });
      } else {
        res = await fetch(url, { method: "POST", headers: authHeaders, body: JSON.stringify(buildJsonPayload(createForm)) });
      }

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        setCreateMsg(typeof data === "string" ? data : normalizeErrors(data));
      } else {
        const createdPost = typeof data === "string" ? JSON.parse(data) : data;
        fetchList(); // Recargar lista
        fetchDetail(createdPost.id); // Ir a modo editar
      }
    } catch {
      setCreateMsg("Error de conexión.");
    } finally {
      setCreating(false);
    }
  }

  async function updatePost() {
    if (!selectedId) return;
    const errs = validatePost(editForm);
    setEditErrs(errs);
    if (Object.keys(errs).length) return;

    setUpdatingPut(true);
    setDetailMsg("");
    try {
      const hasFile = !!editForm.cover_file;
      const url = `${BASE_URL}/api/posts/${selectedId}/`;
      let res;

      if (hasFile) {
        const fd = buildFormData(editForm);
        res = await fetch(url, { method: "PUT", headers: { Authorization: `Token ${token}` }, body: fd });
      } else {
        res = await fetch(url, { method: "PUT", headers: authHeaders, body: JSON.stringify(buildJsonPayload(editForm)) });
      }

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        setDetailMsg(typeof data === "string" ? data : normalizeErrors(data));
      } else {
        setDetailMsg("✔ Cambios guardados correctamente.");
        setDetail(data);
        setEditPreview(null);
        fetchList();
      }
    } catch {
      setDetailMsg("Error de conexión.");
    } finally {
      setUpdatingPut(false);
    }
  }

  async function deletePost(id) {
    if (!window.confirm("¿Eliminar permanentemente este post?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (res.ok) {
        fetchList();
        switchToCreate();
      } else {
        alert("No se pudo eliminar.");
      }
    } catch {
      alert("Error de conexión.");
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => { fetchList(); }, []);

  // --- VARIABLES UI ---
  const isCreate = mode === "create";
  const currentForm = isCreate ? createForm : editForm;
  const currentSetForm = isCreate ? setCreateForm : setEditForm;
  const currentErrs = isCreate ? createErrs : editErrs;
  const currentPreview = isCreate ? createPreview : editPreview;
  const msg = isCreate ? createMsg : detailMsg;
  
  // Preview final (si hay nueva imagen, usa esa, si no, usa la del detalle)
  const displayCover = currentPreview || (!isCreate && toAbsolute(detail?.cover));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Fondo decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 md:px-6 pt-6 h-full flex flex-col">
        
        {/* --- Header --- */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Blog & Noticias</h1>
              <p className="text-slate-400 text-xs">Gestiona el contenido editorial.</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Link to="/posts" target="_blank" className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 text-sm transition-all">
                <ExternalLink className="h-4 w-4" /> Ver Blog Público
             </Link>
          </div>
        </header>

        {/* --- GRID LAYOUT (Master-Detail) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* --- IZQUIERDA: LISTA (4 cols) --- */}
          <div className="lg:col-span-4 flex flex-col gap-4 h-[calc(100vh-140px)] sticky top-24">
            
            {/* Toolbar Lista */}
            <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-4 rounded-xl flex flex-col gap-3 shadow-lg">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all" 
                    placeholder="Buscar post..." 
                    value={q} 
                    onChange={(e) => setQ(e.target.value)} 
                  />
                </div>
                <button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors" title="Crear Nuevo">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-2 pb-10">
              {loadingList ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
              ) : filtered.length === 0 ? (
                <div className="text-center text-slate-500 py-10 text-sm">No hay posts.</div>
              ) : (
                filtered.map((p) => (
                  <div 
                    key={p.id} 
                    onClick={() => fetchDetail(p.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all group flex gap-3 items-start
                      ${selectedId === p.id 
                        ? "bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-900"
                      }`}
                  >
                    {/* Miniatura */}
                    <div className="h-16 w-16 bg-slate-950 rounded-lg overflow-hidden flex-shrink-0 border border-slate-800">
                      {p.cover ? (
                        <img src={toAbsolute(p.cover)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-700"><ImageIcon className="h-6 w-6" /></div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold text-sm truncate ${selectedId === p.id ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                        {p.title || "Sin título"}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border 
                          ${p.is_published 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                          {p.is_published ? "Publicado" : "Borrador"}
                        </span>
                        {p.is_featured && (
                          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border bg-purple-500/10 text-purple-400 border-purple-500/20">
                            Hero
                          </span>
                        )}
                        <span className="text-[10px] text-slate-600 ml-auto">#{p.id}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* --- DERECHA: EDITOR (8 cols) --- */}
          <div className="lg:col-span-8 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-full min-h-[600px]">
            
            {/* Header Editor */}
            <div className="border-b border-slate-800 p-4 md:p-6 flex justify-between items-center bg-slate-900/80">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {isCreate ? <Plus className="h-5 w-5 text-indigo-400" /> : <FileText className="h-5 w-5 text-indigo-400" />}
                  {isCreate ? "Crear Nueva Publicación" : "Editando Publicación"}
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  {isCreate ? "Rellena los datos para añadir contenido." : `Modificando ID: ${detail?.id} • Creado: ${new Date(detail?.created_at).toLocaleDateString()}`}
                </p>
              </div>
              
              {!isCreate && (
                <button onClick={() => deletePost(selectedId)} disabled={deleting} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Eliminar">
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Mensajes Alerta */}
            {msg && (
              <div className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${msg.includes("✔") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {msg.includes("✔") ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {msg}
              </div>
            )}

            {/* Formulario Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Título */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Título del Post <span className="text-red-400">*</span></label>
                  <input 
                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${currentErrs.title ? "border-red-500" : "border-slate-700"}`}
                    placeholder="Escribe un título atractivo..."
                    value={currentForm.title}
                    onChange={(e) => currentSetForm({ ...currentForm, title: e.target.value })}
                  />
                  {currentErrs.title && <span className="text-xs text-red-400">{currentErrs.title}</span>}
                </div>

                {/* Layout: Portada + Opciones */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Columna Portada */}
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Imagen de Portada</label>
                    <div className="relative group aspect-[3/4] bg-slate-950 border-2 border-dashed border-slate-700 rounded-xl overflow-hidden hover:border-indigo-500 transition-colors">
                      {displayCover ? (
                        <>
                          <img src={displayCover} alt="Cover" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-xs font-bold">Cambiar Imagen</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                          <ImageIcon className="h-8 w-8 mb-2" />
                          <span className="text-xs">Click para subir</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          let file = e.target.files?.[0];
                          if (file) file = renameFileIfTooLong(file);
                          currentSetForm({ ...currentForm, cover_file: file });
                          if (currentPreview) URL.revokeObjectURL(currentPreview);
                          setCreatePreview(file ? URL.createObjectURL(file) : null);
                          if(!isCreate) setEditPreview(file ? URL.createObjectURL(file) : null);
                        }} 
                      />
                    </div>
                  </div>

                  {/* Columna Opciones */}
                  <div className="md:col-span-2 space-y-6">
                    
                    {/* Body */}
                    <div className="space-y-2 h-full flex flex-col">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contenido <span className="text-red-400">*</span></label>
                      <textarea 
                        className={`w-full flex-1 bg-slate-950 border rounded-xl px-4 py-3 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all min-h-[180px] ${currentErrs.body ? "border-red-500" : "border-slate-700"}`}
                        placeholder="Escribe el contenido de la publicación aquí..."
                        value={currentForm.body}
                        onChange={(e) => currentSetForm({ ...currentForm, body: e.target.value })}
                      />
                      {currentErrs.body && <span className="text-xs text-red-400">{currentErrs.body}</span>}
                    </div>

                  </div>
                </div>

                <div className="h-px bg-slate-800 my-6"></div>

                {/* Configuración Avanzada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Toggles */}
                  <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                        <MoreHorizontal className="h-4 w-4" /> Configuración
                    </h3>
                    
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Estado Publicado</span>
                      <div className={`w-11 h-6 flex items-center bg-slate-700 rounded-full p-1 transition-colors ${currentForm.is_published ? 'bg-emerald-600' : ''}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${currentForm.is_published ? 'translate-x-5' : ''}`}></div>
                        <input type="checkbox" className="hidden" checked={currentForm.is_published} onChange={(e) => currentSetForm({ ...currentForm, is_published: e.target.checked })} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Destacado (Hero)</span>
                      <div className={`w-11 h-6 flex items-center bg-slate-700 rounded-full p-1 transition-colors ${currentForm.is_featured ? 'bg-purple-600' : ''}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${currentForm.is_featured ? 'translate-x-5' : ''}`}></div>
                        <input type="checkbox" className="hidden" checked={currentForm.is_featured} onChange={(e) => currentSetForm({ ...currentForm, is_featured: e.target.checked })} />
                      </div>
                    </label>

                    <div className="pt-2">
                        <span className="text-xs text-slate-500 block mb-1">Asociar Lugar (ID)</span>
                        <input 
                            type="number" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 outline-none"
                            placeholder="Ej. 5"
                            value={currentForm.place_id}
                            onChange={(e) => currentSetForm({ ...currentForm, place_id: e.target.value })}
                        />
                    </div>
                  </div>

                  {/* Call To Action */}
                  <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-2">Botón de Acción (CTA)</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Texto del botón</label>
                            <input 
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                                placeholder="Ej. Reservar ahora"
                                value={currentForm.cta_label}
                                onChange={(e) => currentSetForm({ ...currentForm, cta_label: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 block mb-1">Enlace (URL)</label>
                            <input 
                                className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none ${currentErrs.cta_url ? "border-red-500" : ""}`}
                                placeholder="https://..."
                                value={currentForm.cta_url}
                                onChange={(e) => currentSetForm({ ...currentForm, cta_url: e.target.value })}
                            />
                            {currentErrs.cta_url && <span className="text-xs text-red-400">{currentErrs.cta_url}</span>}
                        </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Footer Acciones */}
            <div className="border-t border-slate-800 p-4 bg-slate-900/80 flex justify-end gap-3">
                {isCreate ? (
                    <button 
                        onClick={createPost} 
                        disabled={creating}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                    >
                        {creating ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                        Crear Publicación
                    </button>
                ) : (
                    <button 
                        onClick={updatePost} 
                        disabled={updatingPut}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                        {updatingPut ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                        Guardar Cambios
                    </button>
                )}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}