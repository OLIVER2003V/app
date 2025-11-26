import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Loader2, 
  FileText,
  Search
} from "lucide-react";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get("/posts/")
      .then(({ data }) => {
        const arr = Array.isArray(data) ? data : (data?.results || []);
        // Filtramos solo los publicados por seguridad visual
        setPosts(arr.filter(p => p.is_published));
      })
      .catch(err => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filtrado simple en cliente
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.place?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-BO", {
      year: "numeric", month: "long", day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
        <p className="animate-pulse">Cargando historias...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden pb-20">
      
      {/* --- FONDO AMBIENTAL --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        
        {/* --- HEADER DE LA PÁGINA --- */}
        <div className="text-center mb-16 space-y-4">
          <span className="text-cyan-400 font-bold tracking-widest uppercase text-xs border border-cyan-900/50 bg-cyan-950/30 px-3 py-1 rounded-full">
            Blog & Novedades
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            Explora el <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Paraíso</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Descubre guías de viaje, noticias sobre eventos y los secretos mejor guardados del Jardín de las Delicias.
          </p>

          {/* Barra de Búsqueda Pública */}
          <div className="max-w-md mx-auto mt-8 relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-slate-800 rounded-xl leading-5 bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all sm:text-sm shadow-lg"
              placeholder="Buscar artículos o lugares..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* --- GRID DE POSTS --- */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id} 
                className="group flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-slate-700 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Imagen de Portada */}
                <Link to={`/posts/${post.id}`} className="relative aspect-[4/3] overflow-hidden block">
                  {post.cover ? (
                    <img 
                      src={post.cover} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-slate-700" />
                    </div>
                  )}
                  
                  {/* Badge de Lugar (Si existe) */}
                  {post.place && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-orange-400" />
                      {post.place.name}
                    </div>
                  )}
                </Link>

                {/* Contenido de la Tarjeta */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Meta (Fecha) */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(post.created_at)}
                  </div>

                  {/* Título */}
                  <h2 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors">
                    <Link to={`/posts/${post.id}`}>
                      {post.title}
                    </Link>
                  </h2>

                  {/* Extracto (Truncado a 3 líneas) */}
                  <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {post.body}
                  </p>

                  {/* Footer Tarjeta */}
                  <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                    <Link 
                      to={`/posts/${post.id}`} 
                      className="inline-flex items-center gap-1 text-sm font-bold text-cyan-500 hover:text-cyan-400 transition-colors group/link"
                    >
                      Leer artículo 
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          // Estado Vacío
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
            <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
              <Search className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No encontramos nada</h3>
            <p className="text-slate-400">Intenta con otra búsqueda o vuelve más tarde.</p>
          </div>
        )}

      </div>
    </div>
  );
}