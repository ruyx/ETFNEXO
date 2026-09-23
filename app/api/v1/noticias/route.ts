import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering to prevent caching stale image URLs
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const featured = searchParams.get('featured') === 'true';
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');

    const supabase = await createClient();

    // 1. Obtener noticias normales
    let newsQuery = supabase
      .from('news_articles_with_metadata')
      .select('*')
      .eq('status' as any, 'published' as any);

    if (categorySlug) {
      newsQuery = newsQuery.eq('category_slug' as any, categorySlug as any);
    }

    if (search) {
      newsQuery = newsQuery.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data: newsArticles, error: newsError } = await newsQuery;

    if (newsError) {
      console.error('Error fetching news articles:', newsError);
      return NextResponse.json(
        { error: 'Error al obtener noticias' },
        { status: 500 }
      );
    }

    // 2. Obtener entrevistas marcadas para mostrar en noticias
    let interviewsQuery = (supabase as any)
      .from('interviews_with_metadata')
      .select('*')
      .eq('status', 'published')
      .eq('mostrar_en_noticias', true);

    // Aplicar filtro de categoría si existe
    if (categorySlug) {
      interviewsQuery = interviewsQuery.eq('category_slug' as any, categorySlug as any);
    }

    if (search) {
      interviewsQuery = interviewsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: interviews, error: interviewsError } = await interviewsQuery;

    if (interviewsError) {
      console.error('Error fetching interviews:', interviewsError);
      // No fallar si hay error en entrevistas, solo mostrar noticias
    }

    // 3. Combinar y ordenar por fecha de publicación
    const allArticles = [
      ...(newsArticles || []).map((article: any) => ({ ...article, source_type: 'news' })),
      ...(interviews || []).map((interview: any) => ({
        ...interview,
        source_type: 'interview',
        // Mapear campos de entrevista a formato de noticia
        excerpt: interview.description
      }))
    ].sort((a: any, b: any) => {
      // Primero por pinned
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      // Luego por pinned_at si ambos están pinned
      if (a.pinned && b.pinned) {
        const aDate = a.pinned_at ? new Date(a.pinned_at).getTime() : 0;
        const bDate = b.pinned_at ? new Date(b.pinned_at).getTime() : 0;
        return bDate - aDate;
      }

      // Finalmente por published_at
      const aPublished = a.published_at ? new Date(a.published_at).getTime() : 0;
      const bPublished = b.published_at ? new Date(b.published_at).getTime() : 0;
      return bPublished - aPublished;
    });

    // 4. Paginar resultados
    const totalCount = allArticles.length;
    const paginatedArticles = featured
      ? allArticles.slice(0, 4)
      : allArticles.slice(offset, offset + limit);

    return NextResponse.json({
      data: paginatedArticles,
      count: totalCount,
      limit,
      offset
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}
