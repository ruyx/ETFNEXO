/**
 * Placements Page - Gestión de ubicaciones publicitarias
 * Incluye vista visual, configuración de tamaños y guía de Google AdSense
 */

import { createClient } from '@/lib/supabase/server';
import { MapPin, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import PlacementCard from './PlacementCard';
import AdSenseGuide from './AdSenseGuide';
import { getPlacementFormat, type AdPlacement } from '@/lib/ads/placements';

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

// Tamaño exigido por AdSlot: la creatividad a 1x o a 2x (pantallas retina).
function requiredSizes(placement: AdPlacement) {
  const { width, height } = getPlacementFormat(placement);
  return [`${width}x${height}`, `${width * 2}x${height * 2} (retina)`];
}

const PLACEMENTS: Omit<PlacementInfo, 'activeAds'>[] = [
  {
    id: 'home_top',
    name: 'home_top',
    label: 'Home - Banner Superior Fixed',
    description: 'Banda bajo el ticker de la home. También se usa en home_after_ranking y article_top',
    recommendedSizes: requiredSizes('home_top'),
    adSenseSizes: ['728x90 (Leaderboard)'],
    zone: 'global'
  },
  {
    id: 'section_top',
    name: 'section_top',
    label: 'Secciones - Bajo el hero',
    description: 'Banda entre el hero y el listado en Noticias, Academia, Entrevistas, Rankings, ETFs y Gestoras. Usa "Páginas objetivo" (p. ej. /noticias) para vender una sola sección',
    recommendedSizes: requiredSizes('section_top'),
    adSenseSizes: ['728x90 (Leaderboard)'],
    zone: 'global'
  },
  {
    id: 'home_news_sidebar',
    name: 'home_news_sidebar',
    label: 'Home - Sidebar Noticias (Sticky)',
    description: 'Banner destacado en sidebar de noticias con sticky condicional',
    recommendedSizes: requiredSizes('home_news_sidebar'),
    adSenseSizes: ['300x250 (Medium Rectangle)'],
    zone: 'sidebar'
  }
];

async function getPlacementsWithStats(): Promise<PlacementInfo[]> {
  const supabase = await createClient();

  const placementsWithStats = await Promise.all(
    PLACEMENTS.map(async (placement) => {
      const { count } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('placement', placement.name)
        .eq('status', 'active');

      return {
        ...placement,
        activeAds: count || 0
      };
    })
  );

  return placementsWithStats;
}

export const metadata = {
  title: 'Ubicaciones de Anuncios - ETF Nexo',
  description: 'Gestión de ubicaciones publicitarias y configuración de Google AdSense'
};

export default async function PlacementsPage() {
  const placements = await getPlacementsWithStats();

  const groupedPlacements = {
    global: placements.filter(p => p.zone === 'global'),
    sidebar: placements.filter(p => p.zone === 'sidebar')
  };

  const totalActivePlacementAds = placements.reduce((sum, p) => sum + p.activeAds, 0);

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Ubicaciones de Anuncios</h1>
          <p className="admin-header__description">
            Gestiona las ubicaciones publicitarias y configura Google AdSense
          </p>
        </div>
        <Link href="/admin/ads/campaigns/new" className="btn btn-primary">
          + Nuevo Anuncio
        </Link>
      </div>

      {/* Summary */}
      <div className="placements-summary">
        <div className="placements-summary__stat">
          <MapPin className="w-5 h-5" />
          <div>
            <p className="placements-summary__label">Ubicaciones Disponibles</p>
            <p className="placements-summary__value">{placements.length}</p>
          </div>
        </div>
        <div className="placements-summary__stat">
          <Info className="w-5 h-5" />
          <div>
            <p className="placements-summary__label">Anuncios Activos</p>
            <p className="placements-summary__value">{totalActivePlacementAds}</p>
          </div>
        </div>
      </div>

      {/* Google AdSense Guide */}
      <AdSenseGuide />

      {/* Placements by Zone */}
      <div className="placements-zones">
        {/* Global Zone (Home Top Banner) */}
        <div className="placements-zone">
          <div className="placements-zone__header">
            <h2 className="placements-zone__title">Página Principal</h2>
            <span className="placements-zone__count">{groupedPlacements.global.length} ubicación</span>
          </div>
          <div className="placements-grid">
            {groupedPlacements.global.map((placement) => (
              <PlacementCard key={placement.id} placement={placement} />
            ))}
          </div>
        </div>

        {/* Sidebar Zone (Home News Sidebar) */}
        <div className="placements-zone">
          <div className="placements-zone__header">
            <h2 className="placements-zone__title">Sidebar de Noticias</h2>
            <span className="placements-zone__count">{groupedPlacements.sidebar.length} ubicación</span>
          </div>
          <div className="placements-grid">
            {groupedPlacements.sidebar.map((placement) => (
              <PlacementCard key={placement.id} placement={placement} />
            ))}
          </div>
        </div>
      </div>

      {/* Visual Preview Link */}
      <div className="placements-preview-cta">
        <Info className="w-5 h-5" />
        <div>
          <h3>Vista Previa Visual</h3>
          <p>Para ver cómo se muestran los anuncios en cada ubicación, visita la página de vista previa.</p>
        </div>
        <Link href="/admin/ads/placements/preview" className="btn btn-secondary">
          <ExternalLink className="w-4 h-4" />
          Ver Preview
        </Link>
      </div>
    </div>
  );
}
