interface CategoryBreakdownProps {
  rankings: Array<{
    etfnexo_score: number;
    category: string | null;
  }>;
}

export default function CategoryBreakdown({ rankings }: CategoryBreakdownProps) {
  const categories = [
    { key: 'equity', label: 'Renta Variable' },
    { key: 'bond', label: 'Renta Fija' },
    { key: 'commodity', label: 'Commodities' },
  ];

  const categoryData = categories.map(cat => {
    const etfsInCategory = rankings.filter(r => r.category === cat.key);
    const count = etfsInCategory.length;
    const avgScore = count > 0
      ? etfsInCategory.reduce((sum, r) => sum + r.etfnexo_score, 0) / count
      : 0;
    const percentage = (count / rankings.length) * 100;

    return {
      ...cat,
      count,
      avgScore,
      percentage
    };
  });

  const maxCount = Math.max(...categoryData.map(d => d.count));

  return (
    <div className="card">
      <h3 className="category-breakdown__title">Distribución por Categoría</h3>
      <div className="category-breakdown">
        {categoryData.map((cat) => (
          <div key={cat.key} className="category-breakdown__item">
            <div className="category-breakdown__header">
              <span className="category-breakdown__label">{cat.label}</span>
              <span className="category-breakdown__count">
                {cat.count} ETFs ({cat.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="category-breakdown__bar-container">
              <div
                className="category-breakdown__bar"
                style={{ width: `${(cat.count / maxCount) * 100}%` }}
              />
            </div>
            <div className="category-breakdown__score">
              Score Promedio: {cat.avgScore.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
