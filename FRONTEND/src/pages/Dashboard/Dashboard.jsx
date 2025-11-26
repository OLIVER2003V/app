import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext"; // Verifica que esta ruta sea correcta
import { useNavigate } from "react-router-dom";

// Importa tus dashboards
import AdminDashboard from "../AdminDashboard";
import EditorDashboard from "../EditorDashboard"; // Si no existe, comenta esta línea
import UserDashboard from "../UserDashboard";

export default function Dashboard() {
  // 1. Extraemos todo lo posible del AuthContext
  const { me, loading, isAuthenticated } = useAuth();
  const nav = useNavigate();

  // 2. DEBUG: Esto imprimirá en tu consola (F12) qué está recibiendo exactamente
  useEffect(() => {
    console.log("--- DASHBOARD DEBUG ---");
    console.log("Loading:", loading);
    console.log("Usuario (me):", me);
    console.log("Rol detectado:", me?.profile?.role);
    console.log("-----------------------");
  }, [me, loading]);

  // 3. ESTADO DE CARGA: Pantalla negra con spinner para asegurar que es Admin
  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-900 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p>Cargando permisos...</p>
      </div>
    );
  }

  // 4. SEGURIDAD: Si no hay usuario, mandar al login
  if (!me) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <p>No se encontró información de usuario. <button onClick={() => nav("/login")} className="text-blue-400 underline">Ir al Login</button></p>
      </div>
    );
  }

  // 5. EXTRACCIÓN DEL ROL
  // Asegúrate de que tu API devuelve el rol en me.profile.role
  // Si tu API devuelve el rol directo en me.role, cambia esta línea.
  const role = me?.profile?.role; 

  // 6. RENDERIZADO SEGÚN ROL
  if (role === "admin") {
    return <AdminDashboard />;
  }
  
  if (role === "editor") {
    // Si no tienes componente de editor, usa AdminDashboard o crea uno dummy
    return typeof EditorDashboard !== "undefined" ? <EditorDashboard /> : <AdminDashboard />; 
  }

  // 7. FALLBACK (Usuario Normal)
  // Si llega aquí, es porque el rol NO es admin ni editor.
  // Agregué un pequeño aviso temporal arriba para que sepas que estás aquí por descarte.
  return (
    <div className="relative">
      {/* Este aviso rojo solo saldrá si estás viendo el panel de usuario por error */}
      {role !== "user" && (
        <div className="bg-red-600 text-white text-xs p-1 text-center">
          DEBUG: Se está mostrando Panel Usuario porque el rol detectado es: "{String(role)}"
        </div>
      )}
      <UserDashboard />
    </div>
  );
}