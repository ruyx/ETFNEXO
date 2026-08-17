/**
 * API - AI Agents
 * Get list of AI agents
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

// GET /api/agents - List all active agents
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('id, name, display_name, role, slug')
      .eq('is_active' as any, true as any)
      .order('display_name');

    if (error) {
      console.error('Error fetching agents:', error);
      return errorResponse(
        'Error al obtener agentes',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(agents || []);

  } catch (error: any) {
    console.error('Unexpected error in GET /api/agents:', error);
    return errorResponse(
      'Error interno del servidor',
      'INTERNAL_ERROR',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    );
  }
}
