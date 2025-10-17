import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsAdmin.css";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/** Normaliza errores DRF en un texto legible */
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

/** Convierte URL relativa (/media/...) a absoluta, o devuelve la absoluta tal cual */
function toAbsolute(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    return u.href; // ya es absoluta
  } catch {
    const base = BASE_URL?.replace(/\/+$/, "");
    const path = String(url).startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  }
}

/**
 * Revisa si el nombre de un archivo excede el límite. Si es así, lo acorta
 * y devuelve un nuevo objeto File con el nombre corregido.
 * @param {File} file - El archivo original.
 * @param {number} maxLength - El largo máximo permitido para el nombre.
 * @returns {File} - El archivo original o uno nuevo con el nombre acortado.
 */
function renameFileIfTooLong(file, maxLength = 100) {
  if (!file || file.name.length <= maxLength) {
    return file; // No es necesario cambiar nada
  }

  console.warn(`Filename "${file.name}" is too long. Shortening it.`);

  const fileName = file.name;
  const lastDot = fileName.lastIndexOf('.');
  
  if (lastDot === -1) {
    return new File([file], fileName.substring(0, maxLength), { type: file.type });
  }

  const extension = fileName.substring(lastDot); // .jpg, .png, etc.
  const baseName = fileName.substring(0, lastDot);
  
  const maxBaseNameLength = maxLength - extension.length;
  const truncatedBaseName = baseName.substring(0, maxBaseNameLength);
  
  const newName = truncatedBaseName + extension;

  return new File([file], newName, { type: file.type });
}

