import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

// --- Iconos ---
const SearchIcon = ({ className = "h-5 w-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
  const { token, me, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  
  // 1. Estado para detectar el scroll
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { setOpen(false); }, [location]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  // 2. Efecto para escuchar el evento de scroll
  useEffect(() => {
    const handleScroll = () => {
      // Si bajamos más de 20px, activamos el modo "scrolled"
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
      {/* Lógica dinámica en className:
          - scrolled ? "transparente y borroso" : "sólido y degradado"
          - scrolled ? "h-16" : "h-20" (Animación de altura)
      */}
      <header
        className={`sticky top-0 z-50 w-full font-sans transition-all duration-500 ease-in-out
        ${scrolled 
            ? "bg-cyan-950/60 backdrop-blur-md shadow-lg border-b border-transparent" // ESTADO SCROLL: Transparente + Borroso (Glassmorphism)
            : "bg-gradient-to-r from-cyan-950 via-teal-900 to-emerald-950 shadow-2xl border-b border-white/5" // ESTADO NORMAL: Sólido
        }`}
      >
        <div 
            className={`max-w-7xl mx-auto px-3 md:px-6 flex items-center justify-between gap-3 transition-all duration-500
            ${scrolled ? "h-16" : "h-20 md:h-24"} 
            `}
        >

          {/* === ZONA IZQUIERDA === */}
          <div className="flex items-center gap-4 md:gap-8 flex-1 overflow-hidden">
            
            {/* LOGO */}
            <Link to="/" className="flex-shrink-0 group relative z-20">
               <img
                  src="/images/cascada.png"
                  alt="Inicio"
                  // El logo también se hace un pelín más pequeño al hacer scroll para elegancia
                  className={`relative object-contain drop-shadow-lg transform transition-all duration-500 group-hover:scale-110
                  ${scrolled ? "h-9 w-9" : "h-10 w-10 md:h-11 md:w-11"}`}
                />
            </Link>

            {/* MENÚ DE BOTONES */}
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar pr-4">
               <NavPill to="/places">Lugares</NavPill>
               <NavPill to="/events">Eventos</NavPill>
               <NavPill to="/contact">Contactos</NavPill>
            </nav>

          </div>

          {/* === ZONA DERECHA === */}
          <div className="flex flex-shrink-0 items-center justify-end gap-2 md:gap-4">
            
            {/* Buscador Desktop */}
            <form className="hidden lg:flex items-center gap-2 group relative" onSubmit={onSearch}>
              <input
                  type="search"
                  placeholder="Buscar..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-10 h-10 rounded-full border-2 border-transparent bg-transparent text-transparent focus:w-48 xl:focus:w-60 focus:bg-cyan-950/80 focus:text-white focus:px-4 focus:border-cyan-700 transition-all duration-300 absolute right-0 cursor-pointer focus:cursor-text z-10 outline-none placeholder:text-cyan-200/50"
              />
              {/* Botón lupa eliminado en desktop */}
            </form>

            {/* Auth Desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {token ? (
                <Link to="/dashboard" className={btnGhost}>
                  {me?.username?.split(' ')[0] || "Panel"}
                </Link>
              ) : (
                <Link to="/login" className={btnAccent}>Ingresar</Link>
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

      {/* ===== DRAWER MÓVIL (Sin cambios) ===== */}
      <div
        className={`fixed inset-0 z-40 h-screen w-full font-sans bg-cyan-950/90 backdrop-blur-xl transition-opacity duration-300
        ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div className={`flex flex-col h-full max-w-sm ml-auto bg-gradient-to-b from-cyan-900 to-teal-950 shadow-2xl transition-transform duration-300 border-l border-white/10 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
            
            <div className="flex flex-col h-full p-6 pt-24 overflow-y-auto">
                
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                        Jardín de las Delicias
                    </h2>
                    <p className="text-cyan-200 mt-2 font-medium">Tu próxima aventura</p>
                </div>

                <form className="relative mb-8" onSubmit={onSearch}>
                    <input
                        type="search"
                        placeholder="Buscar lugares..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-12 px-5 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-cyan-200/50 focus:outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all"
                    />
                    <button type="submit" className="absolute right-4 top-3.5 text-cyan-200">
                        <SearchIcon />
                    </button>
                </form>

                <nav className="flex flex-col gap-2">
                    {['/places', '/events', '/contact'].map((path) => (
                        <NavLink
                            key={path}
                            to={path}
                            onClick={(e) => handleMobileNav(e, path)}
                            className={({ isActive }) => `text-xl font-bold py-3 px-4 rounded-xl transition-all flex items-center ${isActive ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/30' : 'text-cyan-100/70 hover:text-white hover:bg-white/5'}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-3 ${isActive ? 'bg-orange-400' : 'bg-cyan-600/50'}`}></span>
                                    {path === '/places' ? 'Lugares' : path === '/events' ? 'Eventos' : 'Contacto'}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto pt-8 flex flex-col gap-4">
                     <a
                        href="https://chat.whatsapp.com/EpzISekSBCe08kJh9lsqpx"
                        target="_blank"
                        rel="noreferrer"
                        className={`${btnWhatsapp} h-12 w-full text-base`}
                    >
                        <WhatsappIcon /> WhatsApp
                    </a>
                    {token ? (
                        <button onClick={() => { setOpen(false); setTimeout(logout, 300); }} className="w-full h-12 rounded-xl border border-red-500/30 text-red-300 font-bold hover:bg-red-500/10 transition-all">
                            Cerrar Sesión
                        </button>
                    ) : (
                        <Link to="/login" onClick={(e) => handleMobileNav(e, '/login')} className={`${btnAccent} h-12 w-full text-base`}>
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </div>
        </div>
      </div>
    </>
  );
}