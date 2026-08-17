-- ============================================
-- ETF Nexo - Add Admin Policies for User Management
-- ============================================
-- Fecha: 2026-08-14
-- Versión: 1.0
-- Descripción: Agregar políticas RLS para que admins puedan gestionar cualquier perfil

-- ============================================
-- RLS POLICIES: Admin can manage all profiles
-- ============================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- Recreate with admin exception
CREATE POLICY "Users can update profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR  -- Propio perfil
    public.is_admin()    -- O es admin
  )
  WITH CHECK (
    auth.uid() = id OR  -- Propio perfil
    public.is_admin()    -- O es admin
  );

-- Admin can delete any profile
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

CREATE POLICY "Users can delete profiles"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id OR  -- Propio perfil
    public.is_admin()    -- O es admin
  );

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON POLICY "Users can update profiles" ON public.user_profiles IS
  'Usuarios pueden actualizar su propio perfil, admins pueden actualizar cualquier perfil';

COMMENT ON POLICY "Users can delete profiles" ON public.user_profiles IS
  'Usuarios pueden eliminar su propio perfil, admins pueden eliminar cualquier perfil';
