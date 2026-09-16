-- ============================================
-- Configuración de Supabase Storage para Banners
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

-- 2. Política de lectura pública
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE bucket_id = 'public' AND name = 'Public Access'
  ) THEN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'public');
  END IF;
END $$;

-- 3. Política de subida para usuarios autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE bucket_id = 'public' AND name = 'Authenticated users can upload'
  ) THEN
    CREATE POLICY "Authenticated users can upload"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'public');
  END IF;
END $$;

-- 4. Política de actualización para usuarios autenticados
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE bucket_id = 'public' AND name = 'Authenticated users can update own files'
  ) THEN
    CREATE POLICY "Authenticated users can update own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'public' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'public' AND auth.uid() = owner);
  END IF;
END $$;

-- 5. Política de eliminación solo para propietario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.policies
    WHERE bucket_id = 'public' AND name = 'Users can delete own files'
  ) THEN
    CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'public' AND auth.uid() = owner);
  END IF;
END $$;

-- Verificar configuración
SELECT
  'Bucket configurado:' as status,
  name,
  public as es_publico,
  file_size_limit / 1024 / 1024 as max_size_mb,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'public';

SELECT
  'Políticas configuradas:' as status,
  name,
  definition
FROM storage.policies
WHERE bucket_id = 'public'
ORDER BY name;
