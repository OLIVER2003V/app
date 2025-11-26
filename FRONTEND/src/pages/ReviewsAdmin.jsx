import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '@/lib/api'; // Asegúrate que coincida con tu alias
import { 
  ArrowLeft, 
  Search, 
  Star, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MapPin, 
  Calendar, 
  User, 
  MessageSquare,
  ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [actionState, setActionState] = useState({ type: null, id: null });
  const [view, setView] = useState('pending'); // 'pending' | 'approved'
  const [searchTerm, setSearchTerm] = useState('');

  // --- API ---
  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = view === 'approved' ? { status: 'approved' } : {};
      const { data } = await api.get('/moderation/reviews/', { params });
      setReviews(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('No se pudieron cargar las opiniones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [view]);

  // --- Filtrado Local ---
  const filteredReviews = useMemo(() => {
    if (!searchTerm) return reviews;
    const term = searchTerm.toLowerCase();
    return reviews.filter(r => 
      r.author_name.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term) ||
      r.place?.name.toLowerCase().includes(term)
    );
  }, [reviews, searchTerm]);

  // --- Acciones ---
  const updateReviewStatus = async (reviewId, newStatus) => {
    const actionType = newStatus ? 'approving' : 'unapproving';
    setActionState({ type: actionType, id: reviewId });

    try {
      await api.patch(`/moderation/reviews/${reviewId}/`, { is_approved: newStatus });
      // Eliminamos de la lista actual porque cambiamos de vista (de pendiente a aprobado o viceversa)
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert("Error al actualizar el estado.");
    } finally {
      setActionState({ type: null, id: null });
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Eliminar esta opinión permanentemente?')) return;
    setActionState({ type: 'deleting', id: reviewId });
    try {
      await api.delete(`/moderation/reviews/${reviewId}/`);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert("Error al eliminar.");
    } finally {
      setActionState({ type: null, id: null });
    }
  };

  // --- Helpers UI ---
  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < count ? "fill-amber-400 text-amber-400" : "text-slate-700"}`} 
      />
    ));
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative overflow-hidden">
      
      {/* Fondo Decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/20 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-900/20 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Moderación</h1>
              <p className="text-slate-400 text-sm">Gestiona las experiencias de los usuarios.</p>
            </div>
          </div>

          {/* Stats Rápidas */}
          <div className="flex gap-3">
             <div className="bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl text-center">
                <span className="block text-2xl font-bold text-white">{reviews.length}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">{view === 'pending' ? 'Pendientes' : 'Aprobadas'}</span>
             </div>
          </div>
        </header>

        {/* --- TOOLBAR (Tabs + Buscador) --- */}
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-2 rounded-2xl flex flex-col md:flex-row gap-4 mb-8 sticky top-24 z-20 shadow-xl">
          
          {/* Tabs */}
          <div className="flex bg-slate-950 rounded-xl p-1">
            <button 
              onClick={() => setView('pending')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'pending' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Pendientes
            </button>
            <button 
              onClick={() => setView('approved')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${view === 'approved' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              Aprobadas
            </button>
          </div>

          {/* Buscador y Recargar */}
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input 
                className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="Buscar por autor, comentario o lugar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchReviews} 
              disabled={loading}
              className="h-10 w-10 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
              title="Recargar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* --- CONTENIDO --- */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
            <p className="text-slate-500">Cargando opiniones...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <MessageSquare className="h-12 w-12 text-slate-700 mb-3" />
            <p className="text-slate-400 font-medium text-lg">No hay opiniones {view === 'pending' ? 'pendientes' : 'aprobadas'}.</p>
            <p className="text-slate-600 text-sm">
              {searchTerm ? 'Intenta con otra búsqueda.' : '¡Todo está al día!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-5 flex flex-col shadow-lg hover:border-slate-700 transition-colors group"
              >
                {/* Header Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                      {review.author_name.charAt(0).toUpperCase() || <User className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm leading-tight">{review.author_name || "Anónimo"}</h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    #{review.id}
                  </span>
                </div>

                {/* Contenido */}
                <div className="flex-1 mb-4 relative">
                  <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800/50">
                    <p className="text-slate-300 text-sm italic leading-relaxed">"{review.comment}"</p>
                  </div>
                  
                  {/* Si tiene foto */}
                  {review.photo && (
                    <div className="mt-3 relative group/img cursor-pointer overflow-hidden rounded-xl border border-slate-700 h-32 w-full">
                      <a href={review.photo} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={review.photo} 
                          alt="Evidencia" 
                          className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110 opacity-80 group-hover/img:opacity-100" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <ImageIcon className="text-white h-6 w-6" />
                        </div>
                      </a>
                    </div>
                  )}
                </div>

                {/* Contexto */}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-5 border-t border-slate-800 pt-3">
                  <div className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                    <MapPin className="h-3.5 w-3.5" />
                    <Link to={`/places/${review.place?.slug}`} target="_blank" className="truncate max-w-[120px] hover:underline">
                      {review.place?.name || 'Lugar desconocido'}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(review.created_at)}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  {view === 'pending' ? (
                    <button 
                      onClick={() => updateReviewStatus(review.id, true)}
                      disabled={actionState.id === review.id}
                      className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      {actionState.id === review.id && actionState.type === 'approving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Aprobar
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateReviewStatus(review.id, false)}
                      disabled={actionState.id === review.id}
                      className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      {actionState.id === review.id && actionState.type === 'unapproving' ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                      Ocultar
                    </button>
                  )}

                  <button 
                    onClick={() => handleDelete(review.id)}
                    disabled={actionState.id === review.id}
                    className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-2.5 rounded-xl text-sm font-bold border border-red-500/20 transition-all disabled:opacity-50"
                  >
                    {actionState.id === review.id && actionState.type === 'deleting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Eliminar
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}