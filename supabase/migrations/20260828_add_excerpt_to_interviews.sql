-- =====================================================
-- Migration: Add excerpt field to interviews
-- Description: Agregar campo excerpt para resumen de entrevistas (igual que noticias y academia)
-- Date: 2026-08-28
-- =====================================================

-- 1. Agregar columna excerpt
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- 2. Eliminar vista existente y recrearla con todos los campos actuales
DROP VIEW IF EXISTS interviews_with_metadata;

CREATE VIEW interviews_with_metadata AS
SELECT
  i.id,
  i.title,
  i.slug,
  i.description,
  i.excerpt,
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

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- 3. Comentario
COMMENT ON COLUMN interviews.excerpt IS 'Resumen o extracto de la entrevista (texto enriquecido HTML)';
