-- =====================================================
-- Migration: Add FAQ field to interviews
-- Description: Agregar campo faq para preguntas frecuentes (JSON array igual que articles)
-- Date: 2026-08-28
-- =====================================================

-- 1. Eliminar vista existente primero (necesario para poder eliminar columna excerpt)
DROP VIEW IF EXISTS interviews_with_metadata;

-- 2. Agregar columna faq (JSONB para almacenar array de preguntas/respuestas)
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;

-- 3. Eliminar columna excerpt (no la necesitamos, usamos faq en su lugar)
ALTER TABLE interviews DROP COLUMN IF EXISTS excerpt;

-- 4. Recrear vista con todos los campos actuales

CREATE VIEW interviews_with_metadata AS
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
  i.created_at,
  i.updated_at,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- 5. Comentario
COMMENT ON COLUMN interviews.faq IS 'Preguntas y respuestas frecuentes (array JSON de objetos {question, answer})';
