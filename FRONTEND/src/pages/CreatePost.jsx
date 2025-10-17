import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    content: "",
    is_published: true,
  });
  const [loading, setLoading] = useState(false);
  const [errs, setErrs] = useState({});
  const [serverMsg, setServerMsg] = useState("");

  const token = localStorage.getItem("token"); // o tu AuthContext si ya lo tienes

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Título requerido";
    if (!form.content.trim()) e.content = "Contenido requerido";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg("");
    const v = validate();
    setErrs(v);
    if (Object.keys(v).length) return;

    if (!token) {
      setServerMsg("No hay token. Inicia sesión como admin/editor.");
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

      if (res.status === 401) {
        setServerMsg("No autorizado (401). Vuelve a iniciar sesión.");
      } else if (res.status === 403) {
        setServerMsg("Prohibido (403). Requiere rol admin/editor.");
      } else if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setServerMsg(
          `Error ${res.status}. ${data?.detail || "Revisa los campos."}`
        );
      } else {
        const created = await res.json();
        // Si tu backend devuelve id: navega al detalle; ajusta la ruta si es otra
        navigate(`/posts/${created.id}`);
      }
    } catch (err) {
      setServerMsg("Error de red o servidor no disponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Crear publicación</h1>

      {serverMsg && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {serverMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Título <span className="text-red-600">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={onChange}
            className="w-full rounded border p-2"
            placeholder="Ej. Ruta corta al mirador"
          />
          {errs.title && (
            <p className="text-sm text-red-600 mt-1">{errs.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Contenido <span className="text-red-600">*</span>
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={onChange}
            className="w-full rounded border p-2 h-48"
            placeholder="Escribe el contenido de la publicación…"
          />
          {errs.content && (
            <p className="text-sm text-red-600 mt-1">{errs.content}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="is_published"
            type="checkbox"
            name="is_published"
            checked={form.is_published}
            onChange={onChange}
          />
          <label htmlFor="is_published" className="text-sm">
            Publicar inmediatamente
          </label>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Guardando..." : "Guardar publicación"}
          </button>
          <button
            type="button"
            className="rounded border px-4 py-2"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Preview rápido */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Preview</h2>
        <article className="rounded border p-3">
          <h3 className="text-xl font-bold">{form.title || "Sin título"}</h3>
          <p className="whitespace-pre-wrap text-sm mt-2">
            {form.content || "Escribe para ver la previsualización…"}
          </p>
          <p className="mt-2 text-xs opacity-70">
            {form.is_published ? "Publicado" : "Borrador"}
          </p>
        </article>
      </div>
    </div>
  );
}
