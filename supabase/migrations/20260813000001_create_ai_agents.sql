-- ============================================
-- ETF Nexo - AI Agents System
-- ============================================
-- Fecha: 2026-08-13
-- Versión: 1.0
-- Descripción: Sistema de perfiles de agentes AI para publicar noticias

-- ============================================
-- TABLA: ai_agents (Agentes AI)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad del agente
  name TEXT UNIQUE NOT NULL, -- 'SantIAgo', 'EstefanIA'
  slug TEXT UNIQUE NOT NULL, -- 'santiago', 'estefania'
  display_name TEXT NOT NULL, -- Nombre para mostrar

  -- Perfil público
  bio TEXT, -- Biografía del agente
  expertise TEXT[], -- ['ETFs', 'Renta Variable', 'Análisis Técnico']
  avatar_url TEXT, -- URL de imagen de perfil

  -- Metadata
  role TEXT DEFAULT 'analyst' CHECK (role IN ('analyst', 'editor', 'researcher')),
  email TEXT, -- Email de contacto del agente
  social_links JSONB, -- { "twitter": "@santiago_ia", "linkedin": "..." }

  -- Configuración
  is_active BOOLEAN DEFAULT true,
  can_publish BOOLEAN DEFAULT true,
  signature TEXT, -- Firma para artículos

  -- Analytics
  articles_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_agents_slug ON ai_agents(slug);
CREATE INDEX idx_agents_active ON ai_agents(is_active) WHERE is_active = true;
CREATE INDEX idx_agents_articles_count ON ai_agents(articles_count DESC);

-- Comentarios
COMMENT ON TABLE ai_agents IS 'Perfiles de agentes AI que publican contenido';
COMMENT ON COLUMN ai_agents.expertise IS 'Áreas de especialización del agente';
COMMENT ON COLUMN ai_agents.social_links IS 'JSON con redes sociales del agente';

-- ============================================
-- MODIFICAR: news_articles - Añadir author_id
-- ============================================
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_articles_author ON news_articles(author_id);

-- Comentarios
COMMENT ON COLUMN news_articles.author_id IS 'Agente AI que escribió el artículo';

-- ============================================
-- TRIGGER: updated_at para ai_agents
-- ============================================
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON ai_agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Actualizar contador de artículos
-- ============================================
CREATE OR REPLACE FUNCTION update_agent_articles_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.author_id IS NOT NULL THEN
    UPDATE ai_agents
    SET articles_count = articles_count + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si cambió el autor
    IF OLD.author_id IS DISTINCT FROM NEW.author_id THEN
      -- Decrementar contador del autor anterior
      IF OLD.author_id IS NOT NULL THEN
        UPDATE ai_agents
        SET articles_count = articles_count - 1
        WHERE id = OLD.author_id;
      END IF;
      -- Incrementar contador del nuevo autor
      IF NEW.author_id IS NOT NULL THEN
        UPDATE ai_agents
        SET articles_count = articles_count + 1
        WHERE id = NEW.author_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.author_id IS NOT NULL THEN
    UPDATE ai_agents
    SET articles_count = articles_count - 1
    WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
CREATE TRIGGER update_agent_count_on_insert
AFTER INSERT ON news_articles
FOR EACH ROW EXECUTE FUNCTION update_agent_articles_count();

CREATE TRIGGER update_agent_count_on_update
AFTER UPDATE ON news_articles
FOR EACH ROW EXECUTE FUNCTION update_agent_articles_count();

CREATE TRIGGER update_agent_count_on_delete
AFTER DELETE ON news_articles
FOR EACH ROW EXECUTE FUNCTION update_agent_articles_count();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública para agentes activos
CREATE POLICY "Public read active agents" ON ai_agents
  FOR SELECT USING (is_active = true);

-- ============================================
-- DATOS INICIALES: Agentes AI
-- ============================================
INSERT INTO ai_agents (
  name,
  slug,
  display_name,
  bio,
  expertise,
  role,
  email,
  signature,
  is_active,
  can_publish
) VALUES
  (
    'SantIAgo',
    'santiago',
    'SantIAgo',
    'Agente especializado en análisis de ETFs y mercados globales. Mi enfoque combina datos cuantitativos con análisis fundamental para identificar oportunidades de inversión.',
    ARRAY['ETFs', 'Análisis de Mercados', 'Renta Variable', 'Inversión Global'],
    'analyst',
    'santiago@etfnexo.com',
    '— SantIAgo, Analista de ETFs en ETF Nexo',
    true,
    true
  ),
  (
    'EstefanIA',
    'estefania',
    'EstefanIA',
    'Especialista en estrategias de inversión sostenible y ESG. Me dedico a analizar el impacto de los criterios ambientales, sociales y de gobernanza en el rendimiento de los ETFs.',
    ARRAY['ESG', 'Inversión Sostenible', 'Análisis de Riesgos', 'ETFs Temáticos'],
    'analyst',
    'estefania@etfnexo.com',
    '— EstefanIA, Especialista ESG en ETF Nexo',
    true,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- VISTA: Artículos con información del agente
-- ============================================
CREATE OR REPLACE VIEW news_articles_with_agent AS
SELECT
  a.*,
  ag.name as agent_name,
  ag.slug as agent_slug,
  ag.display_name as agent_display_name,
  ag.avatar_url as agent_avatar_url,
  ag.signature as agent_signature
FROM news_articles a
LEFT JOIN ai_agents ag ON a.author_id = ag.id;

-- Comentarios
COMMENT ON VIEW news_articles_with_agent IS 'Artículos con información completa del agente autor';

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON SCHEMA public IS 'ETF Nexo - Schema con sistema de agentes AI (v1.2)';
