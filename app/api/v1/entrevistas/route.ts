import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');

    const supabase = await createClient();

    // Build base query
    let query = supabase
      .from('interviews_with_metadata')
      .select('*', { count: 'exact' })
      .eq('status' as any, 'published' as any)
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Optional filters
    if (categorySlug) {
      query = query.eq('category_slug' as any, categorySlug as any);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching interviews:', error);
      return NextResponse.json(
        { error: 'Error al obtener entrevistas' },
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
