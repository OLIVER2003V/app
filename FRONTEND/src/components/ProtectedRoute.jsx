// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { token, me, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div style={{ padding: 20 }}>Cargando…</div>;
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roles?.length) {
    const role = me?.profile?.role;
    if (!role || !roles.includes(role)) {
      return <div style={{ padding: 20 }}>No autorizado</div>;
    }
  }
  return children;
}
