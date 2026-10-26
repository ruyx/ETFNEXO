'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import HeroSplit from '@/components/HeroSplit';
import AdSlot from '@/components/AdSlot';
import Footer from '@/components/Footer';
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
    <>
      {/* Schema.org CollectionPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Noticias sobre ETFs',
            description: 'Últimas noticias y análisis sobre fondos cotizados (ETFs)',
            url: 'https://etfnexo.com/noticias'
          })
        }}
      />

      <div className="bg-white min-h-screen">
        <Header />

        <main>
        {/* Hero */}
        <HeroSplit
          eyebrow="Actualizado diariamente"
          title={<>Noticias sobre <span className="highlight">ETFs</span></>}
          description="Mantente informado con las últimas noticias del mundo de los fondos cotizados. Análisis de mercado, lanzamientos de productos y tendencias de inversión."
          image={{ src: 'https://images.pexels.com/photos/936137/pexels-photo-936137.jpeg?auto=compress&cs=tinysrgb&w=1920', alt: 'Ejecutivo leyendo un periódico de negocios' }}
          primaryCta={{ href: '/newsletter', label: 'Recibir la newsletter' }}
        />

        {/* Banner bajo el hero (leaderboard 728x90) */}
        <section className="nx-band">
          <AdSlot placement="section_top" />
        </section>

        {/* News Grid */}
        <section className="section section--light px-6">
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
                  className="btn-primary"
                >
                  Ver Rankings de ETFs
                </Link>
              </div>
            ) : (
              <>
                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {articles.map((article, index) => (
                    <NewsCard
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
                        <div className="w-6 h-6 border-[3px] border-primary border-t-transparent rounded-full animate-spin"></div>
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
        <section className="section section--dark px-6">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Buscas los mejores ETFs?
            </h2>
            <p className="text-xl mb-8">
              Descubre nuestro ranking completo de ETFs evaluados con nuestro algoritmo propietario ETFNexo Score
            </p>
            <Link
              href="/rankings"
              className="btn-primary text-lg px-10 py-4"
            >
              Ver Rankings de ETFs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </>
  );
}
