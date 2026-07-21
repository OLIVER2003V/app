import React from 'react';
import {
  Clock,
  Ticket,
  Ban,
  Trees,
  Utensils,
  Backpack,
  Tent,
  AlertTriangle,
  MapPin,
  Info,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Seo from '../components/Seo';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Informacion() {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  const isEN = (i18n.language || '').startsWith('en');

  // El contenido de estas secciones lo carga el admin desde el panel (en
  // español y en inglés). Si todavía no cargó la traducción al inglés,
  // mostramos el texto en español antes que dejar la sección vacía; si no
  // hay nada guardado en la base, caemos al texto por defecto ya traducido
  // de los archivos de idioma (es.json/en.json).
  const pickList = (base, defaultKey) => {
    const enVal = settings?.[`${base}_en`];
    const esVal = settings?.[base];
    if (isEN && enVal?.length) return enVal;
    if (esVal?.length) return esVal;
    return t(defaultKey, { returnObjects: true });
  };
  const pickText = (base, defaultKey) => {
    const enVal = settings?.[`${base}_en`];
    const esVal = settings?.[base];
    if (isEN && enVal) return enVal;
    if (esVal) return esVal;
    return t(defaultKey);
  };

  const rules = pickList('park_rules', 'informacion.default_rules');
  const activities = pickList('activities', 'informacion.default_activities');
  const whatToBring = pickList('what_to_bring', 'informacion.default_what_to_bring');
  const securityText = pickText('security_text', 'informacion.default_security_text');
  const gastronomyText = pickText('gastronomy_text', 'informacion.default_gastronomy_text');
  const gastronomyNote = pickText('gastronomy_note', 'informacion.default_gastronomy_note');
  const campingText = pickText('camping_text', 'informacion.default_camping_text');

  const navSections = [
    { id: 'horarios', label: t('informacion.nav_schedule'), icon: Clock },
    { id: 'reglas', label: t('informacion.rules_title'), icon: Ban },
    { id: 'seguridad', label: t('informacion.safety_title'), icon: AlertTriangle },
    { id: 'actividades', label: t('informacion.activities_title'), icon: Trees },
    { id: 'gastronomia', label: t('informacion.gastronomy_title'), icon: Utensils },
    { id: 'que-llevar', label: t('informacion.what_to_bring_title'), icon: Backpack },
    { id: 'camping', label: t('informacion.camping_title'), icon: Tent },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans relative overflow-hidden">
      <Seo
        title="Información Esencial"
        description="Horarios, precios, qué llevar y recomendaciones para visitar Jardín de las Delicias en El Torno."
        path="/informacion"
      />

      {/* Fondo Decorativo */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-900/10 rounded-full blur-[128px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-20">

        {/* --- HEADER --- */}
        <div className="text-center mb-10 space-y-4">
          <span className="inline-flex items-center gap-2 text-emerald-400 font-bold tracking-widest uppercase text-xs border border-emerald-900/50 bg-emerald-950/30 px-3 py-1 rounded-full">
            <Info className="h-3 w-3" /> {t('informacion.badge')}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight">
            {t('informacion.title_pre')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{t('informacion.title_accent')}</span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            {t('informacion.subtitle')}
          </p>
        </div>

        {/* --- NAVEGACIÓN RÁPIDA --- */}
        <div className="no-scrollbar flex gap-2 overflow-x-auto mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center">
          {navSections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/50 backdrop-blur px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-emerald-500/40 hover:text-white"
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </a>
          ))}
        </div>

        {/* --- SECCIÓN DESTACADA: HORARIOS Y PRECIOS --- */}
        <div id="horarios" className="scroll-mt-24 grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">

          {/* Horarios */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-emerald-500/30 transition-colors group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <Clock className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{t('informacion.schedule_card_title')}</h3>
              <p className="text-slate-400 text-sm mb-2">{t('informacion.schedule_card_sub')}</p>
              <div className="text-2xl font-black text-white">{settings?.schedule_hours || "08:00 - 18:00"} <span className="text-sm font-medium text-slate-500">{t('informacion.hours_unit')}</span></div>
            </div>
          </div>

          {/* Tarifas */}
          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 flex items-start gap-4 hover:border-orange-500/30 transition-colors group">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
              <Ticket className="h-8 w-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-3">{t('informacion.prices_card_title')}</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-300 text-sm">{t('informacion.price_general')}</span>
                  <span className="font-bold text-white">{settings?.general_price ?? 15} Bs</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-300 text-sm">{t('informacion.price_students')}</span>
                  <span className="font-bold text-white">{settings?.park_fee_students ?? 10} Bs</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-300 text-sm">{t('informacion.price_nationals')}</span>
                  <span className="font-bold text-white">{settings?.park_fee_nationals ?? 20} Bs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 text-sm">{t('informacion.price_foreigners')}</span>
                  <span className="font-bold text-white">{settings?.park_fee_foreigners ?? 100} Bs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- GRID DE INFORMACIÓN DETALLADA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Columna 1: Reglas (Importante) */}
          <div className="lg:col-span-1 space-y-8">
            <div id="reglas" className="scroll-mt-24 bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <Ban className="h-6 w-6" /> {t('informacion.rules_title')}
              </h2>
              <ul className="space-y-3 text-slate-300 text-sm">
                {rules.map((rule, idx) => (
                  <li key={idx} className="flex gap-3 items-start">
                    <span className="text-red-500 font-bold">•</span> {rule}
                  </li>
                ))}
              </ul>
            </div>

            <div id="seguridad" className="scroll-mt-24 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-amber-400" /> {t('informacion.safety_title')}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {securityText}
              </p>
            </div>
          </div>

          {/* Columna 2 y 3: Actividades y Servicios */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Actividades */}
            <div id="actividades" className="scroll-mt-24 bg-slate-900/30 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Trees className="h-6 w-6 text-green-400" /> {t('informacion.activities_title')}
              </h2>
              <ul className="space-y-3 text-slate-300 text-sm">
                {activities.map((activity, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> {activity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Gastronomía */}
            <div id="gastronomia" className="scroll-mt-24 bg-slate-900/30 border border-slate-800 hover:bg-slate-900 hover:border-slate-700 transition-all rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Utensils className="h-6 w-6 text-orange-400" /> {t('informacion.gastronomy_title')}
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                {gastronomyText}
              </p>
              <div className="bg-slate-800/50 p-3 rounded-lg text-xs text-slate-300 border border-slate-700">
                {gastronomyNote}
              </div>
            </div>

            {/* Recomendaciones (Span 2 cols en MD) */}
            <div id="que-llevar" className="scroll-mt-24 md:col-span-2 bg-gradient-to-br from-indigo-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Backpack className="h-6 w-6 text-indigo-400" /> {t('informacion.what_to_bring_title')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whatToBring.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <CheckCircleIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                    <p className="text-sm text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Camping */}
            <div id="camping" className="scroll-mt-24 md:col-span-2 bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center">
              <div className="p-4 bg-emerald-500/20 rounded-full text-emerald-400">
                <Tent className="h-8 w-8" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-white">{t('informacion.camping_title')}</h3>
                <p className="text-slate-400 text-sm mt-1">
                  {campingText}
                </p>
                <div className="mt-3 inline-block bg-emerald-500/10 text-emerald-300 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-500/20">
                  {t('informacion.camping_cost_prefix')} {settings?.camping_price_per_tent ?? 10} Bs {t('informacion.camping_cost_suffix')}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">{t('informacion.footer_title')}</h2>
          <p className="text-slate-500 mb-6">{t('informacion.footer_sub')}</p>
          <div className="inline-flex gap-2 items-center text-emerald-400 bg-emerald-900/30 px-4 py-2 rounded-full border border-emerald-800/50 text-sm">
            <MapPin className="h-4 w-4" /> El Torno, Santa Cruz, Bolivia
          </div>
        </div>

      </div>
    </div>
  );
}

// Pequeño componente auxiliar para el check
function CheckCircleIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
