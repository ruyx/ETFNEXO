/**
 * PlacementCard - Tarjeta de información de ubicación publicitaria
 */

import { MapPin, Ruler, Eye } from 'lucide-react';
import Link from 'next/link';

interface PlacementInfo {
  id: string;
  name: string;
  label: string;
  description: string;
  recommendedSizes: string[];
  adSenseSizes: string[];
  activeAds: number;
  zone: 'sidebar' | 'article' | 'feed' | 'global';
}

interface PlacementCardProps {
  placement: PlacementInfo;
}

export default function PlacementCard({ placement }: PlacementCardProps) {
  return (
    <div className="placement-card">
      <div className="placement-card__header">
        <div className="placement-card__icon">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="placement-card__title-group">
          <h3 className="placement-card__title">{placement.label}</h3>
          <p className="placement-card__id">{placement.name}</p>
        </div>
        <div className="placement-card__badge">
          {placement.activeAds > 0 ? (
            <span className="badge badge--success">
              {placement.activeAds} activo{placement.activeAds > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="badge badge--neutral">
              Sin anuncios
            </span>
          )}
        </div>
      </div>

      <p className="placement-card__description">{placement.description}</p>

      <div className="placement-card__section">
        <div className="placement-card__section-header">
          <Ruler className="w-4 h-4" />
          <span>Tamaños Recomendados</span>
        </div>
        <div className="placement-card__sizes">
          {placement.recommendedSizes.map((size) => (
            <span key={size} className="placement-card__size">
              {size}
            </span>
          ))}
        </div>
      </div>

      <div className="placement-card__section">
        <div className="placement-card__section-header">
          <img
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234285f4' stroke-width='2'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5M2 12l10 5 10-5'/%3E%3C/svg%3E"
            alt="AdSense"
            className="w-4 h-4"
          />
          <span>Formatos Google AdSense</span>
        </div>
        <ul className="placement-card__adsense-list">
          {placement.adSenseSizes.map((size, index) => (
            <li key={index}>{size}</li>
          ))}
        </ul>
      </div>

      <div className="placement-card__actions">
        <Link
          href={`/admin/ads/campaigns?placement=${placement.name}`}
          className="placement-card__link"
        >
          <Eye className="w-4 h-4" />
          Ver Anuncios
        </Link>
      </div>
    </div>
  );
}
