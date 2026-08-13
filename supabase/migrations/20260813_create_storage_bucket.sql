-- Crear bucket público para avatares de agentes
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
