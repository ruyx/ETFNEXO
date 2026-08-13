-- ============================================
-- ETF Nexo - Add User Roles for CMS
-- ============================================
-- Fecha: 2026-08-12
-- Versión: 1.0
-- Descripción: Agregar campo role a user_profiles para control de acceso al CMS

-- ============================================
-- MODIFICAR: user_profiles (Agregar role)
-- ============================================

-- Agregar columna role si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.user_profiles
    ADD COLUMN role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'redactor', 'viewer'));
  END IF;
END $$;

-- Comentario
COMMENT ON COLUMN user_profiles.role IS 'Rol del usuario: admin (acceso completo CMS), redactor (crear/editar noticias), viewer (solo lectura)';

-- Índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ============================================
-- FUNCIÓN HELPER: Verificar si usuario es admin
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.is_admin() IS 'Verifica si el usuario autenticado es admin';

-- ============================================
-- FUNCIÓN HELPER: Verificar si usuario es redactor o admin
-- ============================================
CREATE OR REPLACE FUNCTION public.can_edit_articles()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'redactor')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.can_edit_articles() IS 'Verifica si el usuario puede editar artículos (admin o redactor)';

-- ============================================
-- RLS POLICIES: Actualizar news_articles
-- ============================================

-- Habilitar RLS si no está habilitado
ALTER TABLE public.news_articles ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins y redactores pueden crear artículos
DROP POLICY IF EXISTS "Admins and redactors can create articles" ON public.news_articles;
CREATE POLICY "Admins and redactors can create articles"
ON public.news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  public.can_edit_articles()
);

-- Policy: Solo admins y redactores pueden actualizar artículos
DROP POLICY IF EXISTS "Admins and redactors can update articles" ON public.news_articles;
CREATE POLICY "Admins and redactors can update articles"
ON public.news_articles
FOR UPDATE
TO authenticated
USING (
  public.can_edit_articles()
)
WITH CHECK (
  public.can_edit_articles()
);

-- Policy: Solo admins pueden borrar artículos
DROP POLICY IF EXISTS "Only admins can delete articles" ON public.news_articles;
CREATE POLICY "Only admins can delete articles"
ON public.news_articles
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- Policy: Todos pueden leer artículos publicados (sin autenticación)
DROP POLICY IF EXISTS "Anyone can read published articles" ON public.news_articles;
CREATE POLICY "Anyone can read published articles"
ON public.news_articles
FOR SELECT
TO anon, authenticated
USING (
  status = 'published'
);

-- Policy: Redactores y admins pueden ver sus propios borradores
DROP POLICY IF EXISTS "Users can read own drafts" ON public.news_articles;
CREATE POLICY "Users can read own drafts"
ON public.news_articles
FOR SELECT
TO authenticated
USING (
  status = 'draft' AND (
    public.can_edit_articles() OR
    author_email = auth.email()
  )
);

-- ============================================
-- ASIGNAR ROL ADMIN: ruy.dejesus4@gmail.com
-- ============================================

-- Primero, asegurar que el usuario tenga un perfil
-- (Esto es idempotente - no falla si ya existe)
INSERT INTO public.user_profiles (id, full_name, role)
SELECT
  id,
  email,
  'admin'
FROM auth.users
WHERE email = 'ruy.dejesus4@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que el usuario tiene rol admin
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.user_profiles
  WHERE role = 'admin';

  RAISE NOTICE 'Total de usuarios admin: %', admin_count;
END $$;

-- Mostrar usuarios con rol admin
SELECT
  u.email,
  up.role,
  up.created_at
FROM auth.users u
INNER JOIN public.user_profiles up ON u.id = up.id
WHERE up.role = 'admin';
