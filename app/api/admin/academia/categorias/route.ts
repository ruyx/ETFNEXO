/**
 * API Admin - Categorías de Academia
 * Obtener las 7 categorías especializadas en ETF
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEditor, handleAuthError } from '@/lib/auth/check-admin';
import {
  successResponse,
  errorResponse
} from '@/lib/auth/api-response';

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
