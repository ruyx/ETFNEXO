/**
 * API Admin - Gestión de Agentes de Usuario
 * GET: Listar agentes asignados
 * POST: Asignar nuevo agente
 * DELETE: Remover agente asignado
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import {
  successResponse,
  errorResponse,
  validateRequiredFields,
  validationErrorResponse
} from '@/lib/auth/api-response';

// GET /api/admin/usuarios/[id]/agents - Listar agentes asignados a un usuario
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Obtener asignaciones con datos del agente
    const { data: assignments, error } = await supabase
      .from('user_agent_assignments')
      .select(`
        id,
        agent_id,
        assigned_at,
        ai_agents (
          id,
          name,
          display_name,
          role,
          slug
        )
      `)
      .eq('user_id' as any, params.id as any)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user agents:', error);
      return errorResponse(
        'Error al obtener agentes del usuario',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    // Formatear respuesta
    const agents = (assignments || []).map((assignment: any) => ({
      id: assignment.id,
      agent_id: assignment.agent_id,
      name: assignment.ai_agents?.name,
      display_name: assignment.ai_agents?.display_name,
      role: assignment.ai_agents?.role,
      slug: assignment.ai_agents?.slug,
      assigned_at: assignment.assigned_at
    }));

    return successResponse({ agents });

  } catch (error: any) {
    console.error('Error in GET /api/admin/usuarios/[id]/agents:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/usuarios/[id]/agents - Asignar nuevo agente
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();
    const body = await request.json();

    // Validar campos requeridos
    const missingFields = validateRequiredFields(body, ['agent_id']);
    if (missingFields.length > 0) {
      return validationErrorResponse(missingFields);
    }

    // Verificar que el agente existe y está activo
    const { data: agent, error: agentError } = await supabase
      .from('ai_agents')
      .select('id, name, display_name')
      .eq('id' as any, body.agent_id as any)
      .eq('is_active' as any, true as any)
      .single();

    if (agentError || !agent) {
      return errorResponse(
        'Agente no encontrado o inactivo',
        'NOT_FOUND',
        404
      );
    }

    // Crear asignación
    const { data: assignment, error: assignmentError } = await supabase
      .from('user_agent_assignments')
      .insert([{
        user_id: params.id,
        agent_id: body.agent_id
      }] as any)
      .select(`
        id,
        agent_id,
        assigned_at,
        ai_agents (
          id,
          name,
          display_name,
          role,
          slug
        )
      `)
      .single();

    if (assignmentError) {
      // Detectar duplicados
      if (assignmentError.code === '23505') {
        return errorResponse(
          'Este agente ya está asignado al usuario',
          'BAD_REQUEST',
          409
        );
      }

      console.error('Error creating agent assignment:', assignmentError);
      return errorResponse(
        'Error al asignar agente',
        'INTERNAL_ERROR',
        500,
        assignmentError.message
      );
    }

    return successResponse(
      {
        assignment: {
          id: (assignment as any).id,
          agent_id: (assignment as any).agent_id,
          name: (assignment as any).ai_agents?.name,
          display_name: (assignment as any).ai_agents?.display_name,
          role: (assignment as any).ai_agents?.role,
          slug: (assignment as any).ai_agents?.slug,
          assigned_at: (assignment as any).assigned_at
        }
      },
      'Agente asignado correctamente',
      201
    );

  } catch (error: any) {
    console.error('Error in POST /api/admin/usuarios/[id]/agents:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/usuarios/[id]/agents?agent_id=xxx - Remover agente asignado
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return validationErrorResponse(['agent_id']);
    }

    const supabase = createAdminClient();

    // Eliminar asignación
    const { error } = await supabase
      .from('user_agent_assignments')
      .delete()
      .eq('user_id' as any, params.id as any)
      .eq('agent_id' as any, agentId as any);

    if (error) {
      console.error('Error deleting agent assignment:', error);
      return errorResponse(
        'Error al remover agente',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    return successResponse(
      { deleted: true },
      'Agente removido correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/usuarios/[id]/agents:', error);
    return handleAuthError(error);
  }
}
