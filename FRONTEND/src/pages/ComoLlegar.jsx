import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InteractiveTrailMap from '../components/InteractiveTrailMap';
import Seo from '../components/Seo';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { ExternalLink, Copy, X, MapPin, Navigation, Signpost } from 'lucide-react';

// --- Constantes ---
const DEFAULT_YOUTUBE_VIDEO_ID = "rMBSyYd7JJE";
const DEFAULT_TRANSPORT_OPTIONS = [
  { emoji: '🚙', label: 'Camioneta 4x4', price: 25 },
  { emoji: '🛵', label: 'Mototaxi', price: 100 },
];

// --- COMPONENTE DE AVISO (FIX PARA TIKTOK) ---
const TikTokFixOverlay = ({ onClose }) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center relative overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                </button>
                <div className="mb-4 flex justify-center">
                    <div className="bg-cyan-100 p-4 rounded-full">
                        <ExternalLink className="w-8 h-8 text-cyan-600" />
                    </div>
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">
                    {t('comollegar.tiktok_title')}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed text-sm">
                    {t('comollegar.tiktok_desc')}
                </p>
                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 text-left space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">1</span>
                        <p className="text-xs text-slate-700">
                          {t('comollegar.tiktok_step1_pre')}{' '}
                          <strong className="text-slate-900">{t('comollegar.tiktok_step1_bold')}</strong>{' '}
                          {t('comollegar.tiktok_step1_post')}
                        </p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-cyan-600 rounded-full flex items-center justify-center text-xs font-bold text-white">2</span>
                        <p className="text-xs text-slate-700">
                          {t('comollegar.tiktok_step2_pre')}{' '}
                          <strong className="text-slate-900">{t('comollegar.tiktok_step2_bold')}</strong>{' '}
                          {t('comollegar.tiktok_step2_post')}
                        </p>
                    </div>
                </div>
                <button
                    onClick={copyLink}
                    className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                        copied
                        ? "bg-emerald-600 text-white shadow-emerald-600/30"
                        : "bg-white border border-slate-300 text-slate-900 hover:bg-slate-50"
                    }`}
                >
                    <Copy className="w-4 h-4" />
                    {copied ? t('comollegar.tiktok_copied') : t('comollegar.tiktok_copy')}
                </button>
                <button onClick={onClose} className="mt-4 text-xs text-slate-400 underline">
                    {t('comollegar.tiktok_skip')}
                </button>
            </div>
        </div>
    );
};

export default function ComoLlegar() {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  const isEN = (i18n.language || '').startsWith('en');
  const youtubeVideoId = settings?.route_video_youtube_id || DEFAULT_YOUTUBE_VIDEO_ID;
  const transportOptions = settings?.transport_options?.length ? settings.transport_options : DEFAULT_TRANSPORT_OPTIONS;
  const routeStartText = isEN
    ? (settings?.route_start_text_en || settings?.route_start_text)
    : settings?.route_start_text;

  const [trail, setTrail] = useState([]);
  const [error, setError] = useState(null);
  const [showTikTokOverlay, setShowTikTokOverlay] = useState(false);
  const [gpsErrorFromMap, setGpsErrorFromMap] = useState(null);

  // Detectar navegador interno o error de GPS
  useEffect(() => {
    const isMobileScreen = window.innerWidth < 768;
    if (gpsErrorFromMap && isMobileScreen && !showTikTokOverlay) {
        setShowTikTokOverlay(true);
    }
  }, [gpsErrorFromMap]);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isInternalApp = (ua.indexOf("TikTok") > -1) || (ua.indexOf("Instagram") > -1) || (ua.indexOf("FBAN") > -1);
    if (isInternalApp) setShowTikTokOverlay(true);

    fetch('/ruta.json')
      .then(r => r.ok ? r.json() : Promise.reject('Error cargando ruta'))
      .then(data => {
        const coords = data.features?.[0]?.geometry?.coordinates;
        if(coords) setTrail(coords.map(c => [c[1], c[0]]));
      })
      .catch(() => setError(t('comollegar.map_error')));
  }, [t]);

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 pb-10">
      <Seo
        title={t('comollegar.title')}
        description="Ruta, mapa GPS en vivo y transporte para llegar a Jardín de las Delicias desde El Torno, Santa Cruz."
        path="/como-llegar"
      />

      {showTikTokOverlay && <TikTokFixOverlay onClose={() => setShowTikTokOverlay(false)} />}

      {/* --- Encabezado Compacto --- */}
      <header className="bg-gradient-to-br from-cyan-700 to-emerald-800 pt-8 pb-16 px-4 text-center shadow-lg">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-black text-white md:text-5xl tracking-tight">
            {t('comollegar.title')}
          </h1>
          <p className="mt-2 text-cyan-100 font-medium text-sm md:text-base">
            {t('comollegar.subtitle')}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 -mt-10">

        {/* --- PUNTO DE PARTIDA (solo si el admin lo cargó) --- */}
        {routeStartText && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border border-slate-200 p-5 flex items-start gap-4">
            <div className="bg-cyan-100 p-2.5 rounded-xl shrink-0">
              <Signpost className="w-5 h-5 text-cyan-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm mb-1">{t('comollegar.route_start_title')}</h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{routeStartText}</p>
            </div>
          </div>
        )}

        {/* --- TARJETA PRINCIPAL DE NAVEGACIÓN --- */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

            {/* Cabecera de la Tarjeta */}
            <div className="bg-white p-4 md:p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2.5 rounded-xl">
                        <MapPin className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg leading-tight">{t('comollegar.map_card_title')}</h2>
                        <p className="text-xs text-slate-500 font-medium">{t('nav.brand')}</p>
                    </div>
                </div>
            </div>

            {/* --- EL MAPA (GIGANTE) --- */}
            <div className="relative w-full h-[42vh] md:h-[65vh] bg-slate-200">
                {error ? (
                  <div className="flex h-full items-center justify-center bg-red-50 p-6 text-center text-red-600 font-medium">
                    {error}
                  </div>
                ) : (
                  <InteractiveTrailMap
                        trailData={trail}
                        onGpsErrorChange={setGpsErrorFromMap}
                    />
                )}
            </div>

            {/* --- INFORMACIÓN INFERIOR --- */}
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                {/* Bloque 1: Estado */}
                <div className="p-6 flex items-start gap-4">
                    <Navigation className="w-6 h-6 text-blue-500 mt-1 shrink-0" />
                    <div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">{t('comollegar.status_title')}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {t('comollegar.status_desc')}
                        </p>
                    </div>
                </div>

                {/* Bloque 2: Transporte */}
                <div className="p-6 bg-slate-50/50">
                    <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                        {t('comollegar.transport_title')}
                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">{t('comollegar.transport_badge')}</span>
                    </h3>
                    <div className="space-y-2">
                        {transportOptions.map((opt, i) => (
                          <div key={i} className="flex justify-between items-center text-sm">
                               <span className="text-slate-600">{opt.emoji} {opt.label}</span>
                               <span className="font-bold text-emerald-700">{opt.price} Bs</span>
                          </div>
                        ))}
                    </div>
                </div>

                {/* Bloque 3: Video */}
                <div className="p-6 flex flex-col justify-center">
                    <button
                        onClick={() => document.getElementById('video-section').scrollIntoView({ behavior: 'smooth' })}
                        className="w-full py-3 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold text-sm hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>{t('comollegar.video_cta')}</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>

            </div>
        </div>

        {/* --- SECCIÓN VIDEO (Separada pero accesible) --- */}
        <section id="video-section" className="mt-16 mb-8 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-6">{t('comollegar.video_section_title')}</h2>
            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-xl bg-black aspect-video">
                <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                    title="Video explicativo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        </section>

      </main>
    </div>
  );
}
