import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

// Importa tus dashboards
import AdminDashboard from "../AdminDashboard";
import UserDashboard from "../UserDashboard";

export default function Dashboard() {
  const { me, loading } = useAuth();
  const nav = useNavigate();

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p>Cargando permisos...</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <p>No se encontró información de usuario. <button onClick={() => nav("/login")} className="text-blue-400 underline">Ir al Login</button></p>
      </div>
    );
  }

  const role = me?.profile?.role;

  // Editor y admin comparten el mismo panel: los permisos de backend ya son
  // los mismos para ambos en casi todo el contenido (ver AdminDashboard.jsx).
  if (role === "admin" || role === "editor") {
    return <AdminDashboard />;
  }

  return <UserDashboard />;
}
