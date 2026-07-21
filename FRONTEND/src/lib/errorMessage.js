// Extrae un mensaje legible de un error de axios/DRF, sin importar si el
// backend devolvió {detail: "..."}, {campo: ["error"]}, o un string/HTML
// crudo (por ejemplo un 500 sin manejar). Usado por las pantallas de admin
// para no volver a mostrar errores ilegibles al usuario.
export function getErrorMessage(err) {
  const data = err?.response?.data;
  if (!data) return err?.message || "Ocurrió un error inesperado.";
  if (typeof data === "string") return data.slice(0, 300);
  if (data.detail) return String(data.detail);
  if (typeof data === "object") {
    return Object.entries(data)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
      .join(" · ");
  }
  return "Ocurrió un error inesperado.";
}
