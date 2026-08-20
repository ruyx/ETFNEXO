'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AcademyCard, { AcademyArticle } from '@/components/AcademyCard';

export default function AcademiaPage() {
  const [articles, setArticles] = useState<AcademyArticle[]>([]);
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
      const response = await fetch(`/api/v1/academia?limit=${limit}&offset=${offset}`);
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
      console.error('Error loading academy articles:', error);
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
        <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white py-16 px-6">
          <div className="container max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-600/20 border border-purple-400/30 rounded-full text-xs font-semibold text-purple-300 mb-6">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Contenido educativo de calidad</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Academia ETF Nexo
            </h1>
            <p className="text-xl text-purple-100 leading-relaxed">
              Aprende sobre ETFs con artículos educativos creados por expertos.
              Desde conceptos básicos hasta estrategias avanzadas de inversión.
            </p>
          </div>
        </section>

        {/* Articles Grid */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  No hay artículos disponibles
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Próximamente estaremos publicando contenido educativo sobre ETFs
                </p>
                <Link
                  href="/rankings"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all"
                >
                  Ver Rankings de ETFs
                </Link>
              </div>
            ) : (
              <>
                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {articles.map((article, index) => (
                    <AcademyCard
                      key={article.id}
                      article={article}
                      variant="card"
                    />
                  ))}
                </div>

                {/* Loading more indicator */}
                {hasMore && (
                  <div ref={observerTarget} className="py-8">
                    {loading && (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-600 font-medium">Cargando más artículos...</p>
                      </div>
                    )}
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMore && articles.length > 0 && (
                  <div className="text-center py-8 border-t border-slate-200">
                    <p className="text-slate-500">
                      Has visto todos los artículos disponibles
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
              className="inline-flex items-center px-8 py-4 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-all shadow-lg"
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
