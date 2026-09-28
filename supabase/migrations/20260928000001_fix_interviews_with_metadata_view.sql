-- ============================================
-- Fix interviews_with_metadata view
-- ============================================
-- Fecha: 2026-09-28
-- Descripción: Restaurar campos faltantes en interviews_with_metadata
-- Problema: La migración de sponsors eliminó campos de autor y featured_image

DROP VIEW IF EXISTS interviews_with_metadata CASCADE;

CREATE OR REPLACE VIEW interviews_with_metadata AS
SELECT
  i.id,
  i.title,
  i.slug,
  i.description,
  i.faq,
  i.youtube_video_id,
  i.category_id,
  i.status,
  i.published_at,
  i.views_count,
  i.key_points,
  i.meta_title,
  i.meta_description,
  i.sponsors,
  i.created_at,
  i.updated_at,

  -- Campos de imagen y contenido (FALTABAN)
  i.featured_image_url,
  i.featured_image_alt,
  i.content,

  -- Campo de noticias (FALTABA)
  i.mostrar_en_noticias,

  -- Author data (FALTABAN)
  i.author_id,
  a.name as author_name,
  a.slug as author_slug,
  a.display_name as author_display_name,
  a.avatar_url as author_avatar_url,
  a.email as author_email,
  a.signature as author_signature,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id
LEFT JOIN interview_authors a ON i.author_id = a.id;

COMMENT ON VIEW interviews_with_metadata IS 'Vista completa de entrevistas con metadata, autor y categoría';
