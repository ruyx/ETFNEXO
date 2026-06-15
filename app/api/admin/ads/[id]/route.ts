// ============================================
// API Admin - Gestión de Anuncio individual
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/ads/[id] - Obtener un anuncio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();

    const { data: ad, error } = await supabase
      .from('ads')
      .select(`
        *,
        advertiser:advertisers(id, name, email, website, status)
      `)
      .eq('id', params.id)
      .single();

    if (error || !ad) {
      return NextResponse.json(
        { error: 'Anuncio no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ad });

  } catch (error: any) {
    console.error('Error in GET /api/admin/ads/[id]:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/ads/[id] - Actualizar un anuncio
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // No permitir actualizar ciertos campos directamente
    const { id, created_at, impressions_count, clicks_count, ...updateData } = body;

    // Validar tipo si se está actualizando
    if (updateData.type) {
      const validTypes = ['image_banner', 'text_banner', 'script'];
      if (!validTypes.includes(updateData.type)) {
        return NextResponse.json(
          { error: `Tipo de anuncio inválido. Debe ser: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Validar placement si se está actualizando
    if (updateData.placement) {
      const validPlacements = [
        'sidebar_top', 'sidebar_bottom',
        'article_top', 'article_mid', 'article_bottom',
        'feed_inline', 'header', 'footer'
      ];
      if (!validPlacements.includes(updateData.placement)) {
        return NextResponse.json(
          { error: `Placement inválido. Debe ser: ${validPlacements.join(', ')}` },
          { status: 400 }
        );
      }
    }

    const { data: ad, error } = await supabase
      .from('ads')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error || !ad) {
      console.error('Error updating ad:', error);
      return NextResponse.json(
        { error: 'Error al actualizar anuncio', details: error?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ad });

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/ads/[id]:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/ads/[id] - Eliminar un anuncio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting ad:', error);
      return NextResponse.json(
        { error: 'Error al eliminar anuncio', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Anuncio eliminado correctamente' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/ads/[id]:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}
