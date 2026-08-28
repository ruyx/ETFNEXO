import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch single interview by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('interviews_with_metadata')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Entrevista no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error fetching interview:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}

// POST - Create new interview
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('interviews')
      .insert([{
        title: body.title,
        slug: body.slug,
        description: body.description,
        youtube_video_id: body.youtube_video_id,
        category_id: body.category_id,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date().toISOString() : null,
        faq: body.faq || [],
        meta_title: body.meta_title,
        meta_description: body.meta_description
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating interview:', error);
      return NextResponse.json(
        { error: 'Error al crear entrevista' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}

// PUT - Update interview
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updateData: any = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      youtube_video_id: body.youtube_video_id,
      category_id: body.category_id,
      status: body.status,
      faq: body.faq || [],
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      updated_at: new Date().toISOString()
    };

    // Set published_at if publishing for the first time
    if (body.status === 'published') {
      const { data: existing } = await supabase
        .from('interviews')
        .select('published_at')
        .eq('id', id)
        .single();

      if (!existing?.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await supabase
      .from('interviews')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating interview:', error);
      return NextResponse.json(
        { error: 'Error al actualizar entrevista' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}

// DELETE - Delete interview
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting interview:', error);
      return NextResponse.json(
        { error: 'Error al eliminar entrevista' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting interview:', error);
    return NextResponse.json(
      { error: 'Error inesperado' },
      { status: 500 }
    );
  }
}
