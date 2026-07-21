import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, subDays } from 'date-fns';
import es from 'date-fns/locale/es';
import Modal from 'react-modal';
import { X, Calendar as CalendarIcon, Clock, AlignLeft, MessageCircle } from 'lucide-react'; // Usamos Lucide para iconos
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import Seo from '../components/Seo';

// Estilos base de la librería
import 'react-big-calendar/lib/css/react-big-calendar.css';

// --- 1. CONFIGURACIÓN DE FECHAS ---
const locales = { 'es': es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  // Antes ignoraba la fecha que le pasaba el calendario y siempre devolvía
  // el inicio de ESTA semana (la de hoy), sin importar qué mes/fecha se
  // estuviera dibujando. Eso corrompía el cálculo de filas del mes entero,
  // haciendo que eventos de meses lejanos (nov/dic/ene) se amontonaran en
  // la celda equivocada de julio. Tiene que respetar el parámetro `date`.
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }), // Lunes
  getDay,
  locales,
});

// --- 2. ALGORITMO PARA FERIADOS DINÁMICOS (BOLIVIA) ---
const getEaster = (year) => {
  const f = Math.floor,
    G = year % 19,
    C = f(year / 100),
    H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
    I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
    J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
    L = I - J,
    month = 3 + f((L + 40) / 44),
    day = L + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
};

const getHolidaysForYear = (year) => {
  const easter = getEaster(year);
  
  // Feriados Fijos
  const fixed = [
    { title: 'Año Nuevo', date: new Date(year, 0, 1) },
    { title: 'Estado Plurinacional', date: new Date(year, 0, 22) },
    { title: 'Día del Trabajo', date: new Date(year, 4, 1) },
    { title: 'Año Nuevo Aymara', date: new Date(year, 5, 21) },
    { title: 'Día de la Independencia', date: new Date(year, 7, 6) },
    { title: 'Todos los Santos', date: new Date(year, 10, 2) },
    { title: 'Navidad', date: new Date(year, 11, 25) },
  ];

  // Feriados Movibles (basados en Pascua)
  const movable = [
    { title: 'Carnaval (Lunes)', date: subDays(easter, 48) },
    { title: 'Carnaval (Martes)', date: subDays(easter, 47) },
    { title: 'Viernes Santo', date: subDays(easter, 2) },
    { title: 'Corpus Christi', date: addDays(easter, 60) },
  ];

  return [...fixed, ...movable].map(h => ({
    title: h.title,
    start: h.date,
    end: h.date, // Feriados son de 1 día
    type: 'holiday',
    allDay: true
  }));
};

// Generar feriados para un rango de años (ej: anterior, actual, siguiente)
const generateHolidaysRange = () => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2]; // Cubrimos 4 años
  return years.flatMap(y => getHolidaysForYear(y));
};

Modal.setAppElement('#root');

