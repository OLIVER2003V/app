import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import es from 'date-fns/locale/es';
import Modal from 'react-modal';
import api from '../lib/api';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Events.css';

// --- Configuración de localización ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// --- Feriados de Bolivia 2025 ---
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

Modal.setAppElement('#root'); // Mejora la accesibilidad

export default function Events() {
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    api.get("/events/")
      .then(({ data }) => {
        const communityEvents = (data.results || data).map(event => ({
          ...event,
          start: new Date(event.start_date),
          end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
          type: 'event',
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

  const eventStyleGetter = (event) => ({
    className: `rbc-event--${event.type}`,
  });
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };
  
  const closeModal = () => {
    setSelectedEvent(null);
  };

  const formatDate = (date) => format(date, "d 'de' MMMM 'de' yyyy, h:mm a", { locale: es });

  return (
    <div className="events-page">
      <header className="events-header">
        <h1>Calendario de Actividades</h1>
        <p>Descubre qué está pasando en el Jardín de las Delicias.</p>
      </header>

      <div className="events-layout">
        {/* Columna de Próximos Eventos */}
        <aside className="upcoming-events">
          <h2>Próximos Eventos</h2>
          {loading ? (
            <p>Cargando...</p>
          ) : upcomingEvents.length > 0 ? (
            <div className="upcoming-list">
              {upcomingEvents.map(event => (
                <div key={event.id} className="upcoming-card" onClick={() => handleSelectEvent(event)}>
                  <div className="upcoming-date">
                    <span className="month">{format(event.start, 'MMM', { locale: es })}</span>
                    <span className="day">{format(event.start, 'd')}</span>
                  </div>
                  <div className="upcoming-details">
                    <h3>{event.title}</h3>
                    <p>{format(event.start, 'eeee, h:mm a', { locale: es })}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay eventos comunitarios programados por el momento.</p>
          )}
        </aside>

        {/* Columna del Calendario */}
        <main className="calendar-main">
          <div className="calendar-wrapper">
            {error && <p className="error-message">{error}</p>}
            <Calendar
              localizer={localizer}
              culture="es" // <-- AÑADIDO: Esta línea activa el idioma español
              events={allEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '80vh' }}
              eventPropGetter={eventStyleGetter}
              onSelectEvent={handleSelectEvent}
              messages={{
                allDay: 'Todo el día', previous: '‹', next: '›', today: 'Hoy',
                month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
              }}
              views={[Views.MONTH, Views.AGENDA]}
            />
            <div className="legend">
              <div className="legend-item"><span className="color-box event"></span> Evento</div>
              <div className="legend-item"><span className="color-box holiday"></span> Feriado</div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal para detalles del evento */}
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onRequestClose={closeModal}
          className="event-modal"
          overlayClassName="event-modal-overlay"
          contentLabel="Detalles del Evento"
        >
          <button onClick={closeModal} className="close-modal-btn">&times;</button>
          <h2 className={selectedEvent.type === 'holiday' ? 'holiday-title' : 'event-title'}>
            {selectedEvent.title}
          </h2>
          <div className="event-modal-body">
            <p><strong>Inicio:</strong> {formatDate(selectedEvent.start)}</p>
            {selectedEvent.end && (selectedEvent.end.toDateString() !== selectedEvent.start.toDateString()) && (
              <p><strong>Fin:</strong> {formatDate(selectedEvent.end)}</p>
            )}
            {selectedEvent.description && (
              <div className="event-description">
                <strong>Descripción:</strong>
                <p>{selectedEvent.description}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}