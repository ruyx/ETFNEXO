-- ============================================
-- ETF Nexo - News & Blog System
-- ============================================
-- Fecha: 2026-06-04
-- Versión: 1.0
-- Descripción: Sistema completo de noticias y blog para SEO
-- Inspirado en: FundsPeople + BlackRock

-- ============================================
-- TABLA: news_categories (Categorías)
-- ============================================
CREATE TABLE IF NOT EXISTS news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color_hex TEXT DEFAULT '#3B82F6', -- Color para badges
  icon_name TEXT, -- Nombre de icono (opcional)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_categories_slug ON news_categories(slug);

-- Comentarios
COMMENT ON TABLE news_categories IS 'Categorías principales de noticias';
COMMENT ON COLUMN news_categories.slug IS 'Slug para URLs (ej: etf, fondos, gestoras)';

-- ============================================
-- TABLA: news_tags (Etiquetas)
-- ============================================
CREATE TABLE IF NOT EXISTS news_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_tags_slug ON news_tags(slug);
CREATE INDEX idx_tags_usage ON news_tags(usage_count DESC);

-- Comentarios
COMMENT ON TABLE news_tags IS 'Tags flexibles para clasificación múltiple';

-- ============================================
-- TABLA: news_articles (Artículos/Noticias)
-- ============================================
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT, -- Resumen corto para listados
  content TEXT NOT NULL, -- Markdown o HTML

  -- Metadata
  category_id UUID REFERENCES news_categories(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Redacción ETF Nexo',
  author_email TEXT,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- Source tracking (para noticias scraped)
  source_name TEXT, -- 'FundsPeople', 'BlackRock', 'Manual', etc.
  source_url TEXT UNIQUE, -- URL original para evitar duplicados
  source_published_at TIMESTAMPTZ,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_articles_slug ON news_articles(slug);
CREATE INDEX idx_articles_category ON news_articles(category_id);
CREATE INDEX idx_articles_status ON news_articles(status);
CREATE INDEX idx_articles_published ON news_articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_source_url ON news_articles(source_url) WHERE source_url IS NOT NULL;
CREATE INDEX idx_articles_views ON news_articles(views_count DESC);

-- Full-text search
CREATE INDEX idx_articles_search ON news_articles USING gin(to_tsvector('spanish', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- Comentarios
COMMENT ON TABLE news_articles IS 'Artículos de noticias y blog sobre ETFs';
COMMENT ON COLUMN news_articles.source_url IS 'URL única para evitar duplicados en scraping';

-- ============================================
-- TABLA: news_article_tags (Relación N:M)
-- ============================================
CREATE TABLE IF NOT EXISTS news_article_tags (
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES news_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (article_id, tag_id)
);

-- Índices
CREATE INDEX idx_article_tags_article ON news_article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON news_article_tags(tag_id);

-- Comentarios
COMMENT ON TABLE news_article_tags IS 'Relación muchos-a-muchos entre artículos y tags';

-- ============================================
-- TABLA: news_related_etfs (ETFs relacionados)
-- ============================================
CREATE TABLE IF NOT EXISTS news_related_etfs (
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (article_id, etf_id)
);

-- Índices
CREATE INDEX idx_related_etfs_article ON news_related_etfs(article_id);
CREATE INDEX idx_related_etfs_etf ON news_related_etfs(etf_id);

-- Comentarios
COMMENT ON TABLE news_related_etfs IS 'Relación entre artículos y ETFs mencionados';

-- ============================================
-- FUNCIONES: Auto-actualizar usage_count de tags
-- ============================================
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE news_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE news_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tag_usage_on_insert
AFTER INSERT ON news_article_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_tag_usage_on_delete
AFTER DELETE ON news_article_tags
FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

-- ============================================
-- TRIGGER: updated_at
-- ============================================
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON news_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_related_etfs ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública, escritura solo service_role
CREATE POLICY "Public read access" ON news_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON news_tags FOR SELECT USING (true);
CREATE POLICY "Public read published articles" ON news_articles
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON news_article_tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON news_related_etfs FOR SELECT USING (true);

-- ============================================
-- VISTA: Artículos con metadata completa
-- ============================================
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
FROM news_articles a
LEFT JOIN news_categories c ON a.category_id = c.id
LEFT JOIN news_article_tags nat ON a.id = nat.article_id
LEFT JOIN news_tags t ON nat.tag_id = t.id
LEFT JOIN news_related_etfs nre ON a.id = nre.article_id
LEFT JOIN etfs e ON nre.etf_id = e.id
GROUP BY a.id, c.id;

-- Comentarios
COMMENT ON VIEW news_articles_with_metadata IS 'Vista completa de artículos con categorías, tags y ETFs relacionados';

-- ============================================
-- DATOS INICIALES: Categorías
-- ============================================
INSERT INTO news_categories (name, slug, description, color_hex, display_order) VALUES
  ('ETFs', 'etfs', 'Noticias sobre ETFs, lanzamientos y tendencias', '#3B82F6', 1),
  ('Gestoras', 'gestoras', 'Novedades de gestoras y asset managers', '#10B981', 2),
  ('Mercados', 'mercados', 'Análisis de mercados y macroeconomía', '#F59E0B', 3),
  ('Regulación', 'regulacion', 'Cambios regulatorios y normativa', '#EF4444', 4),
  ('Educación', 'educacion', 'Guías y contenido educativo', '#8B5CF6', 5),
  ('Opinión', 'opinion', 'Artículos de opinión y análisis experto', '#06B6D4', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DATOS INICIALES: Tags comunes
-- ============================================
INSERT INTO news_tags (name, slug) VALUES
  ('iShares', 'ishares'),
  ('Vanguard', 'vanguard'),
  ('Amundi', 'amundi'),
  ('Renta Variable', 'renta-variable'),
  ('Renta Fija', 'renta-fija'),
  ('ESG', 'esg'),
  ('Tecnología', 'tecnologia'),
  ('Dividendos', 'dividendos'),
  ('MSCI World', 'msci-world'),
  ('S&P 500', 'sp-500')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- FUNCIÓN: Buscar artículos por texto completo
-- ============================================
CREATE OR REPLACE FUNCTION search_articles(search_query TEXT, max_results INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  slug TEXT,
  published_at TIMESTAMPTZ,
  category_name TEXT,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.excerpt,
    a.slug,
    a.published_at,
    c.name as category_name,
    ts_rank(
      to_tsvector('spanish', a.title || ' ' || COALESCE(a.excerpt, '') || ' ' || a.content),
      plainto_tsquery('spanish', search_query)
    ) as relevance
  FROM news_articles a
  LEFT JOIN news_categories c ON a.category_id = c.id
  WHERE
    a.status = 'published'
    AND to_tsvector('spanish', a.title || ' ' || COALESCE(a.excerpt, '') || ' ' || a.content) @@ plainto_tsquery('spanish', search_query)
  ORDER BY relevance DESC, a.published_at DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON FUNCTION search_articles IS 'Búsqueda full-text en artículos publicados';

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON SCHEMA public IS 'ETF Nexo - Schema con sistema de noticias (v1.1)';
