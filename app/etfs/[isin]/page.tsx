'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface ETFDetail {
  id: string;
  isin: string;
  name: string;
  yahoo_ticker: string;
  category: string | null;
  manager_id: string | null;
  return_1y: number | null;
  return_ytd: number | null;
  return_3y: number | null;
  sharpe_ratio: number | null;
  volatility_1y: number | null;
  ter: number | null;
  aum_millions: number | null;
  bid_ask_spread: number | null;
  number_of_holdings: number | null;
  top_10_holdings: any | null;
  benchmark_index: string | null;
  replication_method: string | null;
  dividend_policy: string | null;
  domicile: string | null;
  currency: string | null;
  inception_date: string | null;
  etfnexo_score: number;
  performance_score: number;
  cost_score: number;
  liquidity_score: number;
  community_score: number;
}

interface FundManager {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  logo_url: string | null;
}

interface APIResponse {
  etf: ETFDetail;
  fundManager: FundManager | null;
  ratings: {
    average: number | null;
    count: number;
  };
  priceHistory: Array<{ date: string; nav_price: number }>;
}

export default function ETFDetailPage() {
  const params = useParams();
  const isin = params?.isin as string;

  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isin) return;

    fetch(`/api/v1/etfs/${isin}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('ETF no encontrado');
          throw new Error('Error al cargar datos del ETF');
        }
        return res.json();
      })
      .then((apiData: APIResponse) => {
        setData(apiData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching ETF details:', err);
        setError(err.message || 'No se pudieron cargar los datos del ETF');
        setLoading(false);
      });
  }, [isin]);

  if (loading) {
    return (
      <div>
        <Header />
        <main className="etf-loading">
          <div className="container etf-loading__container">
            <div className="etf-loading__spinner"></div>
            <p className="etf-loading__text">Cargando información del ETF...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Header />
        <main className="etf-error">
          <div className="container etf-error__container">
            <div className="etf-error__card">
              <h2 className="etf-error__title">Error</h2>
              <p className="etf-error__message">{error}</p>
              <Link href="/rankings" className="btn-primary">
                Volver al Ranking
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { etf, fundManager } = data;

  return (
    <div>
      <Header />
      <main>
        {/* Breadcrumb */}
        <section className="etf-breadcrumb">
          <div className="container">
            <nav className="etf-breadcrumb__nav">
              <Link href="/" className="etf-breadcrumb__link">Inicio</Link>
              <span className="etf-breadcrumb__separator">/</span>
              <Link href="/rankings" className="etf-breadcrumb__link">Rankings</Link>
              <span className="etf-breadcrumb__separator">/</span>
              <span className="etf-breadcrumb__current">{etf.yahoo_ticker}</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="etf-hero">
          <div className="container">
            <div className="etf-hero__content">
              {/* Left: ETF Info */}
              <div className="etf-hero__main">
                <div className="etf-hero__header">
                  {fundManager?.logo_url && (
                    <img
                      src={fundManager.logo_url}
                      alt={fundManager.name}
                      className="etf-hero__logo"
                    />
                  )}
                  <div>
                    <h1 className="etf-hero__title">{etf.name}</h1>
                    <div className="etf-hero__meta">
                      <span className="etf-hero__meta-item">{etf.yahoo_ticker}</span>
                      <span className="etf-breadcrumb__separator">•</span>
                      <span className="etf-hero__meta-item">ISIN: {etf.isin}</span>
                      {fundManager && (
                        <>
                          <span className="etf-breadcrumb__separator">•</span>
                          <Link href={`/gestoras/${fundManager.slug}`} className="etf-hero__meta-link">
                            {fundManager.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Score Card */}
              <div className="card etf-score-card">
                <div className="etf-score-card__main">
                  <div className="etf-score-card__value">
                    {etf.etfnexo_score ? etf.etfnexo_score.toFixed(1) : 'N/A'}
                  </div>
                  <div className="etf-score-card__label">
                    ETFNexo Score
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="etf-score-card__breakdown">
                  <div className="etf-score-card__item">
                    <div className="etf-score-card__item-header">
                      <span className="etf-score-card__item-label">Performance</span>
                      <span className="etf-score-card__item-value">{etf.performance_score ? etf.performance_score.toFixed(0) : 'N/A'}</span>
                    </div>
                    <div className="etf-score-card__bar">
                      <div
                        className="etf-score-card__bar-fill etf-score-card__bar-fill--performance"
                        style={{ width: `${etf.performance_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="etf-score-card__item">
                    <div className="etf-score-card__item-header">
                      <span className="etf-score-card__item-label">Costes</span>
                      <span className="etf-score-card__item-value">{etf.cost_score ? etf.cost_score.toFixed(0) : 'N/A'}</span>
                    </div>
                    <div className="etf-score-card__bar">
                      <div
                        className="etf-score-card__bar-fill etf-score-card__bar-fill--cost"
                        style={{ width: `${etf.cost_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="etf-score-card__item">
                    <div className="etf-score-card__item-header">
                      <span className="etf-score-card__item-label">Liquidez</span>
                      <span className="etf-score-card__item-value">{etf.liquidity_score ? etf.liquidity_score.toFixed(0) : 'N/A'}</span>
                    </div>
                    <div className="etf-score-card__bar">
                      <div
                        className="etf-score-card__bar-fill etf-score-card__bar-fill--liquidity"
                        style={{ width: `${etf.liquidity_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="etf-score-card__item">
                    <div className="etf-score-card__item-header">
                      <span className="etf-score-card__item-label">Comunidad</span>
                      <span className="etf-score-card__item-value">{etf.community_score ? etf.community_score.toFixed(0) : 'N/A'}</span>
                    </div>
                    <div className="etf-score-card__bar">
                      <div
                        className="etf-score-card__bar-fill etf-score-card__bar-fill--community"
                        style={{ width: `${etf.community_score || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="etf-metrics">
          <div className="container">
            <h2 className="etf-metrics__title">Métricas Clave</h2>
            <div className="etf-metrics__grid">
              {/* Rendimiento 1Y */}
              <div className="card">
                <div className="etf-metric-card__label">
                  Rendimiento 1Y
                </div>
                <div className={etf.return_1y && etf.return_1y > 0 ? 'etf-metric-card__value etf-metric-card__value--positive' : 'etf-metric-card__value etf-metric-card__value--negative'}>
                  {etf.return_1y ? `${etf.return_1y > 0 ? '+' : ''}${etf.return_1y.toFixed(2)}%` : 'N/A'}
                </div>
              </div>

              {/* TER */}
              <div className="card">
                <div className="etf-metric-card__label">
                  TER (Costes)
                </div>
                <div className="etf-metric-card__value">
                  {etf.ter ? `${(etf.ter * 100).toFixed(2)}%` : 'N/A'}
                </div>
              </div>

              {/* AUM */}
              <div className="card">
                <div className="etf-metric-card__label">
                  AUM (Tamaño)
                </div>
                <div className="etf-metric-card__value">
                  {etf.aum_millions ? `€${etf.aum_millions.toLocaleString()}M` : 'N/A'}
                </div>
              </div>

              {/* Sharpe Ratio */}
              <div className="card">
                <div className="etf-metric-card__label">
                  Sharpe Ratio
                </div>
                <div className="etf-metric-card__value">
                  {etf.sharpe_ratio ? etf.sharpe_ratio.toFixed(2) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="etf-metrics__grid-3">
              {/* Rendimiento YTD */}
              <div className="card">
                <div className="etf-metric-card__label">
                  Rendimiento YTD
                </div>
                <div className={etf.return_ytd && etf.return_ytd > 0 ? 'etf-metric-card__value etf-metric-card__value--positive' : 'etf-metric-card__value etf-metric-card__value--negative'}>
                  {etf.return_ytd ? `${etf.return_ytd > 0 ? '+' : ''}${etf.return_ytd.toFixed(2)}%` : 'N/A'}
                </div>
              </div>

              {/* Rendimiento 3Y */}
              <div className="card">
                <div className="etf-metric-card__label">
                  Rendimiento 3Y
                </div>
                <div className={etf.return_3y && etf.return_3y > 0 ? 'etf-metric-card__value etf-metric-card__value--positive' : 'etf-metric-card__value etf-metric-card__value--negative'}>
                  {etf.return_3y ? `${etf.return_3y > 0 ? '+' : ''}${etf.return_3y.toFixed(2)}%` : 'N/A'}
                </div>
              </div>

              {/* Volatilidad */}
              <div className="card">
                <div className="etf-metric-card__label">
                  Volatilidad 1Y
                </div>
                <div className="etf-metric-card__value">
                  {etf.volatility_1y ? `${(etf.volatility_1y * 100).toFixed(2)}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Características del ETF */}
        <section className="etf-characteristics">
          <div className="container">
            <h2 className="etf-metrics__title">Características</h2>
            <div className="etf-characteristics__grid">
              {/* Left Column */}
              <div className="etf-characteristics__list">
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Índice Replicado</span>
                  <span className="etf-characteristics__value">{etf.benchmark_index || 'N/A'}</span>
                </div>
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Método de Réplica</span>
                  <span className="etf-characteristics__value">{etf.replication_method || 'N/A'}</span>
                </div>
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Política de Distribución</span>
                  <span className="etf-characteristics__value">{etf.dividend_policy || 'N/A'}</span>
                </div>
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Domicilio</span>
                  <span className="etf-characteristics__value">{etf.domicile || 'N/A'}</span>
                </div>
              </div>

              {/* Right Column */}
              <div className="etf-characteristics__list">
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Moneda</span>
                  <span className="etf-characteristics__value">{etf.currency || 'N/A'}</span>
                </div>
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Fecha de Inicio</span>
                  <span className="etf-characteristics__value">
                    {etf.inception_date ? new Date(etf.inception_date).toLocaleDateString('es-ES') : 'N/A'}
                  </span>
                </div>
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Bid-Ask Spread</span>
                  <span className="etf-characteristics__value">
                    {etf.bid_ask_spread ? `${(etf.bid_ask_spread * 100).toFixed(3)}%` : 'N/A'}
                  </span>
                </div>
                <div className="etf-characteristics__item">
                  <span className="etf-characteristics__label">Número de Holdings</span>
                  <span className="etf-characteristics__value">{etf.number_of_holdings || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Holdings */}
        {etf.top_10_holdings && Array.isArray(etf.top_10_holdings) && etf.top_10_holdings.length > 0 && (
          <section className="etf-holdings">
            <div className="container">
              <h2 className="etf-metrics__title">Top 10 Holdings</h2>
              <div className="card">
                <div className="etf-holdings__list">
                  {etf.top_10_holdings.map((holding: any, index: number) => (
                    <div key={index} className="etf-holdings__item">
                      <div className="etf-holdings__left">
                        <span className="etf-holdings__rank">#{index + 1}</span>
                        <div>
                          <div className="etf-holdings__name">{holding.name}</div>
                          {holding.ticker && (
                            <div className="etf-holdings__ticker">{holding.ticker}</div>
                          )}
                        </div>
                      </div>
                      <div className="etf-holdings__weight">
                        {holding.weight ? `${(holding.weight * 100).toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* External Resources Section */}
        <section className="etf-resources">
          <div className="container">
            <h2 className="etf-resources__title">Información Complementaria</h2>
            <p className="etf-resources__subtitle">
              Consulta información adicional sobre {etf.yahoo_ticker} en estas fuentes confiables
            </p>
            <div className="etf-resources__grid">
              {/* justETF */}
              <a
                href={`https://www.justetf.com/es/find-etf.html?query=${encodeURIComponent(etf.isin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-resource-card"
              >
                <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="etf-resource-card__title">justETF</h3>
                <p className="etf-resource-card__description">
                  Análisis detallado, comparativas y datos históricos de rendimiento
                </p>
              </a>

              {/* ETF World */}
              <a
                href={`https://etfworld.es/buscar?q=${encodeURIComponent(etf.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-resource-card"
              >
                <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="etf-resource-card__title">ETF World</h3>
                <p className="etf-resource-card__description">
                  Noticias, análisis de mercado y estrategias de inversión en ETFs
                </p>
              </a>

              {/* Fundspeople */}
              <a
                href={`https://fundspeople.com/es/buscar?q=${encodeURIComponent(etf.isin)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-resource-card"
              >
                <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="etf-resource-card__title">Fundspeople</h3>
                <p className="etf-resource-card__description">
                  Opiniones de expertos, ratings y análisis profesional del sector
                </p>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="etf-cta">
          <div className="container etf-cta__container">
            <h2 className="etf-cta__title">
              ¿Quieres comparar este ETF con otros?
            </h2>
            <p className="etf-cta__description">
              Explora nuestro ranking completo para ver cómo se compara este ETF con alternativas similares.
            </p>
            <div className="etf-cta__buttons">
              <Link href="/rankings" className="btn-primary">
                Ver Ranking Completo
              </Link>
              <Link href="/" className="btn-secondary">
                Volver al Inicio
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="etf-disclaimer">
          <div className="container etf-disclaimer__container">
            <div className="etf-disclaimer__card">
              <h3 className="etf-disclaimer__title">Disclaimer</h3>
              <p className="etf-disclaimer__text">
                ETF Nexo es una plataforma de información financiera y educación. No somos asesores financieros regulados
                ni prestamos servicios de inversión. El contenido publicado tiene carácter exclusivamente informativo y
                no constituye recomendación de inversión personalizada. Invertir conlleva riesgos, incluida la pérdida
                total del capital. Consulte con un asesor financiero antes de tomar decisiones de inversión.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
