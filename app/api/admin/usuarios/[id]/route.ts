/**
 * API Admin - Gestión de Usuario Individual
 * GET, PATCH, DELETE para un usuario específico
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin, handleAuthError } from '@/lib/auth/check-admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

// GET /api/admin/usuarios/[id] - Obtener usuario específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Obtener perfil
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !profile) {
      return errorResponse('Usuario no encontrado', 'NOT_FOUND', 404);
    }

    // Obtener datos de autenticación
    const { data: authUser } = await supabase.auth.admin.getUserById(params.id);

    return successResponse({
      user: {
        ...profile,
        email: authUser?.user?.email || null,
        email_confirmed_at: authUser?.user?.email_confirmed_at || null,
        last_sign_in_at: authUser?.user?.last_sign_in_at || null,
        created_at: authUser?.user?.created_at || profile.created_at
      }
    });

  } catch (error: any) {
    console.error('Error in GET /api/admin/usuarios/[id]:', error);
    return handleAuthError(error);
  }
}

// PATCH /api/admin/usuarios/[id] - Actualizar usuario
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Use authenticated client for RLS-enabled profile updates (works with is_admin() policy)
    const supabase = await createClient();
    // Admin client only for auth operations (email/password changes)
    const adminClient = createAdminClient();
    const body = await request.json();

    // Campos que no se pueden actualizar directamente
    const {
      id,
      created_at,
      email, // El email se actualiza en auth.users
      password, // La contraseña se actualiza en auth.users
      ...updateData
    } = body;

    // Actualizar perfil
    updateData.updated_at = new Date().toISOString();

    // Convertir cadenas vacías a null para campos UUID
    if (updateData.agent_id === '') {
      updateData.agent_id = null;
    }

    console.log('[PATCH /api/admin/usuarios/[id]] Update data:', JSON.stringify(updateData, null, 2));
    console.log('[PATCH /api/admin/usuarios/[id]] Target user ID:', params.id);

    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (profileError || !profile) {
      // Compact error logging - all on one line to avoid truncation
      console.error('[PATCH ERROR]', JSON.stringify({
        message: profileError?.message,
        code: profileError?.code,
        details: profileError?.details,
        hint: profileError?.hint,
        updateData: updateData,
        userId: params.id
      }));
      return errorResponse(
        'Error al actualizar perfil',
        'INTERNAL_ERROR',
        500,
        profileError?.message
      );
    }

    // Actualizar email si se proporcionó
    if (email) {
      const { error: emailError } = await adminClient.auth.admin.updateUserById(
        params.id,
        { email }
      );

      if (emailError) {
        console.error('Error updating email:', emailError);
        // No fallar la operación completa por esto
      }
    }

    // Actualizar contraseña si se proporcionó
    if (password) {
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(
        params.id,
        { password }
      );

      if (passwordError) {
        console.error('Error updating password:', passwordError);
        // No fallar la operación completa por esto
      }
    }

    // Obtener datos actualizados
    const { data: authUser } = await adminClient.auth.admin.getUserById(params.id);

    return successResponse(
      {
        user: {
          ...profile,
          email: authUser?.user?.email || null
        }
      },
      'Usuario actualizado exitosamente'
    );

  } catch (error: any) {
    console.error('Error in PATCH /api/admin/usuarios/[id]:', error);
    return handleAuthError(error);
  }
}

// DELETE /api/admin/usuarios/[id] - Eliminar usuario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const supabase = createAdminClient();

    // Eliminar usuario de auth (el perfil se eliminará por CASCADE)
    const { error: authError } = await supabase.auth.admin.deleteUser(params.id);

    if (authError) {
      console.error('Error deleting user:', authError);
      return errorResponse(
        'Error al eliminar usuario',
        'INTERNAL_ERROR',
        500,
        authError.message
      );
    }

    return successResponse(
      { deleted: true },
      'Usuario eliminado correctamente'
    );

  } catch (error: any) {
    console.error('Error in DELETE /api/admin/usuarios/[id]:', error);
    return handleAuthError(error);
  }
}
