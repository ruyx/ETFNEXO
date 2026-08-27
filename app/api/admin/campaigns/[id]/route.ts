/**
 * API Route: /api/admin/campaigns/[id]
 * Gestión de campaña individual - Detalle, actualizar, eliminar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/check-admin';

// GET - Obtener detalle de campaña
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ads')
      .select(`
        *,
        advertiser:advertiser_id (
          id,
          name
        )
      `)
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

// PUT - Actualizar campaña
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      advertiser_id,
      name,
      type,
      placement,
      image_url,
      image_alt,
      title,
      description,
      cta_text,
      script_code,
      link_url,
      target,
      size,
      priority,
      max_impressions,
      max_clicks,
      start_date,
      end_date,
      target_pages,
      target_categories,
      status
    } = body;

    // Validación básica
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ads')
      .update({
        advertiser_id: advertiser_id || null,
        name: name.trim(),
        type,
        placement,
        image_url: type === 'image_banner' ? image_url?.trim() : null,
        image_alt: type === 'image_banner' ? image_alt?.trim() : null,
        title: type === 'text_banner' ? title?.trim() : null,
        description: type === 'text_banner' ? description?.trim() : null,
        cta_text: type === 'text_banner' ? cta_text?.trim() : null,
        script_code: type === 'script' ? script_code?.trim() : null,
        link_url: link_url?.trim() || null,
        target: target || '_blank',
        size: size?.trim() || null,
        priority: priority || 0,
        max_impressions: max_impressions || null,
        max_clicks: max_clicks || null,
        start_date: start_date || null,
        end_date: end_date || null,
        target_pages: target_pages || null,
        target_categories: target_categories || null,
        status: status || 'draft',
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

// DELETE - Eliminar campaña
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = await createClient();

    // Eliminar impresiones y clicks (CASCADE debería hacerlo automáticamente)
    const { error } = await supabase
      .from('ads')
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
