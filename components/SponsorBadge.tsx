'use client';

/**
 * SponsorBadge - Componente para mostrar información del patrocinador
 * Se renderiza en el modal FAQ después del botón "Ver artículo completo"
 */

import { ExternalLink } from 'lucide-react';

interface SponsorBadgeProps {
  companyName: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
}

export default function SponsorBadge({
  companyName,
  logoUrl,
  websiteUrl
}: SponsorBadgeProps) {
  return (
    <div className="sponsor-badge" style={{ position: 'relative' }}>
      <div className="sponsor-badge__label">
        Patrocinado por
      </div>

      <div className="sponsor-badge__content">
        {logoUrl && (
          <div className="sponsor-badge__logo">
            <img
              src={logoUrl}
              alt={`Logo de ${companyName}`}
              onError={(e) => {
                // Si falla la carga del logo, ocultarlo
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        <div className="sponsor-badge__info">
          <span className="sponsor-badge__company-name">
            {companyName}
          </span>

          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="sponsor-badge__link"
              aria-label={`Visitar sitio web de ${companyName}`}
            >
              <span>Visitar sitio web</span>
              <ExternalLink className="sponsor-badge__link-icon" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
