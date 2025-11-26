import React from "react";
import { Link } from "react-router-dom";

export function DashboardButton({ 
  children, 
  to, 
  href, 
  variant = "primary", 
  className = "", 
  ...props 
}) {
  // Definimos estilos según la variante
  const baseStyles = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500",
    ghost: "bg-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700",
    danger: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
  };

  const finalClass = `${baseStyles} ${variants[variant] || variants.primary} ${className}`;

  // 1. Si es Link interno de React Router
  if (to) {
    return <Link to={to} className={finalClass} {...props}>{children}</Link>;
  }

  // 2. Si es Link externo
  if (href) {
    return <a href={href} className={finalClass} {...props}>{children}</a>;
  }

  // 3. Si es botón normal (onClick, submit, etc)
  return <button className={finalClass} {...props}>{children}</button>;
}