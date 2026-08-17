// @ts-nocheck
// ============================================
// API Público - Obtener Anuncios Activos
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/ads/active?placement=sidebar_top&page_url=/noticias/...
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const placement = searchParams.get('placement');
    const page_url = searchParams.get('page_url');

    if (!placement) {
      return NextResponse.json(
        { error: 'El parámetro placement es requerido' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Query para obtener anuncios activos
    let query = supabase
      .from('ads')
      .select('*')
      .eq('placement' as any, placement as any)
      .eq('status' as any, 'active' as any)
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('priority', { ascending: false })
      .limit(5); // Máximo 5 anuncios por placement

    const { data: ads, error } = await query;

    if (error) {
      console.error('Error fetching active ads:', error);
      return NextResponse.json(
        { error: 'Error al obtener anuncios', details: error.message },
        { status: 500 }
      );
    }

    if (!ads || ads.length === 0) {
      return NextResponse.json({ ads: [] });
    }

    // Filtrar por página si se especifica target_pages
    let filteredAds = ads;
    if (page_url) {
      filteredAds = ads.filter(ad => {
        // Si no tiene target_pages, se muestra en todas las páginas
        if (!ad.target_pages || !Array.isArray(ad.target_pages)) {
          return true;
        }

        // Verificar si la URL actual coincide con algún patrón
        return ad.target_pages.some((pattern) => {
          // Validar que el patrón sea un string
          if (typeof pattern !== 'string') return false;
          if (pattern === '*') return true;
          if (page_url.includes(pattern)) return true;
          return false;
        });
      });
    }

    // Verificar límites (max_impressions, max_clicks)
    filteredAds = filteredAds.filter(ad => {
      // Verificar max_impressions
      if (ad.max_impressions !== null && (ad.impressions_count ?? 0) >= ad.max_impressions) {
        return false;
      }

      // Verificar max_clicks
      if (ad.max_clicks !== null && (ad.clicks_count ?? 0) >= ad.max_clicks) {
        return false;
      }

      return true;
    });

    // Seleccionar un anuncio aleatorio de los disponibles (con peso por prioridad)
    if (filteredAds.length > 0) {
      // Ordenar por prioridad y tomar el primero (o aleatorio según preferencia)
      const selectedAd = filteredAds[0];

      // Limpiar campos sensibles antes de enviar al cliente
      const {
        target_pages,
        target_categories,
        max_impressions,
        max_clicks,
        impressions_count,
        clicks_count,
        ...publicAdData
      } = selectedAd;

      // Solo incluir script_code para ads de tipo script
      if (selectedAd.type !== 'script') {
        delete (publicAdData as any).script_code;
      }

      return NextResponse.json({
        ad: publicAdData,
        total_available: filteredAds.length
      });
    }

    return NextResponse.json({ ads: [], total_available: 0 });

  } catch (error: any) {
    console.error('Error in GET /api/ads/active:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}
