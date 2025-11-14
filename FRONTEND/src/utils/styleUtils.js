// Mapeo de Colores de Categoría (Premium/Naturaleza)
const categoryStyles = {
  mirador: "bg-sky-600 text-white",
  cascada: "bg-blue-700 text-white",
  ruta: "bg-emerald-600 text-white",
  gastronomia: "bg-amber-600 text-white",
  hospedaje: "bg-purple-600 text-white",
  otro: "bg-slate-500 text-white",
};

export const getCategoryStyle = (category) => {
  const key = category?.toLowerCase() || 'otro';
  return categoryStyles[key] || categoryStyles.otro;
};