export default function Events() {
  const { t } = useTranslation();
  const [allEvents, setAllEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // 1. Cargar eventos del backend
        const { data } = await api.get("/events/");
        const apiEvents = (data.results || data).map(event => ({
          ...event,
          start: new Date(event.start_date),
          end: event.end_date ? new Date(event.end_date) : new Date(event.start_date),
          type: 'event',
          allDay: !event.end_date || (new Date(event.end_date).getTime() - new Date(event.start_date).getTime()) >= 86400000,
        }));

        // 2. Generar feriados matemáticamente
        const holidays = generateHolidaysRange();

        // 3. Combinar
        const combined = [...holidays, ...apiEvents].sort((a, b) => a.start - b.start);
        setAllEvents(combined);

        // 4. Filtrar próximos
        const now = new Date();
        // Reseteamos horas para comparar solo fecha
        now.setHours(0, 0, 0, 0);

        const future = combined
          .filter(e => e.start >= now)
          .slice(0, 6); // Mostrar los próximos 6

        setUpcomingEvents(future);

        // 5. Historial: solo eventos reales (no feriados) que ya pasaron,
        // más recientes primero — para que el evento no desaparezca del
        // sitio sin más al vencer, sino que quede como registro.
        const past = apiEvents
          .filter(e => e.type === 'event' && e.start < now)
          .sort((a, b) => b.start - a.start)
          .slice(0, 6);

        setPastEvents(past);

      } catch (err) {
        console.error(err);
        setError("Hubo un problema al cargar el calendario.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // --- Estilos Dinámicos para el Calendario ---
  const eventStyleGetter = (event) => {
    const isHoliday = event.type === 'holiday';
    return {
      className: isHoliday ? 'rbc-event--holiday' : 'rbc-event--community',
      style: {
        backgroundColor: isHoliday ? '#ef4444' : '#10b981', // Tailwind red-500 / emerald-500
        borderRadius: '6px',
        border: 'none',
        color: 'white',
        fontWeight: '500',
        fontSize: '0.85rem',
        padding: '2px 5px'
      }
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Seo
        title="Eventos y Actividades"
        description="Calendario de eventos, ferias y actividades culturales en Jardín de las Delicias, El Torno."
        path="/events"
      />

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 text-center">
          <span className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-emerald-600 uppercase bg-emerald-100 rounded-full">
            {t('events.badge')}
          </span>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            {t('events.title_pre')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">{t('events.title_accent')}</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {t('events.subtitle')}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-8 items-start">
          
          {/* --- SIDEBAR: PRÓXIMOS EVENTOS --- */}
          <aside className="lg:sticky lg:top-8 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-emerald-500" />
                  {showHistory ? 'Historial' : 'Próximos Eventos'}
                </h2>
                <div className="flex rounded-full bg-slate-200/70 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowHistory(false)}
                    className={`px-2.5 py-1 rounded-full transition-colors ${!showHistory ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Próximos
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowHistory(true)}
                    className={`px-2.5 py-1 rounded-full transition-colors ${showHistory ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Historial
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-slate-400">Cargando agenda...</div>
                ) : (showHistory ? pastEvents : upcomingEvents).length > 0 ? (
                  (showHistory ? pastEvents : upcomingEvents).map((evt, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedEvent(evt)}
                      className={`group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 ${showHistory ? 'opacity-80' : ''}`}
                    >
                      {/* Fecha Badge */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-white shadow-md
                        ${showHistory ? 'bg-slate-400' : evt.type === 'holiday' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        <span className="text-[10px] uppercase font-bold leading-none opacity-80">
                          {format(evt.start, 'MMM', { locale: es })}
                        </span>
                        <span className="text-xl font-black leading-none mt-0.5">
                          {format(evt.start, 'd')}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pt-1">
                        <h3 className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors">
                          {evt.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {evt.allDay ? 'Todo el día' : format(evt.start, 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-slate-500 text-sm py-4">
                    {showHistory ? 'Todavía no hay eventos pasados.' : 'No hay eventos próximos.'}
                  </p>
                )}
              </div>
            </div>

            {/* Leyenda */}
            <div className="bg-white rounded-2xl shadow-sm p-5 border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Referencias</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Evento Comunitario
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span> Feriado Nacional
                    </div>
                </div>
            </div>

          </aside>

          {/* --- CALENDARIO PRINCIPAL --- */}
          <main className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 md:p-6 overflow-hidden">
            {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {error}
                </div>
            )}
            
            <div className="h-[750px] custom-calendar-wrapper">
              <Calendar
                localizer={localizer}
                events={allEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={setSelectedEvent}
                culture="es"
                messages={{
                    allDay: 'Todo el día',
                    previous: 'Anterior',
                    next: 'Siguiente',
                    today: 'Hoy',
                    month: 'Mes',
                    week: 'Semana',
                    day: 'Día',
                    agenda: 'Agenda',
                    date: 'Fecha',
                    time: 'Hora',
                    event: 'Evento',
                    noEventsInRange: 'No hay eventos en este rango.',
                }}
                views={[Views.MONTH, Views.AGENDA]} // Simplificamos las vistas para mejor UX
              />
            </div>
          </main>

        </div>
      </div>

      {/* --- MODAL DETALLE --- */}
      <Modal
        isOpen={!!selectedEvent}
        onRequestClose={() => setSelectedEvent(null)}
        className="outline-none"
        overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      >
        {selectedEvent && (
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

                {/* Header Modal: foto del evento completa (sin recortar, son
                    afiches con texto propio pegado a los bordes) si hay, si
                    no el bloque de color de siempre. El título vive siempre
                    en la franja de abajo, nunca superpuesto a la imagen, así
                    no depende del contraste de la foto ni se corta. */}
                {selectedEvent.image ? (
                    <div className="relative flex max-h-64 shrink-0 items-center justify-center bg-slate-900">
                        <img src={selectedEvent.image} alt={selectedEvent.title} className="max-h-64 w-full object-contain" />
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 p-1 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-white"
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                ) : (
                    <div className={`p-6 text-white relative shrink-0 ${selectedEvent.type === 'holiday' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        <button
                            onClick={() => setSelectedEvent(null)}
                            className="absolute top-4 right-4 p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors text-white"
                            aria-label="Cerrar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <span className="text-xs font-bold uppercase tracking-wider bg-black/20 px-2 py-1 rounded inline-block mb-2">
                            {selectedEvent.type === 'holiday' ? 'Feriado' : selectedEvent.start < new Date() ? 'Evento finalizado' : 'Evento'}
                        </span>
                        <h2 className="text-2xl font-black leading-tight">{selectedEvent.title}</h2>
                    </div>
                )}

                {/* Body Modal */}
                <div className="p-6 space-y-4 overflow-y-auto">
                    {selectedEvent.image && (
                        <div>
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded inline-block mb-2 text-white ${selectedEvent.type === 'holiday' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                                {selectedEvent.type === 'holiday' ? 'Feriado' : selectedEvent.start < new Date() ? 'Evento finalizado' : 'Evento'}
                            </span>
                            <h2 className="text-2xl font-black leading-tight text-slate-900">{selectedEvent.title}</h2>
                        </div>
                    )}

                    <div className="flex items-start gap-3">
                        <CalendarIcon className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-slate-700">Fecha</p>
                            <p className="text-slate-600">
                                {format(selectedEvent.start, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-slate-700">Horario</p>
                            <p className="text-slate-600">
                                {selectedEvent.allDay ? 'Todo el día' : `${format(selectedEvent.start, 'h:mm a')} - ${format(selectedEvent.end, 'h:mm a')}`}
                            </p>
                        </div>
                    </div>

                    {selectedEvent.description && (
                        <div className="pt-4 border-t border-slate-100 mt-4">
                            <div className="flex items-start gap-3">
                                <AlignLeft className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-slate-700 mb-1">Detalles</p>
                                    <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedEvent.whatsapp_url && (
                        <a
                            href={selectedEvent.whatsapp_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-colors"
                        >
                            <MessageCircle className="h-5 w-5" /> Consultar por WhatsApp
                        </a>
                    )}

                    <button
                        onClick={() => setSelectedEvent(null)}
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        )}
      </Modal>

      {/* --- CSS OVERRIDES PARA REACT-BIG-CALENDAR --- */}
      {/* Esto adapta la librería al look & feel de Tailwind */}
      <style>{`
        .rbc-calendar { font-family: inherit; color: #334155; }
        .rbc-header { padding: 12px 0; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
        .rbc-month-view { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
        .rbc-day-bg { border-left: 1px solid #f1f5f9; }
        .rbc-off-range-bg { background-color: #f8fafc; }
        .rbc-today { background-color: #ecfdf5; } /* emerald-50 */
        
        /* Toolbar Styling */
        .rbc-toolbar { margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .rbc-toolbar-label { font-size: 1.25rem; font-weight: 800; color: #1e293b; text-transform: capitalize; }
        .rbc-btn-group button { border: 1px solid #e2e8f0; color: #475569; font-weight: 600; padding: 6px 12px; font-size: 0.875rem; border-radius: 8px; transition: all 0.2s; }
        .rbc-btn-group button:hover { background-color: #f1f5f9; color: #0f172a; }
        .rbc-btn-group button.rbc-active { background-color: #10b981; color: white; border-color: #10b981; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.3); }
        .rbc-btn-group > button:first-child:not(:last-child) { border-top-right-radius: 0; border-bottom-right-radius: 0; }
        .rbc-btn-group > button:last-child:not(:first-child) { border-top-left-radius: 0; border-bottom-left-radius: 0; }
        
        /* Event Styling Overrides */
        .rbc-event { box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.1s; }
        .rbc-event:hover { transform: scale(1.02); z-index: 10; }
        .rbc-day-slot .rbc-event { border: 1px solid rgba(255,255,255,0.2); }
        .rbc-show-more { color: #10b981; font-weight: 600; font-size: 0.8rem; }
      `}</style>
    </div>
  );
}