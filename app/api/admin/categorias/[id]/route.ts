/**
 * API Admin - Gestión de Categoría Individual
 * GET, PATCH, DELETE para una categoría específica
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

// GET /api/admin/categorias/[id] - Obtener categoría específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireEditor();

    const supabase = createAdminClient();

    const { data: category, error } = await supabase
      .from('news_categories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !category) {
      return errorResponse('Categoría no encontrada', 'NOT_FOUND', 404);
    }

    // Obtener conteo de artículos
    const { count } = await supabase
      .from('news_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', params.id);

    return successResponse({
      category: {
        ...category,
        articles_count: count || 0
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/categorias/[id]:', error);
    return handleAuthError(error);
  }
}

// PATCH /api/admin/categorias/[id] - Actualizar categoría
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

      // Verificar unicidad del slug (excepto la categoría actual)
      const { data: existing } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', params.id)
        .single();

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      updateData.slug = slug;
    }

    const { data: category, error } = await supabase
      .from('news_categories')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error || !category) {
      console.error('Error updating category:', error);
      return errorResponse(
        'Error al actualizar categoría',
        'INTERNAL_ERROR',
        500,
        error?.message
      );
    }

    return successResponse(
      { category },
      'Categoría actualizada exitosamente'
    );

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/categorias/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/categorias/[id] - Eliminar categoría (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Verificar si hay artículos usando esta categoría
    const { count } = await supabase
      .from('news_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', params.id);

    if (count && count > 0) {
      return errorResponse(
        `No se puede eliminar la categoría porque tiene ${count} artículo(s) asociado(s)`,
        'CONFLICT',
        409
      );
    }

    const { error } = await supabase
      .from('news_categories')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting category:', error);
      return errorResponse(
        'Error al eliminar categoría',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { deleted: true },
      'Categoría eliminada correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/categorias/[id]:', error);
    return handleAuthError(error);
  }
}
