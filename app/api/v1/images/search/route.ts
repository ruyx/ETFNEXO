import { NextRequest, NextResponse } from 'next/server';
import { searchPhotos, getCuratedPhotos, getRelevantPhotoForCategory } from '@/lib/pexels';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const curated = searchParams.get('curated') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '15'), 80); // Max 80 según API de Pexels

    // Opción 1: Búsqueda por query
    if (query) {
      const result = await searchPhotos(query, page, perPage);
      return NextResponse.json(result);
    }

    // Opción 2: Imagen relevante para categoría
    if (category) {
      const photo = await getRelevantPhotoForCategory(category);
      if (!photo) {
        return NextResponse.json(
          { error: 'No se encontraron imágenes para esta categoría' },
          { status: 404 }
        );
      }
      return NextResponse.json({ photo });
    }

    // Opción 3: Fotos curadas
    if (curated) {
      const result = await getCuratedPhotos(page, perPage);
      return NextResponse.json(result);
    }

    // Default: fotos curadas
    const result = await getCuratedPhotos(page, perPage);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Error al buscar imágenes', details: error.message },
      { status: 500 }
    );
  }
}
