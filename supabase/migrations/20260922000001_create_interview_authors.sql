-- ============================================
-- ETF Nexo - Interview Authors System
-- ============================================
-- Fecha: 2026-09-22
-- Versión: 1.0
-- Descripción: Sistema de autores/redactores para entrevistas
-- Basado en: ai_agents system para noticias

-- ============================================
-- TABLA: interview_authors (Autores de Entrevistas)
-- ============================================
CREATE TABLE IF NOT EXISTS interview_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad del autor
  name TEXT UNIQUE NOT NULL, -- 'Juan Pérez', 'María García'
  slug TEXT UNIQUE NOT NULL, -- 'juan-perez', 'maria-garcia'
  display_name TEXT NOT NULL, -- Nombre para mostrar en frontend

  -- Perfil público
  bio TEXT, -- Biografía del autor
  expertise TEXT[], -- ['ETFs', 'Análisis Técnico', 'Gestión de Fondos']
  avatar_url TEXT, -- URL de imagen de perfil

  -- Metadata
  role TEXT DEFAULT 'editor' CHECK (role IN ('editor', 'analyst', 'journalist', 'guest')),
  email TEXT, -- Email de contacto del autor
  social_links JSONB, -- { "twitter": "@autor", "linkedin": "..." }

  -- Configuración
  is_active BOOLEAN DEFAULT true,
  can_publish BOOLEAN DEFAULT true,
  signature TEXT, -- Firma para entrevistas

  -- Analytics
  interviews_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_interview_authors_slug ON interview_authors(slug);
CREATE INDEX idx_interview_authors_active ON interview_authors(is_active) WHERE is_active = true;
CREATE INDEX idx_interview_authors_interviews_count ON interview_authors(interviews_count DESC);

-- Comentarios
COMMENT ON TABLE interview_authors IS 'Perfiles de autores/redactores que publican entrevistas';
COMMENT ON COLUMN interview_authors.expertise IS 'Áreas de especialización del autor';
COMMENT ON COLUMN interview_authors.social_links IS 'JSON con redes sociales del autor';

-- ============================================
-- MODIFICAR: interviews - Añadir author_id
-- ============================================
-- Primero, eliminar las columnas author_name y author_email que agregamos temporalmente
ALTER TABLE interviews
  DROP COLUMN IF EXISTS author_name,
  DROP COLUMN IF EXISTS author_email;

-- Ahora agregar la relación con interview_authors
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES interview_authors(id) ON DELETE SET NULL;

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_interviews_author ON interviews(author_id);

-- Comentarios
COMMENT ON COLUMN interviews.author_id IS 'Autor/redactor que publicó la entrevista';

-- ============================================
-- TRIGGER: updated_at para interview_authors
-- ============================================
CREATE TRIGGER update_interview_authors_updated_at BEFORE UPDATE ON interview_authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN: Actualizar contador de entrevistas
-- ============================================
CREATE OR REPLACE FUNCTION update_author_interviews_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.author_id IS NOT NULL THEN
    UPDATE interview_authors
    SET interviews_count = interviews_count + 1
    WHERE id = NEW.author_id;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Si cambió el autor
    IF OLD.author_id IS DISTINCT FROM NEW.author_id THEN
      -- Decrementar contador del autor anterior
      IF OLD.author_id IS NOT NULL THEN
        UPDATE interview_authors
        SET interviews_count = interviews_count - 1
        WHERE id = OLD.author_id;
      END IF;
      -- Incrementar contador del nuevo autor
      IF NEW.author_id IS NOT NULL THEN
        UPDATE interview_authors
        SET interviews_count = interviews_count + 1
        WHERE id = NEW.author_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.author_id IS NOT NULL THEN
    UPDATE interview_authors
    SET interviews_count = interviews_count - 1
    WHERE id = OLD.author_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para actualizar contador
CREATE TRIGGER update_author_count_on_insert
AFTER INSERT ON interviews
FOR EACH ROW EXECUTE FUNCTION update_author_interviews_count();

CREATE TRIGGER update_author_count_on_update
AFTER UPDATE ON interviews
FOR EACH ROW EXECUTE FUNCTION update_author_interviews_count();

CREATE TRIGGER update_author_count_on_delete
AFTER DELETE ON interviews
FOR EACH ROW EXECUTE FUNCTION update_author_interviews_count();

-- ============================================
-- RLS (Row Level Security)
-- ============================================
ALTER TABLE interview_authors ENABLE ROW LEVEL SECURITY;

-- Políticas: Lectura pública para autores activos
CREATE POLICY "Public read active interview authors" ON interview_authors
  FOR SELECT USING (is_active = true);

-- Política: Admin full access
CREATE POLICY "Admin all on interview authors" ON interview_authors
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- DATOS INICIALES: Autores por defecto
-- ============================================
INSERT INTO interview_authors (
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
    'Redacción ETF Nexo',
    'redaccion-etf-nexo',
    'Redacción ETF Nexo',
    'Equipo editorial de ETF Nexo, especializado en análisis de fondos cotizados y mercados financieros.',
    ARRAY['ETFs', 'Análisis de Mercados', 'Educación Financiera'],
    'editor',
    'redaccion@etfnexo.com',
    '— Redacción ETF Nexo',
    true,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- ACTUALIZAR VISTA: interviews_with_metadata
-- ============================================
DROP VIEW IF EXISTS interviews_with_metadata;

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

  -- Campos de imagen y contenido
  i.featured_image_url,
  i.featured_image_alt,
  i.content,
  i.faq,

  -- Campo de noticias
  i.mostrar_en_noticias,

  -- Author data (nueva relación)
  i.author_id,
  a.name as author_name,
  a.slug as author_slug,
  a.display_name as author_display_name,
  a.avatar_url as author_avatar_url,
  a.email as author_email,
  a.signature as author_signature,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id
LEFT JOIN interview_authors a ON i.author_id = a.id;

-- Comentarios
COMMENT ON VIEW interviews_with_metadata IS 'Vista con datos completos de entrevistas incluyendo autor y categoría';

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON SCHEMA public IS 'ETF Nexo - Schema con sistema de autores de entrevistas (v1.0)';
