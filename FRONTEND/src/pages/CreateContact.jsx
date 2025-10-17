import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import './CreateEvent.css'; // Reutilizaremos los estilos del formulario de eventos

export default function CreateContact() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'ASOCIACION',
    phone: '',
    whatsapp: '',
    email: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post('/contact/', formData);
      alert('¡Contacto creado con éxito!');
      navigate('/admin'); // Volver al dashboard
    } catch (err) {
      setError('Error al crear el contacto. Revisa los datos.');
      console.error(err.response?.data || err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Añadir Nuevo Contacto</h1>
        <p>Este contacto aparecerá en la página pública de contactos.</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="name">Nombre Completo</label>
            <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} placeholder="Ej: Carla Arroyo" required />
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría</label>
            <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
              <option value="ASOCIACION">Asociación y Guías</option>
              <option value="GASTRONOMIA">Gastronomía</option>
              <option value="TRANSPORTE">Transporte</option>
              <option value="OPERADORES">Operadores Turísticos</option>
              <option value="GENERAL">Redes Sociales y General</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="phone">Teléfono (Opcional)</label>
              <input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="Ej: 70482396" />
            </div>
            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp (Sin '+', Opcional)</label>
              <input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} placeholder="Ej: 59170482396" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email (Opcional)</label>
            <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="ejemplo@email.com" />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleInputChange} />
              Activo y visible en la página pública
            </label>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn btn--secondary" onClick={() => navigate('/admin')}>Cancelar</button>
            <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar Contacto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}