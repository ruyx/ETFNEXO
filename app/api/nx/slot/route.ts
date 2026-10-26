// ============================================
// API Público - Obtener Anuncios Activos
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isAdPlacement } from '@/lib/ads/placements';
import { toServedImageUrl } from '@/lib/ads/media';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Solo lo que necesita el cliente para pintar el anuncio
const PUBLIC_COLUMNS =
  'id, name, type, image_url, image_alt, title, description, cta_text, script_code, link_url, target, placement';
const RULE_COLUMNS = 'priority, target_pages, max_impressions, max_clicks, impressions_count, clicks_count';

interface AdRow {
  type: string;
  script_code: string | null;
  priority: number | null;
  target_pages: unknown;
  max_impressions: number | null;
  max_clicks: number | null;
  impressions_count: number | null;
  clicks_count: number | null;
  [key: string]: unknown;
}

function matchesPage(ad: AdRow, pageUrl: string | null): boolean {
  // Sin target_pages se muestra en todas las páginas
  if (!pageUrl || !Array.isArray(ad.target_pages) || ad.target_pages.length === 0) return true;
  return ad.target_pages.some(
    (pattern) => typeof pattern === 'string' && (pattern === '*' || pageUrl.includes(pattern))
  );
}

function withinLimits(ad: AdRow): boolean {
  if (ad.max_impressions !== null && (ad.impressions_count ?? 0) >= ad.max_impressions) return false;
  if (ad.max_clicks !== null && (ad.clicks_count ?? 0) >= ad.max_clicks) return false;
  return true;
}

// Rotación ponderada: varios anunciantes comparten ubicación y cada uno sale
// en proporción a su prioridad (prioridad 10 sale el doble que prioridad 5).
function pickWeighted(ads: AdRow[]): AdRow {
  const weights = ads.map((ad) => Math.max(ad.priority ?? 0, 1));
  let roll = Math.random() * weights.reduce((sum, w) => sum + w, 0);
  for (let i = 0; i < ads.length; i++) {
    roll -= weights[i];
    if (roll < 0) return ads[i];
  }
  return ads[ads.length - 1];
}

// GET /api/nx/slot?slot=sidebar_top&path=/noticias/...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // slot/path son los nombres actuales; placement/page_url, los de la ruta antigua
  const placement = searchParams.get('slot') ?? searchParams.get('placement');
  const pageUrl = searchParams.get('path') ?? searchParams.get('page_url');

  if (!isAdPlacement(placement)) {
    return NextResponse.json({ error: 'placement no válido' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data, error } = await (supabase.from('ads') as any)
      .select(`${PUBLIC_COLUMNS}, ${RULE_COLUMNS}`)
      .eq('placement', placement)
      .eq('status', 'active')
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .limit(50);

    if (error) {
      console.error('[ads] Error fetching active ads:', error);
      return NextResponse.json({ error: 'Error al obtener anuncios' }, { status: 500 });
    }

    const eligible = ((data || []) as AdRow[]).filter((ad) => matchesPage(ad, pageUrl) && withinLimits(ad));
    if (eligible.length === 0) {
      return NextResponse.json({ ad: null, total_available: 0 });
    }

    const {
      priority, target_pages, max_impressions, max_clicks, impressions_count, clicks_count,
      script_code, ...rest
    } = pickWeighted(eligible);
    // El código de script solo viaja en los anuncios de tipo script
    const publicAd = rest.type === 'script'
      ? { ...rest, script_code }
      : { ...rest, image_url: toServedImageUrl(rest.id as string, rest.image_url) };

    return NextResponse.json(
      { ad: publicAd, total_available: eligible.length },
      // Cada visita debe poder rotar: nada de caché compartida
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (error) {
    console.error('[ads] Error in GET /api/nx/slot:', error);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
