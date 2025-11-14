import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";

// --- Importar Componentes de Admin ---
import { DashboardButton } from "@/components/admin/DashboardButton";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { DashboardStat } from "@/components/admin/DashboardStat";

// --- Importar Iconos ---
import {
  Settings,
  Image,
  FileText,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Phone,
  Search,
  BookCopy,
} from "lucide-react";

// URL base de la API (sin cambios)
const ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export default function AdminDashboard() {
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Lógica de carga de 'me' (sin cambios)
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

  // Lógica de Saludo (sin cambios)
  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Lógica del Probador de API (sin cambios)
  const openApi = async (path) => {
    const clean = String(path).replace(/^\/+/, "");
    try {
      const res = await api.get(clean);
      console.log(`[API Test] GET /api/${clean}`, res.data);
    } catch (err) {
      if (err.response) {
        console.error(`GET /api/${clean}`, err.response.status, err.response.data);
      } else {
        console.error(err);
      }
    }
  };

  // --- Mapeo de Rol a Estilo (con clases estándar) ---
  const roleStyle = {
    admin: "text-blue-400",
    editor: "text-violet-400",
  };

  return (
    // Aplicamos el fondo y los colores de texto estándar de Tailwind
    <main className="mx-auto max-w-6xl p-4 py-6 md:py-8 lg:px-8 
                    bg-slate-900 text-slate-200 min-h-screen">
      
      {/* --- Encabezado --- */}
      <header className="mb-6 grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr,auto]">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-100 md:text-3xl">
            {greet}, <span className="text-white drop-shadow-[0_0_10px_rgba(96,165,250,0.25)]">{displayName}</span>
          </h1>
          <span
            className={`rounded-full border border-slate-700 bg-slate-800 px-3 py-1 text-xs font-semibold ${roleStyle[role] || roleStyle.admin}`}
            title={`Rol: ${role}`}
          >
            {role}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <DashboardButton variant="ghost" href={`${ROOT}/admin/`} target="_blank">
            <Settings className="h-4 w-4" /> Django Admin
          </DashboardButton>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className={`h-2 w-2 rounded-full shadow-[0_0_0_2px_rgba(255,255,250,0.05)] ${token ? "bg-green-500" : "bg-red-500"}`} />
            {token ? "Token activo" : "Sin token"}
          </div>
        </div>
      </header>

      {/* --- Estadísticas --- */}
      <section className="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:my-6">
        <DashboardStat label="Publicaciones" value="—" hint="Total visibles" />
        <DashboardStat label="Lugares" value="—" hint="Activos" />
        <DashboardStat label="Eventos" value="—" hint="Próximos" />
        <DashboardStat label="Reviews pendientes" value="—" hint="Para moderar" />
      </section>

      {/* --- Grid de Acciones --- */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DashboardCard title="Galería Principal" icon={<Image className="h-5 w-5" />} desc="Gestiona el carrusel de la página de inicio.">
          <DashboardButton to="/admin/gallery">Gestionar Galería</DashboardButton>
          <DashboardButton variant="ghost" onClick={() => openApi("gallery/")}>
            <Search className="h-4 w-4" /> GET /api/gallery/
          </DashboardButton>
        </DashboardCard>

        <DashboardCard title="Publicaciones" icon={<FileText className="h-5 w-5" />} desc="Crea y administra el contenido del blog/guía.">
          <DashboardButton to="/admin/posts/new">Crear publicación</DashboardButton>
          <DashboardButton variant="secondary" to="/admin/posts">Gestionar</DashboardButton>
          <DashboardButton variant="ghost" onClick={() => openApi("posts/")}>
            <Search className="h-4 w-4" /> GET /api/posts/
          </DashboardButton>
        </DashboardCard>

        <DashboardCard title="Lugares" icon={<MapPin className="h-5 w-5" />} desc="Gestiona lugares turísticos (rol editor/admin).">
          <DashboardButton to="/admin/places">Gestionar Lugares</DashboardButton>
          <DashboardButton variant="secondary" to="/places">Ver sitio</DashboardButton>
          <DashboardButton variant="ghost" onClick={() => openApi("places/")}>
            <Search className="h-4 w-4" /> GET /api/places/
          </DashboardButton>
        </DashboardCard>

        <DashboardCard title="Eventos" icon={<CalendarDays className="h-5 w-5" />} desc="Crea y administra eventos.">
          <DashboardButton to="/admin/create-event">Crear evento</DashboardButton>
          <DashboardButton variant="secondary" to="/events">Ver calendario</DashboardButton>
          <DashboardButton variant="ghost" onClick={() => openApi("events/")}>
            <Search className="h-4 w-4" /> GET /api/events/
          </DashboardButton>
        </DashboardCard>

        <DashboardCard title="Moderación de Reviews" icon={<ShieldCheck className="h-5 w-5" />} desc="Aprueba o elimina reseñas enviadas por usuarios.">
          <DashboardButton to="/admin/reviews">Moderar reviews</DashboardButton>
          <DashboardButton variant="ghost" onClick={() => openApi("moderation/reviews/")}>
            <Search className="h-4 w-4" /> GET /api/moderation/reviews/
          </DashboardButton>
        </DashboardCard>

        <DashboardCard title="Contactos" icon={<Phone className="h-5 w-5" />} desc="Gestiona los contactos públicos del sitio (solo admin).">
          <DashboardButton to="/admin/contactos/nuevo">Añadir contacto</DashboardButton>
          <DashboardButton variant="secondary" to="/admin/contactos">Gestionar lista</DashboardButton>
          <DashboardButton variant="ghost" onClick={() => openApi("contact/")}>
            <Search className="h-4 w-4" /> GET /api/contact/
          </DashboardButton>
        </DashboardCard>
      </section>

      {/* --- Nota al pie --- */}
      <section className="mt-6 rounded-lg border border-dashed border-slate-700 bg-slate-800 p-4 text-sm text-slate-400">
        <strong>Nota:</strong> Los botones <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-200">GET /api/...</code> son para pruebas rápidas. Revisa la consola del navegador para ver la respuesta.
      </section>
    </main>
  );
}