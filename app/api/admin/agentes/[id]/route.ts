/**
 * API Admin - Agente Individual
 * GET: Obtener agente por ID
 * PUT: Actualizar agente
 * DELETE: Eliminar agente
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: agent, error } = await supabase
      .from('ai_agents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agente no encontrado'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        agent
      }
    });

  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();  // Use admin client to bypass RLS
    const body = await request.json();
    const { id } = await params;

    console.log('[PUT /api/admin/agentes/[id]] Agent ID:', id);
    console.log('[PUT /api/admin/agentes/[id]] Update data:', body);

    const updateData: Record<string, any> = {};

    // Solo actualizar campos proporcionados
    if (body.name !== undefined) updateData.name = body.name;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.display_name !== undefined) updateData.display_name = body.display_name;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.expertise !== undefined) updateData.expertise = body.expertise;
    if (body.avatar_url !== undefined) updateData.avatar_url = body.avatar_url;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.social_links !== undefined) updateData.social_links = body.social_links;
    if (body.signature !== undefined) updateData.signature = body.signature;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.can_publish !== undefined) updateData.can_publish = body.can_publish;

    console.log('[PUT /api/admin/agentes/[id]] Fields to update:', updateData);

    const { data: agents, error } = await supabase
      .from('ai_agents')
      .update(updateData as Database['public']['Tables']['ai_agents']['Update'])
      .eq('id', id)
      .select();

    console.log('[PUT /api/admin/agentes/[id]] Update result:', { agents, error });

    if (error) throw error;

    if (!agents || agents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Agente no encontrado o no se pudo actualizar'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        agent: agents[0]
      }
    });

  } catch (error: any) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient();  // Use admin client to bypass RLS
    const { id } = await params;

    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Agente eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
