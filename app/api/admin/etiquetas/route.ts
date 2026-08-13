/**
 * API Admin - Gestión de Etiquetas (Tags)
 * CRUD completo para etiquetas de noticias
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEditor, handleAuthError } from '@/lib/auth/check-admin';
import {
  successResponse,
  errorResponse,
  validateRequiredFields,
  validationErrorResponse
} from '@/lib/auth/api-response';

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

// GET /api/admin/etiquetas - Listar todas las etiquetas
export async function GET(request: NextRequest) {
  try {
    await requireEditor();

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parámetros opcionales
    const includeCount = searchParams.get('include_count') === 'true';

    let query = supabase
      .from('news_tags')
      .select('*')
      .order('name', { ascending: true });

    const { data: tags, error } = await query;

    if (error) {
      console.error('Error fetching tags:', error);
      return errorResponse(
        'Error al obtener etiquetas',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    // Si se solicita, agregar conteo de artículos por etiqueta
    if (includeCount && tags) {
      const tagsWithCount = await Promise.all(
        tags.map(async (tag) => {
          const { count } = await supabase
            .from('news_articles_tags')
            .select('article_id', { count: 'exact', head: true })
            .eq('tag_id', tag.id);

          return {
            ...tag,
            articles_count: count || 0
          };
        })
      );

      return successResponse({ tags: tagsWithCount });
    }

    return successResponse({ tags: tags || [] });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/etiquetas:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/etiquetas - Crear nueva etiqueta
export async function POST(request: NextRequest) {
  try {
    await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    // Validar campos requeridos
    const missingFields = validateRequiredFields(body, ['name']);
    if (missingFields.length > 0) {
      return validationErrorResponse(missingFields);
    }

    // Generar slug único
    let slug = body.slug || generateSlug(body.name);

    // Verificar que el slug sea único
    const { data: existing } = await supabase
      .from('news_tags')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Preparar datos de la etiqueta
    const tagData = {
      name: body.name,
      slug,
      description: body.description || null
    };

    const { data: tag, error } = await supabase
      .from('news_tags')
      .insert([tagData])
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return errorResponse(
        'Error al crear etiqueta',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { tag },
      'Etiqueta creada exitosamente',
      201
    );

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/etiquetas:', error);
    return handleAuthError(error);
  }
}
