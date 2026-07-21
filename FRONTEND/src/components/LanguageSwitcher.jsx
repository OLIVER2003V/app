import React from "react";
import { useTranslation } from "react-i18next";

// SVG en vez de emoji de bandera: Windows no tiene glifos de bandera en su
// fuente de emojis y muestra el código de país en texto plano (ej. "GB"),
// así que un SVG propio es la única forma de que la bandera se vea igual
// en cualquier sistema operativo.
const FlagES = ({ className = "" }) => (
  <svg viewBox="0 0 20 14" className={className} aria-hidden="true">
    <rect width="20" height="14" rx="2" fill="#AA151B" />
    <rect y="3.5" width="20" height="7" fill="#F1BF00" />
  </svg>
);

const FlagGB = ({ className = "" }) => (
  <svg viewBox="0 0 20 14" className={className} aria-hidden="true">
    <rect width="20" height="14" rx="2" fill="#00247D" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#fff" strokeWidth="2.6" />
    <path d="M0 0L20 14M20 0L0 14" stroke="#CF142B" strokeWidth="1.2" />
    <path d="M10 0V14M0 7H20" stroke="#fff" strokeWidth="4.2" />
    <path d="M10 0V14M0 7H20" stroke="#CF142B" strokeWidth="2.4" />
  </svg>
);

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("en") ? "en" : "es";

  const toggle = () => {
    i18n.changeLanguage(current === "es" ? "en" : "es");
  };

  const Flag = current === "es" ? FlagGB : FlagES;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={current === "es" ? "Switch to English" : "Cambiar a español"}
      title={current === "es" ? "Switch to English" : "Cambiar a español"}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${className}`}
    >
      <Flag className="h-3.5 w-5 rounded-xs shadow-sm ring-1 ring-black/10" />
      {current === "es" ? "EN" : "ES"}
    </button>
  );
}
