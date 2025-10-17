import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";
import "./Login.css"; // 👈 Importa el CSS

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setIsLoading(true); // Inicia la carga
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
      setErr("Credenciales inválidas o servidor no disponible.");
    } finally {
      setIsLoading(false); // Finaliza la carga
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Ingresar</h1>
        <p className="login-subtitle">Accede a tu panel de control</p>
        <form onSubmit={onSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              placeholder="Escribe tu usuario"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Escribe tu contraseña"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Ingresando..." : "Entrar"}
          </button>
        </form>
        {err && <p className="login-error">{err}</p>}
      </div>
    </div>
  );
}