// @ts-nocheck
/**
 * API Route: /api/admin/analytics
 * Obtener datos de analíticas y reportes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/check-admin';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    // Filtros de fecha (opcional)
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // 1. Stats globales
    const { data: ads } = await supabase
      .from('ads')
      .select('id, impressions_count, clicks_count, status');

    const totalImpressions = ads?.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0) || 0;
    const totalClicks = ads?.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0) || 0;
    const totalCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const activeAds = ads?.filter(ad => ad.status === 'active').length || 0;

    const globalStats = {
      totalImpressions,
      totalClicks,
      totalCTR: parseFloat(totalCTR.toFixed(2)),
      activeAds,
      totalAds: ads?.length || 0
    };

    // 2. Datos por fecha (últimos 30 días)
    let impressionsQuery = supabase
      .from('ad_impressions')
      .select('created_at, ad_id');

    let clicksQuery = supabase
      .from('ad_clicks')
      .select('created_at, ad_id');

    if (startDate) {
      impressionsQuery = impressionsQuery.gte('created_at', startDate);
      clicksQuery = clicksQuery.gte('created_at', startDate);
    }

    if (endDate) {
      impressionsQuery = impressionsQuery.lte('created_at', endDate);
      clicksQuery = clicksQuery.lte('created_at', endDate);
    }

    const { data: impressions } = await impressionsQuery;
    const { data: clicks } = await clicksQuery;

    // Agrupar por fecha
    const dateMap = new Map<string, { impressions: number; clicks: number }>();

    impressions?.forEach(imp => {
      const date = new Date(imp.created_at).toISOString().split('T')[0];
      const current = dateMap.get(date) || { impressions: 0, clicks: 0 };
      dateMap.set(date, { ...current, impressions: current.impressions + 1 });
    });

    clicks?.forEach(click => {
      const date = new Date(click.created_at).toISOString().split('T')[0];
      const current = dateMap.get(date) || { impressions: 0, clicks: 0 };
      dateMap.set(date, { ...current, clicks: current.clicks + 1 });
    });

    const chartData = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.impressions > 0 ? parseFloat(((data.clicks / data.impressions) * 100).toFixed(2)) : 0
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 3. Top anuncios por CTR
    const { data: topAds } = await supabase
      .from('ads')
      .select('id, name, impressions_count, clicks_count, placement, type')
      .gt('impressions_count', 0)
      .order('impressions_count', { ascending: false })
      .limit(10);

    const topAdsWithCTR = topAds?.map(ad => ({
      ...ad,
      ctr: ad.impressions_count > 0
        ? parseFloat(((ad.clicks_count / ad.impressions_count) * 100).toFixed(2))
        : 0
    })).sort((a, b) => b.ctr - a.ctr) || [];

    // 4. Datos por ubicación (placement)
    const { data: adsByPlacement } = await supabase
      .from('ads')
      .select('placement, impressions_count, clicks_count, id');

    const placementMap = new Map<string, { impressions: number; clicks: number; ads: number }>();

    adsByPlacement?.forEach(ad => {
      const placement = ad.placement || 'Sin ubicación';
      const current = placementMap.get(placement) || { impressions: 0, clicks: 0, ads: 0 };
      placementMap.set(placement, {
        impressions: current.impressions + (ad.impressions_count || 0),
        clicks: current.clicks + (ad.clicks_count || 0),
        ads: current.ads + 1
      });
    });

    const placementStats = Array.from(placementMap.entries())
      .map(([placement, data]) => ({
        placement,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.impressions > 0 ? parseFloat(((data.clicks / data.impressions) * 100).toFixed(2)) : 0,
        ads: data.ads
      }))
      .sort((a, b) => b.impressions - a.impressions);

    // 5. Datos por tipo de anuncio
    const { data: adsByType } = await supabase
      .from('ads')
      .select('type, impressions_count, clicks_count, id');

    const typeMap = new Map<string, { impressions: number; clicks: number; ads: number }>();

    adsByType?.forEach(ad => {
      const type = ad.type || 'unknown';
      const current = typeMap.get(type) || { impressions: 0, clicks: 0, ads: 0 };
      typeMap.set(type, {
        impressions: current.impressions + (ad.impressions_count || 0),
        clicks: current.clicks + (ad.clicks_count || 0),
        ads: current.ads + 1
      });
    });

    const typeStats = Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        impressions: data.impressions,
        clicks: data.clicks,
        ctr: data.impressions > 0 ? parseFloat(((data.clicks / data.impressions) * 100).toFixed(2)) : 0,
        ads: data.ads
      }))
      .sort((a, b) => b.impressions - a.impressions);

    return NextResponse.json({
      globalStats,
      chartData,
      topAds: topAdsWithCTR,
      placementStats,
      typeStats
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
