/**
 * Banda publicitaria pegada bajo el header en el detalle de noticias y
 * academia (formato leaderboard 728x90). El sticky es CSS puro
 * (.ad-band--sticky): no necesita espaciador ni altura fija.
 */

import AdSlot from './AdSlot';
import type { AdPlacement } from '@/lib/ads/placements';

interface FixedTopBannerProps {
  placement: AdPlacement;
}

export default function FixedTopBanner({ placement }: FixedTopBannerProps) {
  return (
    <div className="ad-band ad-band--sticky">
      <AdSlot placement={placement} />
    </div>
  );
}
