-- ============================================
-- ETF Nexo - Academia System
-- ============================================
-- Fecha: 2026-08-20
-- Versión: 1.0
-- Descripción: Sistema completo de artículos educativos (Academia)
-- Réplica del sistema de noticias adaptado para contenido formativo

-- ============================================
-- TABLA: academy_categories (Categorías de Academia)
-- ============================================
CREATE TABLE IF NOT EXISTS academy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color_hex TEXT DEFAULT '#8B5CF6', -- Púrpura para Academia
  icon_name TEXT, -- Nombre de icono (opcional)
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_academy_categories_slug ON academy_categories(slug);

-- Comentarios
COMMENT ON TABLE academy_categories IS 'Categorías de artículos educativos de Academia';
COMMENT ON COLUMN academy_categories.slug IS 'Slug para URLs (ej: conceptos-basicos, estrategias)';

-- ============================================
-- TABLA: academy_tags (Etiquetas de Academia)
-- ============================================
CREATE TABLE IF NOT EXISTS academy_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_academy_tags_slug ON academy_tags(slug);
CREATE INDEX idx_academy_tags_usage ON academy_tags(usage_count DESC);

-- Comentarios
COMMENT ON TABLE academy_tags IS 'Tags flexibles para clasificación de artículos de Academia';

-- ============================================
-- TABLA: academy_articles (Artículos de Academia)
-- ============================================
CREATE TABLE IF NOT EXISTS academy_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT, -- Resumen corto para listados
  content TEXT NOT NULL, -- HTML o Markdown

  -- Metadata
  category_id UUID REFERENCES academy_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- FAQ (Preguntas Frecuentes)
  faq JSONB DEFAULT '[]'::jsonb,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,

  -- Academia-specific fields
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_reading_time INTEGER, -- Minutos
  prerequisites TEXT[], -- Array de slugs de artículos prerequisitos

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_academy_articles_slug ON academy_articles(slug);
CREATE INDEX idx_academy_articles_category ON academy_articles(category_id);
CREATE INDEX idx_academy_articles_author ON academy_articles(author_id);
CREATE INDEX idx_academy_articles_status ON academy_articles(status);
CREATE INDEX idx_academy_articles_published ON academy_articles(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_academy_articles_views ON academy_articles(views_count DESC);
CREATE INDEX idx_academy_articles_difficulty ON academy_articles(difficulty_level) WHERE difficulty_level IS NOT NULL;

-- Full-text search
CREATE INDEX idx_academy_articles_search ON academy_articles
  USING gin(to_tsvector('spanish', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- Índice GIN para FAQ
CREATE INDEX idx_academy_articles_faq ON academy_articles USING GIN (faq);

-- Comentarios
COMMENT ON TABLE academy_articles IS 'Artículos educativos de Academia sobre ETFs';
COMMENT ON COLUMN academy_articles.faq IS 'Array de preguntas y respuestas. Formato: [{"question": "texto", "answer": "html"}]';
COMMENT ON COLUMN academy_articles.difficulty_level IS 'Nivel de dificultad: beginner, intermediate, advanced';
COMMENT ON COLUMN academy_articles.estimated_reading_time IS 'Tiempo estimado de lectura en minutos';
COMMENT ON COLUMN academy_articles.prerequisites IS 'Array de slugs de artículos que se recomienda leer antes';

-- ============================================
-- TABLA: academy_article_tags (Relación N:M)
-- ============================================
CREATE TABLE IF NOT EXISTS academy_article_tags (
  article_id UUID REFERENCES academy_articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES academy_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (article_id, tag_id)
);

-- Índices
CREATE INDEX idx_academy_article_tags_article ON academy_article_tags(article_id);
CREATE INDEX idx_academy_article_tags_tag ON academy_article_tags(tag_id);

-- Comentarios
COMMENT ON TABLE academy_article_tags IS 'Relación muchos-a-muchos entre artículos de Academia y tags';

-- ============================================
-- TABLA: academy_related_etfs (ETFs relacionados)
-- ============================================
CREATE TABLE IF NOT EXISTS academy_related_etfs (
  article_id UUID REFERENCES academy_articles(id) ON DELETE CASCADE,
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  PRIMARY KEY (article_id, etf_id)
);

-- Índices
CREATE INDEX idx_academy_related_etfs_article ON academy_related_etfs(article_id);
CREATE INDEX idx_academy_related_etfs_etf ON academy_related_etfs(etf_id);

-- Comentarios
COMMENT ON TABLE academy_related_etfs IS 'Relación entre artículos de Academia y ETFs mencionados';

-- ============================================
-- FUNCIONES: Auto-actualizar usage_count de tags
-- ============================================
CREATE OR REPLACE FUNCTION update_academy_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE academy_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE academy_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academy_tag_usage_on_insert
AFTER INSERT ON academy_article_tags
FOR EACH ROW EXECUTE FUNCTION update_academy_tag_usage_count();

CREATE TRIGGER update_academy_tag_usage_on_delete
AFTER DELETE ON academy_article_tags
FOR EACH ROW EXECUTE FUNCTION update_academy_tag_usage_count();

-- ============================================
-- TRIGGER: updated_at
-- ============================================
CREATE TRIGGER update_academy_articles_updated_at BEFORE UPDATE ON academy_articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Actualizar contador de artículos en ai_agents
-- ============================================
-- Nota: Esta función ya existe para news_articles, pero necesitamos extenderla
-- para que también cuente artículos de academia. Vamos a crear una versión específica.

CREATE OR REPLACE FUNCTION update_agent_academy_articles_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.author_id IS NOT NULL AND NEW.status = 'published' THEN
    -- Incrementar contador cuando se publica
    UPDATE ai_agents
    SET articles_count = articles_count + 1,
        total_views = total_views + COALESCE(NEW.views_count, 0)
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si cambió el estado a published
    IF OLD.status != 'published' AND NEW.status = 'published' AND NEW.author_id IS NOT NULL THEN
      UPDATE ai_agents
      SET articles_count = articles_count + 1
      WHERE id = NEW.author_id;
    END IF;
    -- Si cambió de published a otro estado
    IF OLD.status = 'published' AND NEW.status != 'published' AND OLD.author_id IS NOT NULL THEN
      UPDATE ai_agents
      SET articles_count = articles_count - 1
      WHERE id = OLD.author_id;
    END IF;
    -- Si cambió el autor
    IF OLD.author_id IS DISTINCT FROM NEW.author_id AND NEW.status = 'published' THEN
      IF OLD.author_id IS NOT NULL THEN
        UPDATE ai_agents SET articles_count = articles_count - 1 WHERE id = OLD.author_id;
      END IF;
      IF NEW.author_id IS NOT NULL THEN
        UPDATE ai_agents SET articles_count = articles_count + 1 WHERE id = NEW.author_id;
      END IF;
    END IF;
    -- Si cambiaron las vistas
    IF OLD.views_count IS DISTINCT FROM NEW.views_count AND NEW.author_id IS NOT NULL THEN
      UPDATE ai_agents
      SET total_views = total_views + (NEW.views_count - OLD.views_count)
      WHERE id = NEW.author_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.author_id IS NOT NULL AND OLD.status = 'published' THEN
    UPDATE ai_agents
    SET articles_count = articles_count - 1,
        total_views = total_views - COALESCE(OLD.views_count, 0)
    WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para academy_articles
CREATE TRIGGER update_academy_agent_count_on_insert
AFTER INSERT ON academy_articles
FOR EACH ROW EXECUTE FUNCTION update_agent_academy_articles_count();

CREATE TRIGGER update_academy_agent_count_on_update
AFTER UPDATE ON academy_articles
FOR EACH ROW EXECUTE FUNCTION update_agent_academy_articles_count();

CREATE TRIGGER update_academy_agent_count_on_delete
AFTER DELETE ON academy_articles
FOR EACH ROW EXECUTE FUNCTION update_agent_academy_articles_count();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_related_etfs ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública, escritura solo service_role
CREATE POLICY "Public read access" ON academy_categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON academy_tags FOR SELECT USING (true);
CREATE POLICY "Public read published articles" ON academy_articles
  FOR SELECT USING (status = 'published');
CREATE POLICY "Public read access" ON academy_article_tags FOR SELECT USING (true);
CREATE POLICY "Public read access" ON academy_related_etfs FOR SELECT USING (true);

-- ============================================
-- VISTA: Artículos con metadata completa
-- ============================================
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

-- Comentarios
COMMENT ON VIEW academy_articles_with_metadata IS 'Vista completa de artículos de Academia con categorías, tags, agente autor y ETFs relacionados';

-- ============================================
-- FUNCIÓN: Buscar artículos por texto completo
-- ============================================
CREATE OR REPLACE FUNCTION search_academy_articles(search_query TEXT, max_results INTEGER DEFAULT 20)
RETURNS TABLE (
  id UUID,
  title TEXT,
  excerpt TEXT,
  slug TEXT,
  published_at TIMESTAMPTZ,
  category_name TEXT,
  difficulty_level TEXT,
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
    a.difficulty_level,
    ts_rank(
      to_tsvector('spanish', a.title || ' ' || COALESCE(a.excerpt, '') || ' ' || a.content),
      plainto_tsquery('spanish', search_query)
    ) as relevance
  FROM academy_articles a
  LEFT JOIN academy_categories c ON a.category_id = c.id
  WHERE
    a.status = 'published'
    AND to_tsvector('spanish', a.title || ' ' || COALESCE(a.excerpt, '') || ' ' || a.content)
        @@ plainto_tsquery('spanish', search_query)
  ORDER BY relevance DESC, a.published_at DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Comentarios
COMMENT ON FUNCTION search_academy_articles IS 'Búsqueda full-text en artículos publicados de Academia';

-- ============================================
-- DATOS INICIALES: Categorías
-- ============================================
INSERT INTO academy_categories (name, slug, description, color_hex, display_order) VALUES
  ('Conceptos Básicos', 'conceptos-basicos', 'Fundamentos y conceptos esenciales sobre ETFs', '#10B981', 1),
  ('Estrategias de Inversión', 'estrategias', 'Estrategias y metodologías para invertir en ETFs', '#3B82F6', 2),
  ('Análisis Técnico', 'analisis-tecnico', 'Análisis técnico aplicado a ETFs', '#F59E0B', 3),
  ('Gestión de Riesgos', 'gestion-riesgos', 'Cómo gestionar y minimizar riesgos', '#EF4444', 4),
  ('Fiscalidad', 'fiscalidad', 'Aspectos fiscales de la inversión en ETFs', '#8B5CF6', 5),
  ('Casos Prácticos', 'casos-practicos', 'Ejemplos y casos de uso reales', '#06B6D4', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- DATOS INICIALES: Tags comunes
-- ============================================
INSERT INTO academy_tags (name, slug) VALUES
  ('Principiantes', 'principiantes'),
  ('Avanzado', 'avanzado'),
  ('Tutorial', 'tutorial'),
  ('Case Study', 'case-study'),
  ('Guía Paso a Paso', 'guia-paso-a-paso'),
  ('Comparativas', 'comparativas'),
  ('Herramientas', 'herramientas'),
  ('Diversificación', 'diversificacion'),
  ('Rebalanceo', 'rebalanceo'),
  ('Dollar-Cost Averaging', 'dca'),
  ('Buy and Hold', 'buy-and-hold'),
  ('Impuestos', 'impuestos')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON SCHEMA public IS 'ETF Nexo - Schema con sistema de Academia (v1.3)';
