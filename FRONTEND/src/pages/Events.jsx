import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import Modal from 'react-modal';
import api from '../lib/api';

// --- CSS de Librerías (Debe ir en el archivo principal si es necesario) ---
import 'react-big-calendar/lib/css/react-big-calendar.css';

// --- Configuración de localización (sin cambios) ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// --- Feriados (sin cambios) ---
const feriadosBolivia2025 = [
  { title: 'Año Nuevo', start: new Date('2025-01-01T00:00:00'), end: new Date('2025-01-01T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Fundación del Estado Plurinacional', start: new Date('2025-01-22T00:00:00'), end: new Date('2025-01-22T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Carnaval', start: new Date('2025-03-03T00:00:00'), end: new Date('2025-03-04T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Viernes Santo', start: new Date('2025-04-18T00:00:00'), end: new Date('2025-04-18T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Día del Trabajo', start: new Date('2025-05-01T00:00:00'), end: new Date('2025-05-01T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Corpus Christi', start: new Date('2025-06-19T00:00:00'), end: new Date('2025-06-19T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Año Nuevo Aymara', start: new Date('2025-06-21T00:00:00'), end: new Date('2025-06-21T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Día de la Independencia', start: new Date('2025-08-06T00:00:00'), end: new Date('2025-08-06T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Día de Todos los Santos', start: new Date('2025-11-02T00:00:00'), end: new Date('2025-11-02T23:59:59'), type: 'holiday', allDay: true },
  { title: 'Navidad', start: new Date('2025-12-25T00:00:00'), end: new Date('2025-12-25T23:59:59'), type: 'holiday', allDay: true },
];

Modal.setAppElement('#root');

export default function Events() {
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- Lógica de carga de datos (sin cambios) ---
  useEffect(() => {
    api.get("/events/")
      .then(({ data }) => {
        const communityEvents = (data.results || data).map(event => ({
          ...event,
          start: new Date(event.start_date),
          end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
          type: 'event',
          // Determina allDay basado en la duración del evento
          allDay: !event.end_date || (new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) >= 86400000,
        }));

        const combinedEvents = [...feriadosBolivia2025, ...communityEvents].sort((a, b) => a.start - b.start);
        setAllEvents(combinedEvents);

        const now = new Date();
        const futureEvents = communityEvents.filter(event => event.start >= now).slice(0, 5);
        setUpcomingEvents(futureEvents);
      })
      .catch(() => setError("No se pudieron cargar los eventos."))
      .finally(() => setLoading(false));
  }, []);

  // --- Asignador de clases de CSS ---
  const eventStyleGetter = (event) => ({
    // Estas clases se definen en el bloque <style> inferior
    className: `rbc-event--${event.type}`, 
  });
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };
  
  const closeModal = () => {
    setSelectedEvent(null);
  };

  const formatDate = (date) => format(date, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es });
  const formatTime = (date) => format(date, "h:mm a", { locale: es });


  return (
    // [MODIFICADO] Tema Claro
    <div className="min-h-screen bg-gray-100 text-gray-900">
      
      {/* [MODIFICADO] Encabezado Vibrante */}
      <header className="bg-gradient-to-r from-cyan-600 to-emerald-700 py-12 px-4 text-center text-white shadow-lg md:py-16">
        <h1 className="mb-2 text-4xl font-extrabold md:text-5xl">Calendario de Actividades</h1>
        <p className="text-lg text-cyan-100">Descubre qué está pasando en el Jardín de las Delicias.</p>
      </header>

      {/* --- Layout de 2 Columnas --- */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 p-4 py-8 md:grid-cols-[320px,1fr] md:py-12 lg:gap-8 lg:px-8">
        
        {/* --- Columna de Próximos Eventos --- */}
        <aside className="h-fit sticky top-6 rounded-lg bg-white p-5 shadow-xl">
          <h2 className="mt-0 border-b border-gray-200 pb-4 text-2xl font-bold text-gray-900">
            Próximos Eventos
          </h2>
          <div className="pt-4">
            {loading ? (
              <p className="text-gray-600">Cargando...</p>
            ) : upcomingEvents.length > 0 ? (
              <div className="flex flex-col gap-4">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex cursor-pointer items-center gap-4 rounded-lg bg-gray-50 p-4 transition-all duration-200 hover:translate-x-1 hover:bg-emerald-50/70 shadow-sm" 
                    onClick={() => handleSelectEvent(event)}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectEvent(event)}
                  >
                    {/* [NUEVO] Diseño de fecha con acento esmeralda */}
                    <div className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-100 text-emerald-800">
                      <span className="text-xs font-semibold uppercase tracking-wider">{format(event.start, 'MMM', { locale: es }).substring(0, 3)}</span>
                      <span className="text-3xl font-bold leading-none">{format(event.start, 'd')}</span>
                    </div>
                    <div>
                      <h3 className="mb-0.5 font-semibold text-gray-900">{event.title}</h3>
                      <p className="m-0 text-sm text-gray-600">
                        {event.allDay ? 'Todo el día' : formatTime(event.start)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No hay eventos comunitarios programados.</p>
            )}
          </div>
        </aside>

        {/* --- Columna del Calendario --- */}
        <main className="overflow-hidden rounded-lg bg-white p-4 shadow-xl md:p-6">
          <div className="h-[80vh] min-h-[650px]">
            {error && <p className="text-center text-red-600">{error}</p>}
            <Calendar
              localizer={localizer}
              culture="es"
              events={allEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              messages={{
                allDay: 'Todo el día', previous: '‹', next: '›', today: 'Hoy',
                month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
              }}
              views={[Views.MONTH, Views.AGENDA]}
            />
            {/* Leyenda con colores claros */}
            <div className="mt-4 flex justify-end gap-6 px-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-sm bg-emerald-500" /> Evento Comunitario
              </div>
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-sm bg-red-500" /> Feriado Nacional
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* --- Modal (Estilizado con Tailwind) --- */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onRequestClose={closeModal}
          // Clases de Tailwind para el Modal
          overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          className="relative w-full max-w-lg rounded-lg bg-white p-6 text-gray-900 shadow-2xl outline-none"
          contentLabel="Detalles del Evento"
        >
          <button 
            onClick={closeModal} 
            className="absolute top-3 right-3 text-3xl font-light text-gray-500 transition-colors hover:text-gray-900"
          >
            &times;
          </button>
          
          <h2 className={`mb-4 border-b border-gray-200 pb-4 text-2xl font-bold ${
            selectedEvent.type === 'holiday' ? 'text-red-600' : 'text-emerald-600'
          }`}>
            {selectedEvent.title}
          </h2>
          
          <div className="space-y-3 text-gray-700">
            <p className="font-semibold">Tipo: <span className="font-normal">{selectedEvent.type === 'holiday' ? 'Feriado Oficial' : 'Evento Comunitario'}</span></p>
            <p className="font-semibold">Inicio: <span className="font-normal">{formatDate(selectedEvent.start)}</span></p>
            {selectedEvent.end && (selectedEvent.end.toDateString() !== selectedEvent.start.toDateString()) && (
              <p className="font-semibold">Fin: <span className="font-normal">{formatDate(selectedEvent.end)}</span></p>
            )}
            
            {selectedEvent.description && (
              <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-inner">
                <strong className="text-gray-800">Descripción:</strong>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{selectedEvent.description}</p>
              </div>
            )}
            
            <button
              onClick={closeModal}
              className="mt-4 w-full rounded-md bg-emerald-600 py-2 font-semibold text-white transition-colors hover:bg-emerald-700"
            >
              Cerrar
            </button>
          </div>
        </Modal>
      )}
      
      {/* --- ESTILOS DEL CALENDARIO --- */}
      <style>{`
        /* Reset y Colores de Tema Claro */
        .rbc-calendar {
          font-family: inherit;
          color: #1f2937; /* gray-800 */
        }
        .rbc-header {
          padding: 8px 0;
          font-weight: 600;
          color: #374151; /* gray-700 */
          border-bottom: 1px solid #e5e7eb; /* gray-200 */
          border-left: none;
        }
        .rbc-day-bg {
          border-left: 1px solid #e5e7eb; /* gray-200 */
        }
        .rbc-month-view {
          border: 1px solid #e5e7eb;
          border-top: none;
        }

        /* Toolbar (Controles) */
        .rbc-toolbar button {
          border: 1px solid #d1d5db; /* gray-300 */
          border-radius: 6px;
          color: #374151; /* gray-700 */
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover,
        .rbc-toolbar button:active,
        .rbc-toolbar .rbc-active {
          background-color: #059669; /* emerald-600 */
          color: white;
          border-color: #059669;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .rbc-toolbar-label {
          font-weight: 700;
          font-size: 1.25rem; /* text-xl */
          color: #10b981; /* emerald-500 */
        }

        /* Días de la Semana y Celdas */
        .rbc-row-segment, .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid #e5e7eb;
        }
        .rbc-off-range-bg {
          background-color: #f3f4f6; /* gray-100 */
        }
        .rbc-today {
          background-color: #d1fae5; /* green-100, sutil */
        }

        /* Eventos Personalizados */
        .rbc-event {
          border: none !important;
          border-radius: 4px;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        /* Evento Comunitario (esmeralda) */
        .rbc-event--event {
          background-color: #10b981; /* emerald-500 */
          color: white;
        }
        /* Feriado (rojo) */
        .rbc-event--holiday {
          background-color: #ef4444; /* red-500 */
          color: white;
        }
        
        /* Vista Agenda */
        .rbc-agenda-table th {
          font-weight: 700;
          color: #10b981;
          border-bottom: 2px solid #10b981;
        }
        .rbc-agenda-view table {
          border: 1px solid #e5e7eb;
        }

        /* Fix para móviles */
        @media (max-width: 768px) {
          .rbc-toolbar button {
            padding: 8px 10px;
          }
          .rbc-toolbar-label {
            font-size: 1rem;
            text-align: center;
          }
          .rbc-toolbar {
            flex-wrap: wrap;
            justify-content: center;
          }
          .rbc-toolbar .rbc-btn-group {
            flex: 1 1 50%;
            margin-bottom: 8px;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}