export default function PostsAdmin() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");

  // ------- LISTADO -------
  const [posts, setPosts] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [q, setQ] = useState("");

  // ------- CREAR -------
  const [createForm, setCreateForm] = useState({
    title: "",
    body: "",
    is_published: true,
    is_featured: false,
    place_id: "",
    cta_url: "",
    cta_label: "",
    cover_file: null,
  });
  const [createPreview, setCreatePreview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState("");
  const [createErrs, setCreateErrs] = useState({});

  // ------- DETALLE/EDITAR -------
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailMsg, setDetailMsg] = useState("");
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    body: "",
    is_published: true,
    is_featured: false,
    place_id: "",
    cta_url: "",
    cta_label: "",
    cover_file: null,
  });
  const [editPreview, setEditPreview] = useState(null);
  const [updatingPut, setUpdatingPut] = useState(false);
  const [updatingPatch, setUpdatingPatch] = useState(false);
  const [editErrs, setEditErrs] = useState({});
  const [deleting, setDeleting] = useState(false);

  // ------------------ HELPERS ------------------
  const authHeaders = useMemo(() => {
    const h = { "Content-Type": "application/json", Accept: "application/json" };
    if (token) h.Authorization = `Token ${token}`;
    return h;
  }, [token]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(
      (p) =>
        String(p?.id).includes(term) ||
        (p?.title || "").toLowerCase().includes(term) ||
        (p?.body || p?.content || "").toLowerCase?.()?.includes?.(term)
    );
  }, [posts, q]);

  const validatePost = (obj) => {
    const e = {};
    if (!obj.title?.trim()) e.title = "Título requerido";
    if (!obj.body?.trim()) e.body = "Contenido requerido";
    if (obj.cta_url?.trim()) {
      try { new URL(obj.cta_url.trim()); } catch { e.cta_url = "URL inválida"; }
    }
    if (obj.place_id && Number(obj.place_id) <= 0) e.place_id = "ID inválido";
    return e;
  };

  const fileToPreview = (file) => (file ? URL.createObjectURL(file) : null);

  // Limpieza de object URLs
  useEffect(() => () => { if (createPreview) URL.revokeObjectURL(createPreview); }, [createPreview]);
  useEffect(() => () => { if (editPreview) URL.revokeObjectURL(editPreview); }, [editPreview]);

  // ------------------ API CALLS ------------------
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
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}/`);
      if (!res.ok) {
        setDetail(null);
        setDetailMsg(`No encontrado (${res.status})`);
        return;
      }
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

  async function createPost() {
    setCreateMsg("");
    const errs = validatePost(createForm);
    setCreateErrs(errs);
    if (Object.keys(errs).length) return;
    if (!token) { setCreateMsg("No hay token. Inicia sesión (admin/editor)."); return; }

    setCreating(true);
    try {
      const hasFile = !!createForm.cover_file;
      const url = `${BASE_URL}/api/posts/`;

      let res;
      if (hasFile) {
        const fd = buildFormData(createForm);
        res = await fetch(url, { method: "POST", headers: { Authorization: `Token ${token}` }, body: fd });
      } else {
        const payload = buildJsonPayload(createForm);
        res = await fetch(url, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify(payload),
        });
      }

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }

      if (res.status === 401) return setCreateMsg("401: No autorizado.");
      if (res.status === 403) return setCreateMsg("403: Requiere rol admin/editor.");
      if (!res.ok) {
        console.warn("POST /api/posts/ ->", data);
        const message = typeof data === "string" ? data : normalizeErrors(data);
        return setCreateMsg(message);
      }

      setCreateMsg("✔ Publicación creada");
      const createdPost = typeof data === "string" ? JSON.parse(data) : data;

      setCreateForm({
        title: "", body: "", is_published: true, is_featured: false,
        place_id: "", cta_url: "", cta_label: "", cover_file: null,
      });
      if (createPreview) URL.revokeObjectURL(createPreview);
      setCreatePreview(null);
      setSelectedId(createdPost.id);
      setDetail(createdPost);
      fetchList();
    } catch {
      setCreateMsg("Error de red/servidor");
    } finally {
      setCreating(false);
    }
  }

  async function updatePostPut() {
    if (!selectedId) return setDetailMsg("Selecciona un post.");
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
        const payload = buildJsonPayload(editForm);
        res = await fetch(url, { method: "PUT", headers: authHeaders, body: JSON.stringify(payload) });
      }

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        console.warn("PUT /api/posts/{id}/ ->", data);
        const msg = typeof data === "string" ? data : normalizeErrors(data);
        setDetailMsg(`PUT ${res.status}: ${msg}`);
      } else {
        setDetail(typeof data === "string" ? JSON.parse(data) : data);
        setDetailMsg("✔ Actualizado (PUT)");
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(null);
        fetchList();
      }
    } catch {
      setDetailMsg("Error de red/servidor");
    } finally {
      setUpdatingPut(false);
    }
  }

  async function updatePostPatch(partial = {}) {
    if (!selectedId) return setDetailMsg("Selecciona un post.");
    setUpdatingPatch(true);
    setDetailMsg("");

    try {
      const hasFile = !!editForm.cover_file;
      const url = `${BASE_URL}/api/posts/${selectedId}/`;

      let res;
      if (hasFile) {
        const fd = new FormData();
        if (editForm.title?.trim()) fd.append("title", editForm.title.trim());
        if (editForm.body?.trim()) fd.append("body", editForm.body.trim());
        fd.append("is_published", String(!!editForm.is_published));
        fd.append("is_featured", String(!!editForm.is_featured));
        if (editForm.place_id) fd.append("place", String(editForm.place_id));
        if (editForm.cta_url?.trim()) fd.append("cta_url", editForm.cta_url.trim());
        if (editForm.cta_label?.trim()) fd.append("cta_label", editForm.cta_label.trim());
        fd.append("cover", editForm.cover_file);
        res = await fetch(url, { method: "PATCH", headers: { Authorization: `Token ${token}` }, body: fd });
      } else {
        const patchObj = Object.keys(partial).length > 0 ? partial : {
            ...(editForm.title?.trim() ? { title: editForm.title.trim() } : {}),
            ...(editForm.body?.trim() ? { body: editForm.body.trim() } : {}),
            ...(typeof editForm.is_published === "boolean" ? { is_published: !!editForm.is_published } : {}),
            ...(typeof editForm.is_featured === "boolean" ? { is_featured: !!editForm.is_featured } : {}),
            ...(editForm.place_id ? { place: Number(editForm.place_id) } : {}),
            ...(editForm.cta_url?.trim() ? { cta_url: editForm.cta_url.trim() } : {}),
            ...(editForm.cta_label?.trim() ? { cta_label: editForm.cta_label.trim() } : {}),
        };
        res = await fetch(url, { method: "PATCH", headers: authHeaders, body: JSON.stringify(patchObj) });
      }

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        console.warn("PATCH /api/posts/{id}/ ->", data);
        const msg = typeof data === "string" ? data : normalizeErrors(data);
        setDetailMsg(`PATCH ${res.status}: ${msg}`);
      } else {
        setDetail(typeof data === "string" ? JSON.parse(data) : data);
        setDetailMsg("✔ Actualizado (PATCH)");
        if (editPreview) URL.revokeObjectURL(editPreview);
        setEditPreview(null);
        fetchList();
      }
    } catch {
      setDetailMsg("Error de red/servidor");
    } finally {
      setUpdatingPatch(false);
    }
  }

  async function deletePost(id) {
    if (!window.confirm(`¿Seguro que quieres eliminar el post #${id}? Esta acción no se puede deshacer.`)) {
      return;
    }
    setDeleting(true);
    setDetailMsg("");
    try {
      const res = await fetch(`${BASE_URL}/api/posts/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Token ${token}` },
      });
      if (res.status === 204) {
        setDetailMsg("✔ Post eliminado correctamente.");
        setDetail(null);
        setSelectedId(null);
        fetchList();
      } else if (res.status === 404) {
        setDetailMsg("Error: El post no fue encontrado.");
      } else if (res.status === 403) {
        setDetailMsg("Error: No tienes permiso para eliminar este post.");
      } else {
        const data = await res.json().catch(() => ({ detail: "Error desconocido" }));
        const msg = normalizeErrors(data);
        setDetailMsg(`Error ${res.status}: ${msg}`);
      }
    } catch (err) {
      setDetailMsg("Error de red o servidor al intentar eliminar.");
      console.error("Delete failed:", err);
    } finally {
      setDeleting(false);
    }
  }

  // ------------------ EFFECTS ------------------
  useEffect(() => { fetchList(); }, []);

  // ------------------ UI ------------------
  const coverSrc = toAbsolute(detail?.cover);

  return (
    <div className="pa-container">
      <header className="pa-head">
        <div><h1 className="pa-title">Administración de Posts</h1></div>
        <div className="pa-toolbar">
          <button className="pa-btn pa-btn--ghost" onClick={fetchList}>🔄 Recargar</button>
          <button className="pa-btn pa-btn--ghost" onClick={() => nav("/posts")}>📚 Ver público</button>
        </div>
      </header>
      <div className="pa-grid">
        <section className="pa-card pa-col-left" aria-label="Listado de posts">
          <div className="pa-card__header">
            <h2 className="pa-card__title">Listar posts</h2>
            <input className="pa-input" placeholder="Buscar por id/título/contenido…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="pa-list">
            {loadingList ? <div className="pa-empty">Cargando…</div> : filtered.length === 0 ? <div className="pa-empty">Sin resultados</div> : (
              filtered.map((p) => {
                const thumb = toAbsolute(p.cover);
                return (
                  <button key={p.id} className={`pa-listitem ${selectedId === p.id ? "is-active" : ""}`} onClick={() => { setSelectedId(p.id); fetchDetail(p.id); }} title={`Abrir detalle #${p.id}`}>
                    <div className="pa-listitem__title">
                      {thumb && <img className="pa-thumb" src={thumb} alt="" />}
                      <span className="pa-badge">#{p.id}</span> {p.title || "(sin título)"}
                    </div>
                    <div className="pa-listitem__meta">{p.is_published ? "Publicado" : "Borrador"}</div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section className="pa-card pa-col-right" aria-label="Crear post">
          <h2 className="pa-card__title">Crear post</h2>
          {createMsg && <div className="pa-alert">{createMsg}</div>}
          <div className="pa-field">
            <label>Título *</label>
            <input className={`pa-input ${createErrs.title ? "has-error" : ""}`} value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Ej. Ruta corta al mirador" />
            {createErrs.title && <div className="pa-error">{createErrs.title}</div>}
          </div>
          <div className="pa-field">
            <label>Contenido *</label>
            <textarea className={`pa-textarea ${createErrs.body ? "has-error" : ""}`} value={createForm.body} onChange={(e) => setCreateForm({ ...createForm, body: e.target.value })} placeholder="Contenido de la publicación…" rows={6} />
            {createErrs.body && <div className="pa-error">{createErrs.body}</div>}
          </div>
          <div className="pa-row">
            <label className="pa-check"><input type="checkbox" checked={createForm.is_published} onChange={(e) => setCreateForm({ ...createForm, is_published: e.target.checked })} /> Publicar inmediatamente</label>
            <label className="pa-check"><input type="checkbox" checked={createForm.is_featured} onChange={(e) => setCreateForm({ ...createForm, is_featured: e.target.checked })} /> Destacado (hero)</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input className={`pa-input ${createErrs.place_id ? "has-error" : ""}`} type="number" min="1" placeholder="ID Place (opcional)" value={createForm.place_id} onChange={(e) => setCreateForm({ ...createForm, place_id: e.target.value })} style={{ maxWidth: 180 }} />
            </div>
          </div>
          {createErrs.place_id && <div className="pa-error">{createErrs.place_id}</div>}
          <div className="pa-field">
            <label>CTA URL (opcional)</label>
            <input className={`pa-input ${createErrs.cta_url ? "has-error" : ""}`} value={createForm.cta_url} onChange={(e) => setCreateForm({ ...createForm, cta_url: e.target.value })} placeholder="https://tu-enlace.com" />
            {createErrs.cta_url && <div className="pa-error">{createErrs.cta_url}</div>}
          </div>
          <div className="pa-field">
            <label>CTA Label (opcional)</label>
            <input className="pa-input" value={createForm.cta_label} onChange={(e) => setCreateForm({ ...createForm, cta_label: e.target.value })} placeholder='Ej. "Reservar"' />
          </div>
          <div className="pa-field">
            <label>Portada (imagen)</label>
            <input type="file" accept="image/*" onChange={(e) => {
                let file = e.target.files?.[0] || null;
                if (file) {
                  file = renameFileIfTooLong(file);
                }
                setCreateForm({ ...createForm, cover_file: file });
                if (createPreview) URL.revokeObjectURL(createPreview);
                setCreatePreview(fileToPreview(file));
            }} />
            {createPreview && <div style={{ marginTop: 8 }}><img src={createPreview} alt="preview" style={{ maxWidth: 240, borderRadius: 10 }} /></div>}
          </div>
          <div className="pa-actions">
            <button className="pa-btn pa-btn--primary" disabled={creating} onClick={createPost}>{creating ? "Guardando…" : "Crear post"}</button>
          </div>
        </section>

        <section className="pa-card pa-col-full" aria-label="Detalle y edición">
          <div className="pa-card__header">
            <h2 className="pa-card__title">Detalle post</h2>
            <div className="pa-idpick">
              <input className="pa-input" type="number" min="1" placeholder="ID" value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)} />
              <button className="pa-btn pa-btn--ghost" onClick={() => selectedId && fetchDetail(selectedId)}>Abrir</button>
            </div>
          </div>
          {detailMsg && <div className="pa-alert">{detailMsg}</div>}
          {loadingDetail ? <div className="pa-empty">Cargando detalle…</div> : !detail ? <div className="pa-empty">Selecciona un post del listado o ingresa un ID.</div> : (
            <>
              <div className="pa-detail">
                <div><strong>ID:</strong> {detail.id}</div>
                <div><strong>Título:</strong> {detail.title}</div>
                <div><strong>Estado:</strong> {detail.is_published ? "Publicado" : "Borrador"}</div>
              </div>
              {coverSrc && <div style={{ marginBottom: 10 }}><div style={{ color: "var(--pa-muted)", marginBottom: 6 }}>Portada actual</div><img src={coverSrc} alt="Cover" style={{ maxWidth: 320, borderRadius: 12 }} /></div>}
              <div className="pa-split">
                <div className="pa-field">
                  <label>Título</label>
                  <input className={`pa-input ${editErrs.title ? "has-error" : ""}`} value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                  {editErrs.title && <div className="pa-error">{editErrs.title}</div>}
                </div>
                <div className="pa-field">
                  <label>Contenido</label>
                  <textarea className={`pa-textarea ${editErrs.body ? "has-error" : ""}`} value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} rows={5} />
                  {editErrs.body && <div className="pa-error">{editErrs.body}</div>}
                </div>
                <div className="pa-row">
                  <label className="pa-check"><input type="checkbox" checked={editForm.is_published} onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })} /> Publicado</label>
                  <label className="pa-check"><input type="checkbox" checked={editForm.is_featured} onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })} /> Destacado (hero)</label>
                  <input className={`pa-input ${editErrs.place_id ? "has-error" : ""}`} type="number" min="1" placeholder="ID Place (opcional)" value={editForm.place_id} onChange={(e) => setEditForm({ ...editForm, place_id: e.target.value })} style={{ maxWidth: 180 }} />
                </div>
                {editErrs.place_id && <div className="pa-error">{editErrs.place_id}</div>}
                <div className="pa-field">
                  <label>CTA URL (opcional)</label>
                  <input className={`pa-input ${editErrs.cta_url ? "has-error" : ""}`} value={editForm.cta_url} onChange={(e) => setEditForm({ ...editForm, cta_url: e.target.value })} placeholder="https://tu-enlace.com" />
                  {editErrs.cta_url && <div className="pa-error">{editErrs.cta_url}</div>}
                </div>
                <div className="pa-field">
                  <label>CTA Label (opcional)</label>
                  <input className="pa-input" value={editForm.cta_label} onChange={(e) => setEditForm({ ...editForm, cta_label: e.target.value })} placeholder='Ej. "Reservar"' />
                </div>
                <div className="pa-field">
                  <label>Reemplazar portada</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                      let file = e.target.files?.[0] || null;
                      if (file) {
                        file = renameFileIfTooLong(file);
                      }
                      setEditForm({ ...editForm, cover_file: file });
                      if (editPreview) URL.revokeObjectURL(editPreview);
                      setEditPreview(fileToPreview(file));
                  }} />
                  {editPreview && <div style={{ marginTop: 8 }}><img src={editPreview} alt="preview" style={{ maxWidth: 240, borderRadius: 10 }} /></div>}
                </div>
                <div className="pa-actions">
                  <button className="pa-btn pa-btn--primary" disabled={updatingPut} onClick={updatePostPut}>{updatingPut ? "Actualizando (PUT)..." : "Actualizar (PUT)"}</button>
                  <button className="pa-btn" disabled={updatingPatch} onClick={() => updatePostPatch()}>{updatingPatch ? "Actualizando (PATCH)..." : "Actualizar (PATCH)"}</button>
                  <button className="pa-btn pa-btn--danger" disabled={deleting} onClick={() => deletePost(selectedId)} style={{ marginLeft: 'auto' }}>{deleting ? "Eliminando..." : "Eliminar"}</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}