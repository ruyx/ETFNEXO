'use client';

/**
 * SponsorList - Componente para mostrar múltiples patrocinadores
 * Renderiza un array de sponsors en grid con título único
 */

import SponsorBadge from './SponsorBadge';
import { Sponsor } from '@/types/sponsor';

interface SponsorListProps {
  sponsors: Sponsor[];
}

export default function SponsorList({ sponsors }: SponsorListProps) {
  // Filtrar sponsors válidos (con company_name)
  const validSponsors = sponsors.filter(s => s.company_name && s.company_name.trim().length > 0);

  if (validSponsors.length === 0) {
    return null;
  }

  return (
    <div className="sponsor-section">
      <h3 className="sponsor-section__title">Patrocinado por:</h3>
      <div className="sponsor-grid">
        {validSponsors.map((sponsor, index) => (
          <SponsorBadge
            key={index}
            companyName={sponsor.company_name}
            logoUrl={sponsor.logo_url}
            websiteUrl={sponsor.website_url}
          />
        ))}
      </div>
    </div>
  );
}
