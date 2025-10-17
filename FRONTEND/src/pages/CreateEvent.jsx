import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import './CreateEvent.css';

export default function CreateEvent() {
  const [title, setTitle] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  
  const [places, setPlaces] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  // Cargar la lista de lugares para el dropdown
  useEffect(() => {
    api.get('/places/')
      .then(({ data }) => {
        setPlaces(data.results || data);
      })
      .catch(() => {
        setError('No se pudieron cargar los lugares. Asegúrate de que la API funciona.');
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const eventData = {
      title,
      start_date: startDate,
      description,
      // Solo incluir campos si tienen valor
      ...(placeId && { place: placeId }),
      ...(endDate && { end_date: endDate }),
    };

    try {
      // NOTA: Para que esto funcione, tu `EventViewSet` en el backend necesita
      // permisos de administrador para el método POST.
      await api.post('/events/', eventData);
      alert('¡Evento creado con éxito!');
      navigate('/admin'); // Redirigir al dashboard de admin
    } catch (err) {
      setError('Error al crear el evento. Revisa los datos o contacta al administrador del sistema.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Crear Nuevo Evento</h1>
        <p>Completa el formulario para añadir un nuevo evento al calendario.</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Título del Evento</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Festival Gastronómico"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="place">Lugar Asociado (Opcional)</label>
            <select id="place" value={placeId} onChange={(e) => setPlaceId(e.target.value)}>
              <option value="">-- Ninguno --</option>
              {places.map(place => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="start-date">Fecha y Hora de Inicio</label>
              <input
                id="start-date"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="end-date">Fecha y Hora de Fin (Opcional)</label>
              <input
                id="end-date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate} // No puede terminar antes de empezar
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descripción (Opcional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="5"
              placeholder="Añade detalles sobre el evento, como horarios, actividades especiales, etc."
            ></textarea>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/admin')}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}