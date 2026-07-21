import React, { useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";
import api from "../lib/api";
import Seo from "../components/Seo";
import {
  Phone, Mail, MapPin, Facebook, Instagram,
  Users, Car, Utensils, Compass, Globe,
  Loader2, AlertCircle, ArrowUp,
} from "lucide-react";

/* --- Ícono de WhatsApp (marca, no existe en lucide) --- */
const WhatsappIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91a9.85 9.85 0 0 0-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.06 8.06 0 0 1-1.23-4.38c0-4.4 3.57-7.97 7.97-7.97s7.97 3.57 7.97 7.97-3.57 7.97-7.97 7.97zm4.28-5.48c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.96-.15.17-.3.19-.56.06-.26-.12-1.1-.4-2.09-1.28-.77-.69-1.29-1.53-1.44-1.79-.15-.25-.02-.38.11-.5.11-.11.25-.28.37-.42.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.42-.14 0-.3 0-.47 0s-.42.08-.64.38c-.22.3-.86.84-.86 2.04 0 1.2.88 2.37 1 2.53.12.17 1.73 2.63 4.2 3.7.59.25 1.05.4 1.41.51.59.17 1.13.15 1.56.09.48-.06 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28z" />
  </svg>
);

const formatWhatsappUrl = (number) => {
  if (!number) return "";
  const clean = String(number).replace(/[\s+]/g, "");
  return `https://wa.me/${clean}`;
};

/* --- Metadatos por categoría: ícono + color, todo en clases estáticas
   (Tailwind no detecta clases armadas con template strings) --- */
const CATEGORY_META = {
  ASOCIACION: { icon: Users, badge: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  TRANSPORTE: { icon: Car, badge: "bg-sky-100 text-sky-700", border: "border-sky-200" },
  GASTRONOMIA: { icon: Utensils, badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  OPERADORES: { icon: Compass, badge: "bg-purple-100 text-purple-700", border: "border-purple-200" },
  GENERAL: { icon: Globe, badge: "bg-slate-200 text-slate-700", border: "border-slate-300" },
};
const CATEGORY_ORDER = ["ASOCIACION", "TRANSPORTE", "GASTRONOMIA", "OPERADORES", "GENERAL"];
const getCategoryMeta = (category) => CATEGORY_META[category] || CATEGORY_META.GENERAL;

/* --- Tarjeta de Contacto --- */
const ContactCard = ({ contact, t }) => {
  const hasPrimaryActions = contact.phone || contact.whatsapp;
  const hasSecondaryActions = contact.email || contact.facebook || contact.instagram;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <div className="flex-grow">
        <h4 className="mb-1.5 text-lg font-bold text-gray-900">{contact.name}</h4>
        {contact.address && (
          <p className="flex items-start gap-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{contact.address}</span>
          </p>
        )}
      </div>

      {hasPrimaryActions && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-cyan-50 px-3 py-2.5 text-sm font-bold text-cyan-700 transition-colors hover:bg-cyan-100"
            >
              <Phone className="h-4 w-4" /> {t('contact.call')}
            </a>
          )}
          {contact.whatsapp && (
            <a
              href={formatWhatsappUrl(contact.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-green-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-green-600 ${
                !contact.phone ? "col-span-2" : ""
              }`}
            >
              <WhatsappIcon className="h-4 w-4" /> WhatsApp
            </a>
          )}
        </div>
      )}

      {hasSecondaryActions && (
        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              title={contact.email}
              aria-label={t('contact.email')}
              className="text-gray-400 transition-colors hover:text-cyan-600"
            >
              <Mail className="h-4.5 w-4.5" />
            </a>
          )}
          {contact.facebook && (
            <a
              href={contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-400 transition-colors hover:text-blue-600"
            >
              <Facebook className="h-4.5 w-4.5" />
            </a>
          )}
          {contact.instagram && (
            <a
              href={contact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-400 transition-colors hover:text-pink-600"
            >
              <Instagram className="h-4.5 w-4.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default function Contact() {
  const { t } = useTranslation();
  const [contactsByCategory, setContactsByCategory] = useState({});
  const [orderedCategories, setOrderedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    api
      .get("/contact/")
      .then(({ data }) => {
        const items = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : [];
        const grouped = items.reduce((acc, c) => {
          const key = CATEGORY_META[c.category] ? c.category : "GENERAL";
          (acc[key] ||= []).push(c);
          return acc;
        }, {});
        const found = Object.keys(grouped);
        const ordered = [
          ...CATEGORY_ORDER.filter((k) => found.includes(k)),
          ...found.filter((k) => !CATEGORY_ORDER.includes(k)),
        ];
        setContactsByCategory(grouped);
        setOrderedCategories(ordered);
      })
      .catch(() => setError(t('contact.error')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-20 text-gray-900">
      <Seo
        title={t('contact.title')}
        description="Directorio de contactos: asociación, guías, transporte, gastronomía y operadores turísticos de Jardín de las Delicias."
        path="/contact"
      />

      <header className="bg-gradient-to-r from-cyan-600 to-emerald-700 py-12 px-4 text-center text-white shadow-lg md:py-16">
        <h1 className="mb-2 text-4xl font-extrabold md:text-5xl">{t('contact.title')}</h1>
        <p className="text-lg text-cyan-100">{t('contact.subtitle')}</p>
      </header>

      {/* --- Navegación rápida por categoría --- */}
      {!loading && !error && orderedCategories.length > 1 && (
        <div className="border-b border-gray-200 bg-gray-100/95 backdrop-blur">
          <div className="no-scrollbar mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
            {orderedCategories.map((category) => {
              const meta = getCategoryMeta(category);
              const Icon = meta.icon;
              return (
                <a
                  key={category}
                  href={`#cat-${category}`}
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-opacity hover:opacity-80 ${meta.badge}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t(`contact.category_${category.toLowerCase()}`)}
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
            <p>{t('contact.loading')}</p>
          </div>
        )}

        {error && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 py-10 text-center text-red-700">
            <AlertCircle className="h-8 w-8" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && orderedCategories.length === 0 && (
          <p className="py-16 text-center text-lg text-gray-600">{t('contact.empty')}</p>
        )}

        {!loading && !error && orderedCategories.length > 0 && (
          <div className="flex flex-col gap-14">
            {orderedCategories.map((category) => {
              const meta = getCategoryMeta(category);
              const Icon = meta.icon;
              const contacts = contactsByCategory[category];
              return (
                <section key={category} id={`cat-${category}`} className="scroll-mt-24">
                  <div className={`mb-6 flex items-center gap-3 border-b-2 pb-4 ${meta.border}`}>
                    <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${meta.badge}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                      {t(`contact.category_${category.toLowerCase()}`)}
                    </h2>
                    <span className="ml-auto text-sm font-semibold text-gray-400">{contacts.length}</span>
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
                    {contacts.map((contact) => (
                      <ContactCard key={contact.id} contact={contact} t={t} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t('contact.back_to_top')}
          className="fixed bottom-20 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-cyan-700 text-white shadow-lg transition-colors hover:bg-cyan-800 lg:bottom-6"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
