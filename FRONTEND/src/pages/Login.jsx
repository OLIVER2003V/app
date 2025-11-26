import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Asegúrate de que la ruta sea correcta
import api from "../lib/api"; // Asegúrate de que la ruta sea correcta

// --- Iconos Visuales ---
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setIsLoading(true);
    try {
      await login(form.username, form.password);

      const from = location.state?.from?.pathname;
      let role = null;
      try {
        const { data } = await api.get("/auth/me/");
        role = data?.profile?.role || null;
      } catch {}

      const fallback = "/dashboard";
      const target = from || fallback;

      nav(target, { replace: true });
    } catch (e) {
      setErr("Usuario o contraseña incorrectos.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* ================= SECCIÓN IZQUIERDA (IMAGEN) ================= */}
      {/* En desktop ocupa el 50% o 60%. En móvil está oculta o se usa de fondo. */}
      <div className="hidden lg:flex relative w-1/2 xl:w-2/3 bg-gray-900 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80" 
          alt="Luxury Destination" 
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors w-fit">
            <ArrowLeftIcon />
            <span className="font-semibold tracking-wide">Volver al inicio</span>
          </Link>
          
          <div className="mb-10">
            <h2 className="text-5xl font-serif font-medium leading-tight mb-4">
              Jardín de <br /><span className="text-orange-300 italic">las Delicias</span>
            </h2>
            <p className="text-gray-200 text-lg max-w-md font-light">
              Accede para gestionar tus reservas y continuar tu aventura en el paraíso.
            </p>
          </div>
        </div>
      </div>

      {/* ================= SECCIÓN DERECHA (FORMULARIO) ================= */}
      <div className="w-full lg:w-1/2 xl:w-1/3 flex flex-col justify-center items-center p-8 lg:p-12 relative">
        
        {/* Fondo móvil: Si es móvil, mostramos una imagen difuminada de fondo */}
        <div className="absolute inset-0 lg:hidden z-0">
             <img 
              src="https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80" 
              className="w-full h-full object-cover"
              alt="bg"
            />
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm" />
        </div>

        {/* Contenedor del Formulario */}
        <div className="w-full max-w-sm relative z-10">
          
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Bienvenido</h1>
            <p className="text-gray-500">Ingresa tus credenciales para continuar.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            
            {/* Input Usuario */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-semibold text-gray-700 block">Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon />
                </div>
                <input
                  id="username"
                  type="text"
                  placeholder="Ej. viajero123"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-gray-700 block">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all duration-200 shadow-sm"
                />
              </div>
            </div>

            {/* Mensaje de Error */}
            {err && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {err}
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 px-4 flex items-center justify-center rounded-xl text-white font-bold shadow-lg shadow-orange-500/30 transition-all duration-300
                ${isLoading 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 hover:scale-[1.02] active:scale-[0.98]"
                }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Ingresando...</span>
                </div>
              ) : (
                "Acceder al Panel"
              )}
            </button>
          </form>

          {/* Footer del Formulario */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="text-orange-600 font-semibold hover:underline">
                Contáctanos
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}