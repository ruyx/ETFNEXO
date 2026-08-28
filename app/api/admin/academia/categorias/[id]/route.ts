/**
 * API Admin - Gestión de Categoría Individual de Academia
 * PUT, DELETE para una categoría específica
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

// PUT /api/admin/academia/categorias/[id] - Actualizar categoría
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return errorResponse('El nombre es requerido', 'BAD_REQUEST', 400);
    }

    // Si se actualiza el nombre y no se proporciona slug, regenerar
    let slug = body.slug;
    if (!slug) {
      slug = generateSlug(body.name);

      // Verificar unicidad del slug (excepto la categoría actual)
      const { data: existing } = await supabase
        .from('academy_categories')
        .select('id')
        .eq('slug' as any, slug as any)
        .neq('id' as any, params.id as any)
        .single();

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const updateData = {
      name: body.name.trim(),
      slug,
      description: body.description ?? null,
      color_hex: body.color_hex || '#3B82F6',
      icon_name: body.icon_name ?? null,
      display_order: body.display_order ?? undefined
    };

    const { data: category, error } = await supabase
      .from('academy_categories')
      .update(updateData as any)
      .eq('id' as any, params.id as any)
      .select()
      .single();

    if (error || !category) {
      console.error('Error updating academy category:', error);
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
    console.error('Error in PUT /api/admin/academia/categorias/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/academia/categorias/[id] - Eliminar categoría (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Verificar si hay artículos usando esta categoría
    const { count } = await supabase
      .from('academy_articles')
      .select('id', { count: 'exact', head: true })
      .eq('category_id' as any, params.id as any);

    if (count && count > 0) {
      return errorResponse(
        `No se puede eliminar la categoría porque tiene ${count} artículo(s) asociado(s)`,
        'BAD_REQUEST',
        409
      );
    }

    const { error } = await supabase
      .from('academy_categories')
      .delete()
      .eq('id' as any, params.id as any);

    if (error) {
      console.error('Error deleting academy category:', error);
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
    console.error('Error in DELETE /api/admin/academia/categorias/[id]:', error);
    return handleAuthError(error);
  }
}
