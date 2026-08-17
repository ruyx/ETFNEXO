/**
 * API Admin - Exportar Usuarios a CSV
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import { errorResponse } from '@/lib/auth/api-response';

// GET /api/admin/usuarios/export - Exportar usuarios a CSV
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Filtros (igual que en el GET principal)
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Query - obtener TODOS los usuarios que cumplan los filtros
    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (role) {
      query = query.eq('role' as any, role as any);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data: profiles, error } = await query;

    if (error) {
      console.error('Error fetching users for export:', error);
      return errorResponse(
        'Error al exportar usuarios',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    // Obtener emails de auth.users para cada perfil
    const usersWithEmail = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: authUser } = await supabase.auth.admin.getUserById((profile as any).id);
        return {
          ...(profile as any),
          email: authUser?.user?.email || '',
          email_confirmed_at: authUser?.user?.email_confirmed_at || '',
          last_sign_in_at: authUser?.user?.last_sign_in_at || ''
        };
      })
    );

    // Generar CSV
    const headers = [
      'ID',
      'Email',
      'Nombre Completo',
      'Username',
      'Rol',
      'Bio',
      'Moneda Preferida',
      'Idioma Preferido',
      'Notificaciones Email',
      'Marketing Emails',
      'Email Confirmado',
      'Último Inicio Sesión',
      'Creado En',
      'Actualizado En'
    ];

    const csvRows = [
      headers.join(','),
      ...usersWithEmail.map(user => [
        user.id,
        user.email,
        `"${(user.full_name || '').replace(/"/g, '""')}"`,
        `"${(user.username || '').replace(/"/g, '""')}"`,
        user.role || '',
        `"${(user.bio || '').replace(/"/g, '""')}"`,
        user.preferred_currency || '',
        user.preferred_language || '',
        user.email_notifications ? 'Sí' : 'No',
        user.marketing_emails ? 'Sí' : 'No',
        user.email_confirmed_at ? new Date(user.email_confirmed_at).toLocaleString('es-ES') : 'No',
        user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : 'Nunca',
        user.created_at ? new Date(user.created_at).toLocaleString('es-ES') : '',
        user.updated_at ? new Date(user.updated_at).toLocaleString('es-ES') : ''
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    // Retornar como archivo CSV
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="usuarios-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/usuarios/export:', error);
    return handleAuthError(error);
  }
}
