/**
 * API Admin - Autor Individual de Entrevistas
 * GET: Obtener autor por ID
 * PUT: Actualizar autor
 * DELETE: Eliminar autor
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const { data: author, error } = await supabase
      .from('interview_authors' as any)
      .select('*')
      .eq('id' as any, id as any)
      .single();

    if (error) throw error;

    if (!author) {
      return NextResponse.json(
        {
          success: false,
          error: 'Autor no encontrado'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        author
      }
    });

  } catch (error: any) {
    console.error('Error fetching interview author:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();
    const { id } = params;

    // Campos que no se pueden actualizar directamente
    const {
      id: authorId,
      created_at,
      interviews_count,
      total_views,
      ...updateData
    } = body;

    // Actualizar updated_at
    updateData.updated_at = new Date().toISOString();

    const { data: authors, error } = await supabase
      .from('interview_authors' as any)
      .update(updateData as any)
      .eq('id' as any, id as any)
      .select();

    if (error) throw error;

    if (!authors || authors.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Autor no encontrado o no se pudo actualizar'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        author: authors[0]
      }
    });

  } catch (error: any) {
    console.error('Error updating interview author:', error);
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
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { id } = params;

    const { error } = await supabase
      .from('interview_authors' as any)
      .delete()
      .eq('id' as any, id as any);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Autor eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error deleting interview author:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
