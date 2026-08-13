// ============================================
// API Admin - Gestión de Anuncio individual
// ============================================
// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

// GET /api/admin/ads/[id] - Obtener un anuncio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol de admin
    await requireAdmin();

    const supabase = createAdminClient();

    const { data: ad, error } = await supabase
      .from('ads')
      .select(`
        *,
        advertiser:advertisers(id, name, email, website, status)
      `)
      // @ts-expect-error - Supabase generated types issue with select join
      .eq('id', params.id)
      .single();

    if (error || !ad) {
      return errorResponse('Anuncio no encontrado', 'NOT_FOUND', 404);
    }

    return successResponse({ ad });

  } catch (error: any) {
    console.error('Error in GET /api/admin/ads/[id]:', error);
    return handleAuthError(error);
  }
}

// PATCH /api/admin/ads/[id] - Actualizar un anuncio
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol de admin
    await requireAdmin();

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
      return errorResponse(
        'Error al actualizar anuncio',
        'INTERNAL_ERROR',
        500,
        error?.message
      );
    }

    return successResponse({ ad }, 'Anuncio actualizado exitosamente');

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/ads/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/ads/[id] - Eliminar un anuncio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol de admin
    await requireAdmin();

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('ads')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting ad:', error);
      return errorResponse(
        'Error al eliminar anuncio',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { deleted: true },
      'Anuncio eliminado correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/ads/[id]:', error);
    return handleAuthError(error);
  }
}
