/**
 * API Admin - Gestión de Usuarios
 * CRUD completo para usuarios y perfiles
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import {
  successResponse,
  errorResponse,
  validateRequiredFields,
  validationErrorResponse
} from '@/lib/auth/api-response';

// GET /api/admin/usuarios - Listar usuarios con filtros
export async function GET(request: NextRequest) {
  try {
    // Solo admins pueden gestionar usuarios
    await requireAdmin();

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Filtros
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Query base - JOIN con auth.users para obtener email y estado
    let query = supabase
      .from('user_profiles')
      .select(`
        *
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Aplicar filtros
    if (role) {
      query = query.eq('role', role);
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data: profiles, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return errorResponse(
        'Error al obtener usuarios',
        'INTERNAL_ERROR',
        500,
        error.message
      );
    }

    // Obtener emails de auth.users para cada perfil
    const usersWithEmail = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
        return {
          ...profile,
          email: authUser?.user?.email || null,
          email_confirmed_at: authUser?.user?.email_confirmed_at || null,
          last_sign_in_at: authUser?.user?.last_sign_in_at || null
        };
      })
    );

    return successResponse({
      users: usersWithEmail,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: offset + limit < (count || 0)
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/usuarios:', error);
    return handleAuthError(error);
  }
}

// POST /api/admin/usuarios - Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    // Solo admins pueden crear usuarios
    await requireAdmin();

    const supabase = createAdminClient();
    const body = await request.json();

    // Validar campos requeridos
    const missingFields = validateRequiredFields(body, ['email', 'password', 'full_name']);
    if (missingFields.length > 0) {
      return validationErrorResponse(missingFields);
    }

    // Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: body.full_name
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating auth user:', authError);
      return errorResponse(
        'Error al crear usuario',
        'INTERNAL_ERROR',
        500,
        authError?.message || 'No se pudo crear el usuario'
      );
    }

    // Crear perfil de usuario
    const profileData = {
      id: authData.user.id,
      full_name: body.full_name,
      username: body.username || null,
      role: body.role || 'viewer',
      bio: body.bio || null,
      agent_id: body.agent_id && body.agent_id !== '' ? body.agent_id : null,
      avatar_url: body.avatar_url || null,
      preferred_currency: body.preferred_currency || 'EUR',
      preferred_language: body.preferred_language || 'es',
      email_notifications: body.email_notifications !== false,
      marketing_emails: body.marketing_emails || false
    };

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Intentar eliminar el usuario de auth si falló la creación del perfil
      await supabase.auth.admin.deleteUser(authData.user.id);

      return errorResponse(
        'Error al crear perfil de usuario',
        'INTERNAL_ERROR',
        500,
        profileError.message
      );
    }

    return successResponse(
      {
        user: {
          ...profile,
          email: authData.user.email
        }
      },
      'Usuario creado exitosamente',
      201
    );

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/usuarios:', error);
    return handleAuthError(error);
  }
}
