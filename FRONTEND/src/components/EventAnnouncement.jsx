import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';
import api from '../lib/api';

const DISMISS_KEY = 'dismissedEventAnnouncement';
// No queremos que el anuncio del turista interrumpa a alguien trabajando en
// el panel de administración.
const HIDDEN_PREFIXES = ['/admin', '/dashboard', '/login'];

// Pop-up del evento que el admin marcó como destacado (is_featured), pensado
// para promocionar rallys/ferias/carreras apenas alguien entra al sitio. Se
// muestra una sola vez por evento: al cerrarlo (o al hacer clic para ir a
// Eventos) queda recordado en este navegador y no vuelve a aparecer para ese
// mismo evento.
export default function EventAnnouncement() {
  const [event, setEvent] = useState(null);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    api.get('/events/')
      .then(({ data }) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data.results || []);
        const now = new Date();
        const candidates = list
          .filter((e) => e.is_featured && e.is_active && e.start_date && new Date(e.start_date) >= now)
          .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
        const next = candidates[0];
        if (!next) return;
        if (localStorage.getItem(DISMISS_KEY) === String(next.id)) return;
        setEvent(next);
        setVisible(true);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const dismiss = () => {
    if (event) localStorage.setItem(DISMISS_KEY, String(event.id));
    setVisible(false);
  };

  const goToEvents = () => {
    dismiss();
    navigate('/events');
  };

  const isHiddenRoute = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (!visible || !event || isHiddenRoute) return null;

  const start = new Date(event.start_date);
  const end = event.end_date ? new Date(event.end_date) : null;
  const allDay = !end || (end.getTime() - start.getTime()) >= 86400000;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300"
      onClick={dismiss}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={(e) => { e.stopPropagation(); goToEvents(); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToEvents(); } }}
        aria-label={`Ver más sobre ${event.title} en la sección de eventos`}
        className="group relative w-full max-w-sm cursor-pointer overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-300"
      >
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          aria-label="Cerrar anuncio"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
        >
          <X className="h-4 w-4" />
        </button>

        {/* La imagen se ve COMPLETA (object-contain), nunca recortada: son
            afiches diseñados con texto propio pegado a los bordes, así que
            recortarlos (object-cover) tapaba justo esa información. El
            fondo oscuro rellena el espacio sobrante si el afiche no calza
            exacto en el recuadro (como un "marco" de galería). */}
        {event.image ? (
          <div className="flex max-h-80 w-full items-center justify-center bg-slate-900">
            <img
              src={event.image}
              alt={event.title}
              className="max-h-80 w-full object-contain"
            />
          </div>
        ) : (
          <div className="h-20 w-full bg-gradient-to-br from-orange-500 to-red-500" />
        )}

        {/* Título y fecha viven en su propia franja blanca, separados de la
            imagen: antes iban superpuestos sobre la foto y, si el título
            era largo, terminaba en texto blanco sobre el fondo blanco de
            la tarjeta (invisible). Así siempre se ve completo. */}
        <div className="p-5 text-slate-900">
          <span className="mb-2 inline-block rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
            Próximo evento
          </span>
          <h3 className="mb-3 text-xl font-black leading-tight">{event.title}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {format(start, "d 'de' MMMM", { locale: es })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {allDay ? 'Todo el día' : format(start, 'h:mm a')}
            </span>
          </div>
        </div>

        <div className="px-5 pb-5">
          <span className="block w-full rounded-xl bg-slate-900 py-2.5 text-center text-sm font-bold text-white transition-colors group-hover:bg-slate-800">
            Ver todos los eventos
          </span>
        </div>
      </div>
    </div>
  );
}
