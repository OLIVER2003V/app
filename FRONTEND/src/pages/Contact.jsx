import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from "../lib/api";
// Ya no se necesita "./Contact.css"

/* --- Constantes de Categoría (sin cambios) --- */
const CATEGORY_LABEL = {
  ASOCIACION: "Asociación y Guías",
  TRANSPORTE: "Transporte",
  GASTRONOMIA: "Gastronomía",
  OPERADORES: "Operadores Turísticos",
  GENERAL: "Redes Sociales y General",
};

const CATEGORY_ORDER = [
  "Asociación y Guías",
  "Transporte",
  "Gastronomía",
  "Operadores Turísticos",
  "Redes Sociales y General",
];

/* --- [NUEVOS] Iconos para las tarjetas --- */
const WhatsappIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91a9.85 9.85 0 0 0-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.06 8.06 0 0 1-1.23-4.38c0-4.4 3.57-7.97 7.97-7.97s7.97 3.57 7.97 7.97-3.57 7.97-7.97 7.97zm4.28-5.48c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.96-.15.17-.3.19-.56.06-.26-.12-1.1-.4-2.09-1.28-.77-.69-1.29-1.53-1.44-1.79-.15-.25-.02-.38.11-.5.11-.11.25-.28.37-.42.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42-.14 0-.3 0-.47 0s-.42.08-.64.38c-.22.3-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.73 2.63 4.2 3.7.59.25 1.05.4 1.41.51.59.17 1.13.15 1.56.09.48-.06 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);
const PhoneIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
  </svg>
);
const EmailIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);
const LocationIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
);
/* ----------------------------------------------- */


/* --- Componente de Tarjeta de Contacto (Refactorizado) --- */
const ContactCard = ({ contact }) => {
  const formatWhatsappUrl = (number) => {
    if (!number) return "";
    const clean = String(number).replace(/[\s+]/g, "");
    return `https://wa.me/${clean}`;
  };

  return (
    // [NUEVO] Tema claro para la tarjeta
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-6 shadow-lg transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <h4 className="mb-4 text-xl font-bold text-gray-900">{contact.name}</h4>
      
      {/* [NUEVO] Detalles con iconos y colores de tema claro */}
      <div className="flex-grow space-y-3 text-sm text-gray-700">
        {contact.phone && (
          <p className="flex items-center gap-3">
            <PhoneIcon className="h-5 w-5 flex-shrink-0 text-gray-500" />
            <a href={`tel:${contact.phone}`} className="text-emerald-600 hover:underline">{contact.phone}</a>
          </p>
        )}
        {contact.email && (
          <p className="flex items-center gap-3">
            <EmailIcon className="h-5 w-5 flex-shrink-0 text-gray-500" />
            <a href={`mailto:${contact.email}`} className="truncate text-emerald-600 hover:underline">{contact.email}</a>
          </p>
        )}
        {contact.address && (
          <p className="flex items-start gap-3">
            <LocationIcon className="h-5 w-5 flex-shrink-0 text-gray-500" />
            <span>{contact.address}</span>
          </p>
        )}
      </div>

      <div className="mt-6">
        {contact.whatsapp && (
          <a
            href={formatWhatsappUrl(contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            // [NUEVO] Botón de WhatsApp con mejor contraste
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <WhatsappIcon className="h-5 w-5" />
            Contactar por WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};


/* --- Componente Principal de la Página --- */
export default function Contact() {
  const [contactsByCategory, setContactsByCategory] = useState({});
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lógica de carga (sin cambios)
  useEffect(() => {
    window.scrollTo(0, 0);
    api
      .get("/contact/")
      .then(({ data }) => {
        const items = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        const grouped = items.reduce((acc, c) => {
          const label =
            c.category_display ||
            CATEGORY_LABEL[c.category] ||
            "Redes Sociales y General";
          (acc[label] ||= []).push(c);
          return acc;
        }, {});
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
    // [NUEVO] Contenedor Principal (Tema Claro)
    <div className="min-h-screen bg-gray-100 pb-16 text-gray-900">
      
      {/* [NUEVO] Encabezado (Vibrante) */}
      <header className="bg-gradient-to-r from-cyan-600 to-emerald-700 py-12 px-4 text-center text-white shadow-lg md:py-16">
        <h1 className="mb-2 text-4xl font-extrabold md:text-5xl">Contactos</h1>
        <p className="text-lg text-cyan-100">Conéctate con nuestra comunidad y operadores turísticos.</p>
      </header>

      {/* --- Contenedor de Contenido --- */}
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {loading && (
          <p className="text-center text-lg text-gray-600">Cargando contactos...</p>
        )}
        
        {error && (
          <p className="text-center text-lg text-red-600">{error}</p>
        )}

        {!loading && !error && orderedCategories.length === 0 && (
          <p className="text-center text-lg text-gray-600">No hay contactos disponibles por ahora.</p>
        )}

        {!loading && !error && orderedCategories.length > 0 && (
          <div className="flex flex-col gap-12">
            {orderedCategories.map((category) => (
              <section key={category} className="contact-category-section">
                {/* [NUEVO] Título de Categoría (Tema Claro) */}
                <h2 className="mb-8 border-b-2 border-emerald-600 pb-4 text-3xl font-bold text-gray-900">
                  {category}
                </h2>
                {/* Grid de Tarjetas */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
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