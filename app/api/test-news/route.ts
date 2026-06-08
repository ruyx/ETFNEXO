import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data, error, count } = await supabase
      .from('news_articles_with_metadata')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: count,
      articles: data?.length || 0,
      data: data?.map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        published_at: article.published_at
      }))
    });
  } catch (error) {
    console.error('Error in test-news route:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
