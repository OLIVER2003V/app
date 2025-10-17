import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import './Contact.css';

// --- Componente reutilizable para cada tarjeta de contacto ---
const ContactCard = ({ contact }) => {
  // Formatea el número de WhatsApp eliminando espacios y '+'
  const formatWhatsappUrl = (number) => {
    if (!number) return '';
    const cleanNumber = number.replace(/[\s+]/g, '');
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="contact-card">
      <h4>{contact.name}</h4>
      <div className="contact-details">
        {contact.phone && <p><strong>Teléfono:</strong> <a href={`tel:${contact.phone}`}>{contact.phone}</a></p>}
        {contact.email && <p><strong>Email:</strong> <a href={`mailto:${contact.email}`}>{contact.email}</a></p>}
        {contact.address && <p><strong>Dirección:</strong> {contact.address}</p>}
      </div>
      <div className="contact-actions">
        {contact.whatsapp && (
          <a href={formatWhatsappUrl(contact.whatsapp)} target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

export default function Contact() {
  const [contactsByCategory, setContactsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get("/contact/")
      .then(({ data }) => {
        const items = data.results || data;
        
        // Agrupar contactos por categoría
        const grouped = items.reduce((acc, contact) => {
          const category = contact.category_display || 'General';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(contact);
          return acc;
        }, {});
        
        setContactsByCategory(grouped);
      })
      .catch(() => setError("No se pudo cargar la información de contacto."))
      .finally(() => setLoading(false));
  }, []);

  const categoryOrder = ['Asociación y Guías', 'Transporte', 'Gastronomía', 'Operadores Turísticos', 'Redes Sociales y General'];

  return (
    <div className="contact-page">
      <header className="contact-header">
        <h1>Contactos</h1>
        <p>Conéctate con nuestra comunidad y operadores turísticos.</p>
      </header>

      <div className="contact-wrapper">
        {loading && <p>Cargando contactos...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && (
          <div className="contact-sections-container">
            {categoryOrder.map(category => 
              contactsByCategory[category] && (
                <section key={category} className="contact-category-section">
                  <h2>{category}</h2>
                  <div className="contact-grid">
                    {contactsByCategory[category].map(contact => (
                      <ContactCard key={contact.id} contact={contact} />
                    ))}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}