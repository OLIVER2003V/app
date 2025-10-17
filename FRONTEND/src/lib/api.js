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

export default api;
