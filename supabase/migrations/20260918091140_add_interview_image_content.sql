-- Agregar campos de imagen destacada y contenido WYSIWYG a la tabla interviews
-- Fecha: 2026-09-18

ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS featured_image_url TEXT,
ADD COLUMN IF NOT EXISTS featured_image_alt TEXT,
ADD COLUMN IF NOT EXISTS content TEXT;

COMMENT ON COLUMN interviews.featured_image_url IS 'URL de la imagen destacada para el listado y detalle';
COMMENT ON COLUMN interviews.featured_image_alt IS 'Texto alternativo para la imagen destacada (SEO y accesibilidad)';
COMMENT ON COLUMN interviews.content IS 'Contenido escrito de la entrevista (WYSIWYG) para entrevistas sin video';
