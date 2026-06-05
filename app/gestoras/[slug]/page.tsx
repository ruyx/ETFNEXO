'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface FundManager {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
}

interface ETF {
  id: string;
  isin: string;
  name: string;
  yahoo_ticker: string;
  category: string | null;
  return_1y: number | null;
  ter: number | null;
  aum_millions: number | null;
}

interface Stats {
  etf_count: number;
  total_aum_millions: number;
  avg_ter: number | null;
  avg_return_1y: number | null;
}

interface APIResponse {
  manager: FundManager;
  etfs: ETF[];
  stats: Stats;
}

export default function GestoraDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    fetch(`/api/v1/gestoras/${slug}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Gestora no encontrada');
          throw new Error('Error al cargar gestora');
        }
        return res.json();
      })
      .then((apiData: APIResponse) => {
        setData(apiData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching gestora:', err);
        setError(err.message || 'No se pudieron cargar los datos de la gestora');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div>
        <Header />
        <main className="gestoras-loading">
          <div className="container">
            <div className="gestoras-loading__spinner"></div>
            <p className="gestoras-loading__text">Cargando información...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div>
        <Header />
        <main className="gestoras-main">
          <div className="container">
            <div className="gestoras-error">
              <p className="gestoras-error__text">{error}</p>
              <Link href="/gestoras" className="btn-primary" style={{ marginTop: '1.5rem' }}>
                Volver a Gestoras
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { manager, etfs, stats } = data;

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
              <Link href="/gestoras" className="etf-breadcrumb__link">Gestoras</Link>
              <span className="etf-breadcrumb__separator">/</span>
              <span className="etf-breadcrumb__current">{manager.name}</span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="gestora-detail-hero">
          <div className="container">
            <div className="gestora-detail-hero__content">
              {manager.logo_url && (
                <img
                  src={manager.logo_url}
                  alt={manager.name}
                  className="gestora-detail-hero__logo"
                />
              )}
              <div className="gestora-detail-hero__main">
                <h1 className="gestora-detail-hero__name">{manager.name}</h1>
                {manager.website_url && (
                  <a
                    href={manager.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gestora-detail-hero__website"
                  >
                    {manager.website_url} →
                  </a>
                )}
                {manager.description && (
                  <p className="gestora-detail-hero__description">
                    {manager.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="gestora-stats">
          <div className="container">
            <div className="gestora-stats__grid">
              <div className="card">
                <div className="etf-metric-card__label">Total ETFs</div>
                <div className="etf-metric-card__value">{stats.etf_count}</div>
              </div>
              <div className="card">
                <div className="etf-metric-card__label">AUM Total</div>
                <div className="etf-metric-card__value">
                  €{(stats.total_aum_millions / 1000).toFixed(1)}B
                </div>
              </div>
              <div className="card">
                <div className="etf-metric-card__label">TER Promedio</div>
                <div className="etf-metric-card__value">
                  {stats.avg_ter ? `${(stats.avg_ter * 100).toFixed(2)}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ETFs List */}
        <section className="gestora-etfs">
          <div className="container">
            <h2 className="gestora-etfs__title">
              Catálogo de ETFs ({stats.etf_count})
            </h2>
            <div className="gestora-etfs__grid">
              {etfs.map((etf) => (
                <Link
                  key={etf.id}
                  href={`/etfs/${etf.isin}`}
                  className="gestora-etf-card"
                >
                  <div className="gestora-etf-card__left">
                    <div className="gestora-etf-card__name">{etf.name}</div>
                    <div className="gestora-etf-card__ticker">{etf.yahoo_ticker}</div>
                  </div>
                  <div className="gestora-etf-card__right">
                    <div className="gestora-etf-card__metric">
                      <div className="gestora-etf-card__metric-label">Rent. 1Y</div>
                      <div className={etf.return_1y && etf.return_1y > 0 ? 'gestora-etf-card__metric-value gestora-etf-card__metric-value--positive' : 'gestora-etf-card__metric-value'}>
                        {etf.return_1y ? `${etf.return_1y > 0 ? '+' : ''}${etf.return_1y.toFixed(2)}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="gestora-etf-card__metric">
                      <div className="gestora-etf-card__metric-label">AUM</div>
                      <div className="gestora-etf-card__metric-value">
                        {etf.aum_millions ? `€${(etf.aum_millions / 1000).toFixed(1)}B` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Resources Section */}
        <section className="gestora-resources">
          <div className="container">
            <h2 className="gestora-resources__title">Información Complementaria</h2>
            <p className="gestora-resources__subtitle">
              Consulta más información sobre {manager.name} en estas fuentes confiables
            </p>
            <div className="gestora-resources__grid">
              {/* justETF */}
              <a
                href={`https://www.justetf.com/es/find-etf.html?query=${encodeURIComponent(manager.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-resource-card"
              >
                <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="etf-resource-card__title">justETF</h3>
                <p className="etf-resource-card__description">
                  ETFs de {manager.name}, análisis y comparativas
                </p>
              </a>

              {/* ETF World */}
              <a
                href={`https://etfworld.es/buscar?q=${encodeURIComponent(manager.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-resource-card"
              >
                <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="etf-resource-card__title">ETF World</h3>
                <p className="etf-resource-card__description">
                  Noticias y análisis sobre {manager.name}
                </p>
              </a>

              {/* Fundspeople */}
              <a
                href={`https://fundspeople.com/es/buscar?q=${encodeURIComponent(manager.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="etf-resource-card"
              >
                <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
                <h3 className="etf-resource-card__title">Fundspeople</h3>
                <p className="etf-resource-card__description">
                  Opiniones de expertos sobre {manager.name}
                </p>
              </a>

              {/* Website oficial */}
              {manager.website_url && (
                <a
                  href={manager.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="etf-resource-card"
                >
                  <svg className="etf-resource-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <h3 className="etf-resource-card__title">Sitio Web Oficial</h3>
                  <p className="etf-resource-card__description">
                    Información directa de {manager.name}
                  </p>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="etf-cta">
          <div className="container etf-cta__container">
            <h2 className="etf-cta__title">
              Explora otras gestoras
            </h2>
            <p className="etf-cta__description">
              Compara {manager.name} con otras gestoras de ETFs del mercado
            </p>
            <div className="etf-cta__buttons">
              <Link href="/gestoras" className="btn-primary">
                Ver Todas las Gestoras
              </Link>
              <Link href="/rankings" className="btn-secondary">
                Ver Rankings de ETFs
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
