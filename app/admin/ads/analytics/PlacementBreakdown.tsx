'use client';

import '@/app/styles/components/admin-ads.css';
import { MapPin } from 'lucide-react';

/**
 * Placement Breakdown Component - Análisis de rendimiento por ubicación
 */

interface PlacementStat {
  placement: string;
  impressions: number;
  clicks: number;
  ctr: number;
  ads: number;
}

interface PlacementBreakdownProps {
  stats: PlacementStat[];
  title?: string;
  showAdsCount?: boolean;
}

export default function PlacementBreakdown({
  stats,
  title = 'Rendimiento por Ubicación',
  showAdsCount = true
}: PlacementBreakdownProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className="analytics-breakdown">
        <div className="analytics-breakdown__header">
          <h3 className="analytics-breakdown__title">{title}</h3>
        </div>
        <div className="analytics-empty">
          <p className="analytics-empty__description">
            No hay datos disponibles
          </p>
        </div>
      </div>
    );
  }

  // Labels amigables para ubicaciones
  const placementLabels: Record<string, string> = {
    'sidebar_top': 'Sidebar Superior',
    'sidebar_bottom': 'Sidebar Inferior',
    'article_top': 'Artículo Superior',
    'article_mid': 'Artículo Medio',
    'article_bottom': 'Artículo Inferior',
    'feed_inline': 'Feed Inline',
    'header': 'Header',
    'footer': 'Footer'
  };

  return (
    <div className="analytics-breakdown">
      <div className="analytics-breakdown__header">
        <h3 className="analytics-breakdown__title">{title}</h3>
      </div>

      <div className="analytics-breakdown__list">
        {stats.map((stat) => (
          <div key={stat.placement} className="analytics-breakdown__item">
            <div className="analytics-breakdown__item-info">
              <div className="analytics-breakdown__item-label">
                <MapPin className="w-4 h-4" style={{ display: 'inline', marginRight: '8px' }} />
                {placementLabels[stat.placement] || stat.placement}
              </div>
              {showAdsCount && (
                <div className="analytics-breakdown__item-sublabel">
                  {stat.ads} {stat.ads === 1 ? 'anuncio' : 'anuncios'}
                </div>
              )}
            </div>

            <div className="analytics-breakdown__item-stats">
              <div className="analytics-breakdown__item-stat">
                <div className="analytics-breakdown__item-stat-value">
                  {stat.impressions.toLocaleString()}
                </div>
                <div className="analytics-breakdown__item-stat-label">
                  Impresiones
                </div>
              </div>

              <div className="analytics-breakdown__item-stat">
                <div className="analytics-breakdown__item-stat-value">
                  {stat.clicks.toLocaleString()}
                </div>
                <div className="analytics-breakdown__item-stat-label">
                  Clicks
                </div>
              </div>

              <div className="analytics-breakdown__item-stat">
                <div
                  className="analytics-breakdown__item-stat-value"
                  style={{
                    color: stat.ctr >= 2 ? 'var(--color-success)' :
                           stat.ctr >= 1 ? 'var(--color-warning)' :
                           'var(--color-neutral-600)'
                  }}
                >
                  {stat.ctr.toFixed(2)}%
                </div>
                <div className="analytics-breakdown__item-stat-label">
                  CTR
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
