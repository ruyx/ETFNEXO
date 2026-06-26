// @ts-nocheck
// ============================================
// API Público - Registrar Impresión de Anuncio
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/ads/impression
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { ad_id, page_url } = body;

    if (!ad_id) {
      return NextResponse.json(
        { error: 'El campo ad_id es requerido' },
        { status: 400 }
      );
    }

    // Obtener información de la solicitud
    const user_agent = request.headers.get('user-agent') || 'Unknown';
    const referrer = request.headers.get('referer') || request.headers.get('referrer') || '';

    // Obtener IP (puede estar detrás de un proxy/CDN)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip_address = forwarded
      ? forwarded.split(',')[0].trim()
      : request.headers.get('x-real-ip') || '0.0.0.0';

    // Registrar impresión
    const { data: impression, error } = await supabase
      .from('ad_impressions')
      .insert([{
        ad_id,
        page_url: page_url || referrer,
        referrer,
        user_agent,
        ip_address
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating impression:', error);
      return NextResponse.json(
        { error: 'Error al registrar impresión', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        impression_id: impression.id
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error in POST /api/ads/impression:', error);
    return NextResponse.json(
      { error: 'Error inesperado', details: error.message },
      { status: 500 }
    );
  }
}
