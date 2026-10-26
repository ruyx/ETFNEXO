/**
 * Formatos publicitarios por ubicación.
 *
 * Única fuente de verdad del tamaño de cada anuncio: AdSlot reserva este hueco
 * antes de cargar el anuncio (sin CLS) y las creatividades deben subirse en
 * esta proporción, a 1x o 2x (p. ej. 728x90 o 1456x180).
 */

export type AdPlacement =
  | 'sidebar_top'
  | 'sidebar_bottom'
  | 'article_top'
  | 'article_mid'
  | 'article_bottom'
  | 'feed_inline'
  | 'header'
  | 'footer'
  | 'home_top'
  | 'home_after_ranking'
  | 'home_news_sidebar';

export type AdFormat = 'leaderboard' | 'rectangle';

export const AD_FORMATS: Record<AdFormat, { width: number; height: number; label: string }> = {
  leaderboard: { width: 728, height: 90, label: 'Leaderboard' },
  rectangle: { width: 300, height: 250, label: 'Medium Rectangle' },
};

export const PLACEMENT_FORMAT: Record<AdPlacement, AdFormat> = {
  home_top: 'leaderboard',
  home_after_ranking: 'leaderboard',
  article_top: 'leaderboard',
  article_mid: 'leaderboard',
  article_bottom: 'leaderboard',
  feed_inline: 'leaderboard',
  header: 'leaderboard',
  footer: 'leaderboard',
  sidebar_top: 'rectangle',
  sidebar_bottom: 'rectangle',
  home_news_sidebar: 'rectangle',
};

// Se cargan nada más montar; el resto espera a acercarse al viewport.
export const ABOVE_FOLD_PLACEMENTS: readonly AdPlacement[] = ['article_top', 'home_top', 'header'];

export function getPlacementFormat(placement: AdPlacement) {
  const format = PLACEMENT_FORMAT[placement];
  return { format, ...AD_FORMATS[format] };
}
