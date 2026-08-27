/**
 * API Route: /api/admin/advertisers
 * Gestión de anunciantes - Listar y crear
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/check-admin';

// GET - Listar todos los anunciantes
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('advertisers')
      .select('*')
      .order('created_at', { ascending: false });

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

// POST - Crear nuevo anunciante
export async function POST(request: NextRequest) {
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
      .insert([
        {
          name: name.trim(),
          email: email?.trim() || null,
          website: website?.trim() || null,
          contact_person: contact_person?.trim() || null,
          phone: phone?.trim() || null,
          notes: notes?.trim() || null,
          status: status || 'active'
        }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Unauthorized' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
