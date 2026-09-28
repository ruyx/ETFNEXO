-- =====================================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- =====================================================
-- Dashboard: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/editor
-- Ubicación: SQL Editor > New Query > Copiar y pegar este script > Run

-- Función para loguear cambios en contenido publicado
CREATE OR REPLACE FUNCTION notify_sitemap_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo notificar si el artículo/entrevista pasa a estado 'published'
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN

    -- Log para debugging (visible en Logs)
    RAISE NOTICE 'Sitemap update: table=%, slug=%', TG_TABLE_NAME, NEW.slug;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para news_articles
DROP TRIGGER IF EXISTS news_articles_sitemap_ping ON news_articles;
CREATE TRIGGER news_articles_sitemap_ping
  AFTER INSERT OR UPDATE ON news_articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_sitemap_update();

-- Trigger para academy_articles
DROP TRIGGER IF EXISTS academy_articles_sitemap_ping ON academy_articles;
CREATE TRIGGER academy_articles_sitemap_ping
  AFTER INSERT OR UPDATE ON academy_articles
  FOR EACH ROW
  EXECUTE FUNCTION notify_sitemap_update();

-- Trigger para interviews
DROP TRIGGER IF EXISTS interviews_sitemap_ping ON interviews;
CREATE TRIGGER interviews_sitemap_ping
  AFTER INSERT OR UPDATE ON interviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_sitemap_update();

-- Verificación
SELECT 'Triggers creados exitosamente!' as status;
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name LIKE '%sitemap_ping'
ORDER BY event_object_table;
