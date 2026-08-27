/**
 * API Route: /api/admin/campaigns
 * Gestión de campañas/anuncios - Listar y crear
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/check-admin';

// GET - Listar todas las campañas
export async function GET(request: NextRequest) {
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

// POST - Crear nueva campaña
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const {
      advertiser_id,
      name,
      type,
      placement,
      // image_banner fields
      image_url,
      image_alt,
      // text_banner fields
      title,
      description,
      cta_text,
      // script fields
      script_code,
      // common fields
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

    if (!type || !['image_banner', 'text_banner', 'script'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de anuncio inválido' },
        { status: 400 }
      );
    }

    if (!placement) {
      return NextResponse.json(
        { error: 'La ubicación es requerida' },
        { status: 400 }
      );
    }

    // Validación por tipo
    if (type === 'image_banner' && !image_url) {
      return NextResponse.json(
        { error: 'La URL de la imagen es requerida para banners de imagen' },
        { status: 400 }
      );
    }

    if (type === 'text_banner' && !title) {
      return NextResponse.json(
        { error: 'El título es requerido para banners de texto' },
        { status: 400 }
      );
    }

    if (type === 'script' && !script_code) {
      return NextResponse.json(
        { error: 'El código del script es requerido' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('ads')
      .insert([
        {
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
          status: status || 'draft'
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
