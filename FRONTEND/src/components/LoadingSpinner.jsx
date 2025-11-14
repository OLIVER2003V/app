// src/components/LoadingSpinner.jsx
import React from "react";

export const LoadingSpinner = () => (
  <div
    className="flex h-[80vh] items-center justify-center"
    role="status"
    aria-label="Cargando contenido"
  >
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
  </div>
);