/**
 * Admin Authentication Utilities
 * Funciones para verificar autenticación y roles de usuario
 */

import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export type UserRole = 'admin' | 'redactor' | 'viewer';

export interface AuthenticatedUser {
  user: User;
  role: UserRole;
  profile: {
    id: string;
    full_name: string | null;
    role: UserRole;
  };
}

export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Verifica que el usuario esté autenticado y retorna sus datos
 * @throws {AuthError} Si el usuario no está autenticado
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('Usuario no autenticado', 'UNAUTHENTICATED');
  }

  return user;
}

/**
 * Verifica que el usuario tenga un rol específico
 * @param allowedRoles - Roles permitidos (admin, redactor, viewer)
 * @returns Datos completos del usuario autenticado con su rol
 * @throws {AuthError} Si no está autenticado o no tiene el rol requerido
 */
export async function requireRole(
  allowedRoles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  const supabase = await createClient();

  // Obtener perfil con rol del usuario
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new AuthError(
      'No se encontró el perfil del usuario',
      'NOT_FOUND'
    );
  }

  // Verificar que el rol esté permitido
  if (!allowedRoles.includes(profile.role as UserRole)) {
    throw new AuthError(
      `Acceso denegado. Se requiere uno de estos roles: ${allowedRoles.join(', ')}`,
      'FORBIDDEN'
    );
  }

  return {
    user,
    role: profile.role as UserRole,
    profile: {
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role as UserRole
    }
  };
}

/**
 * Verifica que el usuario sea admin
 * @returns Datos del usuario admin autenticado
 * @throws {AuthError} Si no está autenticado o no es admin
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole(['admin']);
}

/**
 * Verifica que el usuario pueda editar artículos (admin o redactor)
 * @returns Datos del usuario autenticado con permisos de edición
 * @throws {AuthError} Si no está autenticado o no tiene permisos
 */
export async function requireEditor(): Promise<AuthenticatedUser> {
  return requireRole(['admin', 'redactor']);
}

/**
 * Verifica autenticación y rol, pero retorna null si falla en lugar de lanzar error
 * Útil para páginas que necesitan mostrar contenido diferente según el rol
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, full_name, role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      user,
      role: profile.role as UserRole,
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role as UserRole
      }
    };
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario actual es admin (sin lanzar error)
 * @returns true si es admin, false en caso contrario
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}

/**
 * Verifica si el usuario actual puede editar artículos (sin lanzar error)
 * @returns true si puede editar, false en caso contrario
 */
export async function canEditArticles(): Promise<boolean> {
  try {
    await requireEditor();
    return true;
  } catch {
    return false;
  }
}

/**
 * Maneja errores de autenticación y retorna respuestas apropiadas
 * Útil para usar en el catch block de API routes
 */
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'UNAUTHENTICATED':
        return NextResponse.json(
          { error: error.message, code: 'UNAUTHENTICATED' },
          { status: 401 }
        );
      case 'FORBIDDEN':
        return NextResponse.json(
          { error: error.message, code: 'FORBIDDEN' },
          { status: 403 }
        );
      case 'NOT_FOUND':
        return NextResponse.json(
          { error: error.message, code: 'NOT_FOUND' },
          { status: 404 }
        );
    }
  }

  // Error desconocido
  console.error('Error desconocido:', error);
  return NextResponse.json(
    {
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error })
    },
    { status: 500 }
  );
}
