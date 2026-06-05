'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

interface FundManager {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  created_at: string | null;
  etf_count: number;
  total_aum_millions: number | null;
}

type SortField = 'name' | 'etf_count' | 'total_aum_millions';
type SortDirection = 'asc' | 'desc';

export default function GestorasPage() {
  const [managers, setManagers] = useState<FundManager[]>([]);
  const [filteredManagers, setFilteredManagers] = useState<FundManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');

  // Sort states
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    fetch('/api/v1/gestoras')
      .then(res => {
        if (!res.ok) throw new Error('Error al cargar gestoras');
        return res.json();
      })
      .then(data => {
        setManagers(data.data || []);
        setFilteredManagers(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching fund managers:', err);
        setError('No se pudieron cargar las gestoras. Intenta de nuevo más tarde.');
        setLoading(false);
      });
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...managers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(manager =>
        manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (manager.description && manager.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null values
      if (aValue === null) aValue = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bValue === null) bValue = sortDirection === 'asc' ? Infinity : -Infinity;

      // String comparison for name
      if (sortField === 'name') {
        const comparison = String(aValue).localeCompare(String(bValue), 'es');
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Numeric comparison
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredManagers(filtered);
  }, [managers, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'name' ? 'asc' : 'desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="gestoras-sort__icon gestoras-sort__icon--neutral">↕</span>;
    }
    return <span className="gestoras-sort__icon gestoras-sort__icon--active">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="gestoras-hero">
          <div className="container">
            <div className="gestoras-hero__container">
              <div className="gestoras-hero__badge">
                <div className="gestoras-hero__badge-dot"></div>
                <span>Directorio Completo</span>
              </div>

              <h1 className="gestoras-hero__title">
                Gestoras de ETFs
              </h1>
              <p className="gestoras-hero__description">
                Descubre las principales gestoras de ETFs del mercado. Explora su catálogo de fondos,
                activos bajo gestión y compara sus productos de inversión.
              </p>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <section className="gestoras-filters">
          <div className="container">
            <div className="gestoras-filters__container">
              <div className="gestoras-filters__content">
                <div className="gestoras-filters__search">
                  <input
                    type="text"
                    placeholder="Buscar por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="gestoras-filters__input"
                  />
                </div>

                <div className="gestoras-filters__count">
                  <span className="gestoras-filters__count-number">{filteredManagers.length}</span>
                  <span>Gestoras encontradas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fund Managers Grid */}
        <section className="gestoras-main">
          <div className="container">
            {loading && (
              <div className="gestoras-loading">
                <div className="gestoras-loading__spinner"></div>
                <p className="gestoras-loading__text">Cargando gestoras...</p>
              </div>
            )}

            {error && (
              <div className="gestoras-error">
                <p className="gestoras-error__text">{error}</p>
              </div>
            )}

            {!loading && !error && filteredManagers.length === 0 && (
              <div className="gestoras-empty">
                <p className="gestoras-empty__text">No se encontraron gestoras con los filtros aplicados.</p>
              </div>
            )}

            {!loading && !error && filteredManagers.length > 0 && (
              <>
                {/* Sorting Controls */}
                <div className="gestoras-sort">
                  <span className="gestoras-sort__label">Ordenar por:</span>
                  <button
                    onClick={() => handleSort('name')}
                    className={sortField === 'name' ? 'gestoras-sort__button gestoras-sort__button--active' : 'gestoras-sort__button gestoras-sort__button--inactive'}
                  >
                    Nombre <SortIcon field="name" />
                  </button>
                  <button
                    onClick={() => handleSort('etf_count')}
                    className={sortField === 'etf_count' ? 'gestoras-sort__button gestoras-sort__button--active' : 'gestoras-sort__button gestoras-sort__button--inactive'}
                  >
                    Nº ETFs <SortIcon field="etf_count" />
                  </button>
                  <button
                    onClick={() => handleSort('total_aum_millions')}
                    className={sortField === 'total_aum_millions' ? 'gestoras-sort__button gestoras-sort__button--active' : 'gestoras-sort__button gestoras-sort__button--inactive'}
                  >
                    AUM Total <SortIcon field="total_aum_millions" />
                  </button>
                </div>

                {/* Grid of Cards */}
                <div className="gestoras-grid">
                  {filteredManagers.map((manager) => (
                    <Link
                      key={manager.id}
                      href={`/gestoras/${manager.slug}`}
                      className="manager-card"
                    >
                      {/* Logo and Name */}
                      <div className="manager-card__header">
                        {manager.logo_url ? (
                          <img
                            src={manager.logo_url}
                            alt={manager.name}
                            className="manager-card__logo"
                          />
                        ) : (
                          <div className="manager-card__logo-placeholder">
                            {manager.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="manager-card__info">
                          <h3 className="manager-card__name">
                            {manager.name}
                          </h3>
                          {manager.website_url && (
                            <a
                              href={manager.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="manager-card__website"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Sitio web →
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {manager.description && (
                        <p className="manager-card__description">
                          {manager.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="manager-card__stats">
                        <div className="manager-card__stat">
                          <p className="manager-card__stat-label">
                            ETFs
                          </p>
                          <p className="manager-card__stat-value">
                            {manager.etf_count}
                          </p>
                        </div>
                        <div className="manager-card__stat">
                          <p className="manager-card__stat-label">
                            AUM Total
                          </p>
                          <p className="manager-card__stat-value">
                            {manager.total_aum_millions !== null && manager.total_aum_millions > 0
                              ? `€${(manager.total_aum_millions / 1000).toFixed(1)}B`
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="gestoras-cta">
          <div className="container gestoras-cta__container">
            <h2 className="gestoras-cta__title">
              ¿Buscas los mejores ETFs?
            </h2>
            <p className="gestoras-cta__description">
              Descubre nuestro ranking completo de ETFs evaluados con nuestro algoritmo propietario ETFNexo Score
            </p>
            <Link href="/rankings" className="btn-primary">
              Ver Rankings de ETFs
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
