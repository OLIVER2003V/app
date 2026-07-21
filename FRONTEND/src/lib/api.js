// @/lib/api.js
import axios from "axios";

// Normaliza la URL base y asegura que termine en /api
const ROOT = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

const api = axios.create({
  baseURL: `${ROOT}/api`,
  withCredentials: false,
  headers: {
    Accept: "application/json",
  },
});

// Interceptor: agrega Content-Type y Authorization cuando corresponde
api.interceptors.request.use((cfg) => {
  const method = (cfg.method || "").toLowerCase();
  const needsBody = ["post", "put", "patch"].includes(method);

  if (needsBody && !(cfg.data instanceof FormData)) {
    cfg.headers["Content-Type"] = "application/json";
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) cfg.headers.Authorization = `Token ${token}`;

  return cfg;
});

// Interceptor: si el token expiró/es inválido a mitad de sesión, cierra sesión
// y redirige a login en vez de dejar que el usuario vea errores 401 crudos.
// Se excluyen /auth/login/ (credenciales incorrectas, no un token vencido) y
// /auth/me/ (AuthContext ya maneja ese caso de forma silenciosa al cargar).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isExemptEndpoint = url.includes("/auth/login") || url.includes("/auth/me");

    if (status === 401 && !isExemptEndpoint && typeof window !== "undefined") {
      const hadToken = !!localStorage.getItem("token");
      localStorage.removeItem("token");
      if (hadToken && !window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
