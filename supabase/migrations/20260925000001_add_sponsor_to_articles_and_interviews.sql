-- =====================================================
-- Migration: Add Sponsor fields to news_articles and interviews
-- Description: Sistema de patrocinio para monetización
-- Date: 2026-09-25
-- =====================================================

-- ============================================
-- TABLA: news_articles - Agregar campos sponsor
-- ============================================

-- Agregar columnas de sponsor
ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS sponsor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sponsor_company_name TEXT,
ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT,
ADD COLUMN IF NOT EXISTS sponsor_website_url TEXT;

-- Índice para filtrar artículos patrocinados
CREATE INDEX IF NOT EXISTS idx_news_articles_sponsor_enabled
ON news_articles(sponsor_enabled)
WHERE sponsor_enabled = TRUE;

-- Comentarios explicativos
COMMENT ON COLUMN news_articles.sponsor_enabled IS 'Indica si el artículo tiene patrocinio activo';
COMMENT ON COLUMN news_articles.sponsor_company_name IS 'Nombre de la empresa patrocinadora';
COMMENT ON COLUMN news_articles.sponsor_logo_url IS 'URL del logo de la empresa patrocinadora';
COMMENT ON COLUMN news_articles.sponsor_website_url IS 'URL del sitio web de la empresa patrocinadora';

-- ============================================
-- TABLA: interviews - Agregar campos sponsor
-- ============================================

-- Agregar columnas de sponsor
ALTER TABLE interviews
ADD COLUMN IF NOT EXISTS sponsor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sponsor_company_name TEXT,
ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT,
ADD COLUMN IF NOT EXISTS sponsor_website_url TEXT;

-- Índice para filtrar entrevistas patrocinadas
CREATE INDEX IF NOT EXISTS idx_interviews_sponsor_enabled
ON interviews(sponsor_enabled)
WHERE sponsor_enabled = TRUE;

-- Comentarios explicativos
COMMENT ON COLUMN interviews.sponsor_enabled IS 'Indica si la entrevista tiene patrocinio activo';
COMMENT ON COLUMN interviews.sponsor_company_name IS 'Nombre de la empresa patrocinadora';
COMMENT ON COLUMN interviews.sponsor_logo_url IS 'URL del logo de la empresa patrocinadora';
COMMENT ON COLUMN interviews.sponsor_website_url IS 'URL del sitio web de la empresa patrocinadora';

-- ============================================
-- VALIDACIÓN: Constraint checks
-- ============================================

-- Si sponsor_enabled es TRUE, debe haber al menos company_name
ALTER TABLE news_articles
ADD CONSTRAINT check_news_articles_sponsor_data
CHECK (
  (sponsor_enabled = FALSE) OR
  (sponsor_enabled = TRUE AND sponsor_company_name IS NOT NULL AND LENGTH(TRIM(sponsor_company_name)) > 0)
);

ALTER TABLE interviews
ADD CONSTRAINT check_interviews_sponsor_data
CHECK (
  (sponsor_enabled = FALSE) OR
  (sponsor_enabled = TRUE AND sponsor_company_name IS NOT NULL AND LENGTH(TRIM(sponsor_company_name)) > 0)
);

-- ============================================
-- RLS (Row Level Security)
-- ============================================
-- Las políticas existentes ya cubren SELECT público
-- Los campos sponsor se incluirán automáticamente en las queries

-- Verificar que RLS está habilitado (ya debería estarlo)
-- No necesitamos crear nuevas políticas porque las existentes cubren todos los campos

-- ============================================
-- ACTUALIZAR VISTAS EXISTENTES
-- ============================================

-- Recrear vista news_articles_with_metadata (si existe)
DROP VIEW IF EXISTS news_articles_with_metadata CASCADE;

CREATE OR REPLACE VIEW news_articles_with_metadata AS
SELECT
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as tags
FROM news_articles a
LEFT JOIN news_categories c ON a.category_id = c.id
LEFT JOIN news_article_tags at ON a.id = at.article_id
LEFT JOIN news_tags t ON at.tag_id = t.id
GROUP BY a.id, c.name, c.slug, c.color_hex;

-- Recrear vista interviews_with_metadata (si existe)
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
  i.sponsor_enabled,
  i.sponsor_company_name,
  i.sponsor_logo_url,
  i.sponsor_website_url,
  i.created_at,
  i.updated_at,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- ============================================
-- DATOS DE EJEMPLO (Opcional - comentado)
-- ============================================

-- UPDATE news_articles
-- SET
--   sponsor_enabled = TRUE,
--   sponsor_company_name = 'BlackRock',
--   sponsor_logo_url = 'https://example.com/blackrock-logo.png',
--   sponsor_website_url = 'https://www.blackrock.com'
-- WHERE id = 'ejemplo-id-articulo';
