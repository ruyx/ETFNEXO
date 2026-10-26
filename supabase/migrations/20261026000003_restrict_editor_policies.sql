-- ============================================
-- Permisos de escritura solo para admin / redactor (26 oct 2026)
-- ============================================
-- Varias políticas daban acceso total a cualquier usuario autenticado
-- (auth.role() = 'authenticated'). Como la web permite registrarse, cualquier
-- usuario registrado podía editar o borrar entrevistas, sus categorías y
-- autores, y subir, sustituir o borrar archivos del bucket público, usando la
-- clave pública directamente contra la API de Supabase.
-- Se sustituyen por public.can_edit_articles() (rol admin o redactor en
-- user_profiles). La lectura pública no cambia.
-- Idempotente: se puede ejecutar varias veces.

-- Entrevistas
DROP POLICY IF EXISTS "interviews_admin_all" ON interviews;
DROP POLICY IF EXISTS "interviews_editors_all" ON interviews;
CREATE POLICY "interviews_editors_all" ON interviews
  FOR ALL
  USING (public.can_edit_articles())
  WITH CHECK (public.can_edit_articles());

-- Categorías de entrevistas
DROP POLICY IF EXISTS "interview_categories_admin_all" ON interview_categories;
DROP POLICY IF EXISTS "interview_categories_editors_all" ON interview_categories;
CREATE POLICY "interview_categories_editors_all" ON interview_categories
  FOR ALL
  USING (public.can_edit_articles())
  WITH CHECK (public.can_edit_articles());

-- Autores de entrevistas
DROP POLICY IF EXISTS "Admin all on interview authors" ON interview_authors;
DROP POLICY IF EXISTS "Editors all on interview authors" ON interview_authors;
CREATE POLICY "Editors all on interview authors" ON interview_authors
  FOR ALL
  USING (public.can_edit_articles())
  WITH CHECK (public.can_edit_articles());

-- Bucket público de Storage (imágenes de artículos, avatares y banners).
-- Las subidas del admin usan la sesión del editor o la clave de servicio.
DROP POLICY IF EXISTS "Authenticated users can upload to public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Editors can upload to public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Editors can update public bucket" ON storage.objects;
DROP POLICY IF EXISTS "Editors can delete from public bucket" ON storage.objects;

CREATE POLICY "Editors can upload to public bucket" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'public' AND public.can_edit_articles());

CREATE POLICY "Editors can update public bucket" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'public' AND public.can_edit_articles());

CREATE POLICY "Editors can delete from public bucket" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'public' AND public.can_edit_articles());
