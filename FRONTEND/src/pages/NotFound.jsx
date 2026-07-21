import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Compass, Home, MapPinned } from 'lucide-react';
import Seo from '../components/Seo';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16 text-center text-gray-900">
      <Seo title={t('notFound.seo_title')} path="/404" noindex />

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <Compass className="h-10 w-10" />
      </div>

      <h1 className="mb-2 text-3xl font-extrabold tracking-tight md:text-4xl">
        {t('notFound.title')}
      </h1>
      <p className="mb-8 max-w-md text-gray-600">
        {t('notFound.subtitle')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Home className="h-4 w-4" /> {t('notFound.go_home')}
        </Link>
        <Link
          to="/places"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-100"
        >
          <MapPinned className="h-4 w-4" /> {t('notFound.go_places')}
        </Link>
      </div>
    </div>
  );
}
