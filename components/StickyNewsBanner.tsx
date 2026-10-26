/**
 * Banner de la columna "Más noticias" de la home (formato rectangle 300x250).
 *
 * Antes calculaba un sticky en JS, pero el sticky vivía dentro de un div del
 * mismo alto que el banner y nunca llegaba a pegarse. Se deja como tarjeta
 * estática: pegarlo taparía las noticias de la lista al hacer scroll.
 */

import AdSlot from './AdSlot';
import type { AdPlacement } from '@/lib/ads/placements';

interface StickyNewsBannerProps {
  placement: AdPlacement;
}

export default function StickyNewsBanner({ placement }: StickyNewsBannerProps) {
  return (
    <div className="ad-card">
      <AdSlot placement={placement} />
    </div>
  );
}
