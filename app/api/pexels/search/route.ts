import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

  console.log('[Pexels API] Request received');
  console.log('[Pexels API] API Key present:', !!PEXELS_API_KEY);

  if (!PEXELS_API_KEY) {
    console.error('[Pexels API] PEXELS_API_KEY not configured');
    return NextResponse.json(
      { error: 'PEXELS_API_KEY environment variable is not set' },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const perPage = searchParams.get('per_page') || '12';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    console.log('[Pexels API] Searching for:', query);

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    console.log('[Pexels API] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Pexels API] Error response:', errorText);
      throw new Error(`Pexels API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log('[Pexels API] Found photos:', data.photos?.length || 0);

    // Transform to simpler format
    const photos = data.photos.map((photo: any) => ({
      id: photo.id,
      url: photo.src.large2x,
      thumbnail: photo.src.medium,
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      alt: photo.alt || query,
    }));

    console.log('[Pexels API] Returning:', photos.length, 'photos');
    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
