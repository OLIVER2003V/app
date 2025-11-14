import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

// --- Iconos (Los dejamos por si los usas en otros lados, pero WaterfallIcon y UserIcon ya no se usan en el logo) ---
const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l-.515 1.882 1.826-.514zM12 4.098c4.913 0 8.91 3.997 8.91 8.91s-3.997 8.91-8.91 8.91-8.91-3.997-8.91-8.91c0-2.394 1.01-4.63 2.64-6.264C7.37 5.108 9.606 4.098 12 4.098zM9.31 8.304c-.27-.13-.59-.203-.92-.203-.33 0-.64.073-.91.203-.27.13-.51.3-.71.51-.2.21-.36.46-.48.75-.12.29-.18.6-.18.91 0 .31.06.62.18.91.12.29.28.55.48.75.2.2.44.38.71.51.27.13.58.2.91.2.33 0 .64-.07.92-.2.27-.13.51-.3.71-.51.2-.21.36.46.48.75-.12.29-.18.6-.18.91 0-.31-.06-.62-.18-.91-.12-.29-.28-.55-.48-.75-.2-.2-.44-.38-.71-.51zm4.38 4.38c.27.13.58.2.91.2.33 0 .64-.07.92-.2.27-.13.51-.3.71-.51.2-.21.36.46.48.75.12.29.18.6.18.91 0-.31-.06-.62-.18-.91-.12-.29-.28-.55-.48-.75-.2-.2-.44-.38-.71-.51-.27-.13-.58-.2-.92-.2-.33 0-.64.07-.91.2-.27.13-.51.3-.71.51-.2.21-.36.46.48.75-.12.29-.18.6-.18.91 0 .31.06.62.18.91.12.29.28.55.48.75.2.2.44.38.71.51z" />
  </svg>
);


// --- Definiciones de Estilos de Botones ---
const btnBase = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
const btnPrimary = `${btnBase} bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 focus-visible:ring-orange-500`;
const btnGhost = `${btnBase} bg-transparent text-white hover:bg-white/10 border border-white/30 focus-visible:ring-white`;
const btnWhatsapp = `${btnBase} bg-[#25D366] text-white hover:bg-[#1fb257] border-transparent focus-visible:ring-[#25D366]`;

// --- Componente NavLink (Desktop) ---
const NavLinkItem = ({ to, children }) => {
  const baseStyle = "px-3 py-2 rounded-lg font-semibold font-sans transition-colors duration-200 focus:outline-none focus-visible:bg-white/10 focus-visible:text-white";
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `${baseStyle} ${isActive ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/10'}`
      }
    >
      {children}
    </NavLink>
  );
};


