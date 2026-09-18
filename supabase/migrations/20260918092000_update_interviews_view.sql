-- =====================================================
-- Migration: Update interviews_with_metadata view
-- Description: Agregar featured_image_url, featured_image_alt y content a la vista
-- Author: ETF Nexo
-- Date: 2026-09-18
-- =====================================================

-- Eliminar vista existente
DROP VIEW IF EXISTS interviews_with_metadata;

-- Recrear vista interviews_with_metadata con nuevos campos
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

  -- Nuevos campos de imagen y contenido
  i.featured_image_url,
  i.featured_image_alt,
  i.content,
  i.faq,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

COMMENT ON VIEW interviews_with_metadata IS 'Vista optimizada con datos de categoría y nuevos campos de imagen/contenido para queries públicas';
