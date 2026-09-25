-- =====================================================
-- Migration: Add Sponsor fields to academy_articles
-- Description: Extender sistema de patrocinio a Academia
-- Date: 2026-09-25
-- =====================================================

-- ============================================
-- TABLA: academy_articles - Agregar campos sponsor
-- ============================================

-- Agregar columnas de sponsor
ALTER TABLE academy_articles
ADD COLUMN IF NOT EXISTS sponsor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sponsor_company_name TEXT,
ADD COLUMN IF NOT EXISTS sponsor_logo_url TEXT,
ADD COLUMN IF NOT EXISTS sponsor_website_url TEXT;

-- Índice para filtrar artículos patrocinados
CREATE INDEX IF NOT EXISTS idx_academy_articles_sponsor_enabled
ON academy_articles(sponsor_enabled)
WHERE sponsor_enabled = TRUE;

-- Comentarios explicativos
COMMENT ON COLUMN academy_articles.sponsor_enabled IS 'Indica si el artículo tiene patrocinio activo';
COMMENT ON COLUMN academy_articles.sponsor_company_name IS 'Nombre de la empresa patrocinadora';
COMMENT ON COLUMN academy_articles.sponsor_logo_url IS 'URL del logo de la empresa patrocinadora';
COMMENT ON COLUMN academy_articles.sponsor_website_url IS 'URL del sitio web de la empresa patrocinadora';

-- ============================================
-- VALIDACIÓN: Constraint checks
-- ============================================

-- Si sponsor_enabled es TRUE, debe haber al menos company_name
ALTER TABLE academy_articles
ADD CONSTRAINT check_academy_articles_sponsor_data
CHECK (
  (sponsor_enabled = FALSE) OR
  (sponsor_enabled = TRUE AND sponsor_company_name IS NOT NULL AND LENGTH(TRIM(sponsor_company_name)) > 0)
);

-- ============================================
-- ACTUALIZAR VISTA EXISTENTE
-- ============================================

-- Recrear vista academy_articles_with_metadata (si existe)
DROP VIEW IF EXISTS academy_articles_with_metadata CASCADE;

CREATE OR REPLACE VIEW academy_articles_with_metadata AS
SELECT
  a.id,
  a.title,
  a.slug,
  a.content,
  a.excerpt,
  a.faq,
  a.featured_image_url,
  a.featured_image_alt,
  a.category_id,
  a.author_id,
  a.difficulty_level,
  a.estimated_reading_time,
  a.prerequisites,
  a.status,
  a.published_at,
  a.views_count,
  a.shares_count,
  a.meta_title,
  a.meta_description,
  a.sponsor_enabled,
  a.sponsor_company_name,
  a.sponsor_logo_url,
  a.sponsor_website_url,
  a.created_at,
  a.updated_at,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color,

  -- Author data
  au.name as author_name,
  au.email as author_email,

  -- Tags aggregated
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

FROM academy_articles a
LEFT JOIN academy_categories c ON a.category_id = c.id
LEFT JOIN academy_authors au ON a.author_id = au.id
LEFT JOIN academy_article_tags at ON a.id = at.article_id
LEFT JOIN academy_tags t ON at.tag_id = t.id
GROUP BY a.id, c.name, c.slug, c.color_hex, au.name, au.email;
