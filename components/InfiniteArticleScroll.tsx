'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { formatArticleContent } from '@/lib/format-article-content';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  category_name?: string;
  category_color?: string;
  published_at?: string;
  source_published_at?: string;
  views_count?: number;
  faq?: any[];
  tags?: any[];
  related_etfs?: any[];
  source_url?: string;
  source_name?: string;
}

interface InfiniteArticleScrollProps {
  initialArticle: Article;
  initialArticleElement: React.RefObject<HTMLElement>;
  basePath: 'noticias' | 'academia';
  onArticleChange?: (article: Article) => void;
}

export default function InfiniteArticleScroll({ initialArticle, initialArticleElement, basePath, onArticleChange }: InfiniteArticleScrollProps) {
  const [articles, setArticles] = useState<Article[]>([initialArticle]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Map<string, HTMLElement>>(new Map());
  const currentVisibleArticle = useRef<{ article: Article; ratio: number } | null>(null);

  // Intersection Observer para detectar cuando llegar al final
  useEffect(() => {
    if (!observerRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadNextArticle();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [articles, hasMore, loading]);

  // Intersection Observer para detectar qué artículo está visible y actualizar URL
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    // Observar artículo inicial
    if (initialArticleElement.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const ratio = entry.intersectionRatio;

            if (entry.isIntersecting && ratio > 0.3) {
              // Actualizar si es un artículo diferente O si tiene mayor ratio que el actual
              const isDifferentArticle = !currentVisibleArticle.current || currentVisibleArticle.current.article.id !== initialArticle.id;
              const hasHigherRatio = currentVisibleArticle.current && ratio > currentVisibleArticle.current.ratio;

              if (isDifferentArticle || hasHigherRatio) {
                currentVisibleArticle.current = { article: initialArticle, ratio };

                if (onArticleChange) onArticleChange(initialArticle);

                const newUrl = `/${basePath}/${initialArticle.slug}`;
                if (window.location.pathname !== newUrl) {
                  window.history.pushState({ article: initialArticle.slug }, '', newUrl);
                }
              }
            } else if (!entry.isIntersecting && currentVisibleArticle.current?.article.id === initialArticle.id) {
              // Si este artículo ya no está visible y era el actual, limpiar
              currentVisibleArticle.current = null;
            }
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
      );

      observer.observe(initialArticleElement.current);
      observers.push(observer);
    }

    // Observar artículos del scroll infinito (excluir el inicial que está en articles[0])
    const infiniteScrollArticles = articles.slice(1);

    infiniteScrollArticles.forEach((article) => {
      const element = articleRefs.current.get(article.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const ratio = entry.intersectionRatio;

            if (entry.isIntersecting && ratio > 0.3) {
              // Actualizar si es un artículo diferente O si tiene mayor ratio que el actual
              const isDifferentArticle = !currentVisibleArticle.current || currentVisibleArticle.current.article.id !== article.id;
              const hasHigherRatio = currentVisibleArticle.current && ratio > currentVisibleArticle.current.ratio;

              if (isDifferentArticle || hasHigherRatio) {
                currentVisibleArticle.current = { article, ratio };

                if (onArticleChange) onArticleChange(article);

                const newUrl = `/${basePath}/${article.slug}`;
                if (window.location.pathname !== newUrl) {
                  window.history.pushState({ article: article.slug }, '', newUrl);
                }
              }
            } else if (!entry.isIntersecting && currentVisibleArticle.current?.article.id === article.id) {
              currentVisibleArticle.current = null;
            }
          });
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach(obs => obs.disconnect());
    };
  }, [articles, basePath, initialArticle, onArticleChange, initialArticleElement]);

  const loadNextArticle = async () => {
    setLoading(true);

    const lastArticle = articles[articles.length - 1];

    try {
      const response = await fetch(`/api/v1/${basePath}/next?currentId=${lastArticle.id}`);

      // 404 significa que no hay más artículos
      if (response.status === 404) {
        console.log('No more articles available');
        setHasMore(false);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        console.error('Error fetching next article:', response.status);
        setHasMore(false);
        setLoading(false);
        return;
      }

      const nextArticle = await response.json();

      if (nextArticle && nextArticle.id) {
        setArticles(prev => [...prev, nextArticle]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading next article:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {articles.slice(1).map((article, index) => (
        <article
          key={article.id}
          className="article-detail article-detail--next"
          ref={(el) => {
            if (el) articleRefs.current.set(article.id, el);
          }}
        >
          <div className="container">
            <div className="article-detail__wrapper">
              {/* Separator */}
              <div className="infinite-scroll-separator">
                <div className="infinite-scroll-separator__line" />
                <span className="infinite-scroll-separator__text">
                  {index === 0 ? 'Siguiente Artículo' : `Artículo ${index + 1}`}
                </span>
                <div className="infinite-scroll-separator__line" />
              </div>

              {/* Category Badge */}
              {article.category_name && (
                <div className="article-detail__category">
                  <span
                    className="article-detail__category-badge"
                    style={{ backgroundColor: article.category_color || '#3B82F6' }}
                  >
                    {article.category_name}
                  </span>
                </div>
              )}

              {/* Title */}
              <h2 className="article-detail__title">
                <Link href={`/${basePath}/${article.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {article.title}
                </Link>
              </h2>

              {/* Meta Info */}
              <div className="article-detail__meta">
                <div className="article-detail__meta-item">
                  <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <time dateTime={article.published_at || article.source_published_at || undefined}>
                    {article.published_at || article.source_published_at
                      ? new Date(article.published_at || article.source_published_at!).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Fecha no disponible'}
                  </time>
                </div>
                {article.views_count != null && article.views_count > 0 && (
                  <div className="article-detail__meta-item">
                    <svg className="article-detail__meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{article.views_count} vistas</span>
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {article.featured_image_url && (
                <Link href={`/${basePath}/${article.slug}`}>
                  <div className="article-image article-image--featured" style={{ cursor: 'pointer' }}>
                    <img
                      src={article.featured_image_url}
                      alt={article.title || 'Imagen destacada'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </Link>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <div className="article-detail__excerpt">
                  <p dangerouslySetInnerHTML={{
                    __html: article.excerpt.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
                  }} />
                </div>
              )}

              {/* Content */}
              {article.content && (
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: formatArticleContent(article.content) }}
                />
              )}

              {/* Source Link */}
              {article.source_url && article.source_name && (
                <div className="article-detail__source">
                  <p className="article-detail__source-label">
                    Fuente original:
                  </p>
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="article-detail__source-link"
                  >
                    <span>{article.source_name}</span>
                    <svg className="article-detail__source-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}

      {/* Loading Indicator / Observer Trigger */}
      <div ref={observerRef} style={{ padding: '40px', textAlign: 'center' }}>
        {loading && (
          <div className="infinite-scroll-loading">
            <div className="spinner"></div>
            <p>Cargando siguiente artículo...</p>
          </div>
        )}
        {!hasMore && articles.length > 1 && (
          <div className="infinite-scroll-end">
            <p>Has llegado al final de los artículos</p>
            <Link href={`/${basePath}`} className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
              Ver más en {basePath === 'noticias' ? 'Noticias' : 'Academia'}
            </Link>
          </div>
        )}
      </div>

    </>
  );
}
