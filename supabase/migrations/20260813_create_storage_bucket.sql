-- ============================================
-- Storage Bucket para Archivos Públicos
-- ============================================
-- Crear bucket público para avatares y assets
-- Los archivos de avatares se guardarán en: public/avatars/*
--
-- IMPORTANTE: Este SQL debe ejecutarse manualmente en Supabase Dashboard
-- (npx supabase db push falla si ya existen otras migraciones)
--
-- Instrucciones:
-- 1. Ve a Supabase Dashboard → SQL Editor
-- 2. Copia y pega este SQL completo
-- 3. Click en "Run"
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public',
  'public',
  true,
  2097152, -- 2MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acceso para el bucket público
CREATE POLICY "Public bucket is viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');

CREATE POLICY "Authenticated users can upload to public bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'public'
  AND auth.role() = 'authenticated'
);
