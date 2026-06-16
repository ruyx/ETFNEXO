'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import RankingSlider from '@/components/RankingSlider';
import MarketTicker from '@/components/MarketTicker';
import AdSlot from '@/components/AdSlot';

interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image_url: string | null;
  published_at: string;
  category_name: string;
  category_slug: string;
  category_color: string;
  author_name: string;
  views_count: number;
}

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<NewsArticle[]>([]);
  const [recentArticles, setRecentArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/noticias?featured=true').then(res => res.json()),
      fetch('/api/v1/noticias?limit=6').then(res => res.json())
    ])
      .then(([featured, recent]) => {
        setFeaturedArticles(featured.data || []);
        setRecentArticles(recent.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading articles:', err);
        setLoading(false);
      });
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="bg-white">
      <Header />
      <MarketTicker />

      {/* Hero Editorial Section - Featured Article */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Financial markets background"
            className="w-full h-full object-cover"
          />
          {/* Overlay oscuro al 80% */}
          <div className="absolute inset-0 bg-slate-900/80"></div>
        </div>

        <div className="container py-20 px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left: Main Featured Article */}
            <div>
              <div className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-300 mb-6">
                ARTÍCULO DESTACADO
              </div>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-12 bg-slate-700 rounded mb-6 w-3/4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded w-5/6"></div>
                </div>
              ) : featuredArticles[0] ? (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    {featuredArticles[0].title}
                  </h1>
                  <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                    {featuredArticles[0].excerpt}
                  </p>
                  <div className="flex items-center gap-6 mb-8">
                    <span className="text-sm text-slate-400">
                      {formatDate(featuredArticles[0].published_at)}
                    </span>
                    <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                    <span className="text-sm text-slate-400">
                      {featuredArticles[0].author_name}
                    </span>
                  </div>
                  <Link
                    href={`/noticias/${featuredArticles[0].slug}`}
                    className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all"
                  >
                    Leer artículo completo
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              ) : (
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                    Información y Análisis de ETFs
                  </h1>
                  <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                    La plataforma de referencia para inversores que buscan información transparente y análisis objetivo sobre ETFs
                  </p>
                  <Link
                    href="/rankings"
                    className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all"
                  >
                    Ver Rankings de ETFs
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Secondary Featured Articles */}
            <div className="space-y-6">
              {loading ? (
                <>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-slate-800 rounded-lg p-6">
                      <div className="h-4 bg-slate-700 rounded mb-3 w-3/4"></div>
                      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </>
              ) : featuredArticles.length > 1 ? (
                featuredArticles.slice(1, 4).map((article) => (
                  <Link
                    key={article.id}
                    href={`/noticias/${article.slug}`}
                    className="block bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span>{formatDate(article.published_at)}</span>
                          <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                          <span className="text-blue-400">{article.category_name}</span>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-slate-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50 text-center">
                  <p className="text-slate-400">Próximamente más noticias y análisis</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access Nav */}
      <section className="border-b border-slate-200 bg-white sticky top-[105px] z-40 shadow-sm">
        <div className="container">
          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {['ETFs', 'Gestoras', 'Mercados', 'Regulación', 'Educación'].map((cat) => (
              <Link
                key={cat}
                href={`/noticias?categoria=${cat.toLowerCase()}`}
                className="px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {cat}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/rankings"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                Ver Rankings
              </Link>
            </div>
          </nav>
        </div>
      </section>

      <main>
        {/* Rankings Section - PRINCIPAL */}
        <section className="relative py-20 bg-white border-b border-slate-200">
          <div className="mb-16 text-center px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 mb-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>Actualizado Semanalmente</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Top ETFs del Mercado
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Análisis objetivo basado en nuestro algoritmo ETFNexo Score:
              rendimiento, costes, liquidez y calidad de cartera
            </p>
          </div>

          <RankingSlider />

          <div className="text-center mt-12 px-6">
            <Link
              href="/rankings"
              className="inline-flex items-center justify-center px-8 py-4 bg-slate-900 text-white text-lg font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-lg"
            >
              Ver Ranking Completo de 170+ ETFs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Ad Slot - Feed Inline (después de rankings) */}
        <section className="py-8 px-6 bg-white">
          <div className="container max-w-4xl">
            <AdSlot key="feed-inline-after-rankings" placement="feed_inline" />
          </div>
        </section>

        {/* Latest News Grid */}
        <section className="py-16 px-6 bg-slate-50">
          <div className="container max-w-7xl">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Últimas Noticias</h2>
                <p className="text-slate-600">Información actualizada sobre ETFs y mercados</p>
              </div>
              <Link
                href="/noticias"
                className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center"
              >
                Ver todas
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-slate-200 rounded-lg mb-4"></div>
                    <div className="h-6 bg-slate-200 rounded mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : recentArticles.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentArticles.map((article, index) => (
                  <>
                    <Link
                      key={article.id}
                      href={`/noticias/${article.slug}`}
                      className="group"
                    >
                      <article className="h-full flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                        {/* Image */}
                        <div className="news-card-image">
                          {article.featured_image_url ? (
                            <img
                              src={article.featured_image_url}
                              alt={article.title}
                              className="group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="news-card-image__placeholder">
                              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            </div>
                          )}
                          <div className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                            {article.category_name}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col p-6">
                          <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <p className="text-slate-600 mb-4 line-clamp-2 flex-1">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-slate-500">
                            <time>{formatDate(article.published_at)}</time>
                            <span className="w-1 h-1 bg-slate-400 rounded-full"></span>
                            <span>{article.views_count} vistas</span>
                          </div>
                        </div>
                      </article>
                    </Link>
                    {/* Ad after 3rd article */}
                    {index === 2 && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <AdSlot key="feed-inline-after-articles" placement="feed_inline" />
                      </div>
                    )}
                  </>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-6">Próximamente noticias y análisis sobre ETFs</p>
                <Link
                  href="/rankings"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
                >
                  Ver Rankings de ETFs
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-16 px-6 bg-slate-900 text-white">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Recibe Noticias y Análisis Semanales
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Únete a más de 500 inversores que reciben nuestro newsletter cada lunes
            </p>
            <Link
              href="/newsletter"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-lg"
            >
              Suscribirme Gratis
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-white border-t border-slate-200">
          <div className="container max-w-7xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand */}
              <div>
                <div className="text-2xl font-bold text-slate-900 mb-4">
                  ETF<span className="text-blue-600">Nexo</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Información transparente y análisis independiente sobre ETFs para inversores inteligentes
                </p>
              </div>

              {/* Noticias */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Noticias</h4>
                <ul className="space-y-2">
                  {['ETFs', 'Gestoras', 'Mercados', 'Regulación'].map((item) => (
                    <li key={item}>
                      <Link href={`/noticias?categoria=${item.toLowerCase()}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Herramientas */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Herramientas</h4>
                <ul className="space-y-2">
                  {['Rankings', 'Buscador ETFs', 'Comparador', 'Newsletter'].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Legal</h4>
                <ul className="space-y-2">
                  {['Metodología', 'Términos', 'Privacidad', 'Disclaimer'].map((item) => (
                    <li key={item}>
                      <Link href={`/${item.toLowerCase()}`} className="text-sm text-slate-600 hover:text-slate-900 transition-colors">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500">
                © 2026 ETFNexo. Todos los derechos reservados.
              </p>
              <p className="text-xs text-slate-400 max-w-2xl text-center md:text-right">
                ETF Nexo es una plataforma informativa. No prestamos servicios de inversión ni asesoramiento financiero regulado.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
