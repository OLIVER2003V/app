import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@context/AuthContext";
import HeartIcon from "./icons/HeartIcon";
import LanguageSwitcher from "./LanguageSwitcher";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const DEFAULT_WHATSAPP_GROUP = "https://chat.whatsapp.com/EpzISekSBCe08kJh9lsqpx";

// --- Iconos ---
const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DashboardIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const LogoutIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const LoginIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const HomeIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5a1 1 0 01-1-1v-5h-4v5a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
  </svg>
);

const PlacesIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const MenuIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const PhoneIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const InfoIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.89-5.451 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l-.515 1.882 1.826-.514zM12 4.098c4.913 0 8.91 3.997 8.91 8.91s-3.997 8.91-8.91 8.91-8.91-3.997-8.91-8.91c0-2.394 1.01-4.63 2.64-6.264C7.37 5.108 9.606 4.098 12 4.098zM9.31 8.304c-.27-.13-.59-.203-.92-.203-.33 0-.64.073-.91.203-.27.13-.51.3-.71.51-.2.21-.36.46-.48.75-.12.29-.18.6-.18.91 0 .31.06.62.18.91.12.29.28.55.48.75.2.2.44.38.71.51.27.13.58.2.91.2.33 0 .64-.07.92-.2.27-.13.51-.3.71-.51.2-.21.36.46.48.75-.12.29-.18.6-.18.91 0-.31-.06-.62-.18-.91-.12-.29-.28-.55-.48-.75-.2-.2-.44-.38-.71-.51zm4.38 4.38c.27.13.58.2.91.2.33 0 .64-.07.92-.2.27-.13.51-.3.71-.51.2-.21.36.46.48.75.12.29.18.6.18.91 0-.31-.06-.62-.18-.91-.12-.29-.28-.55-.48-.75-.2-.2-.44-.38-.71-.51-.27-.13-.58-.2-.92-.2-.33 0-.64.07-.91.2-.27.13-.51.3-.71.51-.2.21-.36.46.48.75-.12.29-.18.6-.18.91 0 .31.06.62.18.91.12.29.28.55.48.75.2.2.44.38.71.51z" />
  </svg>
);

// --- Botones Base ---
const btnBase = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-300 rounded-full focus:outline-none";
const btnAccent = `${btnBase} bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105`;
const btnGhost = `${btnBase} text-cyan-100 hover:text-white hover:bg-white/10`;
const btnWhatsapp = `${btnBase} bg-[#25D366] text-white hover:bg-[#20bd5a] shadow-lg shadow-green-500/20`;

