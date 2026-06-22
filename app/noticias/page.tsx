'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import NewsCard, { NewsArticle } from '@/components/NewsCard';

export default function NoticiasPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load more articles
  const loadArticles = useCallback(async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const limit = 12;
      const offset = (pageNum - 1) * limit;
      const response = await fetch(`/api/v1/noticias?limit=${limit}&offset=${offset}`);
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        setArticles(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
        // Check if there are more articles based on total count
        const hasMoreArticles = offset + limit < data.count;
        setHasMore(hasMoreArticles);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
      if (pageNum === 1) {
        setInitialLoading(false);
      }
    }
  }, [loading]);

  // Initial load
  useEffect(() => {
    loadArticles(1);
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadArticles(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [hasMore, loading, page, loadArticles]);

  return (
    <div className="bg-white min-h-screen">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 px-6">
          <div className="container max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-300 mb-6">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Actualizado diariamente</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Noticias sobre ETFs
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Mantente informado con las últimas noticias del mundo de los fondos cotizados.
              Análisis de mercado, lanzamientos de productos y tendencias de inversión.
            </p>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-16 px-6">
          <div className="container max-w-7xl">
            {initialLoading ? (
              // Initial loading state
              <div className="grid gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-24 h-24 bg-slate-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded mb-2 w-full"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              // Empty state
              <div className="text-center py-20">
                <div className="mb-6">
                  <svg className="w-24 h-24 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  No hay noticias disponibles
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Próximamente estaremos publicando noticias y análisis sobre ETFs
                </p>
                <Link
                  href="/rankings"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Ver Rankings de ETFs
                </Link>
              </div>
            ) : (
              <>
                {/* Articles Grid */}
                <div className="grid gap-6 mb-12">
                  {articles.map((article, index) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      variant={index === 0 ? 'featured' : 'default'}
                    />
                  ))}
                </div>

                {/* Loading more indicator */}
                {hasMore && (
                  <div ref={observerTarget} className="py-8">
                    {loading && (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-medium">Cargando más noticias...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMore && articles.length > 0 && (
                  <div className="text-center py-8 border-t border-slate-200">
                    <p className="text-slate-500">
                      Has visto todas las noticias disponibles
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-6 bg-slate-900 text-white">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Buscas los mejores ETFs?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Descubre nuestro ranking completo de ETFs evaluados con nuestro algoritmo propietario ETFNexo Score
            </p>
            <Link
              href="/rankings"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              Ver Rankings de ETFs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
