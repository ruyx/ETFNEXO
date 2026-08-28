/**
 * API Admin - Categorías de Academia
 * CRUD completo para categorías especializadas en ETF
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEditor, handleAuthError } from '@/lib/auth/check-admin';
import {
  successResponse,
  errorResponse
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

// GET /api/admin/academia/categorias - Listar todas las categorías
export async function GET(request: NextRequest) {
  try {
    // Verificar permisos de editor
    await requireEditor();

    const supabase = createAdminClient();

    // Obtener categorías ordenadas por display_order
    const { data: categories, error } = await supabase
      .from('academy_categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching academy categories:', error);
      return errorResponse(
        'Error al obtener categorías de Academia',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse({
      categories: categories || []
    });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/academia/categorias:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/academia/categorias - Crear nueva categoría
export async function POST(request: NextRequest) {
  try {
    await requireEditor();

    const supabase = createAdminClient();
    const body = await request.json();

    if (!body.name || !body.name.trim()) {
      return errorResponse('El nombre es requerido', 'BAD_REQUEST', 400);
    }

    // Generar slug único
    let slug = body.slug || generateSlug(body.name);

    // Verificar unicidad del slug
    const { data: existing } = await supabase
      .from('academy_categories')
      .select('id')
      .eq('slug' as any, slug as any)
      .single();

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Obtener el próximo display_order
    const { data: lastCategory } = await supabase
      .from('academy_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = lastCategory ? (lastCategory.display_order || 0) + 1 : 1;

    // Preparar datos
    const categoryData = {
      name: body.name.trim(),
      slug,
      description: body.description || null,
      color_hex: body.color_hex || '#3B82F6',
      icon_name: body.icon_name || null,
      display_order: body.display_order ?? nextOrder
    };

    const { data: category, error } = await supabase
      .from('academy_categories')
      .insert([categoryData] as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating academy category:', error);
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
    console.error('Unexpected error in POST /api/admin/academia/categorias:', error);
    return handleAuthError(error);
  }
}
