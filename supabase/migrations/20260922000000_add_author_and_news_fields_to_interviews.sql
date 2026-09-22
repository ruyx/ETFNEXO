-- ============================================
-- Add author and news integration fields to interviews
-- ============================================
-- Fecha: 2026-09-22
-- Descripción: Agregar campos de autor/redactor y mostrar_en_noticias
-- Inspirado en: Sistema de noticias existente

-- Agregar columnas a la tabla interviews
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS author_name TEXT DEFAULT 'Redacción ETF Nexo',
  ADD COLUMN IF NOT EXISTS author_email TEXT,
  ADD COLUMN IF NOT EXISTS mostrar_en_noticias BOOLEAN DEFAULT FALSE;

-- Índice para búsquedas de entrevistas que se muestran en noticias
CREATE INDEX IF NOT EXISTS idx_interviews_mostrar_noticias
  ON interviews(mostrar_en_noticias)
  WHERE mostrar_en_noticias = TRUE;

-- Comentarios
COMMENT ON COLUMN interviews.author_name IS 'Nombre del autor/redactor de la entrevista';
COMMENT ON COLUMN interviews.author_email IS 'Email del autor/redactor';
COMMENT ON COLUMN interviews.mostrar_en_noticias IS 'Si TRUE, la entrevista aparece también en la sección de noticias';

-- Actualizar vista interviews_with_metadata para incluir nuevos campos
DROP VIEW IF EXISTS interviews_with_metadata;

CREATE VIEW interviews_with_metadata AS
SELECT
  i.id,
  i.title,
  i.slug,
  i.description,
  i.youtube_video_id,
  i.category_id,
  i.status,
  i.published_at,
  i.views_count,
  i.key_points,
  i.meta_title,
  i.meta_description,
  i.created_at,
  i.updated_at,

  -- Campos de imagen y contenido
  i.featured_image_url,
  i.featured_image_alt,
  i.content,
  i.faq,

  -- Nuevos campos de autor y noticias
  i.author_name,
  i.author_email,
  i.mostrar_en_noticias,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- Comentario
COMMENT ON VIEW interviews_with_metadata IS 'Vista con datos completos de entrevistas incluyendo autor y flag de noticias';
