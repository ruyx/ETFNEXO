-- =====================================================
-- Migration: Refactor sponsor fields to JSONB array (repeater)
-- Description: Permitir múltiples sponsors por artículo/entrevista
-- Date: 2026-09-25
-- =====================================================

-- ============================================
-- TABLA: news_articles - Refactor a array de sponsors
-- ============================================

-- Eliminar campos individuales y constraints
ALTER TABLE news_articles
DROP CONSTRAINT IF EXISTS check_news_articles_sponsor_data,
DROP COLUMN IF EXISTS sponsor_enabled,
DROP COLUMN IF EXISTS sponsor_company_name,
DROP COLUMN IF EXISTS sponsor_logo_url,
DROP COLUMN IF EXISTS sponsor_website_url;

-- Eliminar índice antiguo
DROP INDEX IF EXISTS idx_news_articles_sponsor_enabled;

-- Agregar campo JSONB array para múltiples sponsors
ALTER TABLE news_articles
ADD COLUMN sponsors JSONB DEFAULT '[]'::jsonb;

-- Índice GIN para búsquedas eficientes en el array
CREATE INDEX idx_news_articles_sponsors ON news_articles USING GIN (sponsors);

-- Comentario
COMMENT ON COLUMN news_articles.sponsors IS 'Array de sponsors/patrocinadores. Formato: [{"company_name": "texto", "logo_url": "url", "website_url": "url"}]';

-- ============================================
-- TABLA: interviews - Refactor a array de sponsors
-- ============================================

ALTER TABLE interviews
DROP CONSTRAINT IF EXISTS check_interviews_sponsor_data,
DROP COLUMN IF EXISTS sponsor_enabled,
DROP COLUMN IF EXISTS sponsor_company_name,
DROP COLUMN IF EXISTS sponsor_logo_url,
DROP COLUMN IF EXISTS sponsor_website_url;

DROP INDEX IF EXISTS idx_interviews_sponsor_enabled;

ALTER TABLE interviews
ADD COLUMN sponsors JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_interviews_sponsors ON interviews USING GIN (sponsors);

COMMENT ON COLUMN interviews.sponsors IS 'Array de sponsors/patrocinadores. Formato: [{"company_name": "texto", "logo_url": "url", "website_url": "url"}]';

-- ============================================
-- TABLA: academy_articles - Refactor a array de sponsors
-- ============================================

ALTER TABLE academy_articles
DROP CONSTRAINT IF EXISTS check_academy_articles_sponsor_data,
DROP COLUMN IF EXISTS sponsor_enabled,
DROP COLUMN IF EXISTS sponsor_company_name,
DROP COLUMN IF EXISTS sponsor_logo_url,
DROP COLUMN IF EXISTS sponsor_website_url;

DROP INDEX IF EXISTS idx_academy_articles_sponsor_enabled;

ALTER TABLE academy_articles
ADD COLUMN sponsors JSONB DEFAULT '[]'::jsonb;

CREATE INDEX idx_academy_articles_sponsors ON academy_articles USING GIN (sponsors);

COMMENT ON COLUMN academy_articles.sponsors IS 'Array de sponsors/patrocinadores. Formato: [{"company_name": "texto", "logo_url": "url", "website_url": "url"}]';

-- ============================================
-- ACTUALIZAR VISTAS
-- ============================================

-- Recrear vista news_articles_with_metadata
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

-- Recrear vista interviews_with_metadata
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

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- Recrear vista academy_articles_with_metadata
DROP VIEW IF EXISTS academy_articles_with_metadata CASCADE;

CREATE OR REPLACE VIEW academy_articles_with_metadata AS
SELECT
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color,
  ag.name as agent_name,
  ag.slug as agent_slug,
  ag.display_name as agent_display_name,
  ag.avatar_url as agent_avatar_url,
  ag.signature as agent_signature,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'::json
  ) as tags,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', e.id,
        'isin', e.isin,
        'name', e.name
      )
    ) FILTER (WHERE e.id IS NOT NULL),
    '[]'::json
  ) as related_etfs
FROM academy_articles a
LEFT JOIN academy_categories c ON a.category_id = c.id
LEFT JOIN ai_agents ag ON a.author_id = ag.id
LEFT JOIN academy_article_tags aat ON a.id = aat.article_id
LEFT JOIN academy_tags t ON aat.tag_id = t.id
LEFT JOIN academy_related_etfs are ON a.id = are.article_id
LEFT JOIN etfs e ON are.etf_id = e.id
GROUP BY a.id, c.id, ag.id;
