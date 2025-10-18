import React, { useState, useEffect } from "react";
import api from "../lib/api";
import "./Contact.css";

/* Mapa de códigos → etiqueta amigable */
const CATEGORY_LABEL = {
  ASOCIACION: "Asociación y Guías",
  TRANSPORTE: "Transporte",
  GASTRONOMIA: "Gastronomía",
  OPERADORES: "Operadores Turísticos",
  GENERAL: "Redes Sociales y General",
};

/* Orden sugerido para secciones (las que no estén aquí van al final) */
const CATEGORY_ORDER = [
  "Asociación y Guías",
  "Transporte",
  "Gastronomía",
  "Operadores Turísticos",
  "Redes Sociales y General",
];

const ContactCard = ({ contact }) => {
  const formatWhatsappUrl = (number) => {
    if (!number) return "";
    const clean = String(number).replace(/[\s+]/g, "");
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="contact-card">
      <h4>{contact.name}</h4>
      <div className="contact-details">
        {contact.phone && (
          <p>
            <strong>Teléfono:</strong>{" "}
            <a href={`tel:${contact.phone}`}>{contact.phone}</a>
          </p>
        )}
        {contact.email && (
          <p>
            <strong>Email:</strong>{" "}
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </p>
        )}
        {contact.address && (
          <p>
            <strong>Dirección:</strong> {contact.address}
          </p>
        )}
      </div>
      <div className="contact-actions">
        {contact.whatsapp && (
          <a
            href={formatWhatsappUrl(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
          >
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

export default function Contact() {
  const [contactsByCategory, setContactsByCategory] = useState({});
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    api
      .get("/contact/")
      .then(({ data }) => {
        const items = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];

        // Agrupar por etiqueta final (display si viene; si no, mapeo; si no, “General”)
        const grouped = items.reduce((acc, c) => {
          const label =
            c.category_display ||
            CATEGORY_LABEL[c.category] ||
            "Redes Sociales y General";
          (acc[label] ||= []).push(c);
          return acc;
        }, {});

        // Ordenar: primero las del orden sugerido, luego cualquier otra categoría encontrada
        const found = Object.keys(grouped);
        const ordered = [
          ...CATEGORY_ORDER.filter((l) => found.includes(l)),
          ...found.filter((l) => !CATEGORY_ORDER.includes(l)),
        ];

        setContactsByCategory(grouped);
        setOrderedCategories(ordered);
      })
      .catch(() => setError("No se pudo cargar la información de contacto."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="contact-page">
      <header className="contact-header">
        <h1>Contactos</h1>
        <p>Conéctate con nuestra comunidad y operadores turísticos.</p>
      </header>

      <div className="contact-wrapper">
        {loading && <p>Cargando contactos...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && orderedCategories.length === 0 && (
          <p>No hay contactos disponibles por ahora.</p>
        )}

        {!loading && !error && orderedCategories.length > 0 && (
          <div className="contact-sections-container">
            {orderedCategories.map((category) => (
              <section key={category} className="contact-category-section">
                <h2>{category}</h2>
                <div className="contact-grid">
                  {contactsByCategory[category].map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
