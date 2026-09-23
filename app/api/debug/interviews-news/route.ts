// @ts-nocheck
/**
 * DEBUG: Verificar entrevistas con mostrar_en_noticias
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verificar todas las entrevistas
    const { data: allInterviews, error: allError } = await (supabase as any)
      .from('interviews_with_metadata')
      .select('id, title, slug, mostrar_en_noticias, status, published_at')
      .eq('status', 'published');

    if (allError) {
      console.error('Error fetching all interviews:', allError);
    }

    // Verificar entrevistas con mostrar_en_noticias = true
    const { data: newsInterviews, error: newsError } = await (supabase as any)
      .from('interviews_with_metadata')
      .select('*')
      .eq('status', 'published')
      .eq('mostrar_en_noticias', true);

    if (newsError) {
      console.error('Error fetching news interviews:', newsError);
    }

    return NextResponse.json({
      success: true,
      data: {
        total_interviews: allInterviews?.length || 0,
        interviews_with_news_flag: newsInterviews?.length || 0,
        all_interviews: allInterviews,
        news_interviews: newsInterviews,
        errors: {
          allError: allError?.message || null,
          newsError: newsError?.message || null
        }
      }
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
