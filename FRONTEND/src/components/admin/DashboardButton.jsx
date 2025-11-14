import React from "react";
import { Link } from "react-router-dom";

// --- Clases de Estilo Base (Estándar) ---
const baseClasses = "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-1.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50";

// --- Clases de Variantes (Estándar) ---
const variants = {
  // Primario (por defecto)
  primary: "bg-blue-600 text-white shadow-md hover:bg-blue-500",
  // Secundario (bordeado)
  secondary: "bg-slate-700 text-slate-200 ring-1 ring-inset ring-slate-600 hover:bg-slate-600",
  // Fantasma (transparente)
  ghost: "bg-transparent text-slate-400 hover:bg-white/10 hover:text-slate-200",
};

export function DashboardButton({
  to,
  href,
  onClick,
  variant = "primary",
  children,
  className = "",
  target,
  ...props
}) {
  const variantClasses = variants[variant] || variants.primary;
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`;

  // 1. Si tiene 'to', es un <Link> de React Router
  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  // 2. Si tiene 'href', es un enlace <a> estándar
  if (href) {
    return (
      <a 
        href={href} 
        className={combinedClasses} 
        target={target}
        rel={target === "_blank" ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    );
  }

  // 3. Si no, es un <button>
  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={combinedClasses} 
      {...props}
    >
      {children}
    </button>
  );
}