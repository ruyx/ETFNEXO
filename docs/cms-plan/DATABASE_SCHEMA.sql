-- ============================================
-- ETF Nexo CMS - Nuevas Tablas
-- ============================================
-- Fecha: 2026-08-12
-- Versión: 1.0
-- Descripción: Tablas adicionales para el CMS de noticias

-- ============================================
-- TABLA: user_profiles (Perfiles de usuarios)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'redactor' CHECK (role IN ('admin', 'redactor', 'revisor_ia')),
  avatar_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(active);

-- Comentarios
COMMENT ON TABLE user_profiles IS 'Perfiles de redactores y administradores';
COMMENT ON COLUMN user_profiles.role IS 'admin: acceso completo, redactor: crear/editar, revisor_ia: solo revisar contenido IA';

-- ============================================
-- TABLA: article_revisions (Historial)
-- ============================================
CREATE TABLE IF NOT EXISTS article_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,

  -- Snapshot del artículo
  content_snapshot JSONB NOT NULL,

  -- Metadata del cambio
  editor_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  editor_email TEXT,
  change_type TEXT CHECK (change_type IN ('created', 'updated', 'published', 'unpublished', 'deleted')),
  change_summary TEXT, -- Opcional: descripción del cambio

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_revisions_article ON article_revisions(article_id);
CREATE INDEX idx_revisions_editor ON article_revisions(editor_id);
CREATE INDEX idx_revisions_created ON article_revisions(created_at DESC);

-- Comentarios
COMMENT ON TABLE article_revisions IS 'Historial de cambios de artículos para auditoría';
COMMENT ON COLUMN article_revisions.content_snapshot IS 'Snapshot completo del artículo en formato JSON';

-- ============================================
-- TABLA: ai_generated_content (Tracking IA)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,

  -- Metadata del agente IA
  ai_agent_name TEXT NOT NULL,
  ai_model TEXT,
  generation_prompt TEXT,
  generation_metadata JSONB, -- Data sources, parámetros, etc.

  -- Confianza y revisión
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  needs_review BOOLEAN DEFAULT true,
  reviewed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  review_decision TEXT CHECK (review_decision IN ('approved', 'edited', 'rejected')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_content_article ON ai_generated_content(article_id);
CREATE INDEX idx_ai_content_needs_review ON ai_generated_content(needs_review) WHERE needs_review = true;
CREATE INDEX idx_ai_content_agent ON ai_generated_content(ai_agent_name);
CREATE INDEX idx_ai_content_model ON ai_generated_content(ai_model);

-- Comentarios
COMMENT ON TABLE ai_generated_content IS 'Tracking de contenido generado por agentes IA';
COMMENT ON COLUMN ai_generated_content.confidence_score IS 'Confianza del agente IA en el contenido (0-1)';

-- ============================================
-- TABLA: scheduled_publications
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,

  -- Programación
  scheduled_for TIMESTAMPTZ NOT NULL,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: No publicar artículos ya publicados
  CONSTRAINT unique_unpublished_schedule UNIQUE (article_id, published)
);

-- Índices
CREATE INDEX idx_scheduled_upcoming ON scheduled_publications(scheduled_for) WHERE published = false;
CREATE INDEX idx_scheduled_published ON scheduled_publications(published);

-- Comentarios
COMMENT ON TABLE scheduled_publications IS 'Publicaciones programadas para fecha/hora específica';

-- ============================================
-- TABLA: article_analytics (Métricas diarias)
-- ============================================
CREATE TABLE IF NOT EXISTS article_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,

  -- Fecha de la métrica
  analytics_date DATE NOT NULL,

  -- Métricas
  views_count INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  avg_time_on_page INTEGER, -- Segundos
  bounce_rate FLOAT, -- 0-1
  shares_count INTEGER DEFAULT 0,

  -- Fuentes de tráfico
  traffic_sources JSONB, -- { "direct": 50, "google": 30, "social": 20 }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraint: Una fila por artículo por día
  UNIQUE (article_id, analytics_date)
);

-- Índices
CREATE INDEX idx_analytics_article ON article_analytics(article_id);
CREATE INDEX idx_analytics_date ON article_analytics(analytics_date DESC);

-- Comentarios
COMMENT ON TABLE article_analytics IS 'Métricas diarias por artículo para dashboard';

