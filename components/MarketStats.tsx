interface MarketStatsProps {
  totalETFs: number;
  avgScore: number;
  avgReturn: number;
  avgTER: number;
  totalAUM: number;
}

export default function MarketStats({ totalETFs, avgScore, avgReturn, avgTER, totalAUM }: MarketStatsProps) {
  const formatNumber = (num: number) => num.toLocaleString('es-ES', { maximumFractionDigits: 2 });

  return (
    <div className="market-stats">
      <div className="market-stats__card">
        <div className="market-stats__label">Total ETFs</div>
        <div className="market-stats__value">{totalETFs}</div>
      </div>

      <div className="market-stats__card">
        <div className="market-stats__label">Score Promedio</div>
        <div className="market-stats__value">{avgScore.toFixed(1)}</div>
      </div>

      <div className="market-stats__card">
        <div className="market-stats__label">Rentabilidad Media</div>
        <div className={avgReturn >= 0
          ? 'market-stats__value market-stats__value--positive'
          : 'market-stats__value market-stats__value--negative'}>
          {avgReturn >= 0 ? '+' : ''}{avgReturn.toFixed(2)}%
        </div>
      </div>

      <div className="market-stats__card">
        <div className="market-stats__label">TER Promedio</div>
        <div className="market-stats__value">{(avgTER * 100).toFixed(2)}%</div>
      </div>

      <div className="market-stats__card">
        <div className="market-stats__label">AUM Total</div>
        <div className="market-stats__value">
          €{(totalAUM / 1000).toFixed(1)}B
        </div>
      </div>
    </div>
  );
}
