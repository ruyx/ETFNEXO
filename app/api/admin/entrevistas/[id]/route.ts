import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { resolvePublication } from '@/lib/content/publication';
import { denyUnlessRole } from '@/lib/auth/check-admin';

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
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  try {
    const { id } = params;
    const supabase = createAdminClient();

    // @ts-ignore - Supabase type instantiation depth limit with interviews_with_metadata view
    const { data, error } = await supabase
      .from('interviews_with_metadata')
      .select('*')
      .eq('id' as any, id as any)
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
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const publication = resolvePublication({ status: body.status ?? 'draft', scheduled_at: body.scheduled_at });
    if (!publication.ok) {
      return NextResponse.json({ error: publication.error }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('interviews')
      .insert([{
        title: body.title,
        slug: body.slug,
        description: body.description,
        content: body.content,
        featured_image_url: body.featured_image_url,
        featured_image_alt: body.featured_image_alt,
        youtube_video_id: body.youtube_video_id,
        category_id: body.category_id,
        status: publication.status,
        published_at: publication.published_at,
        faq: body.faq || [],
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        author_id: body.author_id || null,
        mostrar_en_noticias: body.mostrar_en_noticias || false
      } as any])
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
  const denied = await denyUnlessRole(['admin', 'redactor']);
  if (denied) return denied;

  try {
    const { id } = params;
    const body = await request.json();
    const supabase = createAdminClient();

    const updateData: any = {
      title: body.title,
      slug: body.slug,
      description: body.description,
      content: body.content,
      featured_image_url: body.featured_image_url,
      featured_image_alt: body.featured_image_alt,
      youtube_video_id: body.youtube_video_id,
      category_id: body.category_id,
      faq: body.faq || [],
      meta_title: body.meta_title,
      meta_description: body.meta_description,
      author_id: body.author_id || null,
      mostrar_en_noticias: body.mostrar_en_noticias || false,
      updated_at: new Date().toISOString()
    };

    // Estado y fecha de publicación: conserva la fecha original al editar
    // algo ya publicado y valida la fecha si se programa
    if (body.status !== undefined) {
      const { data: current } = await supabase
        .from('interviews')
        .select('status, published_at')
        .eq('id' as any, id as any)
        .single();

      const publication = resolvePublication({ status: body.status, scheduled_at: body.scheduled_at }, current as any);
      if (!publication.ok) {
        return NextResponse.json({ error: publication.error }, { status: 400 });
      }
      updateData.status = publication.status;
      updateData.published_at = publication.published_at;
    }

    const { data, error } = await supabase
      .from('interviews')
      .update(updateData)
      .eq('id' as any, id as any)
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
  const denied = await denyUnlessRole(['admin']);
  if (denied) return denied;

  try {
    const { id } = params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id' as any, id as any);

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
