/**
 * API Admin - Gestión de Categorías
 * CRUD completo para categorías de noticias
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

// GET /api/admin/categorias - Listar todas las categorías
export async function GET(request: NextRequest) {
  try {
    await requireEditor();

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parámetros opcionales
    const includeCount = searchParams.get('include_count') === 'true';

    let query = supabase
      .from('news_categories')
      .select('*')
      .order('name', { ascending: true });

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return errorResponse(
        'Error al obtener categorías',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    // Si se solicita, agregar conteo de artículos por categoría
    if (includeCount && categories) {
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const { count } = await supabase
            .from('news_articles')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', category.id);

          return {
            ...category,
            articles_count: count || 0
          };
        })
      );

      return successResponse({ categories: categoriesWithCount });
    }

    return successResponse({ categories: categories || [] });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/categorias:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/categorias - Crear nueva categoría
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
      .from('news_categories')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Preparar datos de la categoría
    const categoryData = {
      name: body.name,
      slug,
      description: body.description || null,
      color_hex: body.color_hex || '#235D87', // Color por defecto (primary blue)
      icon_name: body.icon_name || null
    };

    const { data: category, error } = await supabase
      .from('news_categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      return errorResponse(
        'Error al crear categoría',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { category },
      'Categoría creada exitosamente',
      201
    );

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/categorias:', error);
    return handleAuthError(error);
  }
}
