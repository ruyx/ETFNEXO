// ============================================
// API Público - Registrar Impresión de Anuncio
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getRequestMeta, isBotRequest, isValidAdId, readJson, sanitizePageUrl } from '@/lib/ads/tracking';

// POST /api/nx/view
export async function POST(request: NextRequest) {
  const body = await readJson(request);
  if (!body || !isValidAdId(body.ad_id)) {
    return NextResponse.json({ error: 'ad_id no válido' }, { status: 400 });
  }

  // Los bots no cuentan, pero no les damos pistas: respuesta vacía
  if (isBotRequest(request)) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const supabase = createAdminClient();
    const meta = getRequestMeta(request);
    const ratio = typeof body.viewability_ratio === 'number'
      ? Math.min(Math.max(body.viewability_ratio, 0), 1)
      : 0;

    const row = {
      ad_id: body.ad_id,
      page_url: sanitizePageUrl(body.page_url, meta.referrer),
      ...meta,
    };

    let { error } = await (supabase.from('ad_impressions') as any).insert([{
      ...row,
      viewable: body.viewable === true,
      viewability_ratio: ratio,
    }]);

    // Si la BD aún no tiene las columnas de viewability (migración pendiente),
    // registramos igualmente la impresión en lugar de perderla.
    if (error && /viewab/i.test(error.message)) {
      console.warn('[ads] ad_impressions sin columnas de viewability; aplicar migración 20261026');
      ({ error } = await (supabase.from('ad_impressions') as any).insert([row]));
    }

    if (error) {
      console.error('[ads] Error creating impression:', error);
      return NextResponse.json({ error: 'Error al registrar impresión' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[ads] Error in POST /api/nx/view:', error);
    return NextResponse.json({ error: 'Error inesperado' }, { status: 500 });
  }
}
