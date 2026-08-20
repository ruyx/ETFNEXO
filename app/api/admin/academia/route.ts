/**
 * API Admin - Gestión de Academia
 * CRUD completo para artículos educativos de Academia
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
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^\w\s-]/g, '') // Quitar caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .substring(0, 100); // Limitar longitud
}

// GET /api/admin/academia - Listar artículos con filtros
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de editor
    await requireEditor();

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Filtros
    const status = searchParams.get('status');
    const category_id = searchParams.get('category_id');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');

    // Query base
    let query = supabase
      .from('academy_articles')
      .select(`
        *,
        category:academy_categories(id, name, slug),
        author:ai_agents(id, name, display_name, avatar_url)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (status) {
      query = query.eq('status' as any, status as any);
    }
    if (category_id) {
      query = query.eq('category_id' as any, category_id as any);
    }
    if (difficulty) {
      query = query.eq('difficulty_level' as any, difficulty as any);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching academy articles:', error);
      return errorResponse(
        'Error al obtener artículos de Academia',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse({
      articles: articles || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/academia:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/academia - Crear nuevo artículo
export async function POST(request: NextRequest) {
  try {
    // Verificar permisos de editor
    const authUser = await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    // Validar campos requeridos
    const missingFields = validateRequiredFields(body, ['title', 'content']);
    if (missingFields.length > 0) {
      return validationErrorResponse(missingFields);
    }

    // Generar slug único
    let slug = body.slug || generateSlug(body.title);

    // Verificar que el slug sea único
    const { data: existing } = await supabase
      .from('academy_articles')
      .select('id')
      .eq('slug' as any, slug as any)
      .single();

    if (existing) {
      // Si existe, agregar timestamp
      slug = `${slug}-${Date.now()}`;
    }

    // Preparar datos del artículo
    const articleData: any = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || null,
      category_id: body.category_id || null,

      // Autor (agente de IA)
      author_id: body.author_id || null,

      // SEO
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.excerpt || null,

      // Imagen destacada
      featured_image_url: body.featured_image_url || null,
      featured_image_alt: body.featured_image_alt || null,

      // FAQ (preguntas frecuentes)
      faq: body.faq || [],

      // Academia-specific fields
      difficulty_level: body.difficulty_level || null, // beginner, intermediate, advanced
      estimated_reading_time: body.estimated_reading_time || null, // minutos
      prerequisites: body.prerequisites || null, // array de slugs

      // Estado
      status: body.status || 'draft',

      // Si se publica directamente, agregar fecha de publicación
      published_at: body.status === 'published' ? new Date().toISOString() : null
    };

    const { data: article, error } = await supabase
      .from('academy_articles')
      .insert([articleData] as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating academy article:', error);
      return errorResponse(
        'Error al crear artículo de Academia',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { article },
      'Artículo de Academia creado exitosamente',
      201
    );

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/academia:', error);
    return handleAuthError(error);
  }
}
