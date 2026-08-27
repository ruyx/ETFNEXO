-- ============================================
-- ETF Nexo - Add Pinned Articles Feature
-- ============================================
-- Fecha: 2026-08-27
-- Descripción: Agregar funcionalidad de artículos fijados
-- que aparecen siempre al inicio de los listados

-- ============================================
-- Agregar columna 'pinned' a news_articles
-- ============================================
ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

-- Agregar columna 'pinned_at' para ordenar artículos fijados
ALTER TABLE news_articles
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Índice compuesto para optimizar queries de listado
-- Los artículos fijados aparecen primero, ordenados por pinned_at DESC
-- Luego los no fijados ordenados por published_at DESC
CREATE INDEX IF NOT EXISTS idx_articles_pinned_published
ON news_articles(pinned DESC, pinned_at DESC NULLS LAST, published_at DESC)
WHERE status = 'published';

-- Comentarios
COMMENT ON COLUMN news_articles.pinned IS 'Artículo fijado en la parte superior del listado';
COMMENT ON COLUMN news_articles.pinned_at IS 'Fecha cuando se fijó el artículo (para ordenar múltiples fijados)';

-- ============================================
-- Agregar columna 'pinned' a academy_articles
-- ============================================
ALTER TABLE academy_articles
ADD COLUMN IF NOT EXISTS pinned BOOLEAN DEFAULT FALSE;

ALTER TABLE academy_articles
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Índice compuesto para academia
CREATE INDEX IF NOT EXISTS idx_academia_pinned_published
ON academy_articles(pinned DESC, pinned_at DESC NULLS LAST, published_at DESC)
WHERE status = 'published';

-- Comentarios
COMMENT ON COLUMN academy_articles.pinned IS 'Artículo fijado en la parte superior del listado';
COMMENT ON COLUMN academy_articles.pinned_at IS 'Fecha cuando se fijó el artículo (para ordenar múltiples fijados)';

-- ============================================
-- Función para actualizar pinned_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_pinned_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se está fijando un artículo (pinned cambia de FALSE a TRUE)
  IF NEW.pinned = TRUE AND (OLD.pinned IS NULL OR OLD.pinned = FALSE) THEN
    NEW.pinned_at = NOW();
  END IF;

  -- Si se está desfijando (pinned cambia de TRUE a FALSE)
  IF NEW.pinned = FALSE AND OLD.pinned = TRUE THEN
    NEW.pinned_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para news_articles
DROP TRIGGER IF EXISTS trigger_update_news_pinned_at ON news_articles;
CREATE TRIGGER trigger_update_news_pinned_at
  BEFORE UPDATE OF pinned ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_pinned_at();

-- Triggers para academy_articles
DROP TRIGGER IF EXISTS trigger_update_academia_pinned_at ON academy_articles;
CREATE TRIGGER trigger_update_academia_pinned_at
  BEFORE UPDATE OF pinned ON academy_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_pinned_at();

-- ============================================
-- Limitar cantidad de artículos fijados (constraint check)
-- ============================================
-- Nota: PostgreSQL no soporta CHECK con subqueries directamente
-- Usaremos una función trigger para validar el límite

CREATE OR REPLACE FUNCTION validate_pinned_limit()
RETURNS TRIGGER AS $$
DECLARE
  pinned_count INTEGER;
  max_pinned INTEGER := 3; -- Máximo 3 artículos fijados por sección
BEGIN
  -- Solo validar si se está intentando fijar un artículo
  IF NEW.pinned = TRUE THEN
    -- Contar artículos fijados (excluyendo el actual)
    SELECT COUNT(*) INTO pinned_count
    FROM news_articles
    WHERE pinned = TRUE
      AND id != NEW.id
      AND status = 'published';

    IF pinned_count >= max_pinned THEN
      RAISE EXCEPTION 'No se pueden fijar más de % artículos. Desfija uno primero.', max_pinned;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar límite en news_articles
DROP TRIGGER IF EXISTS trigger_validate_news_pinned_limit ON news_articles;
CREATE TRIGGER trigger_validate_news_pinned_limit
  BEFORE INSERT OR UPDATE OF pinned ON news_articles
  FOR EACH ROW
  WHEN (NEW.pinned = TRUE)
  EXECUTE FUNCTION validate_pinned_limit();

-- Función similar para academia (puede tener límite diferente si se requiere)
CREATE OR REPLACE FUNCTION validate_academia_pinned_limit()
RETURNS TRIGGER AS $$
DECLARE
  pinned_count INTEGER;
  max_pinned INTEGER := 3;
BEGIN
  IF NEW.pinned = TRUE THEN
    SELECT COUNT(*) INTO pinned_count
    FROM academy_articles
    WHERE pinned = TRUE
      AND id != NEW.id
      AND status = 'published';

    IF pinned_count >= max_pinned THEN
      RAISE EXCEPTION 'No se pueden fijar más de % artículos de academia. Desfija uno primero.', max_pinned;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar límite en academy_articles
DROP TRIGGER IF EXISTS trigger_validate_academia_pinned_limit ON academy_articles;
CREATE TRIGGER trigger_validate_academia_pinned_limit
  BEFORE INSERT OR UPDATE OF pinned ON academy_articles
  FOR EACH ROW
  WHEN (NEW.pinned = TRUE)
  EXECUTE FUNCTION validate_academia_pinned_limit();
