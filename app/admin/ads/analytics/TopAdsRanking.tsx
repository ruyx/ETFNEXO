'use client';

import '@/app/styles/components/admin-ads.css';
import Link from 'next/link';
import { TrendingUp, Eye, MousePointerClick } from 'lucide-react';

/**
 * Top Ads Ranking Component - Ranking de anuncios más efectivos por CTR
 */

interface TopAd {
  id: string;
  name: string;
  type: string;
  placement: string;
  impressions_count: number;
  clicks_count: number;
  ctr: number;
}

interface TopAdsRankingProps {
  ads: TopAd[];
}

export default function TopAdsRanking({ ads }: TopAdsRankingProps) {
  if (!ads || ads.length === 0) {
    return (
      <div className="analytics-top-ads">
        <div className="analytics-top-ads__header">
          <h3 className="analytics-top-ads__title">Top Anuncios por CTR</h3>
        </div>
        <div className="analytics-empty">
          <p className="analytics-empty__description">
            No hay anuncios con impresiones todavía
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-top-ads">
      <div className="analytics-top-ads__header">
        <h3 className="analytics-top-ads__title">Top Anuncios por CTR</h3>
        <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
      </div>

      <table className="analytics-top-ads__table">
        <thead>
          <tr>
            <th>#</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Ubicación</th>
            <th style={{ textAlign: 'center' }}>
              <Eye className="w-4 h-4" style={{ display: 'inline' }} />
            </th>
            <th style={{ textAlign: 'center' }}>
              <MousePointerClick className="w-4 h-4" style={{ display: 'inline' }} />
            </th>
            <th style={{ textAlign: 'right' }}>CTR</th>
          </tr>
        </thead>
        <tbody>
          {ads.map((ad, index) => (
            <tr key={ad.id}>
              <td>
                <span className="analytics-top-ads__rank">#{index + 1}</span>
              </td>
              <td>
                <Link
                  href={`/admin/ads/campaigns/${ad.id}`}
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'none',
                    fontWeight: 600
                  }}
                >
                  {ad.name}
                </Link>
              </td>
              <td>
                <span className="admin-ads-badge admin-ads-badge--neutral" style={{ fontSize: '11px' }}>
                  {ad.type === 'image_banner' ? 'Imagen' :
                   ad.type === 'text_banner' ? 'Texto' :
                   'Script'}
                </span>
              </td>
              <td style={{ fontSize: '13px', color: 'var(--color-neutral-600)' }}>
                {ad.placement}
              </td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>
                {ad.impressions_count.toLocaleString()}
              </td>
              <td style={{ textAlign: 'center', fontWeight: 600 }}>
                {ad.clicks_count.toLocaleString()}
              </td>
              <td style={{ textAlign: 'right' }}>
                <span className="analytics-top-ads__ctr">
                  {ad.ctr.toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
