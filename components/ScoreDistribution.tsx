interface ScoreDistributionProps {
  rankings: Array<{ etfnexo_score: number }>;
}

export default function ScoreDistribution({ rankings }: ScoreDistributionProps) {
  const ranges = [
    { label: '90-100', min: 90, max: 100, cssClass: 'score-bar--excellent' },
    { label: '80-89', min: 80, max: 89, cssClass: 'score-bar--very-good' },
    { label: '70-79', min: 70, max: 79, cssClass: 'score-bar--good' },
    { label: '60-69', min: 60, max: 69, cssClass: 'score-bar--fair' },
    { label: '50-59', min: 50, max: 59, cssClass: 'score-bar--poor' },
    { label: '0-49', min: 0, max: 49, cssClass: 'score-bar--very-poor' },
  ];

  const distribution = ranges.map(range => {
    const count = rankings.filter(
      r => r.etfnexo_score >= range.min && r.etfnexo_score <= range.max
    ).length;
    const percentage = (count / rankings.length) * 100;
    return { ...range, count, percentage };
  });

  const maxCount = Math.max(...distribution.map(d => d.count));

  return (
    <div className="card">
      <h3 className="score-distribution__title">Distribución de Scores</h3>
      <div className="score-distribution">
        {distribution.map((range) => (
          <div key={range.label} className="score-distribution__item">
            <div className="score-distribution__header">
              <span className="score-distribution__label">{range.label}</span>
              <span className="score-distribution__count">
                {range.count} ETFs ({range.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="score-distribution__bar-container">
              <div
                className={`score-distribution__bar ${range.cssClass}`}
                style={{ width: `${(range.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
