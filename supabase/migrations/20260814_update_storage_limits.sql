-- ============================================
-- Actualizar límite de tamaño del bucket público
-- De 2MB a 5MB para imágenes de artículos
-- ============================================

UPDATE storage.buckets
SET file_size_limit = 5242880  -- 5MB en bytes (5 * 1024 * 1024)
WHERE id = 'public';

-- Comentario
COMMENT ON TABLE storage.buckets IS 'Buckets de almacenamiento con límite de 5MB para imágenes';
