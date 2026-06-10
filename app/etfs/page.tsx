'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface ETF {
  id: string;
  isin: string;
  name: string;
  yahoo_ticker: string;
  category: string | null;
  issuer_name: string | null;
  return_1y: number | null;
  ter: number | null;
  aum_millions: number | null;
  etfnexo_score: number | null;
}

const CATEGORIES = [
  { name: 'Todas las categorías', value: '' },
  { name: 'Renta Variable', value: 'equity' },
  { name: 'Renta Fija', value: 'bond' },
  { name: 'Commodities', value: 'commodity' },
  { name: 'Inmobiliario', value: 'real_estate' },
  { name: 'Mixto', value: 'mixed' },
];

type SortField = 'name' | 'score' | 'return' | 'ter' | 'aum';

export default function ETFsPage() {
  const [etfs, setEtfs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedIssuer, setSelectedIssuer] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('score');
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/v1/etfs')
      .then(res => res.json())
      .then(response => {
        setEtfs(response.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading ETFs:', err);
        setLoading(false);
      });
  }, []);

  const issuers = useMemo(() => {
    const uniqueIssuers = new Set(
      etfs.map(etf => etf.issuer_name).filter((name): name is string => !!name)
    );
    return Array.from(uniqueIssuers).sort();
  }, [etfs]);

  const filteredETFs = useMemo(() => {
    let filtered = etfs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(etf =>
        etf.name.toLowerCase().includes(term) ||
        etf.yahoo_ticker?.toLowerCase().includes(term) ||
        etf.isin.toLowerCase().includes(term)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(etf => etf.category === selectedCategory);
    }

    if (selectedIssuer) {
      filtered = filtered.filter(etf => etf.issuer_name === selectedIssuer);
    }

    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'score':
          aVal = a.etfnexo_score ?? -1;
          bVal = b.etfnexo_score ?? -1;
          break;
        case 'return':
          aVal = a.return_1y ?? -999;
          bVal = b.return_1y ?? -999;
          break;
        case 'ter':
          aVal = a.ter ?? 999;
          bVal = b.ter ?? 999;
          break;
        case 'aum':
          aVal = a.aum_millions ?? 0;
          bVal = b.aum_millions ?? 0;
          break;
        default:
          return 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDesc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
      }

      return sortDesc ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
    });

    return filtered;
  }, [etfs, searchTerm, selectedCategory, selectedIssuer, sortBy, sortDesc]);

  const formatPercent = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatScore = (score: number | null) => {
    if (score === null) return 'N/A';
    return score.toFixed(1);
  };

  return (
    <>
      <Header />
      <main className="etfs-page">
        <section className="etfs-hero">
          <div className="container">
            <div className="etfs-hero__content">
              <span className="etfs-hero__badge">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Explorador de ETFs
              </span>
              <h1 className="etfs-hero__title">
                Descubre el ETF perfecto para tu cartera
              </h1>
              <p className="etfs-hero__description">
                Explora nuestra base de datos completa de ETFs. Busca, filtra y compara para encontrar las mejores oportunidades de inversión.
              </p>
            </div>
          </div>
        </section>

        <section className="etfs-filters">
          <div className="container">
            <div className="etfs-filters__wrapper">
              <div className="etfs-filters__search">
                <svg className="etfs-filters__search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  className="etfs-filters__search-input"
                  placeholder="Buscar por nombre, ticker o ISIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="etfs-filters__select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.name}</option>
                ))}
              </select>

              <select
                className="etfs-filters__select"
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
              >
                <option value="">Todas las gestoras</option>
                {issuers.map(issuer => (
                  <option key={issuer} value={issuer}>{issuer}</option>
                ))}
              </select>

              <select
                className="etfs-filters__select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
              >
                <option value="score">ETF Nexo Score</option>
                <option value="name">Nombre</option>
                <option value="return">Rentabilidad 1Y</option>
                <option value="ter">TER (menor a mayor)</option>
                <option value="aum">Tamaño (AUM)</option>
              </select>

              <button
                className="etfs-filters__sort-btn"
                onClick={() => setSortDesc(!sortDesc)}
                title={sortDesc ? 'Descendente' : 'Ascendente'}
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                  {sortDesc ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  )}
                </svg>
              </button>

              <div className="etfs-filters__count">
                <span className="etfs-filters__count-number">{filteredETFs.length}</span> ETFs encontrados
              </div>
            </div>
          </div>
        </section>

        <section className="etfs-grid">
          <div className="container">
            {loading ? (
              <div className="etfs-loading">Cargando ETFs...</div>
            ) : filteredETFs.length === 0 ? (
              <div className="etfs-empty">
                <p>No se encontraron ETFs con los criterios seleccionados.</p>
              </div>
            ) : (
              <div className="etfs-grid__list">
                {filteredETFs.map((etf) => (
                  <Link key={etf.isin} href={`/etfs/${etf.isin}`} className="etf-card">
                    <div className="etf-card__header">
                      <div className="etf-card__ticker">{etf.yahoo_ticker || etf.isin}</div>
                      {etf.etfnexo_score !== null && (
                        <div className="etf-card__score">
                          <span className="etf-card__score-value">{formatScore(etf.etfnexo_score)}</span>
                          <span className="etf-card__score-label">Score</span>
                        </div>
                      )}
                    </div>
                    <h3 className="etf-card__name">{etf.name}</h3>
                    {etf.issuer_name && (
                      <p className="etf-card__issuer">{etf.issuer_name}</p>
                    )}
                    <div className="etf-card__stats">
                      {etf.return_1y !== null && (
                        <div className="etf-card__stat">
                          <span className="etf-card__stat-label">Rent. 1Y</span>
                          <span className={`etf-card__stat-value ${etf.return_1y >= 0 ? 'positive' : 'negative'}`}>
                            {formatPercent(etf.return_1y)}
                          </span>
                        </div>
                      )}
                      {etf.ter !== null && (
                        <div className="etf-card__stat">
                          <span className="etf-card__stat-label">TER</span>
                          <span className="etf-card__stat-value">{etf.ter.toFixed(2)}%</span>
                        </div>
                      )}
                      {etf.aum_millions !== null && (
                        <div className="etf-card__stat">
                          <span className="etf-card__stat-label">AUM</span>
                          <span className="etf-card__stat-value">
                            {etf.aum_millions >= 1000
                              ? `¬${(etf.aum_millions / 1000).toFixed(1)}B`
                              : `¬${etf.aum_millions.toFixed(0)}M`}
                          </span>
                        </div>
                      )}
                    </div>
                    {etf.category && (
                      <div className="etf-card__category">{etf.category}</div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="etfs-cta">
          <div className="container">
            <h2 className="etfs-cta__title">¿Quieres ver los mejores ETFs del mercado?</h2>
            <p className="etfs-cta__description">
              Consulta nuestro ranking completo con los ETFs mejor valorados según nuestro algoritmo ETFNexo Score
            </p>
            <Link href="/rankings" className="btn-primary">
              Ver Rankings
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
