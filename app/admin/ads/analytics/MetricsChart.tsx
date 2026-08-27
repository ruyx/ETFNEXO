'use client';

import '@/app/styles/components/admin-ads.css';

/**
 * Metrics Chart Component - Gráfica de impresiones y clicks por fecha
 */

interface ChartDataPoint {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface MetricsChartProps {
  data: ChartDataPoint[];
}

export default function MetricsChart({ data }: MetricsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="analytics-chart">
        <div className="analytics-chart__header">
          <h3 className="analytics-chart__title">Impresiones y Clicks por Fecha</h3>
        </div>
        <div className="analytics-empty">
          <p className="analytics-empty__title">Sin datos disponibles</p>
          <p className="analytics-empty__description">
            No hay datos para el periodo seleccionado
          </p>
        </div>
      </div>
    );
  }

  // Encontrar el máximo para escalar las barras
  const maxImpressions = Math.max(...data.map(d => d.impressions));
  const maxClicks = Math.max(...data.map(d => d.clicks));
  const max = Math.max(maxImpressions, maxClicks);

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__header">
        <h3 className="analytics-chart__title">Impresiones y Clicks por Fecha</h3>
        <div className="analytics-chart__legend">
          <div className="analytics-chart__legend-item">
            <div className="analytics-chart__legend-dot analytics-chart__legend-dot--impressions" />
            <span>Impresiones</span>
          </div>
          <div className="analytics-chart__legend-item">
            <div className="analytics-chart__legend-dot analytics-chart__legend-dot--clicks" />
            <span>Clicks</span>
          </div>
        </div>
      </div>

      <div className="analytics-chart__canvas">
        <div className="analytics-chart__bars">
          {data.map((point) => {
            const impressionHeight = max > 0 ? (point.impressions / max) * 100 : 0;
            const clickHeight = max > 0 ? (point.clicks / max) * 100 : 0;

            return (
              <div key={point.date} className="analytics-chart__bar-group">
                <div className="analytics-chart__bars-container">
                  <div
                    className="analytics-chart__bar analytics-chart__bar--impressions"
                    style={{ height: `${impressionHeight}%` }}
                    title={`${point.impressions} impresiones`}
                  />
                  <div
                    className="analytics-chart__bar analytics-chart__bar--clicks"
                    style={{ height: `${clickHeight}%` }}
                    title={`${point.clicks} clicks`}
                  />
                </div>
                <div className="analytics-chart__date-label">
                  {new Date(point.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div style={{
        marginTop: 'var(--spacing-5)',
        paddingTop: 'var(--spacing-4)',
        borderTop: '1px solid var(--color-neutral-200)',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-4)',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)' }}>
            {data.reduce((sum, d) => sum + d.impressions, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
            Total Impresiones
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)' }}>
            {data.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
            Total Clicks
          </div>
        </div>
        <div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-info)' }}>
            {(() => {
              const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
              const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
              return totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0.00';
            })()}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
            CTR Promedio
          </div>
        </div>
      </div>
    </div>
  );
}
