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
  const content = (
    <div className="sponsor-badge">
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
            <div className="sponsor-badge__link-icon">
              <ExternalLink className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Si hay URL del sitio web, hacer el badge clickeable
  if (websiteUrl) {
    return (
      <a
        href={websiteUrl}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        className="sponsor-badge-link"
        aria-label={`Visitar sitio web de ${companyName}`}
      >
        {content}
      </a>
    );
  }

  // Sin URL, solo mostrar el badge
  return content;
}
