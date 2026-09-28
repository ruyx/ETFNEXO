import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * API endpoint para notificar a Google que el sitemap ha sido actualizado
 * Se puede llamar desde Supabase triggers o manualmente después de publicar contenido
 */
export async function POST(request: NextRequest) {
  try {
    const { secretKey } = await request.json();

    // Validar secret key (prevenir abuse)
    if (secretKey !== process.env.SITEMAP_PING_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sitemaps = [
      'https://etfnexo.com/sitemap.xml',
      'https://etfnexo.com/noticias/sitemap.xml',
      'https://etfnexo.com/academia/sitemap.xml',
      'https://etfnexo.com/entrevistas/sitemap.xml',
    ];

    const results = await Promise.all(
      sitemaps.map(async (sitemapUrl) => {
        try {
          // Ping a Google
          const googlePingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
          const googleResponse = await fetch(googlePingUrl);

          // Ping a Bing (opcional pero recomendado)
          const bingPingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;
          const bingResponse = await fetch(bingPingUrl);

          return {
            sitemap: sitemapUrl,
            google: googleResponse.ok ? 'OK' : 'FAILED',
            bing: bingResponse.ok ? 'OK' : 'FAILED',
          };
        } catch (error: any) {
          return {
            sitemap: sitemapUrl,
            google: 'ERROR',
            bing: 'ERROR',
            error: error.message,
          };
        }
      })
    );

    console.log('[Sitemap Ping] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Sitemaps pinged successfully',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Sitemap Ping] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ping sitemaps' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para ping manual (usar con cuidado)
 */
export async function GET(request: NextRequest) {
  const secretKey = request.nextUrl.searchParams.get('secret');

  if (secretKey !== process.env.SITEMAP_PING_SECRET) {
    return NextResponse.json(
      { error: 'Unauthorized - Invalid secret key' },
      { status: 401 }
    );
  }

  // Re-usar lógica POST
  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ secretKey }),
    })
  );
}
