/**
 * Endpoint temporal para verificar rol del usuario actual
 * DELETE después de verificar
 */

import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/check-admin';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Debug: Ver todas las cookies
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(c =>
      c.name.includes('supabase') || c.name.includes('sb-')
    );

    console.log('=== COOKIE DEBUG ===');
    console.log('Total cookies:', allCookies.length);
    console.log('Supabase cookies:', supabaseCookies.length);
    supabaseCookies.forEach(c => {
      console.log(`Cookie: ${c.name}`);
      console.log(`  Value length: ${c.value.length}`);
      console.log(`  First 100 chars: ${c.value.substring(0, 100)}`);
    });

    // Verificar variables de entorno
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        error: true,
        message: 'Variables de entorno de Supabase no configuradas',
        debug: {
          has_url: hasUrl,
          has_key: hasKey
        }
      });
    }

    const supabase = await createClient();

    console.log('=== SUPABASE CLIENT CREATED ===');

    // IMPORTANTE: En el servidor usar getUser() en lugar de getSession()
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    console.log('User result:', user ? user.email : 'null');
    console.log('User error:', userError?.message || 'none');

    if (!user) {
      // Intentar decodificar la cookie para ver su contenido
      let cookieContent = null;
      if (supabaseCookies.length > 0) {
        try {
          const decoded = decodeURIComponent(supabaseCookies[0].value);
          const parsed = JSON.parse(decoded);
          cookieContent = {
            has_access_token: !!parsed.access_token,
            access_token_length: parsed.access_token?.length || 0,
            has_refresh_token: !!parsed.refresh_token,
            expires_at: parsed.expires_at
          };
        } catch (e) {
          cookieContent = { parse_error: 'No se pudo parsear la cookie' };
        }
      }

      return NextResponse.json({
        authenticated: false,
        message: 'No hay sesión activa. Ve a /login primero.',
        debug: {
          total_cookies: allCookies.length,
          supabase_cookies: supabaseCookies.map(c => ({
            name: c.name,
            has_value: !!c.value,
            value_length: c.value?.length || 0
          })),
          cookie_content: cookieContent,
          user_error: userError?.message || null,
          supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...',
          has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        }
      });
    }

    // Obtener perfil del usuario
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id' as any, user.id as any)  // ✅ CORRECCIÓN: usar 'id' en lugar de 'user_id'
      .single();

    // Intentar obtener usuario autenticado con nuestro middleware
    let authUser = null;
    try {
      authUser = await getAuthenticatedUser();
    } catch (err) {
      // Puede fallar si no tiene rol
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        user_id: user.id,
        email: user.email
      },
      profile: profile || null,
      role: profile?.role || 'sin rol asignado',
      can_access_admin: authUser ? true : false,
      message: profile?.role
        ? `Tienes rol: ${profile.role}. ${authUser ? 'Puedes acceder a /admin' : 'No puedes acceder a /admin (rol viewer o sin rol)'}`
        : 'No tienes rol asignado. Necesitas que un admin te asigne rol "admin" o "redactor" en la tabla user_profiles.'
    });

  } catch (error: any) {
    return NextResponse.json({
      error: true,
      message: error.message
    }, { status: 500 });
  }
}
