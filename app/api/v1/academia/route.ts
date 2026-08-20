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
    const difficulty = searchParams.get('difficulty'); // beginner, intermediate, advanced
    const search = searchParams.get('search');

    const supabase = await createClient();

    // Construir query base
    let query = supabase
      .from('academy_articles_with_metadata')
      .select('*', { count: 'exact' })
      .eq('status' as any, 'published' as any)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtros opcionales
    if (categorySlug) {
      query = query.eq('category_slug' as any, categorySlug as any);
    }

    if (difficulty) {
      query = query.eq('difficulty_level' as any, difficulty as any);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    // Si se piden featured, tomar solo los primeros 4
    if (featured) {
      query = query.limit(4);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching academy articles:', error);
      return NextResponse.json(
        { error: 'Error al obtener artículos de Academia' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      count: count || 0,
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
