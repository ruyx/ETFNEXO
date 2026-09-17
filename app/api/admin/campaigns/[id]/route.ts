// @ts-nocheck
/**
 * API Route: /api/admin/campaigns/[id]
 * Gestión de campaña individual - Detalle, actualizar, eliminar
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/check-admin';

// GET - Obtener detalle de campaña
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Primero obtener el ad
    // @ts-ignore - Admin client type mismatch
    const { data: adData, error: adError } = await supabase
      .from('ads')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (adError) {
      return NextResponse.json({ error: adError.message }, { status: 500 });
    }

    if (!adData) {
      return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    }

    // Luego obtener el advertiser si existe
    let advertiser = null;
    if (adData.advertiser_id) {
      const { data: advertiserData, error: advertiserError } = await supabase
        .from('advertisers')
        .select('id, name')
        .eq('id', adData.advertiser_id)
        .maybeSingle();

      if (!advertiserError && advertiserData) {
        advertiser = advertiserData;
      }
    }

    return NextResponse.json({
      ...adData,
      advertiser
    });
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

    const supabase = createAdminClient();
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

    if (!placement || placement.trim() === '') {
      return NextResponse.json(
        { error: 'La ubicación es requerida' },
        { status: 400 }
      );
    }

    // Validar que placement sea uno de los valores permitidos
    const validPlacements = [
      // Home
      'home_top', 'home_news_sidebar', 'home_after_ranking',
      // Artículos
      'article_top', 'article_mid', 'article_bottom',
      // Sidebar
      'sidebar_top', 'sidebar_mid', 'sidebar_bottom',
      // Global
      'header', 'footer', 'feed_inline'
    ];

    if (!validPlacements.includes(placement)) {
      return NextResponse.json(
        { error: `Ubicación no válida. Debe ser una de: ${validPlacements.join(', ')}` },
        { status: 400 }
      );
    }

    // Actualizar el ad
    // @ts-ignore - Admin client type mismatch
    const { error: updateError } = await supabase
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
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Luego obtener el ad actualizado
    // @ts-ignore - Admin client type mismatch
    const { data: updatedAd, error: fetchError } = await supabase
      .from('ads')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching updated ad:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!updatedAd) {
      return NextResponse.json({ error: 'Campaña no encontrada después de actualizar' }, { status: 404 });
    }

    return NextResponse.json(updatedAd);
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

    const supabase = createAdminClient();

    // Eliminar impresiones y clicks (CASCADE debería hacerlo automáticamente)
    // @ts-ignore - Admin client type mismatch
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
