import React, { useEffect, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { token, me, logout } = useAuth();
  const [open, setOpen] = useState(false);      // mobile
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // cerrar menú mobile al cambiar de ruta
  useEffect(() => { setOpen(false); }, [location]);

  // header sólido al hacer scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    if (query.trim().length === 0) return;
    navigate(`/places?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : "nav--top"}`}>
      <div className="nav__inner">
        {/* LOGO */}
        <Link to="/" className="nav__brand">
          <span className="nav__logo">🌿</span>
          <span>Jardín de las Delicias</span>
        </Link>

        {/* LINKS + SEARCH (desktop) */}
        <nav className="nav__links">
          <NavLink to="/places" className="nav__link">Lugares</NavLink>
          <NavLink to="/events" className="nav__link">Eventos</NavLink>
          <NavLink to="/contact" className="nav__link">Contacto</NavLink>

          <form className="nav__search" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Buscar lugares..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar"
            />
            <button className="btn btn--sm" type="submit">Buscar</button>
          </form>
        </nav>

        {/* CTA + Auth */}
        <div className="nav__cta">
          <a
            className="btn btn--sm btn--whatsapp"
            href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          {token ? (
            <>
              <Link to="/dashboard" className="btn btn--sm btn--ghost">
                {me?.username || "Mi panel"}
              </Link>
              <button className="btn btn--sm btn--ghost" onClick={logout}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="btn btn--sm btn--ghost">Ingresar</Link>
          )}
        </div>

        {/* HAMBURGUER */}
        <button
          className="nav__burger"
          aria-label="Abrir menú"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* MOBILE PANEL */}
      {open && (
        <div className="nav__mobile">
          <form className="nav__mSearch" onSubmit={onSearch}>
            <input
              type="search"
              placeholder="Buscar lugares..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar"
            />
            <button className="btn btn--full" type="submit">Buscar</button>
          </form>

          <NavLink to="/places" className="nav__mItem">Lugares</NavLink>
          <NavLink to="/events" className="nav__mItem">Eventos</NavLink>
          <NavLink to="/contact" className="nav__mItem">Contactos</NavLink>

          <a
            className="btn btn--full btn--whatsapp"
            href="https://chat.whatsapp.com/EpzISekSBCe08kJh9LsQpx"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
          {token ? (
            <>
              <Link to="/dashboard" className="btn btn--full btn--ghost">Mi panel</Link>
              <button className="btn btn--full btn--ghost" onClick={logout}>Salir</button>
            </>
          ) : (
            <Link to="/login" className="btn btn--full btn--ghost">Ingresar</Link>
          )}
        </div>
      )}
    </header>
  );
}
