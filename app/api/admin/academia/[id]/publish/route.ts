/**
 * API Admin - Publicar/Despublicar Artículo de Academia
 * Endpoint simple para cambiar el estado de publicación
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEditor, handleAuthError } from '@/lib/auth/check-admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

// POST /api/admin/academia/[id]/publish
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos de editor
    await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    const publish = body.publish !== false; // Por defecto publicar

    // Obtener artículo actual
    const { data: article } = await supabase
      .from('academy_articles')
      .select('id, title, status')
      .eq('id' as any, params.id as any)
      .single();

    if (!article) {
      return errorResponse('Artículo no encontrado', 'NOT_FOUND', 404);
    }

    // Determinar nuevo estado
    const newStatus = publish ? 'published' : 'draft';
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Si se está publicando, agregar fecha de publicación
    if (publish) {
      updateData.published_at = new Date().toISOString();
    } else {
      // Si se despublica, limpiar fecha de publicación
      updateData.published_at = null;
    }

    const { data: updated, error } = await supabase
      .from('academy_articles')
      .update(updateData as any)
      .eq('id' as any, params.id as any)
      .select()
      .single();

    if (error) {
      console.error('Error updating academy article status:', error);
      return errorResponse(
        'Error al cambiar estado del artículo de Academia',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { article: updated },
      publish
        ? 'Artículo de Academia publicado exitosamente'
        : 'Artículo de Academia despublicado exitosamente'
    );

  } catch (error: any) {
    console.error('Error in POST /api/admin/academia/[id]/publish:', error);
    return handleAuthError(error);
  }
}
