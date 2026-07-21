import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errorMessage";
import {
  Image as ImageIcon,
  Trash2,
  Eye,
  EyeOff,
  UploadCloud,
  ArrowLeft,
  Loader2,
  Save,
  RefreshCw,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Replace,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB, igual que el límite del backend
const ACCEPTED_TYPES = "image/*,video/mp4,video/webm,video/quicktime";

function validateFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    return `El archivo supera el máximo permitido (${MAX_FILE_SIZE / (1024 * 1024)}MB).`;
  }
  return null;
}

function formatSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Aviso flotante (reemplaza los alert() nativos) ---
  const [toast, setToast] = useState(null); // { type: 'error' | 'success', message }
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  // --- Formulario de subida ---
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  // --- Reemplazar archivo de un ítem existente (con confirmación) ---
  const [replaceCandidate, setReplaceCandidate] = useState(null); // { item, file }
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceProgress, setReplaceProgress] = useState(0);
  const replaceInputRef = useRef(null);
  const replaceTargetRef = useRef(null);

  // --- Reordenar (drag & drop en desktop, flechas en cualquier dispositivo) ---
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  // --- Confirmar borrado ---
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get("gallery/");
      setItems(res.data.results || res.data || []);
    } catch (err) {
      console.error("Error cargando galería:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGallery(); }, []);

  // --- Selección de archivo (form de subida) ---
  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const error = validateFile(selected);
    if (error) {
      setUploadError(error);
      e.target.value = "";
      return;
    }

    setUploadError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const fd = new FormData();
    fd.append("title", title);
    fd.append("order", items.length); // siempre se agrega al final
    fd.append("is_active", isActive);
    fd.append("media_file", file);

    try {
      await api.post("gallery/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setUploadProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setFile(null);
      setPreview(null);
      setTitle("");
      fetchGallery();
      showToast("success", "Contenido subido correctamente.");
    } catch (err) {
      setUploadError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // --- Visibilidad ---
  const toggleVisibility = async (id, currentStatus) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_active: !currentStatus } : i));
    try {
      await api.patch(`gallery/${id}/`, { is_active: !currentStatus });
    } catch {
      fetchGallery();
    }
  };

  // --- Borrado con confirmación propia ---
  const confirmDeleteNow = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete.id;
    setDeletingId(id);
    try {
      await api.delete(`gallery/${id}/`);
      setItems(prev => prev.filter(i => i.id !== id));
      showToast("success", "Elemento eliminado.");
    } catch (err) {
      showToast("error", getErrorMessage(err));
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  // --- Reemplazar archivo de un ítem existente ---
  const openReplace = (item) => {
    replaceTargetRef.current = item;
    replaceInputRef.current?.click();
  };

  // Al elegir el archivo nuevo, no se sube de inmediato: se pide confirmación
  const handleReplaceFileSelected = (e) => {
    const selected = e.target.files?.[0];
    const item = replaceTargetRef.current;
    e.target.value = "";
    if (!selected || !item) return;

    const error = validateFile(selected);
    if (error) {
      showToast("error", error);
      return;
    }
    setReplaceCandidate({ item, file: selected });
  };

  const cancelReplace = () => {
    if (isReplacing) return;
    setReplaceCandidate(null);
  };

  const confirmReplaceNow = async () => {
    if (!replaceCandidate) return;
    const { item, file: newFile } = replaceCandidate;

    setIsReplacing(true);
    setReplaceProgress(0);

    const fd = new FormData();
    fd.append("media_file", newFile);

    try {
      const { data } = await api.patch(`gallery/${item.id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) setReplaceProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });
      setItems(prev => prev.map(i => i.id === item.id ? data : i));
      setReplaceCandidate(null);
      showToast("success", "Archivo reemplazado correctamente.");
    } catch (err) {
      showToast("error", getErrorMessage(err));
    } finally {
      setIsReplacing(false);
      setReplaceProgress(0);
    }
  };

  // --- Persistir un nuevo orden (usado por drag & drop y por las flechas) ---
  const persistReorder = async (reorderedItems) => {
    const withNewOrder = reorderedItems.map((item, idx) => ({ ...item, order: idx }));
    const changed = withNewOrder.filter((item) => {
      const before = items.find(i => i.id === item.id);
      return before && before.order !== item.order;
    });

    setItems(withNewOrder);

    try {
      await Promise.all(changed.map(item => api.patch(`gallery/${item.id}/`, { order: item.order })));
    } catch {
      fetchGallery();
    }
  };

  const handleDrop = (targetId) => {
    setDragOverId(null);
    if (draggingId === null || draggingId === targetId) { setDraggingId(null); return; }

    const fromIndex = items.findIndex(i => i.id === draggingId);
    const toIndex = items.findIndex(i => i.id === targetId);
    setDraggingId(null);
    if (fromIndex === -1 || toIndex === -1) return;

    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    persistReorder(reordered);
  };

  // Alternativa que funciona en cualquier dispositivo (celular, teclado, mouse):
  // el arrastre nativo del navegador no responde al tacto en móviles.
  const moveItem = (id, direction) => {
    const index = items.findIndex(i => i.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const reordered = [...items];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    persistReorder(reordered);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-x-hidden">

      {/* Fondo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-950/20 to-transparent"></div>
      </div>

      <input
        ref={replaceInputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_TYPES}
        onChange={handleReplaceFileSelected}
      />

      {/* Aviso flotante */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[70] max-w-[90vw] px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-2
            ${toast.type === "error" ? "bg-red-950/95 border-red-500/30 text-red-200" : "bg-emerald-950/95 border-emerald-500/30 text-emerald-200"}`}
        >
          {toast.type === "error" ? <AlertTriangle className="h-4 w-4 shrink-0" /> : <CheckCircle2 className="h-4 w-4 shrink-0" />}
          <span className="break-words">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-1 opacity-60 hover:opacity-100 shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" aria-label="Volver al panel" title="Volver al panel" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Galería Multimedia</h1>
              <p className="text-slate-400 text-sm">Imágenes y videos del carrusel de inicio</p>
            </div>
          </div>
          <button onClick={fetchGallery} className="p-2 text-cyan-400 hover:bg-cyan-950/30 rounded-lg transition-colors" title="Recargar" aria-label="Recargar galería">
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
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs leading-relaxed break-words">
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
                  accept={ACCEPTED_TYPES}
                  disabled={isUploading}
                  aria-label="Seleccionar imagen o video para subir"
                />

                {preview ? (
                  file?.type.startsWith("video") ? (
                    <video src={preview} className="w-full h-full object-cover" autoPlay muted loop />
                  ) : (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 px-4 text-center">
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-xs font-medium">Click para seleccionar</span>
                    <span className="text-[10px] opacity-60 mt-1">JPG, PNG, WEBP, MP4, WEBM · máx. 50MB</span>
                  </div>
                )}

                {file && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center">
                    <p className="text-xs text-white truncate px-2">{file.name}</p>
                    <p className="text-[10px] text-slate-300">{formatSize(file.size)}</p>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
                    <div className="w-2/3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-xs text-slate-300">{uploadProgress}%</span>
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
                    disabled={isUploading}
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="accent-orange-500 w-4 h-4"
                    disabled={isUploading}
                  />
                  <span className="text-xs text-slate-300 select-none">Visible en el sitio</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="mt-2 w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                {isUploading ? `Subiendo... ${uploadProgress}%` : "Guardar"}
              </button>
            </form>
          </div>

          {/* === COLUMNA DERECHA: GRID === */}
          <div>
            {items.length > 1 && (
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1.5">
                <GripVertical className="h-3.5 w-3.5" /> Arrastra una tarjeta o usa las flechas ↑↓ para cambiar su orden de aparición.
              </p>
            )}

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
                  <p className="text-xs mt-1">Sube tu primera imagen o video desde el panel de la izquierda.</p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    onDragOver={(e) => { e.preventDefault(); if (dragOverId !== item.id) setDragOverId(item.id); }}
                    onDragLeave={() => setDragOverId(prev => (prev === item.id ? null : prev))}
                    onDrop={() => handleDrop(item.id)}
                    onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                    className={`group relative bg-slate-900 border rounded-xl overflow-hidden transition-all duration-200 cursor-grab active:cursor-grabbing
                      ${item.is_active ? "border-slate-800 hover:border-slate-600" : "border-red-900/30 opacity-75"}
                      ${draggingId === item.id ? "opacity-40" : ""}
                      ${dragOverId === item.id && draggingId !== item.id ? "ring-2 ring-orange-500/70" : ""}`}
                  >

                    {/* --- AREA VISUAL (IMAGEN O VIDEO) --- */}
                    <div className="aspect-video w-full bg-black relative">
                      {item.media_type === "VIDEO" ? (
                        <video
                          src={item.media_file}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.media_file}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}

                      {/* Handle de arrastre (solo visual, decorativo en touch) */}
                      <div className="absolute top-2 left-2 p-1 rounded-md bg-black/50 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="h-4 w-4" />
                      </div>

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
                    <div className="p-3 bg-slate-900 flex items-center justify-between gap-2">

                      {/* Orden: funciona con mouse, teclado y touch en cualquier dispositivo */}
                      <div className="flex flex-col">
                        <button
                          onClick={() => moveItem(item.id, "up")}
                          disabled={idx === 0}
                          className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Subir"
                          aria-label={`Subir ${item.title || "elemento"} en el orden`}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(item.id, "down")}
                          disabled={idx === items.length - 1}
                          className="p-0.5 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                          title="Bajar"
                          aria-label={`Bajar ${item.title || "elemento"} en el orden`}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <p className="text-xs font-medium text-slate-300 truncate flex-1" title={item.title}>
                        {item.title || "Sin título"}
                      </p>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openReplace(item)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-orange-400 hover:bg-slate-800 transition-colors"
                          title="Reemplazar archivo"
                          aria-label={`Reemplazar archivo de ${item.title || "elemento"}`}
                        >
                          <Replace className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleVisibility(item.id, item.is_active)}
                          className={`p-1.5 rounded-md transition-colors ${item.is_active ? "text-slate-500 hover:text-white hover:bg-slate-800" : "text-red-400 hover:bg-red-900/20"}`}
                          title={item.is_active ? "Ocultar" : "Mostrar"}
                          aria-label={item.is_active ? `Ocultar ${item.title || "elemento"}` : `Mostrar ${item.title || "elemento"}`}
                        >
                          {item.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(item)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-red-500 hover:bg-slate-800 transition-colors"
                          title="Eliminar"
                          aria-label={`Eliminar ${item.title || "elemento"}`}
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

      {/* Modal de confirmación de borrado */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Eliminar contenido</h3>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              ¿Eliminar <span className="text-slate-200 font-medium">"{confirmDelete.title || "este elemento"}"</span> permanentemente? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteNow}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? <Loader2 className="animate-spin h-5 w-5" /> : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de reemplazo */}
      {replaceCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={cancelReplace}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Replace className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Reemplazar archivo</h3>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              Vas a reemplazar el contenido de{" "}
              <span className="text-slate-200 font-medium">"{replaceCandidate.item.title || "este elemento"}"</span> por:
            </p>
            <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 mb-6">
              <p className="text-xs text-white truncate">{replaceCandidate.file.name}</p>
              <p className="text-[10px] text-slate-500">{formatSize(replaceCandidate.file.size)}</p>
            </div>

            {isReplacing && (
              <div className="mb-4">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${replaceProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-500 mt-1 text-center">Subiendo... {replaceProgress}%</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelReplace}
                disabled={isReplacing}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmReplaceNow}
                disabled={isReplacing}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isReplacing ? <Loader2 className="animate-spin h-5 w-5" /> : "Reemplazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
