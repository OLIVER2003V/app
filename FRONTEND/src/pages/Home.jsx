import React, { useEffect, useState, Suspense, lazy } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import { motion } from "framer-motion";

import { LoadingSpinner } from "../components/LoadingSpinner";
import PageLoader from "../components/PageLoader";
import Seo from "../components/Seo";
import PlaceCard from "../components/PlaceCard";
import { useSiteSettings } from "../hooks/useSiteSettings";

// --- Iconos Lucide ---
import {
  Clock,
  Ticket,
  Trees,
  Compass,
  MessageCircle,
  Star,
  ChevronDown,
  ArrowRight,
  MapPin,
  Camera,
  Droplets,
  PawPrint,
  Wallet,
  Footprints,
  BookOpen
} from "lucide-react";

const HeroCarousel = lazy(() => 
  import("../components/HeroCarousel").then(module => ({ default: module.HeroCarousel }))
);

// --- VARIANTES DE ANIMACIÓN (Reutilizables) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// --- COMPONENTE DE ANIMACIÓN DE TEXTO ---
const AnimatedText = ({ text, className, delay = 0 }) => {
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.04 * i + delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: { type: "spring", damping: 12, stiffness: 100 },
    },
  };

  return (
    <motion.div
      style={{ overflow: "hidden", display: "flex", flexWrap: "wrap", justifyContent: "center" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {text.split(" ").map((word, index) => (
        <div key={index} style={{ display: "inline-block", marginRight: "0.25em", whiteSpace: "nowrap" }}>
          {Array.from(word).map((letter, idx) => (
            <motion.span variants={child} key={idx} style={{ display: "inline-block" }}>
              {letter}
            </motion.span>
          ))}
        </div>
      ))}
    </motion.div>
  );
};

// --- Funciones de Utilidad ---
function unwrapResults(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeGalleryItem(raw, idx) {
  const id = raw?.id ?? raw?.pk ?? idx;
  const title = raw?.title ?? raw?.name ?? raw?.titulo ?? "Slide";
  
  const candidates = [
    raw?.media_file_url, raw?.media_url, raw?.file_url, raw?.url, 
    raw?.image_url, raw?.image, raw?.src, raw?.cover, raw?.video_url
  ];
  const src = candidates.find(Boolean) ?? "";
  const mt = raw?.media_type ?? (src?.match(/\.(mp4|webm|ogg)(\?|$)/i) ? "VIDEO" : "IMAGE");
  const media_type = String(mt).toUpperCase();
  
  return { id, title, media_type, src };
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const { settings } = useSiteSettings();
  const [reviews, setReviews] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [places, setPlaces] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await Promise.allSettled([
          api.get("reviews/"),
          api.get("gallery/"),
          api.get("places/"),
          api.get("events/"),
        ]);

        if (results[0].status === "fulfilled") {
          setReviews(unwrapResults(results[0].value.data).slice(0, 6));
        }

        if (results[1].status === "fulfilled") {
          const rawItems = unwrapResults(results[1].value.data);
          const normalizedItems = rawItems.map(normalizeGalleryItem).filter(item => item.src);
          setGalleryItems(normalizedItems);
        }

        if (results[2].status === "fulfilled") {
          setPlaces(unwrapResults(results[2].value.data).slice(0, 3));
        }

        if (results[3].status === "fulfilled") {
          const now = new Date();
          const upcoming = unwrapResults(results[3].value.data)
            .filter((ev) => ev.start_date && new Date(ev.start_date) >= now)
            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
          setNextEvent(upcoming[0] || null);
        }
      } catch (e) {
        console.error("Error crítico:", e);
        setError("No pudimos cargar toda la información. Por favor revisa tu conexión.");
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "es-ES";
  const formatEventMonth = (iso) => new Date(iso).toLocaleDateString(dateLocale, { month: "short" }).replace(".", "").toUpperCase();
  const formatEventDay = (iso) => new Date(iso).toLocaleDateString(dateLocale, { day: "numeric" });

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-cyan-200 selection:text-cyan-900 relative overflow-x-hidden">
      <Seo path="/" />

      {/* --- FONDO AMBIENTAL MEJORADO --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500 via-white to-emerald-300"></div>
        {/* Orbes animados flotantes */}
        <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-sky-200/40 rounded-full blur-[120px] mix-blend-multiply" 
        />
        <motion.div 
            animate={{ x: [0, -30, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 left-0 w-[60vw] h-[60vw] bg-emerald-200/40 rounded-full blur-[120px] mix-blend-multiply" 
        />
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/water.png')] mix-blend-overlay"></div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white border-2 border-red-100 text-red-800 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3"
        >
          <span className="text-xl">⚠️</span> {error}
        </motion.div>
      )}

      <div className="relative z-10">

        {/* --- HERO SECTION --- */}
        <section className="relative min-h-[85vh] sm:min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 text-center pt-0 pb-24 sm:pb-12 overflow-hidden">

          {/* Foto real: la cascada, no un degradado abstracto */}
          <img
            src="/images/hero-cascada.jpg"
            alt="Cascada Tumbo 1, Jardín de las Delicias"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/55 to-slate-950/25"></div>

          <div className="max-w-5xl mx-auto space-y-8 relative z-10">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/30 text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-md"
            >
              <Trees className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{t('home.badge')}</span>
            </motion.div>

            {/* Títulos con ajuste móvil */}
            <div className="flex flex-col items-center justify-center">
                <AnimatedText
                  text={t('home.title_line1')}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1] drop-shadow-lg"
                  delay={0.1}
                />

                <AnimatedText
                  text={t('home.title_line2')}
                  className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-emerald-300 drop-shadow-sm tracking-tight leading-[1.1] mt-1 sm:mt-2 pb-2"
                  delay={0.2}
                />
            </div>

            {/* Subtítulo */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed mt-4 px-4 drop-shadow"
            >
              {t('home.subtitle')}
            </motion.p>

            {/* Dos acciones: explorar lugares (principal) y cómo llegar (esencial,
                porque Google Maps no ubica bien este sitio, así que la gente
                depende de nuestra propia página de navegación) */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.8, duration: 0.8 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 pt-6 sm:pt-8 w-full px-4"
            >
              <Link
                to="/places"
                className="group relative w-full sm:w-auto overflow-hidden rounded-xl shadow-lg shadow-cyan-950/40 active:scale-95 transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-transform group-hover:scale-105"></div>
                <span className="relative flex h-full w-full items-center justify-center gap-3 px-10 py-4 text-base sm:text-lg font-bold text-white">
                  <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
                  {t('home.cta_explore')}
                  <ArrowRight className="h-5 w-5 opacity-70 group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>

              <Link
                to="/como-llegar"
                className="group relative w-full sm:w-auto overflow-hidden rounded-xl shadow-lg shadow-orange-950/40 active:scale-95 transition-all duration-200"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 transition-transform group-hover:scale-105"></div>
                <span className="relative flex h-full w-full items-center justify-center gap-3 px-10 py-4 text-base sm:text-lg font-bold text-white">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
                  {t('home.cta_location')}
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Flecha Scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4, duration: 1 }}
            className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-10"
          >
            <a href="#info-rapida" className="text-cyan-700/60 hover:text-cyan-900 transition-colors p-4">
              <ChevronDown className="h-8 w-8 sm:h-10 sm:w-10" />
            </a>
          </motion.div>
        </section>

        {/* --- INFO RÁPIDA (Scroll Animated) --- */}
        <section id="info-rapida" className="py-16 sm:py-24 px-4 relative overflow-hidden">
          <motion.div 
            className="max-w-6xl mx-auto relative z-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 sm:mb-16">
               <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                 {t('home.info_title')}
               </h2>
               <div className="w-20 sm:w-24 h-1.5 bg-gradient-to-r from-cyan-500 to-emerald-500 mx-auto rounded-full"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Card Horario */}
              <motion.div variants={fadeInUp} className="h-full">
                <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-[0_5px_25px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_35px_rgba(6,182,212,0.15)] transition-all duration-300 group border border-slate-100 h-full hover:-translate-y-2">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-cyan-700" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{t('home.schedule_title')}</h3>
                  <p className="text-slate-500 font-medium mb-4">{t('home.schedule_sub')}</p>
                  <div className="text-2xl sm:text-3xl font-black text-cyan-800">{settings?.schedule_hours || "08:00 - 18:00"}</div>
                </div>
              </motion.div>

              {/* Card Precio */}
              <motion.div variants={fadeInUp} className="h-full">
                <div className="bg-gradient-to-br from-cyan-600 to-sky-700 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-cyan-700/20 text-white relative overflow-hidden transform md:-translate-y-4 hover:-translate-y-6 transition-all duration-300 h-full">
                  <Ticket className="absolute -right-6 -top-6 h-32 w-32 sm:h-36 sm:w-36 text-cyan-400/30 rotate-12" />
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 relative z-10">
                     <Ticket className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-cyan-50 relative z-10">{t('home.price_title')}</h3>
                  <div className="flex items-baseline gap-2 relative z-10">
                     <span className="text-4xl sm:text-5xl font-black text-white drop-shadow-sm">{settings?.general_price ?? 15} Bs</span>
                     <span className="text-cyan-200 font-medium text-sm sm:text-base">{t('home.price_per_person')}</span>
                  </div>
                  <p className="mt-6 text-xs sm:text-sm font-medium text-cyan-100 border-t border-cyan-500/50 pt-4 relative z-10">
                     {t('home.price_note')}
                  </p>
                </div>
              </motion.div>

              {/* Card Parque */}
              <motion.div variants={fadeInUp} className="h-full">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-emerald-700/20 text-white relative overflow-hidden transform md:-translate-y-4 hover:-translate-y-6 transition-all duration-300 h-full">
                   <Trees className="absolute -right-6 -top-6 h-32 w-32 sm:h-36 sm:w-36 text-emerald-400/30 rotate-12" />
                   <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 relative z-10">
                    <Trees className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-1 text-emerald-50 relative z-10">{t('home.park_title')}</h3>
                  <p className="text-emerald-100/70 text-xs sm:text-sm font-medium mb-5 relative z-10">{t('home.park_note')}</p>
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-3 px-1 text-center">
                      <span className="text-emerald-100 text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">{t('home.park_students')}</span>
                      <span className="text-white font-black text-lg sm:text-xl">{settings?.park_fee_students ?? 10} Bs</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-3 px-1 text-center">
                      <span className="text-emerald-100 text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">{t('home.park_nationals')}</span>
                      <span className="text-white font-black text-lg sm:text-xl">{settings?.park_fee_nationals ?? 20} Bs</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-3 px-1 text-center">
                      <span className="text-emerald-100 text-[10px] sm:text-xs font-bold uppercase tracking-wide leading-tight">{t('home.park_foreigners')}</span>
                      <span className="text-white font-black text-lg sm:text-xl">{settings?.park_fee_foreigners ?? 100} Bs</span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </section>

        {/* --- ANTES DE VENIR (enlaza a /informacion, antes huérfana: sin
             esto no había forma de llegar a reglas/seguridad/qué llevar) --- */}
        <section className="px-4 relative z-10 -mt-4 sm:-mt-8 pb-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 shadow-xl">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">{t('home.before_title')}</h3>
                <p className="text-slate-400 text-sm sm:text-base mb-5">{t('home.before_sub')}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-3">
                  <span className="inline-flex items-center gap-2 text-slate-300 text-sm font-medium">
                    <PawPrint className="h-4 w-4 text-amber-400 shrink-0" /> {t('home.before_pets')}
                  </span>
                  <span className="inline-flex items-center gap-2 text-slate-300 text-sm font-medium">
                    <Wallet className="h-4 w-4 text-amber-400 shrink-0" /> {t('home.before_cash')}
                  </span>
                  <span className="inline-flex items-center gap-2 text-slate-300 text-sm font-medium">
                    <Footprints className="h-4 w-4 text-amber-400 shrink-0" /> {t('home.before_trails')}
                  </span>
                </div>
              </div>
              <Link
                to="/informacion"
                className="group inline-flex w-full sm:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-slate-900 transition-all hover:bg-slate-100 active:scale-95"
              >
                <BookOpen className="h-5 w-5" />
                {t('home.before_cta')}
                <ArrowRight className="h-4 w-4 opacity-60 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* --- DESTINOS DESTACADOS --- */}
        {places.length > 0 && (
          <section className="py-16 sm:py-20 px-4 relative z-10">
            <motion.div
                className="max-w-6xl mx-auto"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
              <motion.div variants={fadeInUp} className="text-center mb-10 sm:mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>{t('home.places_badge')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                  {t('home.places_title')}
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {places.map((place) => (
                  <motion.div variants={fadeInUp} key={place.id}>
                    <PlaceCard place={place} onMapClick={() => {}} />
                  </motion.div>
                ))}
              </div>

              <motion.div variants={fadeInUp} className="text-center mt-10 sm:mt-12">
                <Link
                  to="/places"
                  className="inline-flex items-center gap-2 text-cyan-700 font-bold hover:text-cyan-900 transition-colors"
                >
                  {t('home.places_see_all')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </section>
        )}

        {/* --- CARRUSEL --- */}
        {galleryItems.length > 0 && (
          <section className="py-16 sm:py-20 relative z-10 bg-slate-50/50">
            <motion.div 
                className="max-w-[1400px] mx-auto px-4"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
            >
              <div className="text-center mb-8 sm:mb-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-cyan-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4">
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{t('home.gallery_badge')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                      {t('home.gallery_title')}
                  </h2>
              </div>

              <div className="h-full w-full">
                <Suspense fallback={<div className="w-full aspect-video flex items-center justify-center text-cyan-600 bg-slate-200 rounded-3xl"><LoadingSpinner /></div>}>
                  <HeroCarousel items={galleryItems} />
                </Suspense>
              </div>
            </motion.div>
          </section>
        )}

        {/* --- PRÓXIMO EVENTO (solo si hay uno programado) --- */}
        {nextEvent && (
          <section className="py-4 sm:py-6 px-4 relative z-10">
            <motion.div
              className="max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/events"
                className="group flex items-center gap-5 sm:gap-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-5 sm:p-7 hover:shadow-lg hover:shadow-orange-100 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border border-orange-200 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold uppercase text-orange-500">{formatEventMonth(nextEvent.start_date)}</span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 leading-none">{formatEventDay(nextEvent.start_date)}</span>
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-600">{t('home.next_event_badge')}</span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 truncate mt-1">{nextEvent.title}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-orange-500 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </motion.div>
          </section>
        )}

        {/* --- OPINIONES (Scroll Animated) --- */}
        {reviews.length > 0 && (
          <section className="py-16 sm:py-24 relative">
             <motion.div 
                className="max-w-6xl mx-auto px-4 relative z-10"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
             >
                <motion.div variants={fadeInUp} className="text-center mb-12 sm:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
                        {t('home.reviews_title')}
                    </h2>
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {reviews.map((review) => (
                    <motion.div variants={fadeInUp} key={review.id} className="h-full">
                        <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full hover:shadow-xl hover:shadow-cyan-100 transition-all duration-300 hover:-translate-y-2 group">
                            <div className="flex items-center gap-4 mb-6">
                                {review.photo ? (
                                    <img src={review.photo} alt={review.author_name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-cyan-100" />
                                ) : (
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-lg">
                                    {review.author_name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <div className="font-bold text-slate-900 text-base sm:text-lg">{review.author_name}</div>
                                    <div className="flex text-emerald-400 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="relative flex-grow">
                                <p className="text-slate-700 italic relative z-10 mb-6 text-sm sm:text-base leading-relaxed">
                                    "{review.comment}"
                                </p>
                            </div>
                            {review.place_name && (
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <Link to={`/places/${review.place_slug}`} className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-cyan-600 uppercase tracking-wider group-hover:text-cyan-800 transition-colors">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4"/> 
                                    {review.place_name}
                                </Link>
                            </div>
                            )}
                        </div>
                    </motion.div>
                    ))}
                </div>
             </motion.div>
          </section>
        )}

        {/* --- FOOTER CTA --- */}
        <section
          className="py-20 sm:py-24 text-center relative overflow-hidden text-white bg-cover bg-center"
          style={{ backgroundImage: `url('/images/hero-cascada.jpg')` }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div> {/* Semi-transparent dark overlay */}
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 to-transparent opacity-40 pointer-events-none"></div>

           <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative max-w-3xl mx-auto px-4 z-10 space-y-8"
            >
             <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  {t('home.footer_cta_title')}
             </h2>
             <p className="text-cyan-100 text-base sm:text-lg md:text-xl mx-auto font-medium leading-relaxed max-w-lg">
                  {t('home.footer_cta_sub')}
             </p>
             <div className="flex justify-center pt-6">
               <a
                 href={settings?.whatsapp_group_url || "https://chat.whatsapp.com/EpzISekSBCe08kJh9lsqpx"}
                 target="_blank"
                 rel="noreferrer"
                 className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#1ebc57] text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-green-900/20 hover:shadow-xl hover:-translate-y-1 active:scale-95"
               >
                 <MessageCircle className="h-6 w-6 fill-current" />
                 {t('home.whatsapp_group')}
               </a>
             </div>
           </motion.div>
        </section>

        <footer className="bg-slate-950 py-10 text-center text-slate-400 text-sm relative z-20">
             <div className="max-w-6xl mx-auto px-4">
            <div className="mb-6 flex items-center justify-center gap-3">
                <Droplets className="h-6 w-6 text-cyan-400"/>
                <span className="font-bold text-xl text-white tracking-wider">{t('nav.brand')}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-8 font-medium text-slate-300">
              <Link to="/places" className="hover:text-white transition-colors">{t('nav.places')}</Link>
              <Link to="/events" className="hover:text-white transition-colors">{t('nav.events')}</Link>
              <Link to="/posts" className="hover:text-white transition-colors">{t('nav.posts')}</Link>
              <Link to="/contact" className="hover:text-white transition-colors">{t('nav.contact')}</Link>
            </div>
            <div className="pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>&copy; {new Date().getFullYear()} Asociación Turística Jardín de las Delicias</p>
                <p className="flex items-center gap-1">
                    {t('home.footer_credit')}
                    <a href="https://wa.me/59172672767" className="font-bold text-cyan-400 hover:text-white transition-colors ml-1">
                        Oliver Ventura
                    </a>
                </p>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}