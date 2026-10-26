/**
 * API Admin - Gestión de Artículo Individual de Academia
 * GET, PATCH, DELETE para un artículo específico
 */

import { NextRequest } from 'next/server';
import { resolvePublication } from '@/lib/content/publication';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEditor, requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

// Función para generar slug único
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 100);
}

// GET /api/admin/academia/[id] - Obtener artículo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos de editor
    await requireEditor();

    const supabase = createAdminClient();

    const { data: article, error } = await supabase
      .from('academy_articles')
      .select(`
        *,
        category:academy_categories(id, name, slug, color_hex),
        author:ai_agents(id, name, display_name, avatar_url)
      `)
      .eq('id' as any, params.id as any)
      .single();

    if (error || !article) {
      return errorResponse('Artículo no encontrado', 'NOT_FOUND', 404);
    }

    // Obtener tags del artículo
    const { data: articleTags } = await supabase
      .from('academy_article_tags')
      .select(`
        tag:academy_tags(id, name, slug)
      `)
      .eq('article_id' as any, params.id as any);

    const tags = articleTags?.map(at => (at as any).tag) || [];

    // Obtener ETFs relacionados
    const { data: articleEtfs } = await supabase
      .from('academy_related_etfs')
      .select('etf_id')
      .eq('article_id' as any, params.id as any);

    const relatedEtfs = articleEtfs?.map(ae => (ae as any).etf_id) || [];

    return successResponse({
      article: {
        ...(article as any),
        tags,
        relatedEtfs
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/academia/[id]:', error);
    return handleAuthError(error);
  }
}

// PATCH /api/admin/academia/[id] - Actualizar artículo
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos de editor
    await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    // Campos que no se pueden actualizar directamente
    const {
      id,
      created_at,
      views_count,
      shares_count,
      tags,
      relatedEtfs,
      scheduled_at,
      published_at: _publishedAt, // se calcula abajo, no se acepta del cliente
      ...updateData
    } = body;

    // Si se actualiza el título y no se proporciona slug, regenerar
    if (updateData.title && !updateData.slug) {
      let slug = generateSlug(updateData.title);

      // Verificar unicidad del slug (excepto el artículo actual)
      const { data: existing } = await supabase
        .from('academy_articles')
        .select('id')
        .eq('slug' as any, slug as any)
        .neq('id' as any, params.id as any)
        .single();

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      updateData.slug = slug;
    }

    // Estado y fecha de publicación: conserva la fecha original al editar
    // algo ya publicado y valida la fecha si se programa
    if (updateData.status !== undefined) {
      const { data: current } = await supabase
        .from('academy_articles')
        .select('status, published_at')
        .eq('id' as any, params.id as any)
        .single();

      const publication = resolvePublication({ status: updateData.status, scheduled_at }, current as any);
      if (!publication.ok) {
        return errorResponse(publication.error, 'VALIDATION_ERROR', 400);
      }
      updateData.status = publication.status;
      updateData.published_at = publication.published_at;
    }

    // Actualizar updated_at
    updateData.updated_at = new Date().toISOString();

    const { data: article, error } = await supabase
      .from('academy_articles')
      .update(updateData as any)
      .eq('id' as any, params.id as any)
      .select()
      .single();

    if (error || !article) {
      console.error('Error updating academy article:', error);
      return errorResponse(
        'Error al actualizar artículo de Academia',
        'INTERNAL_ERROR',
        500,
        error?.message
      );
    }

    // Actualizar tags si se proporcionan
    if (tags !== undefined && Array.isArray(tags)) {
      // Eliminar tags existentes
      await supabase
        .from('academy_article_tags')
        .delete()
        .eq('article_id' as any, params.id as any);

      // Agregar nuevos tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
          article_id: params.id,
          tag_id: tagId
        }));

        await supabase
          .from('academy_article_tags')
          .insert(tagInserts as any);
      }
    }

    // Actualizar ETFs relacionados si se proporcionan
    if (relatedEtfs !== undefined && Array.isArray(relatedEtfs)) {
      // Eliminar ETFs existentes
      await supabase
        .from('academy_related_etfs')
        .delete()
        .eq('article_id' as any, params.id as any);

      // Agregar nuevos ETFs
      if (relatedEtfs.length > 0) {
        const etfInserts = relatedEtfs.map((etfId: string) => ({
          article_id: params.id,
          etf_id: etfId
        }));

        await supabase
          .from('academy_related_etfs')
          .insert(etfInserts as any);
      }
    }

    return successResponse(
      { article },
      'Artículo de Academia actualizado exitosamente'
    );

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/academia/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/academia/[id] - Eliminar artículo (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Solo admins pueden eliminar artículos
    await requireAdmin();

    const supabase = createAdminClient();

    // Las relaciones se eliminan automáticamente por CASCADE
    const { error } = await supabase
      .from('academy_articles')
      .delete()
      .eq('id' as any, params.id as any);

    if (error) {
      console.error('Error deleting academy article:', error);
      return errorResponse(
        'Error al eliminar artículo de Academia',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { deleted: true },
      'Artículo de Academia eliminado correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/academia/[id]:', error);
    return handleAuthError(error);
  }
}
