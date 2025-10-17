import { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    const load = async () => {
      if (!token) return setLoading(false);
      try {
        const { data } = await api.get("/auth/me/");
        setMe(data);
      } catch {
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  async function login(username, password) {
    // Si tu backend solo tiene /auth/token/login/, cambia la línea de abajo:
    const { data } = await api.post("/auth/login/", { username, password });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    const meRes = await api.get("/auth/me/");
    setMe(meRes.data);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setMe(null);
  }

  return (
    <AuthContext.Provider value={{ token, me, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
