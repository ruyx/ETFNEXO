-- =====================================================
-- Migration: Create Interviews System
-- Description: Tablas para gestionar entrevistas en video
-- Author: ETF Nexo
-- Date: 2026-08-28
-- =====================================================

-- 1. Crear tabla interview_categories
-- =====================================================
CREATE TABLE IF NOT EXISTS interview_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color_hex VARCHAR(7) DEFAULT '#FA8029',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para interview_categories
CREATE INDEX idx_interview_categories_slug ON interview_categories(slug);

-- Trigger para updated_at en interview_categories
CREATE TRIGGER update_interview_categories_updated_at
  BEFORE UPDATE ON interview_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Crear tabla interviews
-- =====================================================
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  youtube_video_id VARCHAR(50) NOT NULL,
  category_id UUID REFERENCES interview_categories(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0,
  key_points JSONB DEFAULT '[]'::jsonb,

  -- SEO fields
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para interviews
CREATE INDEX idx_interviews_slug ON interviews(slug);
CREATE INDEX idx_interviews_status ON interviews(status);
CREATE INDEX idx_interviews_category_id ON interviews(category_id);
CREATE INDEX idx_interviews_published_at ON interviews(published_at DESC);
CREATE INDEX idx_interviews_youtube_video_id ON interviews(youtube_video_id);
CREATE INDEX idx_interviews_key_points ON interviews USING GIN (key_points);

-- Trigger para updated_at en interviews
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Crear vista interviews_with_metadata
-- =====================================================
CREATE OR REPLACE VIEW interviews_with_metadata AS
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

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;

-- 4. Row Level Security (RLS)
-- =====================================================

-- Habilitar RLS en interview_categories
ALTER TABLE interview_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Public read para categorías
CREATE POLICY "interview_categories_public_read"
  ON interview_categories
  FOR SELECT
  USING (true);

-- Policy: Admin full access para categorías
CREATE POLICY "interview_categories_admin_all"
  ON interview_categories
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Habilitar RLS en interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policy: Public read solo published
CREATE POLICY "interviews_public_read"
  ON interviews
  FOR SELECT
  USING (status = 'published');

-- Policy: Admin full access
CREATE POLICY "interviews_admin_all"
  ON interviews
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Insertar categorías por defecto
-- =====================================================
INSERT INTO interview_categories (name, slug, color_hex, description) VALUES
  ('Gestión de Fondos', 'gestion-de-fondos', '#FA8029', 'Entrevistas con gestores de fondos y ETFs'),
  ('Análisis de Mercado', 'analisis-de-mercado', '#34B257', 'Expertos analizando tendencias del mercado'),
  ('Educación Financiera', 'educacion-financiera', '#3B82F6', 'Entrevistas educativas sobre inversión'),
  ('Estrategias de Inversión', 'estrategias-de-inversion', '#8B5CF6', 'Diferentes estrategias y enfoques de inversión'),
  ('Noticias y Actualidad', 'noticias-y-actualidad', '#EF4444', 'Entrevistas sobre noticias financieras actuales')
ON CONFLICT (slug) DO NOTHING;

-- 6. Comentarios para documentación
-- =====================================================
COMMENT ON TABLE interview_categories IS 'Categorías para organizar entrevistas';
COMMENT ON TABLE interviews IS 'Entrevistas en formato video de YouTube';
COMMENT ON COLUMN interviews.youtube_video_id IS 'ID del video de YouTube (extraído de la URL)';
COMMENT ON COLUMN interviews.key_points IS 'Array JSON con puntos clave de la entrevista (Resumen Exprés)';
COMMENT ON VIEW interviews_with_metadata IS 'Vista optimizada con datos de categoría para queries públicas';
