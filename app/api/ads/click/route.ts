// ============================================
// API Público - Registrar Clic de Anuncio
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRequestMeta, isBotRequest, isValidAdId, readJson, sanitizePageUrl } from '@/lib/ads/tracking';

// Ventana en la que un segundo clic de la misma IP en el mismo anuncio no se
// cuenta (dobles clics, recargas y clics repetidos no facturables).
const CLICK_DEDUPE_MINUTES = 30;

// POST /api/ads/click
export async function POST(request: NextRequest) {
  const body = await readJson(request);
  if (!body || !isValidAdId(body.ad_id)) {
    return NextResponse.json({ error: 'ad_id no válido' }, { status: 400 });
  }

  if (isBotRequest(request)) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const supabase = createAdminClient();
    const meta = getRequestMeta(request);

    // Sin IP fiable no deduplicamos: preferimos contar a perder clics reales
    if (meta.ip_address) {
      const since = new Date(Date.now() - CLICK_DEDUPE_MINUTES * 60_000).toISOString();
      const { count } = await (supabase.from('ad_clicks') as any)
        .select('id', { count: 'exact', head: true })
        .eq('ad_id', body.ad_id)
        .eq('ip_address', meta.ip_address)
        .gte('created_at', since);

      if (count && count > 0) {
        return NextResponse.json({ success: true, duplicate: true }, { status: 200 });
      }
    }

    const { error } = await (supabase.from('ad_clicks') as any).insert([{
      ad_id: body.ad_id,
      page_url: sanitizePageUrl(body.page_url, meta.referrer),
      ...meta,
    }]);

    if (error) {
      console.error('[ads] Error creating click:', error);
      return NextResponse.json({ error: 'Error al registrar clic' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[ads] Error in POST /api/ads/click:', error);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
