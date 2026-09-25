'use client';

/**
 * SponsorList - Componente para mostrar múltiples patrocinadores
 * Renderiza un array de sponsors usando SponsorBadge
 */

import SponsorBadge from './SponsorBadge';
import { Sponsor } from '@/types/sponsor';

interface SponsorListProps {
  sponsors: Sponsor[];
}

export default function SponsorList({ sponsors }: SponsorListProps) {
  // DEBUG: Ver todos los sponsors recibidos
  console.group('🔍 [SponsorList] Debug');
  console.log('Total sponsors recibidos:', sponsors?.length || 0);
  console.log('Sponsors completos:', JSON.stringify(sponsors, null, 2));

  // Filtrar sponsors válidos (con company_name)
  const validSponsors = sponsors.filter(s => {
    const isValid = s.company_name && s.company_name.trim().length > 0;
    if (!isValid) {
      console.warn('❌ Sponsor filtrado (sin company_name):', s);
    }
    return isValid;
  });

  console.log('✅ Valid sponsors después de filtro:', validSponsors.length);
  console.groupEnd();

  if (validSponsors.length === 0) {
    return null;
  }

  return (
    <div className="sponsor-list">
      {validSponsors.map((sponsor, index) => (
        <SponsorBadge
          key={index}
          companyName={sponsor.company_name}
          logoUrl={sponsor.logo_url}
          websiteUrl={sponsor.website_url}
        />
      ))}
    </div>
  );
}
