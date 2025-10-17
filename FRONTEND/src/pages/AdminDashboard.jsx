import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin-dashboard.css";
import api from "@/lib/api";

const ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

function Stat({ label, value, hint }) {
  return (
    <div className="ad-stat">
      <div className="ad-stat-value">{value}</div>
      <div className="ad-stat-label">{label}</div>
      {hint && <div className="ad-stat-hint">{hint}</div>}
    </div>
  );
}

function Card({ title, icon, desc, children }) {
  return (
    <section className="ad-card">
      <header className="ad-card-header">
        <div className="ad-card-icon" aria-hidden="true">{icon}</div>
        <div>
          <h3 className="ad-card-title">{title}</h3>
          {desc && <p className="ad-card-desc">{desc}</p>}
        </div>
      </header>
      <div className="ad-card-actions">{children}</div>
    </section>
  );
}

function Btn({ children, onClick, variant = "primary", href, target = "_self" }) {
  const className =
    variant === "secondary"
      ? "ad-btn ad-btn-secondary"
      : variant === "ghost"
      ? "ad-btn ad-btn-ghost"
      : "ad-btn ad-btn-primary";

  if (href) {
    return (
      <a className={className} href={href} target={target} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <button className={className} onClick={onClick} type="button">
      {children}
    </button>
  );
}

export default function AdminDashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Carga del perfil actual (con headers y URL normalizada)
  useEffect(() => {
    let ignore = false;
    async function loadMe() {
      if (!token) return;
      try {
        const res = await fetch(`${ROOT}/api/auth/me/`, {
          headers: {
            Accept: "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!ignore && res.ok) {
          const data = await res.json();
          setMe(data);
        }
      } catch (e) {
        console.warn("No se pudo cargar /api/auth/me/:", e);
      }
    }
    loadMe();
    return () => { ignore = true; };
  }, [token]);

  const role = me?.profile?.role ?? "admin";
  const displayName = me?.username || "Administrador";

  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Probador de endpoints: siempre relativo a /api y sin slash inicial
  const openApi = async (path) => {
    const clean = String(path).replace(/^\/+/, ""); // evita rutas absolutas que ignoran baseURL
    try {
      const res = await api.get(clean);
      const data = res.data;
      console.log(`GET /api/${clean}`, data);
      alert(`GET /api/${clean} → ${res.status} OK (${Array.isArray(data) ? data.length + " items" : "objeto"})`);
    } catch (err) {
      if (err.response) {
        console.error(`GET /api/${clean}`, err.response.status, err.response.data);
        alert(`GET /api/${clean} → ${err.response.status}: ${err.response.statusText || "Error"}`);
      } else {
        console.error(err);
        alert("Error de red");
      }
    }
  };

  return (
    <main className="ad-container">
      <header className="ad-header">
        <div className="ad-header-left">
          <h1 className="ad-title">
            {greet}, <span className="ad-title-strong">{displayName}</span>
          </h1>
          <span className={`ad-role-badge ad-role-${role}`} title={`Rol: ${role}`}>
            {role}
          </span>
        </div>
        <div className="ad-header-right">
          <Btn variant="ghost" href={`${ROOT}/admin/`} target="_blank">⚙️ Django Admin</Btn>
          <div className="ad-quick-help">
            <span className={`ad-dot ${token ? "ad-dot-on" : "ad-dot-off"}`} />
            <span className="ad-dot-text">{token ? "Token activo" : "Sin token"}</span>
          </div>
        </div>
      </header>

      <section className="ad-stats">
        <Stat label="Publicaciones" value="—" hint="Total visibles" />
        <Stat label="Lugares" value="—" hint="Activos" />
        <Stat label="Eventos" value="—" hint="Próximos" />
        <Stat label="Reviews pendientes" value="—" hint="Para moderar" />
      </section>

      <section className="ad-grid">
        <Card title="Galería Principal" icon="🖼️" desc="Gestiona el carrusel de la página de inicio.">
          <Btn onClick={() => nav("/admin/gallery")}>Gestionar Galería</Btn>
          <Btn variant="ghost" onClick={() => openApi("gallery/")}>🔎 GET /api/gallery/</Btn>
        </Card>

        <Card title="Publicaciones" icon="📝" desc="Crea y administra el contenido del blog/guía.">
          <Btn onClick={() => nav("/admin/posts")}>➕ Crear publicación</Btn>
          <Btn variant="secondary" onClick={() => nav("/posts")}>📚 Ver listado</Btn>
          <Btn variant="ghost" onClick={() => openApi("posts/")}>🔎 GET /api/posts/</Btn>
        </Card>

        <Card title="Lugares" icon="📍" desc="Gestiona lugares turísticos (rol editor/admin).">
          <Btn onClick={() => nav("/admin/places")}>➕ Crear lugar</Btn>
          <Btn variant="secondary" onClick={() => nav("/places")}>🗺️ Ver lugares</Btn>
          <Btn variant="ghost" onClick={() => openApi("places/")}>🔎 GET /api/places/</Btn>
        </Card>

        <Card title="Eventos" icon="🎉" desc="Crea y administra eventos.">
          <Btn onClick={() => nav("/admin/create-event")}>➕ Crear evento</Btn>
          <Btn variant="secondary" onClick={() => nav("/events")}>📅 Ver calendario</Btn>
          <Btn variant="ghost" onClick={() => openApi("events/")}>🔎 GET /api/events/</Btn>
        </Card>

        <Card title="Moderación de Reviews" icon="🛡️" desc="Aprueba o elimina reseñas enviadas por usuarios.">
          <Btn onClick={() => nav("/admin/reviews")}>🧹 Moderar reviews</Btn>
          <Btn variant="ghost" onClick={() => openApi("moderation/reviews/")}>🔎 GET /api/moderation/reviews/</Btn>
        </Card>

        <Card title="Contactos" icon="📞" desc="Gestiona los contactos públicos del sitio (solo admin).">
          <Btn onClick={() => nav("/admin/create-contact")}>➕ Añadir contacto</Btn>
          <Btn variant="secondary" onClick={() => nav("/contact")}>📋 Ver página</Btn>
          <Btn variant="ghost" onClick={() => openApi("contact/")}>🔎 GET /api/contact/</Btn>
        </Card>
      </section>

      <section className="ad-note">
        <strong>Nota:</strong> Abrir endpoints en el navegador no envía el header <code>Authorization</code>. Usa los formularios o un cliente HTTP.
      </section>
    </main>
  );
}
