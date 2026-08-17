// ============================================
// ETF Nexo - News API Endpoint
// ============================================
// Descripción: API pública para obtener noticias paginadas
// URL: GET /api/news?page=1&limit=12
// ============================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Validaciones
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Calcular offset
    const offset = (page - 1) * limit;

    // Obtener noticias publicadas
    const { data: articles, error }: any = await (supabase as any)
      .from('news_articles')
      .select(`
        id,
        title,
        slug,
        content,
        featured_image_url,
        published_at,
        author_name,
        source_name,
        source_url
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching news:', error);
      return NextResponse.json(
        { error: 'Failed to fetch news' },
        { status: 500 }
      );
    }

    // Obtener total para calcular si hay más páginas
    const { count } = await (supabase as any)
      .from('news_articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    const hasMore = offset + limit < (count || 0);
    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore
      }
    });

  } catch (error: any) {
    console.error('Fatal error in news API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
