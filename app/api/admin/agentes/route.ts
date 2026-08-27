// @ts-nocheck
/**
 * API Admin - Agentes AI
 * GET: Listar todos los agentes
 * POST: Crear nuevo agente
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        agents: agents || []
      }
    });

  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Validaciones
    if (!body.name || !body.slug || !body.display_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'name, slug y display_name son requeridos'
        },
        { status: 400 }
      );
    }

    const { data: agent, error } = await supabase
      .from('ai_agents')
      .insert({
        name: body.name,
        slug: body.slug,
        display_name: body.display_name,
        bio: body.bio || null,
        expertise: body.expertise || [],
        avatar_url: body.avatar_url || null,
        role: body.role || 'analyst',
        agent_type: body.agent_type || 'redactor',
        email: body.email || null,
        social_links: body.social_links || null,
        signature: body.signature || null,
        is_active: body.is_active !== undefined ? body.is_active : true,
        can_publish: body.can_publish !== undefined ? body.can_publish : true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        agent
      }
    });

  } catch (error: any) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
