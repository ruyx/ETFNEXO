/**
 * API Route: /api/admin/advertisers/[id]
 * Gestión de anunciante individual - Detalle, actualizar, eliminar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/check-admin';

// GET - Obtener detalle de anunciante
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('advertisers')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// PUT - Actualizar anunciante
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { name, email, website, contact_person, phone, notes, status } = body;

    // Validación
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('advertisers')
      .update({
        name: name.trim(),
        email: email?.trim() || null,
        website: website?.trim() || null,
        contact_person: contact_person?.trim() || null,
        phone: phone?.trim() || null,
        notes: notes?.trim() || null,
        status: status || 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

// DELETE - Eliminar anunciante
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Verificar que no tenga anuncios activos
    const { count } = await supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('advertiser_id', params.id);

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un anunciante con anuncios. Elimina primero sus anuncios.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('advertisers')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
