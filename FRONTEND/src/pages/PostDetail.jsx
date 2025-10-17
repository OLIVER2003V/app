// src/pages/PostDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@lib/api';
import './PostDetail.css';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api.get(`/posts/${id}/`)
      .then(({ data }) => setPost(data))
      .catch(() => setError('No se pudo cargar la publicación o no fue encontrada.'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="post-detail-status">Cargando...</div>;
  }

  if (error) {
    return <div className="post-detail-status">{error}</div>;
  }

  if (!post) {
    return null;
  }

  return (
    // ▼▼▼ 1. Contenedor principal para el fondo completo ▼▼▼
    <div className="post-detail-page">
      {/* 2. El contenedor anterior ahora es el "wrapper" que centra el contenido */}
      <div className="post-detail-container">
        <header className="post-detail-header">
          {post.cover && (
            <img src={post.cover} alt={post.title} className="post-detail-cover" />
          )}
          <h1 className="post-detail-title">{post.title}</h1>
          <div className="post-detail-meta">
            <div className="post-detail-author-date">
              {post.author?.username && (
                <span className="author">Por: {post.author.username}</span>
              )}
              {post.created_at && (
                <span className="date">Publicado el: {formatDate(post.created_at)}</span>
              )}
            </div>
            {post.place && (
              <Link to={`/places/${post.place.slug}`} className="post-detail-place">
                📍 {post.place.name}
              </Link>
            )}
          </div>
        </header>
        
        <div 
          className="post-detail-body" 
          dangerouslySetInnerHTML={{ __html: post.body }} 
        />

        {post.cta_url && post.cta_label && (
          <div className="post-detail-cta-container">
            <a 
              href={post.cta_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn--primary"
            >
              {post.cta_label}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}