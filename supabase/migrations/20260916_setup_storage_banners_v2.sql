-- ============================================
-- Configuración de Supabase Storage para Banners (v2)
-- Compatible con Supabase versiones recientes
-- ============================================

-- 1. Crear bucket 'public' si no existe (para banners y avatares)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Eliminar políticas antiguas si existen (para poder recrearlas)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- 3. Política de lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

-- 4. Política de subida para usuarios autenticados
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public');

-- 5. Política de actualización para usuarios autenticados
CREATE POLICY "Authenticated users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'public' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'public' AND auth.uid() = owner);

-- 6. Política de eliminación solo para propietario
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public' AND auth.uid() = owner);

-- Verificar configuración
SELECT
  'Bucket configurado correctamente' as mensaje,
  name,
  public as es_publico,
  file_size_limit / 1024 / 1024 as max_size_mb
FROM storage.buckets
WHERE id = 'public';
