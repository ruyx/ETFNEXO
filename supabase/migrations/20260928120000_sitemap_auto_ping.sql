-- =====================================================
-- SITEMAP AUTO-PING - Notificar a Google/Bing cuando se publique contenido
-- =====================================================
-- Fecha: 2026-09-28
-- Propósito: Actualizar automáticamente Google Search Console cuando hay contenido nuevo

-- Función para hacer ping a nuestro API endpoint
CREATE OR REPLACE FUNCTION notify_sitemap_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo notificar si el artículo/entrevista pasa a estado 'published'
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN

    -- Log para debugging
    RAISE NOTICE 'Sitemap update triggered for table: %, slug: %', TG_TABLE_NAME, NEW.slug;

    -- Aquí NO podemos hacer HTTP request directamente desde Postgres
    -- En su lugar, usaremos Supabase Edge Functions o un CRON job
    -- Por ahora solo logueamos el evento

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

-- =====================================================
-- NOTA: Para completar la integración automática:
-- =====================================================
--
-- OPCIÓN 1: Supabase Edge Function (Recomendado)
-- Crear una Edge Function que escuche los triggers y llame a /api/sitemap-ping
--
-- OPCIÓN 2: CRON Job
-- Configurar un cron que ejecute el ping cada hora:
-- SELECT cron.schedule('sitemap-ping-hourly', '0 * * * *', $$
--   SELECT net.http_post(
--     url := 'https://etfnexo.com/api/sitemap-ping',
--     headers := '{"Content-Type": "application/json"}',
--     body := '{"secretKey": "YOUR_SECRET_KEY"}'
--   );
-- $$);
--
-- OPCIÓN 3: Webhook desde Admin (Manual)
-- Llamar a https://etfnexo.com/api/sitemap-ping?secret=YOUR_SECRET
-- después de publicar contenido desde el panel admin
--
-- =====================================================

COMMENT ON FUNCTION notify_sitemap_update() IS 'Notifica cuando se publica contenido nuevo para actualizar sitemaps en Google/Bing';
