/**
 * API Admin - Gestión de Etiqueta Individual
 * GET, PATCH, DELETE para una etiqueta específica
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEditor, requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

// Función para generar slug único
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

// GET /api/admin/etiquetas/[id] - Obtener etiqueta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireEditor();

    const supabase = createAdminClient();

    const { data: tag, error } = await supabase
      .from('news_tags')
      .select('*')
      .eq('id' as any, params.id as any)
      .single();

    if (error || !tag) {
      return errorResponse('Etiqueta no encontrada', 'NOT_FOUND', 404);
    }

    // Obtener conteo de artículos
    const { count } = await supabase
      .from('news_articles_tags')
      .select('article_id', { count: 'exact', head: true })
      .eq('tag_id' as any, params.id as any);

    return successResponse({
      tag: {
        ...(tag as any),
        articles_count: count || 0
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/etiquetas/[id]:', error);
    return handleAuthError(error);
  }
}

// PATCH /api/admin/etiquetas/[id] - Actualizar etiqueta
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    // Campos que no se pueden actualizar directamente
    const { id, created_at, ...updateData } = body;

    // Si se actualiza el nombre y no se proporciona slug, regenerar
    if (updateData.name && !updateData.slug) {
      let slug = generateSlug(updateData.name);

      // Verificar unicidad del slug (excepto la etiqueta actual)
      const { data: existing } = await supabase
        .from('news_tags')
        .select('id')
        .eq('slug' as any, slug as any)
        .neq('id' as any, params.id as any)
        .single();

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      updateData.slug = slug;
    }

    const { data: tag, error } = await supabase
      .from('news_tags')
      .update(updateData as any)
      .eq('id' as any, params.id as any)
      .select()
      .single();

    if (error || !tag) {
      console.error('Error updating tag:', error);
      return errorResponse(
        'Error al actualizar etiqueta',
        'INTERNAL_ERROR',
        500,
        error?.message
      );
    }

    return successResponse(
      { tag },
      'Etiqueta actualizada exitosamente'
    );

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/etiquetas/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/etiquetas/[id] - Eliminar etiqueta (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Verificar si hay artículos usando esta etiqueta
    const { count } = await supabase
      .from('news_articles_tags')
      .select('article_id', { count: 'exact', head: true })
      .eq('tag_id' as any, params.id as any);

    if (count && count > 0) {
      return errorResponse(
        `No se puede eliminar la etiqueta porque tiene ${count} artículo(s) asociado(s)`,
        'BAD_REQUEST',
        409
      );
    }

    const { error } = await supabase
      .from('news_tags')
      .delete()
      .eq('id' as any, params.id as any);

    if (error) {
      console.error('Error deleting tag:', error);
      return errorResponse(
        'Error al eliminar etiqueta',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { deleted: true },
      'Etiqueta eliminada correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/etiquetas/[id]:', error);
    return handleAuthError(error);
  }
}
