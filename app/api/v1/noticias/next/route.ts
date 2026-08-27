// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const currentId = searchParams.get('currentId');

  if (!currentId) {
    console.error('[Noticias Next API] Missing currentId parameter');
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();

    console.log('[Noticias Next API] Fetching next article after:', currentId);

    // First, get ALL published articles ordered by published_at descending (newest first)
    const { data: allArticles, error: allError } = await supabase
      .from('news_articles_with_metadata')
      .select('id, published_at')
      .eq('status' as any, 'published' as any)
      .order('published_at' as any, { ascending: false });

    if (allError || !allArticles || allArticles.length === 0) {
      console.log('[Noticias Next API] No published articles found:', allError?.message);
      return NextResponse.json(null, { status: 404 });
    }

    // Find the index of the current article
    const currentIndex = allArticles.findIndex((article: any) => article.id === currentId);

    if (currentIndex === -1) {
      console.log('[Noticias Next API] Current article not found in list');
      return NextResponse.json(null, { status: 404 });
    }

    // Check if there's a next article (index + 1)
    if (currentIndex + 1 >= allArticles.length) {
      console.log('[Noticias Next API] No more articles available - reached end of list');
      return NextResponse.json(null, { status: 404 });
    }

    // Get the next article ID
    const nextArticleId = allArticles[currentIndex + 1].id;

    // Fetch the full next article data
    const { data: nextArticle, error: nextError } = await supabase
      .from('news_articles_with_metadata')
      .select('*')
      .eq('id' as any, nextArticleId as any)
      .single();

    if (nextError || !nextArticle) {
      console.log('[Noticias Next API] Error fetching next article:', nextError?.message);
      return NextResponse.json(null, { status: 404 });
    }

    console.log('[Noticias Next API] Found next article:', nextArticle.id, nextArticle.title);
    return NextResponse.json(nextArticle);
  } catch (error) {
    console.error('[Noticias Next API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
