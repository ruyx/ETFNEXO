import { NextRequest, NextResponse } from 'next/server';

const PEXELS_API_KEY = 'EIpu4dabXBeQewM3xuerGnk5g8xdqUKKJbboHynjTs71a1xKUxOPi54N';

export async function GET(request: NextRequest) {
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
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to simpler format
    const photos = data.photos.map((photo: any) => ({
      id: photo.id,
      url: photo.src.large2x,
      thumbnail: photo.src.medium,
      photographer: photo.photographer,
      photographer_url: photo.photographer_url,
      alt: photo.alt || query,
    }));

    return NextResponse.json({ photos });
  } catch (error: any) {
    console.error('Pexels API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
