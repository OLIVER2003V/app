import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import './GalleryAdmin.css';

export default function GalleryAdmin() {
  const [items, setItems] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('IMAGE');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true); // <-- NUEVO: Estado para el checkbox
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    api.get('/gallery/')
      .then(({ data }) => {
        setItems(data.results || data);
      })
      .catch(() => setError('No se pudieron cargar los ítems de la galería.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchItems, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Debes seleccionar un archivo.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('media_type', mediaType);
    formData.append('media_file', file);
    formData.append('order', order);
    formData.append('is_active', isActive); // <-- NUEVO: Enviamos el estado activo

    try {
      await api.post('/gallery/', formData);
      // Limpiar formulario y recargar
      setTitle('');
      setFile(null);
      setOrder(0);
      setIsActive(true);
      document.getElementById('media_file').value = '';
      fetchItems();
    } catch (err) {
      setError('Error al subir el archivo.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este ítem?')) return;
    try {
      await api.delete(`/gallery/${id}/`);
      fetchItems();
    } catch (err) {
      alert('No se pudo eliminar el ítem.');
    }
  };

  // --- NUEVA FUNCIÓN PARA ACTIVAR/DESACTIVAR ---
  const handleToggleActive = async (item) => {
    try {
      await api.patch(`/gallery/${item.id}/`, { is_active: !item.is_active });
      fetchItems(); // Recargar la lista para ver el cambio
    } catch (err) {
      alert('No se pudo cambiar el estado.');
    }
  };

  return (
    <div className="gallery-admin-page">
      <div className="gallery-admin-container">
        <h1>Gestionar Galería Principal</h1>

        {/* Formulario de carga */}
        <form onSubmit={handleSubmit} className="upload-form">
          <h3>Añadir Nuevo Ítem</h3>
          {error && <p className="form-error">{error}</p>}
          <div className="form-row">
            <input name="title" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título o descripción" required />
            <select name="media_type" value={mediaType} onChange={e => setMediaType(e.target.value)}>
              <option value="IMAGE">Imagen</option>
              <option value="VIDEO">Video (MP4)</option>
            </select>
            <input name="order" type="number" value={order} onChange={e => setOrder(Number(e.target.value))} placeholder="Orden" />
          </div>
          <input id="media_file" name="media_file" type="file" onChange={e => setFile(e.target.files[0])} accept="image/*,video/mp4" required />
          
          {/* Checkbox para activar */}
          <div className="form-group-checkbox">
            <label>
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
              Activo y visible en la página principal
            </label>
          </div>

          <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
            {isSubmitting ? 'Subiendo...' : 'Añadir a la Galería'}
          </button>
        </form>

        {/* Lista de ítems existentes */}
        <div className="items-list">
          <h3>Ítems Actuales</h3>
          {loading ? <p>Cargando...</p> : (
            items.map(item => (
              <div key={item.id} className="gallery-item-row">
                <div className="item-info">
                  <span className={`item-status ${item.is_active ? 'active' : ''}`}></span>
                  <span className="item-title">{item.title}</span>
                  <span className="item-details">(Orden: {item.order}, Tipo: {item.media_type})</span>
                </div>
                <div className="item-actions">
                  <button onClick={() => handleToggleActive(item)} className={`btn-toggle ${item.is_active ? 'active' : ''}`}>
                    {item.is_active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-delete">Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}