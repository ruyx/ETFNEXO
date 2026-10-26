// ============================================
// API Público - Servir la imagen de una creatividad
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { isValidAdId } from '@/lib/ads/tracking';

const MAX_BYTES = 5 * 1024 * 1024;

// GET /api/nx/m/<ad_id>?v=<hash>
// Solo sirve la image_url guardada en el anuncio: no es un proxy abierto.
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!isValidAdId(params.id)) {
    return new NextResponse(null, { status: 404 });
  }

  try {
    const supabase = createAdminClient();
    const { data } = await (supabase.from('ads') as any)
      .select('image_url')
      .eq('id', params.id)
      .maybeSingle();

    const imageUrl: string | undefined = data?.image_url;
    if (!imageUrl || !imageUrl.startsWith('https://')) {
      return new NextResponse(null, { status: 404 });
    }

    const upstream = await fetch(imageUrl, { signal: AbortSignal.timeout(8000) });
    const contentType = upstream.headers.get('content-type') || '';
    const length = Number(upstream.headers.get('content-length') || 0);

    if (!upstream.ok || !contentType.startsWith('image/') || length > MAX_BYTES) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(upstream.body, {
      headers: {
        'Content-Type': contentType,
        // La URL lleva el hash de la imagen: se puede cachear sin miedo
        'Cache-Control': 'public, max-age=86400, s-maxage=2592000, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('[ads] Error serving creative image:', error);
    return new NextResponse(null, { status: 502 });
  }
}
