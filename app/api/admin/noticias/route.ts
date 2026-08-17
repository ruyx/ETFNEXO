/**
 * API Admin - Gestión de Noticias
 * CRUD completo para artículos de noticias
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

// GET /api/admin/noticias - Listar artículos con filtros
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
    const search = searchParams.get('search');

    // Query base
    let query = supabase
      .from('news_articles')
      .select(`
        *,
        category:news_categories(id, name, slug)
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
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: articles, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return errorResponse(
        'Error al obtener artículos',
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
    console.error('Unexpected error in GET /api/admin/noticias:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/noticias - Crear nuevo artículo
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
      .from('news_articles')
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

      // Autor (agente de IA o usuario autenticado)
      author_id: body.author_id || null, // ID del agente de IA
      author_name: body.author_name || authUser.profile.full_name || 'Redacción ETF Nexo',
      author_email: body.author_email || authUser.user.email || null,

      // SEO
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.excerpt || null,

      // Imagen destacada
      featured_image_url: body.featured_image_url || null,
      featured_image_alt: body.featured_image_alt || null,

      // Fuente (para artículos externos)
      source_name: body.source_name || null,
      source_url: body.source_url || null,
      source_published_at: body.source_published_at || null,

      // FAQ (preguntas frecuentes)
      faq: body.faq || null,

      // Estado
      status: body.status || 'draft',

      // Si se publica directamente, agregar fecha de publicación
      published_at: body.status === 'published' ? new Date().toISOString() : null
    };

    const { data: article, error } = await supabase
      .from('news_articles')
      .insert([articleData] as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      return errorResponse(
        'Error al crear artículo',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { article },
      'Artículo creado exitosamente',
      201
    );

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/noticias:', error);
    return handleAuthError(error);
  }
}
