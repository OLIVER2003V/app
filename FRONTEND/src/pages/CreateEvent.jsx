import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/lib/api';
import './CreateEvent.css';

export default function ManageEvent() {
  // El `id` del evento viene de la URL, ej: /events/edit/:id
  const { id } = useParams();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    title: '',
    place: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: null, submitting: false });

  // Determina si estamos creando o editando
  const isEditing = Boolean(id);

  // Carga los datos del evento si estamos en modo edición
  useEffect(() => {
    const fetchEventData = async () => {
      if (isEditing) {
        try {
          const { data: eventData } = await api.get(`/events/${id}/`);
          setFormState({
            title: eventData.title || '',
            place: eventData.place?.id || '',
            start_date: eventData.start_date ? eventData.start_date.slice(0, 16) : '',
            end_date: eventData.end_date ? eventData.end_date.slice(0, 16) : '',
            description: eventData.description || '',
          });
        } catch (error) {
          setStatus(s => ({ ...s, error: 'No se pudo cargar el evento para editar.' }));
          console.error("Error fetching event:", error);
        }
      }
    };

    const fetchPlaces = async () => {
      try {
        const { data } = await api.get('/places/');
        setPlaces(data.results || data);
      } catch (error) {
        setStatus(s => ({ ...s, error: 'No se pudieron cargar los lugares.' }));
        console.error("Error fetching places:", error);
      }
    };

    const loadInitialData = async () => {
      setStatus({ loading: true, error: null, submitting: false });
      await Promise.all([fetchPlaces(), fetchEventData()]);
      setStatus({ loading: false, error: null, submitting: false });
    };

    loadInitialData();
  }, [id, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ ...status, submitting: true, error: null });

    const payload = {
      ...formState,
      place: formState.place || null, // Envía null si el lugar está vacío
    };

    try {
      if (isEditing) {
        await api.put(`/events/${id}/`, payload);
        alert('¡Evento actualizado con éxito!');
      } else {
        await api.post('/events/', payload);
        alert('¡Evento creado con éxito!');
      }
      navigate('/admin');
    } catch (err) {
      setStatus({ ...status, submitting: false, error: 'Error al guardar el evento. Revisa los datos.' });
      console.error(err);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setStatus({ ...status, submitting: true, error: null });
    
    try {
      await api.delete(`/events/${id}/`);
      alert('Evento eliminado correctamente.');
      navigate('/admin');
    } catch (err) {
      setStatus({ ...status, submitting: false, error: 'No se pudo eliminar el evento.' });
      console.error(err);
    }
  };

  if (status.loading) {
    return <div className="manage-event-page-loading">Cargando datos del evento...</div>;
  }

  return (
    <div className="manage-event-page">
      <div className="manage-event-container">
        <h1>{isEditing ? 'Editar Evento' : 'Crear Nuevo Evento'}</h1>
        <p>{isEditing ? 'Modifica los detalles y guarda los cambios.' : 'Completa el formulario para añadir un nuevo evento.'}</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Título del Evento</label>
            <input id="title" name="title" type="text" value={formState.title} onChange={handleInputChange} placeholder="Ej: Festival Gastronómico" required />
          </div>

          <div className="form-group">
            <label htmlFor="place">Lugar Asociado (Opcional)</label>
            <select id="place" name="place" value={formState.place} onChange={handleInputChange}>
              <option value="">-- Ninguno --</option>
              {places.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start_date">Fecha y Hora de Inicio</label>
              <input id="start_date" name="start_date" type="datetime-local" value={formState.start_date} onChange={handleInputChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="end_date">Fecha y Hora de Fin (Opcional)</label>
              <input id="end_date" name="end_date" type="datetime-local" value={formState.end_date} onChange={handleInputChange} min={formState.start_date} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción (Opcional)</label>
            <textarea id="description" name="description" value={formState.description} onChange={handleInputChange} rows="5" placeholder="Añade detalles sobre el evento..."></textarea>
          </div>

          {status.error && <div className="form-error">{status.error}</div>}

          <div className="form-actions">
            {isEditing && (
              <button type="button" className="btn btn--danger" onClick={handleDelete} disabled={status.submitting}>
                Eliminar
              </button>
            )}
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/admin')}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={status.submitting}>
              {status.submitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Evento')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}