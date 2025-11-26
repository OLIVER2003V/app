import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

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
  Sparkles,
  Activity
} from "lucide-react";

// URL base
const ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

export default function AdminDashboard() {
  const nav = useNavigate();
  const { me } = useAuth();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const role = me?.profile?.role ?? "admin";
  const displayName = me?.username || "Administrador";

  // Lógica de Saludo
  const greet = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  // Probador de API
  const openApi = async (path) => {
    const clean = String(path).replace(/^\/+/, "");
    try {
      const res = await api.get(clean);
      console.log(`[API Test] GET /api/${clean}`, res.data);
      alert(`✅ Conexión exitosa a: /${clean}`); // Feedback visual rápido
    } catch (err) {
      console.error(err);
      alert(`❌ Error al conectar: ${err.message}`);
    }
  };

  // Estilos de rol (Etiquetas)
  const roleStyles = {
    admin: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    editor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-hidden">
      
      {/* --- FONDO ATMOSFÉRICO (Efecto de luces) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] opacity-50"></div>
        {/* Patrón de grilla sutil */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- ENCABEZADO PRO (Glassmorphism) --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
          
          {/* Saludo y Usuario */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium uppercase tracking-wider">
               <Sparkles className="h-4 w-4 text-amber-400" />
               <span>Panel de Control</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {greet}, <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">{displayName}</span>
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${roleStyles[role] || roleStyles.admin} uppercase tracking-wide`}>
                {role}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <span className={`relative flex h-2.5 w-2.5`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${token ? "bg-emerald-400" : "bg-red-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${token ? "bg-emerald-500" : "bg-red-500"}`}></span>
                </span>
                {token ? "Sistema Online" : "Desconectado"}
              </div>
            </div>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex items-center gap-3">
            <DashboardButton variant="ghost" href={`${ROOT}/admin/`} target="_blank" className="hover:bg-slate-800 transition-all">
              <Settings className="h-5 w-5" />
              <span className="hidden sm:inline">Django Admin</span>
            </DashboardButton>
          </div>
        </header>

        {/* --- SECCIÓN DE ESTADÍSTICAS (KPIs) --- */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4 text-slate-100 font-bold text-lg">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2>Resumen de Actividad</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Nota: Asegúrate de que DashboardStat soporte clases extra o tenga un buen diseño base */}
            <DashboardStat label="Publicaciones" value="—" hint="Artículos activos" />
            <DashboardStat label="Lugares" value="—" hint="Destinos registrados" />
            <DashboardStat label="Eventos" value="—" hint="En calendario" />
            <DashboardStat label="Reviews" value="—" hint="Pendientes de revisión" />
          </div>
        </section>

        {/* --- GRID DE GESTIÓN (El Core) --- */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Gestión de Contenido</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-800 to-transparent ml-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Tarjeta 1: Galería */}
            <DashboardCard 
              title="Galería Principal" 
              icon={<Image className="h-6 w-6" />} 
              desc="Controla las imágenes destacadas del carrusel de inicio."
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <DashboardButton to="/admin/gallery" className="w-full justify-center">Gestionar</DashboardButton>
                <DashboardButton variant="ghost" onClick={() => openApi("gallery/")} className="w-full justify-center border border-slate-700/50">
                   <Search className="h-4 w-4 mr-2" /> Test API
                </DashboardButton>
              </div>
            </DashboardCard>

            {/* Tarjeta 2: Publicaciones */}
            <DashboardCard 
              title="Blog y Noticias" 
              icon={<FileText className="h-6 w-6" />} 
              desc="Crea artículos, noticias y guías para los viajeros."
            >
              <div className="flex flex-col gap-3 mt-4">
                <DashboardButton to="/admin/posts/new" variant="primary" className="w-full justify-center shadow-lg shadow-indigo-500/20">
                  + Crear Nueva Publicación
                </DashboardButton>
                <div className="grid grid-cols-2 gap-3">
                  <DashboardButton variant="secondary" to="/admin/posts" className="justify-center">Ver Todo</DashboardButton>
                  <DashboardButton variant="ghost" onClick={() => openApi("posts/")} className="justify-center border border-slate-700/50">
                    <Search className="h-4 w-4" /> API
                  </DashboardButton>
                </div>
              </div>
            </DashboardCard>

            {/* Tarjeta 3: Lugares */}
            <DashboardCard 
              title="Destinos Turísticos" 
              icon={<MapPin className="h-6 w-6" />} 
              desc="Administra la información de cascadas, senderos y zonas."
            >
              <div className="flex flex-col gap-3 mt-4">
                <DashboardButton to="/admin/places" className="w-full justify-center">Administrar Lugares</DashboardButton>
                <div className="grid grid-cols-2 gap-3">
                  <DashboardButton variant="secondary" to="/places" className="justify-center">Ver Web</DashboardButton>
                  <DashboardButton variant="ghost" onClick={() => openApi("places/")} className="justify-center border border-slate-700/50">
                     Test API
                  </DashboardButton>
                </div>
              </div>
            </DashboardCard>

            {/* Tarjeta 4: Eventos */}
            <DashboardCard 
              title="Calendario de Eventos" 
              icon={<CalendarDays className="h-6 w-6" />} 
              desc="Programa actividades, ferias y fechas especiales."
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <DashboardButton to="/admin/create-event" className="col-span-2 justify-center">+ Crear Evento</DashboardButton>
                <DashboardButton variant="secondary" to="/events" className="justify-center">Calendario</DashboardButton>
                <DashboardButton variant="ghost" onClick={() => openApi("events/")} className="justify-center border border-slate-700/50">API</DashboardButton>
              </div>
            </DashboardCard>

            {/* Tarjeta 5: Moderación */}
            <DashboardCard 
              title="Moderación" 
              icon={<ShieldCheck className="h-6 w-6" />} 
              desc="Revisa comentarios y experiencias de los usuarios."
            >
              <div className="mt-4">
                <DashboardButton to="/admin/reviews" className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                  Panel de Moderación
                </DashboardButton>
                <button 
                  onClick={() => openApi("moderation/reviews/")}
                  className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors text-center"
                >
                  Verificar estado de API
                </button>
              </div>
            </DashboardCard>

            {/* Tarjeta 6: Contacto */}
            <DashboardCard 
              title="Directorio" 
              icon={<Phone className="h-6 w-6" />} 
              desc="Actualiza números y correos de contacto público."
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                <DashboardButton to="/admin/contactos/nuevo" className="justify-center">Nuevo</DashboardButton>
                <DashboardButton variant="secondary" to="/admin/contactos" className="justify-center">Lista</DashboardButton>
              </div>
            </DashboardCard>

          </div>
        </section>

        {/* --- FOOTER TÉCNICO --- */}
        <footer className="mt-12 border-t border-slate-800/50 pt-6 pb-12 text-center">
          <p className="text-slate-500 text-sm">
            Jardín de las Delicias &copy; {new Date().getFullYear()} — Panel de Administración v2.0
          </p>
          <p className="text-slate-600 text-xs mt-2 font-mono">
            Conectado a: <span className="text-indigo-400">{ROOT}</span>
          </p>
        </footer>

      </div>
    </div>
  );
}