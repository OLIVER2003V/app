// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(form.username, form.password);

      // 1) intenta volver a la ruta protegida original
      const from = location.state?.from?.pathname;

      // 2) si no hay "from", decide por rol y manda al dashboard
      let role = null;
      try {
        const { data } = await api.get("/auth/me/");
        role = data?.profile?.role || null; // "admin" | "editor" | etc.
      } catch {}

      // en tu diseño, /dashboard ya renderiza Admin/Editor/User según el rol
      const fallback = "/dashboard";
      const target = from || fallback;

      nav(target, { replace: true });
    } catch (e) {
      setErr("Credenciales inválidas o servidor no disponible.");
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Ingresar</h1>
      <form onSubmit={onSubmit}>
        <input
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <input
          placeholder="Contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button type="submit">Entrar</button>
      </form>
      {err && <p style={{ color: "crimson" }}>{err}</p>}
    </div>
  );
}