-- ============================================
-- FUNCIONES: Auto-actualizar updated_at
-- ============================================

-- Para user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();

-- Para article_analytics
CREATE OR REPLACE FUNCTION update_article_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_analytics_updated_at
BEFORE UPDATE ON article_analytics
FOR EACH ROW
EXECUTE FUNCTION update_article_analytics_updated_at();

-- ============================================
-- FUNCIONES: Auto-crear revisión en cambios
-- ============================================
CREATE OR REPLACE FUNCTION auto_create_revision()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear revisión en UPDATE
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO article_revisions (
      article_id,
      content_snapshot,
      editor_email,
      change_type
    ) VALUES (
      NEW.id,
      jsonb_build_object(
        'title', NEW.title,
        'content', NEW.content,
        'excerpt', NEW.excerpt,
        'status', NEW.status,
        'published_at', NEW.published_at
      ),
      NEW.author_email,
      CASE
        WHEN OLD.status = 'draft' AND NEW.status = 'published' THEN 'published'
        WHEN OLD.status = 'published' AND NEW.status = 'draft' THEN 'unpublished'
        ELSE 'updated'
      END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_revision_on_update
AFTER UPDATE ON news_articles
FOR EACH ROW
EXECUTE FUNCTION auto_create_revision();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Usuarios autenticados pueden leer su perfil
CREATE POLICY "Users can read own profile"
ON user_profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Solo admins pueden crear/editar perfiles
CREATE POLICY "Only admins can manage profiles"
ON user_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Redactores pueden leer revisiones de sus artículos
CREATE POLICY "Authors can read their article revisions"
ON article_revisions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM news_articles a
    WHERE a.id = article_revisions.article_id
    AND a.author_email = auth.email()
  )
);

-- Policy: Admins pueden leer todas las revisiones
CREATE POLICY "Admins can read all revisions"
ON article_revisions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Policy: Revisores IA pueden leer contenido pendiente de revisión
CREATE POLICY "Reviewers can read pending AI content"
ON ai_generated_content
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'revisor_ia')
  )
);

-- Policy: Solo admins y revisores pueden actualizar revisiones IA
CREATE POLICY "Reviewers can update AI content reviews"
ON ai_generated_content
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'revisor_ia')
  )
);

-- ============================================
-- DATOS INICIALES: Roles de ejemplo
-- ============================================

-- Crear categorías si no existen
INSERT INTO news_categories (name, slug, description, color_hex, display_order)
VALUES
  ('ETFs', 'etfs', 'Noticias sobre fondos cotizados', '#3B82F6', 1),
  ('Gestoras', 'gestoras', 'Noticias de gestoras de fondos', '#10B981', 2),
  ('Mercados', 'mercados', 'Análisis de mercados financieros', '#F59E0B', 3),
  ('Regulación', 'regulacion', 'Cambios regulatorios y normativas', '#EF4444', 4),
  ('Educación', 'educacion', 'Guías y contenido educativo', '#8B5CF6', 5)
ON CONFLICT (slug) DO NOTHING;

-- Crear tags comunes
INSERT INTO news_tags (name, slug)
VALUES
  ('Vanguard', 'vanguard'),
  ('iShares', 'ishares'),
  ('SPDR', 'spdr'),
  ('S&P 500', 's-p-500'),
  ('MSCI World', 'msci-world'),
  ('Emergentes', 'emergentes'),
  ('Bonos', 'bonos'),
  ('Dividendos', 'dividendos'),
  ('ESG', 'esg'),
  ('Tecnología', 'tecnologia')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

-- Índice compuesto para filtros comunes en admin
CREATE INDEX idx_articles_admin_filters
ON news_articles(status, category_id, published_at DESC)
WHERE status IN ('draft', 'published');

-- Índice para búsqueda full-text en español
CREATE INDEX idx_articles_fts_spanish
ON news_articles
USING gin(to_tsvector('spanish', title || ' ' || COALESCE(excerpt, '') || ' ' || content));

-- ============================================
-- FIN DEL SCHEMA
-- ============================================

-- Verificar tablas creadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'user_profiles',
  'article_revisions',
  'ai_generated_content',
  'scheduled_publications',
  'article_analytics'
)
ORDER BY table_name;
