import Link from 'next/link';

interface ETF {
  id: string;
  isin: string;
  name: string;
  etfnexo_score: number;
  return_1y: number | null;
  ter: number | null;
  aum_millions: number | null;
}

interface TopPerformersProps {
  rankings: ETF[];
}

export default function TopPerformers({ rankings }: TopPerformersProps) {
  const topByReturn = [...rankings]
    .filter(r => r.return_1y !== null)
    .sort((a, b) => (b.return_1y || 0) - (a.return_1y || 0))
    .slice(0, 10);

  const topByTER = [...rankings]
    .filter(r => r.ter !== null && r.ter > 0)
    .sort((a, b) => (a.ter || 1) - (b.ter || 1))
    .slice(0, 10);

  const topByAUM = [...rankings]
    .filter(r => r.aum_millions !== null)
    .sort((a, b) => (b.aum_millions || 0) - (a.aum_millions || 0))
    .slice(0, 10);

  const getRankBadgeClass = (index: number) => {
    if (index === 0) return 'top-performer__rank top-performer__rank--1';
    if (index === 1) return 'top-performer__rank top-performer__rank--2';
    if (index === 2) return 'top-performer__rank top-performer__rank--3';
    return 'top-performer__rank';
  };

  const renderETFCard = (etf: ETF, metric: string, value: string, index: number) => (
    <Link
      key={etf.id}
      href={`/etfs/${etf.isin}`}
      className="top-performer__item"
    >
      <div className={getRankBadgeClass(index)}>
        #{index + 1}
      </div>
      <div className="top-performer__info">
        <div className="top-performer__name">{etf.name}</div>
        <div className="top-performer__metric">{metric}</div>
      </div>
      <div className="top-performer__value">{value}</div>
    </Link>
  );

  return (
    <div className="top-performers">
      {/* Fila superior: Rentabilidad + TER */}
      <div className="top-performers__row">
        <div className="card">
          <div className="top-performers__header">
            <svg className="top-performers__icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            <h4 className="top-performers__title">Mayor Rentabilidad 1Y</h4>
          </div>
          <div className="top-performers__list">
            {topByReturn.map((etf, i) =>
              renderETFCard(etf, 'Rentabilidad 1Y', `+${etf.return_1y?.toFixed(2)}%`, i)
            )}
          </div>
        </div>

        <div className="card">
          <div className="top-performers__header">
            <svg className="top-performers__icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <h4 className="top-performers__title">Menores Costes (TER)</h4>
          </div>
          <div className="top-performers__list">
            {topByTER.map((etf, i) =>
              renderETFCard(etf, 'TER Anual', `${(etf.ter! * 100).toFixed(2)}%`, i)
            )}
          </div>
        </div>
      </div>

      {/* Fila inferior: AUM en 3 columnas */}
      <div className="card top-performers__aum-card">
        <div className="top-performers__header">
          <svg className="top-performers__icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <h4 className="top-performers__title">Mayor Liquidez (AUM)</h4>
        </div>
        <div className="top-performers__aum-grid">
          {/* Columna 1: Rankings 1-4 */}
          <div className="top-performers__list">
            {topByAUM.slice(0, 4).map((etf, i) =>
              renderETFCard(etf, 'AUM', `€${(etf.aum_millions! / 1000).toFixed(1)}B`, i)
            )}
          </div>
          {/* Columna 2: Rankings 5-7 */}
          <div className="top-performers__list">
            {topByAUM.slice(4, 7).map((etf, i) =>
              renderETFCard(etf, 'AUM', `€${(etf.aum_millions! / 1000).toFixed(1)}B`, i + 4)
            )}
          </div>
          {/* Columna 3: Rankings 8-10 */}
          <div className="top-performers__list">
            {topByAUM.slice(7, 10).map((etf, i) =>
              renderETFCard(etf, 'AUM', `€${(etf.aum_millions! / 1000).toFixed(1)}B`, i + 7)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
