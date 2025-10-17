// src/pages/Posts.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@lib/api";
import "./Posts.css";

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/posts/")
      .then(({ data }) => {
        const arr = Array.isArray(data) ? data : (data?.results || []);
        setPosts(arr);
      })
      .catch(err => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="posts-page-loading">Cargando publicaciones...</div>;
  }

  return (
    // Este div ahora se encarga del fondo de página completa
    <div className="posts-page">
      {/* ▼▼▼ ESTE ES EL NUEVO DIV ENVOLTORIO ▼▼▼ */}
      <div className="posts-page__wrapper">
        <header className="posts-header">
          <h1>Todas las Publicaciones</h1>
          <p>Explora nuestras últimas noticias, guías y artículos.</p>
        </header>

        <div className="posts-grid">
          {posts.length > 0 ? (
            posts.map(post => (
              <div key={post.id} className="full-post-card">
                {post.cover && (
                  <Link to={`/posts/${post.id}`} className="full-post-card__cover">
                    <img src={post.cover} alt={post.title} loading="lazy" />
                  </Link>
                )}
                <div className="full-post-card__body">
                  <h2 className="full-post-card__title">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h2>
                  {post.place && (
                    <div className="full-post-card__meta">
                      <span>📍 {post.place.name}</span>
                    </div>
                  )}
                  <p className="full-post-card__excerpt">{post.body}</p>
                  <Link to={`/posts/${post.id}`} className="full-post-card__readmore">
                    Leer más
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p>No hay publicaciones disponibles en este momento.</p>
          )}
        </div>
      </div> {/* <-- Fin del div envoltorio */}
    </div>
  );
}