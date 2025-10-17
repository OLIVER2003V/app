import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '@lib/api';
import './ReviewsAdmin.css';

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [actionState, setActionState] = useState({ type: null, id: null });

  const [view, setView] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    setReviews([]);
    try {
      const params = view === 'approved' ? { status: 'approved' } : {};
      const { data } = await api.get('/moderation/reviews/', { params });
      setReviews(Array.isArray(data) ? data : (data.results || []));
    } catch (err) {
      setError('No se pudieron cargar las opiniones. Es posible que no tengas permiso.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [view]);

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return reviews;
    const term = searchTerm.toLowerCase();
    return reviews.filter(r => 
      r.author_name.toLowerCase().includes(term) ||
      r.comment.toLowerCase().includes(term) ||
      r.place?.name.toLowerCase().includes(term)
    );
  }, [reviews, searchTerm]);

  const updateReviewStatus = async (reviewId, newStatus) => {
    const isApproving = newStatus;
    setActionState({ type: isApproving ? 'approving' : 'unapproving', id: reviewId });

    const reviewToUpdate = reviews.find(r => r.id === reviewId);
    if (!reviewToUpdate) {
      alert('Error interno: No se encontró la opinión en la lista.');
      setActionState({ type: null, id: null });
      return;
    }

    const payload = { ...reviewToUpdate, is_approved: newStatus };

    try {
      // La URL se construye aquí. Debe ser /api/moderation/reviews/{ID}/
      const url = `/moderation/reviews/${reviewId}/`;
      await api.patch(url, payload);
      
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      // ▼▼▼ MANEJO DE ERRORES MEJORADO ▼▼▼
      console.error("Error al actualizar la opinión:", err); // Muestra el error completo en la consola
      const status = err.response?.status;
      const errorData = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Error ${status || ''}: No se pudo actualizar la opinión.\nDetalles: ${errorData}`);
    } finally {
      setActionState({ type: null, id: null });
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta opinión permanentemente?')) return;
    setActionState({ type: 'deleting', id: reviewId });
    try {
      // La URL se construye aquí. Debe ser /api/moderation/reviews/{ID}/
      const url = `/moderation/reviews/${reviewId}/`;
      await api.delete(url);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      // ▼▼▼ MANEJO DE ERRORES MEJORADO ▼▼▼
      console.error("Error al eliminar la opinión:", err); // Muestra el error completo en la consola
      const status = err.response?.status;
      const errorData = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      alert(`Error ${status || ''}: No se pudo eliminar la opinión.\nDetalles: ${errorData}`);
    } finally {
      setActionState({ type: null, id: null });
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('es-BO', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderContent = () => {
    if (loading) return <div className="status-message">Cargando...</div>;
    if (error) return <div className="status-message error">{error}</div>;
    if (filteredReviews.length === 0) {
      return <div className="status-message">{searchTerm ? 'No se encontraron resultados.' : `No hay opiniones ${view === 'pending' ? 'pendientes' : 'aprobadas'}.`}</div>;
    }
    return (
      <div className="reviews-moderation-list">
        {filteredReviews.map(review => (
          <div key={review.id} className="review-moderation-card">
            <div className="review-card-main">
              <div className="review-card-header">
                <span className="review-author">{review.author_name}</span>
                <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
              </div>
              <p className="review-comment">"{review.comment}"</p>
              {review.photo && (
                <a href={review.photo} target="_blank" rel="noopener noreferrer">
                  <img src={review.photo} alt={`Foto de ${review.author_name}`} className="review-photo" />
                </a>
              )}
            </div>
            <div className="review-card-meta">
              <div className="meta-item">
                <strong>Lugar:</strong>
                <Link to={`/places/${review.place?.slug}`} target="_blank">{review.place?.name || 'N/A'}</Link>
              </div>
              <div className="meta-item">
                <strong>Enviado:</strong> {formatDate(review.created_at)}
              </div>
              <div className="review-actions">
                {view === 'pending' && (
                  <button className="btn-approve" onClick={() => updateReviewStatus(review.id, true)} disabled={actionState.id === review.id}>
                    {actionState.type === 'approving' && actionState.id === review.id ? 'Aprobando...' : 'Aprobar'}
                  </button>
                )}
                {view === 'approved' && (
                  <button className="btn-unapprove" onClick={() => updateReviewStatus(review.id, false)} disabled={actionState.id === review.id}>
                    {actionState.type === 'unapproving' && actionState.id === review.id ? '...' : 'Desaprobar'}
                  </button>
                )}
                <button className="btn-delete" onClick={() => handleDelete(review.id)} disabled={actionState.id === review.id}>
                  {actionState.type === 'deleting' && actionState.id === review.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-wrapper">
        <header className="admin-page-header">
          <h1>Moderación de Opiniones</h1>
          <button className="reload-button" onClick={fetchReviews} disabled={loading}>
            🔄 Recargar
          </button>
        </header>
        <div className="admin-toolbar">
          <div className="tabs">
            <button className={`tab ${view === 'pending' ? 'active' : ''}`} onClick={() => setView('pending')}>Pendientes</button>
            <button className={`tab ${view === 'approved' ? 'active' : ''}`} onClick={() => setView('approved')}>Aprobadas</button>
          </div>
          <input 
            type="search" 
            placeholder="Buscar por autor, lugar o comentario..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {renderContent()}
      </div>
    </div>
  );
}