export default function Navbar() {
  const { token, me, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim().length === 0) return;
    navigate(`/places?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleMobileNav = (e, to) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => {
      navigate(to);
    }, 300);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full font-sans transition-all duration-300 ease-in-out
        bg-gradient-to-r from-emerald-600 to-teal-700 shadow-lg backdrop-blur-lg`}
      >
        <div className="max-w-6xl mx-auto h-14 px-4 flex items-center justify-between gap-4">

          {/* --- LOGO: Ahora usa una IMAGEN ESTÁTICA --- */}
          <Link
            to="/"
            className="flex items-center gap-2.5 p-2 -m-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white flex-shrink-0 min-w-0"
          >
            {/* [NUEVO] Agregamos un tag <img> con la ruta de tu logo */}
            {/* Asegúrate de que esta ruta sea correcta para tu proyecto */}
            <img
              src="/images/cascada.png" // <--- ¡CAMBIA ESTA RUTA POR LA DE TU IMAGEN REAL!
              alt="Jardín de las Delicias Logo"
              className="h-7 w-7 object-contain" // Ajusta h-7, w-7 y object-contain/cover según tu logo
            />
            <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 whitespace-nowrap">
              Jardín de las Delicias
            </span>
          </Link>

          {/* --- LINKS + SEARCH (Desktop) --- */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-4">
            <NavLinkItem to="/places">Lugares</NavLinkItem>
            <NavLinkItem to="/events">Eventos</NavLinkItem>
            <NavLinkItem to="/contact">Contacto</NavLinkItem>

            <form className="flex items-center gap-2 ml-4" onSubmit={onSearch}>
              <input
                type="search"
                placeholder="Buscar lugares..."
                aria-label="Buscar"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-56 px-3 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className={`${btnPrimary} h-9 w-9 px-0`} type="submit" aria-label="Buscar">
                <SearchIcon />
              </button>
            </form>
          </nav>

          {/* --- CTA + Auth (Desktop) --- */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              className={`${btnWhatsapp} hidden xl:inline-flex`}
              href="https://chat.whatsapp.com/EpzISekSBCe08kJh9lsqpx"
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon />
              <span>WhatsApp</span>
            </a>
            {token ? (
              <>
                <Link to="/dashboard" className={btnGhost}>
                  {me?.username || "Mi panel"}
                </Link>
                <button className={btnGhost} onClick={logout}>Salir</button>
              </>
            ) : (
              <Link to="/login" className={btnGhost}>Ingresar</Link>
            )}
          </div>

          {/* --- HAMBURGER (Mobile) --- */}
          <button
            className={`lg:hidden w-10 h-10 p-2 border border-white/20 rounded-lg text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700`}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-full bg-white rounded-full transition-transform duration-300 ease-in-out ${open ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`block h-0.5 w-full bg-white rounded-full transition-opacity duration-300 ease-in-out ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-full bg-white rounded-full transition-transform duration-300 ease-in-out ${open ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>
      </header>

      {/* ===== PANEL MÓVIL (SIN CAMBIOS RELEVANTES AQUÍ, USA EL ANTERIOR) ===== */}
      <div
        className={`lg:hidden fixed inset-0 z-40 h-full w-full font-sans bg-gradient-to-b from-emerald-900 via-gray-950 to-black overflow-y-auto
        transition-all duration-300 ease-in-out
        ${open
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex flex-col h-full w-full max-w-md mx-auto p-6 pt-20 pb-8">

          <div
            className={`mb-8 transition-all duration-300 ${open ? 'opacity-100 translate-y-0 delay-100' : 'opacity-0 translate-y-4'}`}
          >
            <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
              {token ? `Hola, ${me?.username || 'viajero'}` : 'Bienvenido al Jardín'}
            </h2>
            <p className="text-2xl text-slate-300 font-semibold">¿Qué aventura te espera hoy?</p>
          </div>

          <form
            className={`flex flex-col gap-3 transition-all duration-300 ${open ? 'opacity-100 translate-y-0 delay-200' : 'opacity-0 translate-y-4'}`}
            onSubmit={onSearch}
          >
            <input
              type="search"
              placeholder="Buscar lugares..."
              aria-label="Buscar"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 w-full px-4 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button className={`${btnPrimary} w-full h-12 text-base`} type="submit">
              Buscar
            </button>
          </form>

          <nav className="flex flex-col gap-2 mt-8">
            <NavLink
              to="/places"
              onClick={(e) => handleMobileNav(e, '/places')}
              className={({ isActive }) => `block text-3xl font-extrabold p-3 rounded-lg transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400'} ${open ? 'opacity-100 translate-y-0 delay-250' : 'opacity-0 translate-y-4'} hover:text-white hover:scale-105 transform`}
            >
              Lugares
            </NavLink>
            <NavLink
              to="/events"
              onClick={(e) => handleMobileNav(e, '/events')}
              className={({ isActive }) => `block text-3xl font-extrabold p-3 rounded-lg transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400'} ${open ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-4'} hover:text-white hover:scale-105 transform`}
            >
              Eventos
            </NavLink>
            <NavLink
              to="/contact"
              onClick={(e) => handleMobileNav(e, '/contact')}
              className={({ isActive }) => `block text-3xl font-extrabold p-3 rounded-lg transition-all duration-200 ${isActive ? 'text-white' : 'text-slate-400'} ${open ? 'opacity-100 translate-y-0 delay-350' : 'opacity-0 translate-y-4'} hover:text-white hover:scale-105 transform`}
            >
              Contacto
            </NavLink>
          </nav>

          <div className="mt-auto flex flex-col gap-3">
            <a
              className={`${btnWhatsapp} w-full transition-all duration-300 h-11 text-base ${open ? 'opacity-100 translate-y-0 delay-400' : 'opacity-0 translate-y-4'}`}
              href="https://chat.whatsapp.com/EpzISekSBCe08kJh9lsqpx"
              target="_blank"
              rel="noreferrer"
            >
              <WhatsappIcon />
              <span>WhatsApp</span>
            </a>

            {token ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={(e) => handleMobileNav(e, '/dashboard')}
                  className={`${btnGhost} w-full transition-all duration-300 h-11 text-base ${open ? 'opacity-100 translate-y-0 delay-450' : 'opacity-0 translate-y-4'}`}
                >
                  Mi panel
                </Link>
                <button
                  className={`${btnGhost} w-full transition-all duration-300 h-11 text-base ${open ? 'opacity-100 translate-y-0 delay-500' : 'opacity-0 translate-y-4'}`}
                  onClick={() => {
                    setOpen(false);
                    setTimeout(logout, 300);
                  }}
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={(e) => handleMobileNav(e, '/login')}
                className={`${btnGhost} w-full transition-all duration-300 h-11 text-base ${open ? 'opacity-100 translate-y-0 delay-450' : 'opacity-0 translate-y-4'}`}
              >
                Ingresar
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}