import React from "react";
import { useAuth } from "@context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import EditorDashboard from "./EditorDashboard";
import UserDashboard from "./UserDashboard";

export default function Dashboard() {
  const { me } = useAuth();
  const role = me?.profile?.role; // "admin" | "editor" | "user" | undefined

  if (role === "admin") return <AdminDashboard />;
  if (role === "editor") return <EditorDashboard />;
  // por defecto, cualquier otro rol autenticado
  return <UserDashboard />;
}
