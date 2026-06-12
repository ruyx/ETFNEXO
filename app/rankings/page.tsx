'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import MarketTicker from '@/components/MarketTicker';
import ProgressBar from '@/components/ProgressBar';
import MarketStats from '@/components/MarketStats';
import ScoreDistribution from '@/components/ScoreDistribution';
import TopPerformers from '@/components/TopPerformers';
import CategoryBreakdown from '@/components/CategoryBreakdown';

interface ETFRanking {
  id: string;
  isin: string;
  name: string;
  yahoo_ticker: string;
  category: string | null;
  return_1y: number | null;
  sharpe_ratio: number | null;
  ter: number | null;
  aum_millions: number | null;
  bid_ask_spread: number | null;
  etfnexo_score: number;
  rank: number;
  performance_score: number;
  cost_score: number;
  liquidity_score: number;
  community_score: number;
}

const CATEGORIES = [
  { name: 'Todos', value: '' },
  { name: 'Renta Variable', value: 'equity' },
  { name: 'Renta Fija', value: 'bond' },
  { name: 'Commodities', value: 'commodity' },
];

type SortField = 'rank' | 'score' | 'return' | 'ter' | 'aum';

function RankingsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category') || '';

  const [rankings, setRankings] = useState<ETFRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('rank');
  const [sortDesc, setSortDesc] = useState(false);

  useEffect(() => {
    setLoading(true);
    const url = categoryParam
      ? `/api/v1/rankings?category=${categoryParam}`
      : '/api/v1/rankings';

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setRankings(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, [categoryParam]);

  const stats = useMemo(() => {
    if (rankings.length === 0) return null;

    const validReturns = rankings.filter(r => r.return_1y !== null).map(r => r.return_1y!);
    const validTERs = rankings.filter(r => r.ter !== null).map(r => r.ter!);
    const validAUMs = rankings.filter(r => r.aum_millions !== null).map(r => r.aum_millions!);

    return {
      totalETFs: rankings.length,
      avgScore: rankings.reduce((sum, r) => sum + r.etfnexo_score, 0) / rankings.length,
      avgReturn: validReturns.length > 0
        ? validReturns.reduce((sum, r) => sum + r, 0) / validReturns.length
        : 0,
      avgTER: validTERs.length > 0
        ? validTERs.reduce((sum, r) => sum + r, 0) / validTERs.length
        : 0,
      totalAUM: validAUMs.reduce((sum, r) => sum + r, 0),
    };
  }, [rankings]);

  const filteredRankings = useMemo(() => {
    let filtered = rankings;

    if (searchTerm) {
      filtered = filtered.filter(
        r =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.yahoo_ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.isin.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered = [...filtered].sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'score':
          aVal = a.etfnexo_score;
          bVal = b.etfnexo_score;
          break;
        case 'return':
          aVal = a.return_1y || -999;
          bVal = b.return_1y || -999;
          break;
        case 'ter':
          aVal = a.ter || 999;
          bVal = b.ter || 999;
          break;
        case 'aum':
          aVal = a.aum_millions || 0;
          bVal = b.aum_millions || 0;
          break;
        default:
          aVal = a.rank;
          bVal = b.rank;
      }

      return sortDesc ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [rankings, searchTerm, sortBy, sortDesc]);

  const formatNumber = (num: number | null) => {
    if (num === null) return 'N/A';
    return num.toLocaleString('es-ES', { maximumFractionDigits: 2 });
  };

  const formatPercentage = (num: number | null, decimals = 2) => {
    if (num === null) return 'N/A';
    return `${num.toFixed(decimals)}%`;
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'rank-badge rank-badge--1';
    if (rank === 2) return 'rank-badge rank-badge--2';
    if (rank === 3) return 'rank-badge rank-badge--3';
    return 'rank-badge';
  };

  const getMetricClass = (value: number | null) => {
    if (value === null) return 'rankings-table__metric rankings-table__metric--neutral';
    if (value > 0) return 'rankings-table__metric rankings-table__metric--positive';
    return 'rankings-table__metric rankings-table__metric--negative';
  };

  return (
    <div>
      <Header />
      <MarketTicker />

      {/* Hero */}
      <section className="rankings-hero">
        <div className="container">
          <div>
            <div className="rankings-hero__badge">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              <span>Actualizado Diariamente</span>
            </div>
            <h1 className="rankings-hero__title">Rankings de ETFs</h1>
            <p className="rankings-hero__description">
              Análisis completo de {stats?.totalETFs || 0} ETFs con métricas de rendimiento, costes y liquidez
            </p>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="rankings-filters">
        <div className="container">
          <nav className="rankings-filters__nav">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                href={cat.value === '' ? '/rankings' : `/rankings?category=${cat.value}`}
                className={categoryParam === cat.value
                  ? 'rankings-filters__link rankings-filters__link--active'
                  : 'rankings-filters__link rankings-filters__link--inactive'}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <main className="container rankings-main">
        <div className="rankings-content">
          {loading ? (
            <div className="rankings-skeleton">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="rankings-skeleton__card">
                  <div className="rankings-skeleton__bar"></div>
                  <div className="rankings-skeleton__bar rankings-skeleton__bar--large"></div>
                </div>
              ))}
            </div>
          ) : rankings.length === 0 ? (
            <div className="rankings-empty">
              <h3 className="rankings-empty__title">No hay ETFs</h3>
              <p className="rankings-empty__description">Prueba con otra categoría</p>
            </div>
          ) : (
            <>
              {stats && <MarketStats {...stats} />}

              <div className="rankings-analytics">
                <div className="rankings-analytics__performers">
                  <TopPerformers rankings={rankings} />
                </div>
                <div className="rankings-analytics__sidebar">
                  <ScoreDistribution rankings={rankings} />
                  <CategoryBreakdown rankings={rankings} />
                </div>
              </div>

              <div className="card">
                <div className="rankings-search">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, ticker o ISIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rankings-search__input"
                  />
                  <div className="rankings-search__controls">
                    <span className="rankings-search__label">Ordenar:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortField)}
                      className="rankings-search__select"
                    >
                      <option value="rank">Ranking</option>
                      <option value="score">Score</option>
                      <option value="return">Rentabilidad</option>
                      <option value="ter">TER</option>
                      <option value="aum">AUM</option>
                    </select>
                    <button
                      onClick={() => setSortDesc(!sortDesc)}
                      className="rankings-search__sort-btn"
                      aria-label="Cambiar orden"
                    >
                      <svg className={sortDesc ? 'rankings-search__sort-icon rankings-search__sort-icon--desc' : 'rankings-search__sort-icon'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="rankings-search__count">
                  Mostrando {filteredRankings.length} de {rankings.length} ETFs
                </div>

                {/* Tabla Desktop */}
                <div className="rankings-desktop-only">
                  <div className="rankings-table-wrapper">
                    <table className="rankings-table">
                    <thead>
                      <tr className="rankings-table__header">
                        <th className="rankings-table__th rankings-table__th--left">Rank</th>
                        <th className="rankings-table__th rankings-table__th--left">ETF</th>
                        <th className="rankings-table__th rankings-table__th--center">Score</th>
                        <th className="rankings-table__th rankings-table__th--right">Rent. 1Y</th>
                        <th className="rankings-table__th rankings-table__th--right">Sharpe</th>
                        <th className="rankings-table__th rankings-table__th--right">TER</th>
                        <th className="rankings-table__th rankings-table__th--right">AUM</th>
                        <th className="rankings-table__th rankings-table__th--left">Análisis</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRankings.map((etf) => (
                        <tr key={etf.id} className="rankings-table__row">
                          <td className="rankings-table__cell">
                            <div className={getRankClass(etf.rank)}>
                              #{etf.rank}
                            </div>
                          </td>
                          <td className="rankings-table__cell">
                            <Link href={`/etfs/${etf.isin}`} className="rankings-table__etf-link">
                              <div className="rankings-table__etf-name">{etf.name}</div>
                              <div className="rankings-table__ticker">{etf.yahoo_ticker}</div>
                            </Link>
                          </td>
                          <td className="rankings-table__cell">
                            <div className="rankings-table__score">{etf.etfnexo_score.toFixed(1)}</div>
                          </td>
                          <td className="rankings-table__cell">
                            <span className={getMetricClass(etf.return_1y)}>
                              {etf.return_1y ? formatPercentage(etf.return_1y) : 'N/A'}
                            </span>
                          </td>
                          <td className="rankings-table__cell">
                            <span className="rankings-table__metric rankings-table__metric--neutral">
                              {etf.sharpe_ratio ? etf.sharpe_ratio.toFixed(2) : 'N/A'}
                            </span>
                          </td>
                          <td className="rankings-table__cell">
                            <span className="rankings-table__metric rankings-table__metric--neutral">
                              {etf.ter ? formatPercentage(etf.ter * 100) : 'N/A'}
                            </span>
                          </td>
                          <td className="rankings-table__cell">
                            <span className="rankings-table__metric rankings-table__metric--neutral">
                              {etf.aum_millions ? `€${formatNumber(etf.aum_millions)}M` : 'N/A'}
                            </span>
                          </td>
                          <td className="rankings-table__cell">
                            <div className="rankings-table__analysis">
                              <ProgressBar label="Perf" value={etf.performance_score} variant="performance" />
                              <ProgressBar label="Cost" value={etf.cost_score} variant="cost" />
                              <ProgressBar label="Liq" value={etf.liquidity_score} variant="liquidity" />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Cards Mobile */}
                <div className="rankings-mobile-only">
                  {filteredRankings.map((etf) => (
                    <Link key={etf.id} href={`/etfs/${etf.isin}`} className="rankings-card">
                      <div className="rankings-card__header">
                        <div className={getRankClass(etf.rank)}>
                          #{etf.rank}
                        </div>
                        <div className="rankings-card__score">{etf.etfnexo_score.toFixed(1)}</div>
                      </div>
                      <h3 className="rankings-card__title">{etf.name}</h3>
                      <p className="rankings-card__ticker">{etf.yahoo_ticker}</p>

                      <div className="rankings-card__metrics">
                        <div>
                          <div className="rankings-card__metric-label">Rent. 1Y</div>
                          <div className={etf.return_1y && etf.return_1y > 0
                            ? 'rankings-card__metric-value rankings-card__metric-value--positive'
                            : 'rankings-card__metric-value rankings-card__metric-value--negative'}>
                            {etf.return_1y ? formatPercentage(etf.return_1y) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="rankings-card__metric-label">TER</div>
                          <div className="rankings-card__metric-value">
                            {etf.ter ? formatPercentage(etf.ter * 100) : 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="rankings-card__metric-label">AUM</div>
                          <div className="rankings-card__metric-value">
                            {etf.aum_millions ? `€${formatNumber(etf.aum_millions)}M` : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="rankings-card__analysis">
                        <ProgressBar label="Performance" value={etf.performance_score} variant="performance" />
                        <ProgressBar label="Costes" value={etf.cost_score} variant="cost" />
                        <ProgressBar label="Liquidez" value={etf.liquidity_score} variant="liquidity" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="rankings-footer">
        <div className="container">
          <p className="rankings-footer__text">
            © 2026 ETFNexo. Rankings actualizados diariamente con datos de mercado en tiempo real.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function RankingsPage() {
  return (
    <Suspense fallback={
      <div className="rankings-skeleton">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="rankings-skeleton__card">
            <div className="rankings-skeleton__bar"></div>
            <div className="rankings-skeleton__bar rankings-skeleton__bar--large"></div>
          </div>
        ))}
      </div>
    }>
      <RankingsContent />
    </Suspense>
  );
}
