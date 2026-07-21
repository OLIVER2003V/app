import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  ExternalLink,
  Share2
} from 'lucide-react';
import Seo from '@/components/Seo';
import PageLoader from '@/components/PageLoader';

export default function PostDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/posts/${id}/`)
      .then(({ data }) => setPost(data))
      .catch(() => setError(t('postDetail.load_error')))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: post?.title,
      text: post?.title,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // usuario canceló el share, no hacemos nada
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible
    }
  };

  const stripHtml = (html) => (html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString(i18n.language?.startsWith("en") ? "en-US" : "es-BO", {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) return <PageLoader />;

  if (error || !post) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">{t('postDetail.something_wrong')}</h2>
          <p className="text-slate-400 mb-4">{error || t('postDetail.not_found')}</p>
          <Link to="/posts" className="px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700 transition-colors">
            {t('postDetail.back')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-20 relative">
      <Seo
        title={post.title}
        description={stripHtml(post.body).slice(0, 160) || post.title}
        path={`/posts/${id}`}
        image={post.cover || undefined}
        type="article"
      />

      {/* --- ESTILOS PARA EL CONTENIDO HTML --- */}
      {/* Esto asegura que el HTML que viene del editor (negritas, listas, etc.) se vea bien en modo oscuro */}
      <style>{`
        .prose-content p { margin-bottom: 1.5em; line-height: 1.8; font-size: 1.1rem; color: #cbd5e1; }
        .prose-content h2 { color: #f8fafc; font-size: 1.8rem; font-weight: 700; margin-top: 2em; margin-bottom: 0.5em; }
        .prose-content h3 { color: #e2e8f0; font-size: 1.4rem; font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; }
        .prose-content ul, .prose-content ol { margin-bottom: 1.5em; padding-left: 1.5em; color: #cbd5e1; }
        .prose-content li { margin-bottom: 0.5em; list-style-type: disc; }
        .prose-content a { color: #22d3ee; text-decoration: underline; text-underline-offset: 4px; }
        .prose-content a:hover { color: #67e8f9; }
        .prose-content blockquote { border-left: 4px solid #f97316; padding-left: 1em; font-style: italic; color: #94a3b8; margin: 2em 0; }
        .prose-content img { border-radius: 0.75rem; margin: 2em 0; width: 100%; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); }
      `}</style>

      {/* Fondo Ambiental */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-900/10 rounded-full blur-[128px]"></div>
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[128px]"></div>
      </div>

      {/* --- HEADER NAVEGACIÓN --- */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 pt-8 mb-8">
        <Link 
          to="/posts" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 hover:border-slate-600 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4" /> {t('postDetail.back')}
        </Link>
      </div>

      {/* --- ARTÍCULO PRINCIPAL --- */}
      <article className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* 1. Cabecera del Post */}
        <header className="mb-10 text-center space-y-6">
          {post.place && (
            <Link to={`/places/${post.place.slug}`} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-sm font-bold border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
              <MapPin className="h-3.5 w-3.5" />
              {post.place.name}
            </Link>
          )}
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-sm md:text-base border-y border-slate-800 py-4 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-500" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            <span className="hidden sm:block text-slate-700">•</span>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <span>{post.author?.username || t('postDetail.editorial_team')}</span>
            </div>
          </div>
        </header>

        {/* 2. Imagen Destacada */}
        {post.cover && (
          <div className="mb-12 relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="aspect-[16/9] w-full">
              <img 
                src={post.cover} 
                alt={post.title} 
                className="w-full h-full object-cover transform transition-transform duration-1000 hover:scale-105"
              />
            </div>
            {/* Gradiente sutil abajo */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* 3. Cuerpo del Contenido */}
        <div 
          className="prose-content bg-slate-900/30 p-4 md:p-0 md:bg-transparent rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />

        {/* 4. Sección Call To Action (CTA) */}
        {post.cta_url && post.cta_label && (
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 relative overflow-hidden text-center shadow-2xl">
            {/* Efecto brillo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-2 relative z-10">{t('postDetail.cta_question')}</h3>
            <p className="text-slate-400 mb-6 relative z-10">{t('postDetail.cta_sub')}</p>
            
            <a 
              href={post.cta_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all"
            >
              {post.cta_label} <ExternalLink className="h-5 w-5" />
            </a>
          </div>
        )}

        {/* 5. Footer del Post */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
          <Link to="/posts" className="text-slate-500 hover:text-white transition-colors text-sm font-medium">
            {t('postDetail.read_more')}
          </Link>
          <button
            onClick={handleShare}
            aria-label={t('postDetail.share')}
            className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium"
          >
            <Share2 className="h-4 w-4" /> {copied ? t('postDetail.link_copied') : t('postDetail.share')}
          </button>
        </div>

      </article>
    </div>
  );
}