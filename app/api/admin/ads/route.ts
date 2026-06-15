// ============================================
// API Admin - Gestión de Anuncios
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/admin/ads - Listar todos los anuncios
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Filtros opcionales
    const status = searchParams.get('status');
    const advertiser_id = searchParams.get('advertiser_id');
    const placement = searchParams.get('placement');

    let query = supabase
      .from('ads')
      .select(`
        *,
        advertiser:advertisers(id, name, status)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }
    if (advertiser_id) {
      query = query.eq('advertiser_id', advertiser_id);
    }
    if (placement) {
      query = query.eq('placement', placement);
    }

    const { data: ads, error } = await query;

    if (error) {
      console.error('Error fetching ads:', error);
      return NextResponse.json(
        { error: 'Error al obtener anuncios', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ads, count: ads?.length || 0 });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/ads:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/ads - Crear nuevo anuncio
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Validación básica
    if (!body.advertiser_id || !body.name || !body.type || !body.placement) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: advertiser_id, name, type, placement' },
        { status: 400 }
      );
    }

    // Validar tipo de anuncio
    const validTypes = ['image_banner', 'text_banner', 'script'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: `Tipo de anuncio inválido. Debe ser: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar placement
    const validPlacements = [
      'sidebar_top', 'sidebar_bottom',
      'article_top', 'article_mid', 'article_bottom',
      'feed_inline', 'header', 'footer'
    ];
    if (!validPlacements.includes(body.placement)) {
      return NextResponse.json(
        { error: `Placement inválido. Debe ser: ${validPlacements.join(', ')}` },
        { status: 400 }
      );
    }

    // Validación específica por tipo
    if (body.type === 'image_banner' && !body.image_url) {
      return NextResponse.json(
        { error: 'image_url es requerido para banners de imagen' },
        { status: 400 }
      );
    }

    if (body.type === 'text_banner' && !body.title) {
      return NextResponse.json(
        { error: 'title es requerido para banners de texto' },
        { status: 400 }
      );
    }

    if (body.type === 'script' && !body.script_code) {
      return NextResponse.json(
        { error: 'script_code es requerido para anuncios de script' },
        { status: 400 }
      );
    }

    // Crear anuncio
    const { data: ad, error } = await supabase
      .from('ads')
      .insert([{
        advertiser_id: body.advertiser_id,
        name: body.name,
        type: body.type,

        // Contenido según tipo
        image_url: body.image_url || null,
        image_alt: body.image_alt || null,
        title: body.title || null,
        description: body.description || null,
        cta_text: body.cta_text || null,
        script_code: body.script_code || null,

        // Común
        link_url: body.link_url || null,
        target: body.target || '_blank',

        // Ubicación y formato
        placement: body.placement,
        size: body.size || null,

        // Control
        priority: body.priority || 0,
        max_impressions: body.max_impressions || null,
        max_clicks: body.max_clicks || null,

        // Programación
        start_date: body.start_date || null,
        end_date: body.end_date || null,

        // Segmentación
        target_pages: body.target_pages || null,
        target_categories: body.target_categories || null,

        // Estado
        status: body.status || 'draft'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating ad:', error);
      return NextResponse.json(
        { error: 'Error al crear anuncio', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ad }, { status: 201 });

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/ads:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}