// --- Ítem de la barra inferior (móvil) ---
const BottomTabItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      relative flex flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1.5 
      transition-all duration-300 ease-out
      ${isActive
        ? "bg-cyan-400/10 text-cyan-200"
        : "text-slate-400 hover:text-slate-200"
      }`
    }
  >
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </NavLink>
);

// --- NavPill ---
const NavPill = ({ to, children }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative inline-flex items-center justify-center whitespace-nowrap px-5 py-2.5 text-sm rounded-full font-bold transition-all duration-300 ease-out flex-shrink-0 select-none border overflow-hidden
        ${isActive 
          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-900/30 scale-105 border-transparent' 
          : 'text-cyan-100/90 border-cyan-500/20 bg-cyan-950/30 hover:bg-cyan-900/50 hover:border-cyan-400/50 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default function Navbar() {
  const { t } = useTranslation();
  const { token, me, logout } = useAuth();
  const { settings } = useSiteSettings();
  const whatsappGroupUrl = settings?.whatsapp_group_url || DEFAULT_WHATSAPP_GROUP;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim().length === 0) return;
    navigate(`/places?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  };

  const handleMobileNav = (e, to) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => navigate(to), 300);
  };

  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* === HEADER PRINCIPAL === */}
      <header
        className={`sticky top-0 z-50 w-full font-sans transition-all duration-500 ease-in-out
        ${scrolled 
            ? "bg-cyan-950/60 backdrop-blur-md shadow-lg border-b border-transparent" 
            : "bg-gradient-to-r from-cyan-950 via-teal-900 to-emerald-950 shadow-2xl border-b border-white/5" 
        }`}
      >
        <div 
            className={`max-w-7xl mx-auto px-3 md:px-6 flex items-center justify-between gap-3 transition-all duration-500
            ${scrolled ? "h-16" : "h-20 md:h-24"} 
            `}
        >

          {/* === ZONA IZQUIERDA === */}
          <div className="flex items-center gap-4 md:gap-8 flex-1 overflow-hidden">
            
            {/* LOGO + NOMBRE DEL SITIO */}
            <Link to="/" className="group relative z-20 flex items-center gap-2 md:gap-3 min-w-0">
               <div
                  className={`relative overflow-hidden rounded-xl border-2 border-white/25 bg-cyan-950 shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:border-white/50 shrink-0
                  ${scrolled ? "h-11 w-11" : "h-14 w-14 md:h-16 md:w-16"}`}
                >
                 <img
                    src="/images/cascada.png"
                    alt="Inicio"
                    className="w-full h-full object-contain"
                  />
               </div>
               <span
                  className={`min-w-0 font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300 truncate drop-shadow-sm transition-all duration-500
                  ${scrolled ? "text-sm md:text-lg" : "text-base md:text-xl lg:text-2xl"}`}
                >
                 {t('nav.brand')}
               </span>
            </Link>

            {/* MENÚ DE BOTONES (solo escritorio: en móvil vive en la barra inferior y el menú hamburguesa) */}
            <nav className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar pr-4">
               <NavPill to="/places">{t('nav.places')}</NavPill>
               <NavPill to="/informacion">{t('nav.info')}</NavPill>
               <NavPill to="/events">{t('nav.events')}</NavPill>
               <NavPill to="/contact">{t('nav.contact')}</NavPill>
               <NavLink
                 to="/favoritos"
                 aria-label={t('nav.favorites')}
                 title={t('nav.favorites')}
                 className={({ isActive }) => `flex-shrink-0 p-2.5 rounded-full transition-colors ${isActive ? "text-red-400 bg-white/10" : "text-cyan-100/70 hover:text-red-300 hover:bg-white/10"}`}
               >
                 <HeartIcon className="h-5 w-5" />
               </NavLink>
            </nav>

          </div>

          {/* === ZONA DERECHA === */}
          <div className="flex flex-shrink-0 items-center justify-end gap-2 md:gap-4">
            
            {/* Buscador Desktop: siempre visible (antes era una lupa que
                solo se expandía al hacer clic, poco descubrible) */}
            <form className="hidden lg:flex items-center relative" onSubmit={onSearch}>
              <SearchIcon className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-200/50 pointer-events-none" />
              <input
                  type="search"
                  placeholder={t('nav.search_placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-40 xl:w-56 h-10 rounded-full border-2 border-cyan-800/50 bg-cyan-950/40 text-white text-sm pl-9 pr-4 focus:w-56 xl:focus:w-72 focus:bg-cyan-950/80 focus:border-cyan-600 transition-all duration-300 outline-none placeholder:text-cyan-200/50"
              />
            </form>

            <LanguageSwitcher className="hidden lg:inline-flex text-cyan-200/70 hover:text-white hover:bg-white/10" />

            {/* Auth Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              {token ? (
                <>
                  <Link to="/dashboard" className={btnGhost}>
                    {me?.username?.split(' ')[0] || t('nav.panel')}
                  </Link>
                  <button
                    onClick={logout}
                    title={t('nav.logout')}
                    aria-label={t('nav.logout')}
                    className="p-2.5 rounded-full text-cyan-200/70 hover:text-red-300 hover:bg-red-500/10 transition-colors focus:outline-none"
                  >
                    <LogoutIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  title={t('nav.staff_access')}
                  aria-label={t('nav.staff_access')}
                  className="p-2.5 rounded-full text-cyan-200/30 hover:text-cyan-100 hover:bg-white/10 transition-colors focus:outline-none"
                >
                  <LoginIcon className="h-5 w-5" />
                </Link>
              )}
            </div>

            {/* Hamburger Menu */}
            <button
              className={`lg:hidden relative z-50 p-1.5 text-cyan-200 hover:text-white transition-colors focus:outline-none`}
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              <div className="flex flex-col justify-between w-6 h-4.5">
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-left ${open ? 'rotate-45 bg-white' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-full bg-current rounded-full transition-all duration-300 origin-left ${open ? '-rotate-45 bg-white' : ''}`} />
              </div>
            </button>
          </div>

        </div>
      </header>

      {/* ===== DRAWER MÓVIL ===== */}
      <div
        className={`fixed inset-0 z-40 h-screen w-full font-sans bg-cyan-950/90 backdrop-blur-xl transition-opacity duration-300
        ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className={`flex flex-col h-full max-w-sm ml-auto bg-gradient-to-b from-cyan-900 to-teal-950 shadow-2xl transition-transform duration-300 border-l border-white/10 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* AÑADIDO: pb-24 para dar espacio extra al final y permitir scroll completo */}
            <div className="flex flex-col h-full p-6 pt-24 overflow-y-auto pb-24">
                
                <div className="mb-8 flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-emerald-300">
                            {t('nav.brand')}
                        </h2>
                        <p className="text-cyan-200 mt-2 font-medium">{t('nav.tagline')}</p>
                    </div>
                    <LanguageSwitcher className="flex-shrink-0 border border-white/10 text-cyan-200 hover:text-white hover:bg-white/10" />
                </div>

                <form className="relative mb-8 flex-shrink-0" onSubmit={onSearch}>
                    <input
                        type="search"
                        placeholder={t('nav.search_placeholder_mobile')}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-12 px-5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-cyan-200/50 focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all"
                    />
                    <button type="submit" aria-label="Buscar" className="absolute right-4 top-3.5 text-cyan-200">
                        <SearchIcon />
                    </button>
                </form>

                <nav className="flex flex-col gap-2 flex-shrink-0">
                    {['/places', '/informacion', '/events', '/contact', '/favoritos'].map((path) => {
                        const labels = { '/places': t('nav.places'), '/informacion': t('nav.info'), '/events': t('nav.events'), '/contact': t('nav.contact'), '/favoritos': t('nav.favorites') };
                        return (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={(e) => handleMobileNav(e, path)}
                            className={({ isActive }) => `text-xl font-bold py-3 px-4 rounded-xl transition-all flex items-center ${isActive ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30' : 'text-cyan-100/70 hover:text-white hover:bg-white/5'}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-orange-400' : 'bg-cyan-600/50'}`}></span>
                                    {labels[path]}
                                </>
                            )}
                        </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 flex flex-col gap-4 flex-shrink-0">
                      <a
                        href={whatsappGroupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`${btnWhatsapp} h-12 w-full text-base`}
                    >
                        <WhatsappIcon /> {t('nav.whatsapp')}
                    </a>

                    {token ? (
                        <>
                            {/* BOTÓN NUEVO: MI PANEL */}
                            <Link
                                to="/dashboard"
                                onClick={(e) => handleMobileNav(e, '/dashboard')}
                                className="w-full h-12 rounded-xl border border-cyan-500/30 bg-cyan-900/20 text-cyan-200 font-bold hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400/50 transition-all inline-flex items-center justify-center gap-2"
                            >
                                <DashboardIcon />
                                {t('nav.my_panel')}
                            </Link>

                            <button onClick={() => { setOpen(false); setTimeout(logout, 300); }} className="w-full h-12 rounded-xl border border-red-500/30 text-red-300 font-bold hover:bg-red-500/10 transition-all">
                                {t('nav.logout')}
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={(e) => handleMobileNav(e, '/login')}
                            className="text-center text-sm text-cyan-300/40 hover:text-cyan-200 font-medium py-2 transition-colors"
                        >
                            {t('nav.staff_access')}
                        </Link>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* ===== BARRA INFERIOR (MÓVIL) ===== */}
      {/* Reemplaza la fila de pestañas que antes se desbordaba en pantallas
          angostas (el corazón de favoritos quedaba invisible fuera del
          scroll horizontal). Queda al alcance del pulgar, sin abrir nada. */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-stretch gap-2 border-t border-white/10 bg-cyan-950/95 p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <BottomTabItem to="/" icon={<HomeIcon className="h-5 w-5" />} label="Inicio" />
        <BottomTabItem to="/places" icon={<PlacesIcon className="h-5 w-5" />} label={t('nav.places')} />
        <BottomTabItem to="/contact" icon={<PhoneIcon className="h-5 w-5" />} label={t('nav.contact')} />
        <BottomTabItem to="/informacion" icon={<InfoIcon className="h-5 w-5" />} label={t('nav.info')} />
      </nav>
    </>
  );
}