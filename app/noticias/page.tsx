'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { createAdminClient } from '@/lib/supabase/admin';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string;
  source_published_at: string;
  category_name: string | null;
  category_slug: string | null;
  category_color: string | null;
  author_name: string | null;
  views_count: number | null;
  source_name: string | null;
}

const CATEGORIES = [
  { name: 'Todas', value: '' },
  { name: 'ETFs', value: 'etfs' },
  { name: 'Gestoras', value: 'gestoras' },
  { name: 'Mercados', value: 'mercados' },
  { name: 'Regulación', value: 'regulacion' },
  { name: 'Educación', value: 'educacion' },
  { name: 'Opinión', value: 'opinion' },
];

export default function NoticiasPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/noticias')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar noticias');
        return res.json();
      })
      .then(data => {
        setArticles(data.data || []);
        setFilteredArticles(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching news:', err);
        setError('No se pudieron cargar las noticias. Intenta de nuevo más tarde.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = [...articles];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (currentCategory) {
      filtered = filtered.filter(article =>
        article.category_slug === currentCategory
      );
    }

    setFilteredArticles(filtered);
  }, [articles, searchTerm, currentCategory]);

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="noticias-hero">
          <div className="container">
            <div className="noticias-hero__container">
              <div className="noticias-hero__badge">
                <div className="noticias-hero__badge-dot"></div>
                <span>Actualizado diariamente</span>
              </div>

              <h1 className="noticias-hero__title">
                Noticias sobre ETFs
              </h1>
              <p className="noticias-hero__description">
                Mantente informado con las últimas noticias del mundo de los fondos cotizados.
                Análisis de mercado, lanzamientos de productos y tendencias de inversión.
              </p>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="noticias-filters">
          <div className="container">
            <div className="noticias-filters__container">
              <div className="noticias-filters__content">
                <div className="noticias-filters__search">
                  <input
                    type="text"
                    placeholder="Buscar noticias por título o contenido..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="noticias-filters__input"
                  />
                </div>

                <div className="noticias-filters__count">
                  <span className="noticias-filters__count-number">{filteredArticles.length}</span>
                  <span>Noticias encontradas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="noticias-categories">
          <div className="container">
            <div className="noticias-categories__list">
              {CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setCurrentCategory(category.value)}
                  className={currentCategory === category.value ? 'noticias-categories__button noticias-categories__button--active' : 'noticias-categories__button'}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* News Grid */}
        <section className="noticias-main">
          <div className="container">
            {loading && (
              <div className="noticias-loading">
                <div className="noticias-loading__spinner"></div>
                <p className="noticias-loading__text">Cargando noticias...</p>
              </div>
            )}

            {error && (
              <div className="noticias-error">
                <p className="noticias-error__text">{error}</p>
              </div>
            )}

            {!loading && !error && filteredArticles.length === 0 && (
              <div className="noticias-empty">
                <p className="noticias-empty__text">No se encontraron noticias con los filtros aplicados.</p>
              </div>
            )}

            {!loading && !error && filteredArticles.length > 0 && (
              <div className="noticias-grid">
                {filteredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/noticias/${article.slug}`}
                    className="news-card"
                  >
                    {/* Image */}
                    {article.featured_image_url && (
                      <div className="news-card__image-container">
                        <Image
                          src={article.featured_image_url}
                          alt={article.title || 'Imagen destacada'}
                          fill
                          className="news-card__image"
                        />
                        {/* Category Badge */}
                        {article.category_name && (
                          <div className="news-card__badge">
                            <span
                              className="news-card__badge-text"
                              style={{ backgroundColor: article.category_color || '#3B82F6' }}
                            >
                              {article.category_name}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="news-card__content">
                      {/* Meta Info */}
                      <div className="news-card__meta">
                        <div className="news-card__meta-item">
                          <svg className="news-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <time dateTime={article.published_at}>
                            {formatDate(article.published_at)}
                          </time>
                        </div>
                        {article.views_count !== null && article.views_count > 0 && (
                          <div className="news-card__meta-item">
                            <svg className="news-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{article.views_count}</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="news-card__title">
                        {article.title}
                      </h2>

                      {/* Excerpt */}
                      {article.excerpt && (
                        <p className="news-card__excerpt">
                          {article.excerpt}
                        </p>
                      )}

                      {/* Source */}
                      {article.source_name && (
                        <div className="news-card__source">
                          Fuente: {article.source_name}
                        </div>
                      )}

                      {/* Read More */}
                      <div className="news-card__cta">
                        <span>Leer más</span>
                        <svg className="news-card__cta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="noticias-cta">
          <div className="container noticias-cta__container">
            <h2 className="noticias-cta__title">
              ¿Buscas los mejores ETFs?
            </h2>
            <p className="noticias-cta__description">
              Descubre nuestro ranking completo de ETFs evaluados con nuestro algoritmo propietario ETFNexo Score
            </p>
            <Link href="/rankings" className="btn-primary">
              Ver Rankings de ETFs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
