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
          // IndexNow (Bing, Yandex, Seznam) - Protocolo moderno
          const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              host: 'etfnexo.com',
              key: secretKey.substring(0, 32), // Usar parte del secret como key
              keyLocation: `https://etfnexo.com/${secretKey.substring(0, 32)}.txt`,
              urlList: [sitemapUrl],
            }),
          });

          // Google Search Console API requiere OAuth - usar GSC manual
          // Los sitemaps se crawlean automáticamente según changefreq

          return {
            sitemap: sitemapUrl,
            indexnow: indexNowResponse.ok ? 'OK' : 'QUEUED',
            note: 'Google crawleará automáticamente según changefreq del sitemap',
          };
        } catch (error: any) {
          return {
            sitemap: sitemapUrl,
            indexnow: 'ERROR',
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
