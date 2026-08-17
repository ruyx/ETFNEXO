/**
 * API Admin - Gestión de Artículo Individual
 * GET, PATCH, DELETE para un artículo específico
 */

import { NextRequest } from 'next/server';
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

// GET /api/admin/noticias/[id] - Obtener artículo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar permisos de editor
    await requireEditor();

    const supabase = createAdminClient();

    const { data: article, error } = await supabase
      .from('news_articles')
      .select(`
        *,
        category:news_categories(id, name, slug, color_hex)
      `)
      .eq('id' as any, params.id as any)
      .single();

    if (error || !article) {
      return errorResponse('Artículo no encontrado', 'NOT_FOUND', 404);
    }

    // Obtener tags del artículo
    const { data: articleTags } = await supabase
      .from('news_articles_tags')
      .select(`
        tag:news_tags(id, name, slug)
      `)
      .eq('article_id' as any, params.id as any);

    const tags = articleTags?.map(at => (at as any).tag) || [];

    // Obtener ETFs relacionados
    const { data: articleEtfs } = await supabase
      .from('news_articles_related_etfs')
      .select('etf_isin')
      .eq('article_id' as any, params.id as any);

    const relatedEtfs = articleEtfs?.map(ae => (ae as any).etf_isin) || [];

    return successResponse({
      article: {
        ...(article as any),
        tags,
        relatedEtfs
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/noticias/[id]:', error);
    return handleAuthError(error);
  }
}

// PATCH /api/admin/noticias/[id] - Actualizar artículo
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
      ...updateData
    } = body;

    // Si se actualiza el título y no se proporciona slug, regenerar
    if (updateData.title && !updateData.slug) {
      let slug = generateSlug(updateData.title);

      // Verificar unicidad del slug (excepto el artículo actual)
      const { data: existing } = await supabase
        .from('news_articles')
        .select('id')
        .eq('slug' as any, slug as any)
        .neq('id' as any, params.id as any)
        .single();

      if (existing) {
        slug = `${slug}-${Date.now()}`;
      }

      updateData.slug = slug;
    }

    // Si se cambia el estado a 'published' y no tiene published_at, agregarlo
    if (updateData.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    // Si se cambia de published a draft, limpiar published_at
    if (updateData.status === 'draft' || updateData.status === 'archived') {
      updateData.published_at = null;
    }

    // Actualizar updated_at
    updateData.updated_at = new Date().toISOString();

    const { data: article, error } = await supabase
      .from('news_articles')
      .update(updateData as any)
      .eq('id' as any, params.id as any)
      .select()
      .single();

    if (error || !article) {
      console.error('Error updating article:', error);
      return errorResponse(
        'Error al actualizar artículo',
        'INTERNAL_ERROR',
        500,
        error?.message
      );
    }

    // Actualizar tags si se proporcionan
    if (tags !== undefined && Array.isArray(tags)) {
      // Eliminar tags existentes
      await supabase
        .from('news_articles_tags')
        .delete()
        .eq('article_id' as any, params.id as any);

      // Agregar nuevos tags
      if (tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
          article_id: params.id,
          tag_id: tagId
        }));

        await supabase
          .from('news_articles_tags')
          .insert(tagInserts as any);
      }
    }

    // Actualizar ETFs relacionados si se proporcionan
    if (relatedEtfs !== undefined && Array.isArray(relatedEtfs)) {
      // Eliminar ETFs existentes
      await supabase
        .from('news_articles_related_etfs')
        .delete()
        .eq('article_id' as any, params.id as any);

      // Agregar nuevos ETFs
      if (relatedEtfs.length > 0) {
        const etfInserts = relatedEtfs.map((isin: string) => ({
          article_id: params.id,
          etf_isin: isin
        }));

        await supabase
          .from('news_articles_related_etfs')
          .insert(etfInserts as any);
      }
    }

    return successResponse(
      { article },
      'Artículo actualizado exitosamente'
    );

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/noticias/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/noticias/[id] - Eliminar artículo (solo admin)
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
      .from('news_articles')
      .delete()
      .eq('id' as any, params.id as any);

    if (error) {
      console.error('Error deleting article:', error);
      return errorResponse(
        'Error al eliminar artículo',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { deleted: true },
      'Artículo eliminado correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/noticias/[id]:', error);
    return handleAuthError(error);
  }
}
