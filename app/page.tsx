import Link from 'next/link';
import Header from '@/components/Header';
import HeroSplit from '@/components/HeroSplit';
import HeroNewsSlideshow from '@/components/HeroNewsSlideshow';
import RankingSlider from '@/components/RankingSlider';
import MarketTicker from '@/components/MarketTicker';
import AdSlot from '@/components/AdSlot';
import StickyNewsBanner from '@/components/StickyNewsBanner';
import NewsCard from '@/components/NewsCard';
import Footer from '@/components/Footer';
import { getLatestArticles } from '@/lib/news/get-latest-articles';

// La home se regenera cada 5 minutos (ISR): el carrusel del hero recoge las
// noticias nuevas sin redeploy. Para forzarlo al publicar: POST /api/revalidate { path: '/' }.
export const revalidate = 300;

const HERO_SLIDES = 5;

export default async function HomePage() {
  const recentArticles = await getLatestArticles(12);
  const heroArticles = recentArticles.slice(0, HERO_SLIDES);

  return (
    <>
      {/* Schema.org para Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'ETF Nexo',
            url: 'https://etfnexo.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://etfnexo.com/buscar?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })
        }}
      />

      <div className="bg-white">
        <Header />
        <MarketTicker />

      {/* Banner superior bajo el ticker (leaderboard 728x90) */}
      <section className="nx-band">
        <AdSlot placement="home_top" />
      </section>

      {/* Hero: carrusel con las últimas noticias (foto fundida a la derecha) */}
      {heroArticles.length > 0 ? (
        <HeroNewsSlideshow articles={heroArticles} />
      ) : (
        <HeroSplit
          eyebrow="Rankings actualizados semanalmente"
          title={<><span className="highlight">Rankings de ETFs 2026</span>, Noticias y Análisis para Inversores</>}
          description="La plataforma de referencia para inversores que buscan información transparente y análisis objetivo sobre ETFs."
          image={{
            src: 'https://images.pexels.com/photos/8353820/pexels-photo-8353820.jpeg?auto=compress&cs=tinysrgb&w=1920',
            alt: 'Equipo de inversores analizando gráficas de mercado en una reunión',
          }}
          primaryCta={{ href: '/rankings', label: 'Ver Rankings de ETFs' }}
          secondaryCta={{ href: '/noticias', label: 'Últimas Noticias' }}
        />
      )}

      <main>
        {/* Noticias: el grid sigue directamente al hero */}
        <section className="section section--light px-6">
          <div className="container max-w-7xl">
            {recentArticles.length > 0 ? (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Primeras 6 noticias en DOS COLUMNAS (cards) */}
                <div className="lg:col-span-2">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Noticias Destacadas</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {recentArticles.slice(0, 6).map((article) => (
                      <NewsCard key={article.id} article={article} variant="card" />
                    ))}
                  </div>
                </div>

                {/* Siguientes 6 noticias en TERCERA COLUMNA (lista) */}
                <div className="lg:col-span-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Más Noticias</h2>

                  {/* Banner Sticky Destacado */}
                  <StickyNewsBanner placement="home_news_sidebar" />

                  <div className="space-y-4">
                    {recentArticles.slice(6, 12).map(article => (
                      <NewsCard key={article.id} article={article} variant="default" />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-6">Próximamente noticias y análisis sobre ETFs</p>
                <Link href="/rankings" className="btn-primary">
                  Ver Rankings de ETFs
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Rankings Section - PRINCIPAL */}
        <section className="relative section section--white border-b border-slate-100">
          <div className="mb-16 text-center px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-dark text-xs font-semibold rounded-full border border-primary-100 mb-6">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
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
              className="btn-primary text-lg px-10 py-4"
            >
              Ver Ranking Completo de 170+ ETFs
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Banner tras el ranking (leaderboard 728x90) */}
        <section className="nx-band">
          <AdSlot placement="home_after_ranking" />
        </section>

        {/* Newsletter CTA */}
        <section className="section section--dark px-6">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Recibe Noticias y Análisis <span className="highlight">Semanales</span>
            </h2>
            <p className="text-xl mb-8">
              Únete a más de 500 inversores que reciben nuestro newsletter cada lunes
            </p>
            <Link
              href="/newsletter"
              className="btn-primary text-lg px-10 py-4"
            >
              Suscribirme Gratis
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </div>
    </>
  );
}
