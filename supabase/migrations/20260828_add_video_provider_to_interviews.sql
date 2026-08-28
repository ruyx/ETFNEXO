-- Migración: Añadir soporte para múltiples proveedores de video
-- Permite usar YouTube o iframe custom en entrevistas

-- 1. Añadir columna video_provider (youtube o custom)
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS video_provider TEXT DEFAULT 'youtube'
CHECK (video_provider IN ('youtube', 'custom'));

-- 2. Añadir columna custom_iframe_code para almacenar HTML de iframe custom
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS custom_iframe_code TEXT;

-- 3. Comentarios
COMMENT ON COLUMN interviews.video_provider IS 'Proveedor de video: youtube (usa youtube_video_id) o custom (usa custom_iframe_code)';
COMMENT ON COLUMN interviews.custom_iframe_code IS 'Código HTML del iframe personalizado cuando video_provider = custom';

-- 4. Actualizar vista interview_with_metadata para incluir nuevos campos
DROP VIEW IF EXISTS interview_with_metadata;

CREATE VIEW interview_with_metadata AS
SELECT
  i.id,
  i.title,
  i.slug,
  i.description,
  i.youtube_video_id,
  i.video_provider,
  i.custom_iframe_code,
  i.key_points,
  i.status,
  i.published_at,
  i.views_count,
  i.meta_title,
  i.meta_description,
  i.created_at,
  i.updated_at,
  -- Categoría
  i.category_id,
  c.name AS category_name,
  c.slug AS category_slug,
  c.color_hex AS category_color
FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- 5. Comentario en la vista
COMMENT ON VIEW interview_with_metadata IS 'Vista con datos completos de entrevistas incluyendo categoría y soporte multi-proveedor de video';
