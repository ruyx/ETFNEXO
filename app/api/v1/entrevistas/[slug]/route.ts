import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params;
    const supabase = await createClient();

    // Get interview details
    // @ts-expect-error - Supabase type instantiation depth limit
    const { data: interview, error } = await supabase
      .from('interviews_with_metadata' as any)
      .select('*')
      .eq('slug' as any, slug as any)
      .eq('status' as any, 'published' as any)
      .single();

    if (error || !interview) {
      return NextResponse.json(
        { error: 'Entrevista no encontrada' },
        { status: 404 }
      );
    }

    // Increment views count
    const { error: updateError } = await supabase
      .from('interviews' as any)
      .update({ views_count: ((interview as any).views_count || 0) + 1 })
      .eq('id' as any, (interview as any).id as any);

    if (updateError) {
      console.error('Error updating views count:', updateError);
    }

    return NextResponse.json({
      data: interview
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}
