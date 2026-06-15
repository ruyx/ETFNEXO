-- =================================================================
-- Setup Cron Jobs for ETF Nexo
-- =================================================================
-- Autor: ETF Nexo Team
-- Fecha: 2026-06-10
-- Descripción: Configuración de jobs automáticos para:
--   1. Fetch-News: Scraping de noticias cada 6 horas
--   2. Auto-Publish: Publicación automática de noticias cada 12 horas
-- =================================================================

-- Habilitar extensión pg_cron (requiere permisos SUPERUSER en Supabase Dashboard)
-- Nota: Esto debe habilitarse manualmente en Supabase Dashboard → Database → Extensions
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============================================================
-- 1. Función para ejecutar Edge Function fetch-news
-- ============================================================

CREATE OR REPLACE FUNCTION public.fetch_news_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- Ejecuta con permisos del owner
SET search_path = public
AS $$
DECLARE
  service_key TEXT;
  supabase_url TEXT := 'https://utvioubcqkwwzvufhups.supabase.co';
BEGIN
  -- Obtener service_role_key desde vault o variable de entorno
  -- Nota: En producción, usar Supabase Vault para almacenar secrets
  -- service_key := vault.get_secret('service_role_key');

  -- Temporal: Log de ejecución
  RAISE NOTICE 'Executing fetch-news cron job at %', NOW();

  -- Llamar a Edge Function usando pg_net (extensión de Supabase)
  -- Requiere: CREATE EXTENSION IF NOT EXISTS pg_net;
  PERFORM
    net.http_post(
      url := supabase_url || '/functions/v1/fetch-news',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
        'Content-Type', 'application/json'
      ),
      timeout_milliseconds := 180000  -- 3 minutos timeout
    );

  -- Log de éxito
  INSERT INTO public.cron_logs (job_name, status, executed_at)
  VALUES ('fetch-news', 'success', NOW());

EXCEPTION
  WHEN OTHERS THEN
    -- Log de error
    INSERT INTO public.cron_logs (job_name, status, error_message, executed_at)
    VALUES ('fetch-news', 'error', SQLERRM, NOW());

    RAISE NOTICE 'Error in fetch-news cron: %', SQLERRM;
END;
$$;

-- ============================================================
-- 2. Función para auto-publicar noticias de calidad
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_publish_news_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  published_count INTEGER;
BEGIN
  -- Publicar noticias en draft que:
  -- 1. Tienen contenido > 1000 caracteres (calidad mínima)
  -- 2. Tienen imagen destacada
  -- 3. Son de las últimas 24 horas

  UPDATE news_articles
  SET
    status = 'published',
    published_at = source_published_at
  WHERE id IN (
    SELECT id
    FROM news_articles
    WHERE status = 'draft'
      AND LENGTH(content) > 1000
      AND featured_image_url IS NOT NULL
      AND source_published_at > NOW() - INTERVAL '24 hours'
    ORDER BY source_published_at DESC
    LIMIT 20  -- Máximo 20 noticias por batch
  );

  GET DIAGNOSTICS published_count = ROW_COUNT;

  -- Log de éxito
  INSERT INTO public.cron_logs (job_name, status, message, executed_at)
  VALUES (
    'auto-publish-news',
    'success',
    'Published ' || published_count || ' articles',
    NOW()
  );

  RAISE NOTICE 'Auto-published % news articles', published_count;

EXCEPTION
  WHEN OTHERS THEN
    -- Log de error
    INSERT INTO public.cron_logs (job_name, status, error_message, executed_at)
    VALUES ('auto-publish-news', 'error', SQLERRM, NOW());

    RAISE NOTICE 'Error in auto-publish-news cron: %', SQLERRM;
END;
$$;

-- ============================================================
-- 3. Tabla de logs de cron jobs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'error', 'running')),
  message TEXT,
  error_message TEXT,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_cron_logs_job_date
  ON public.cron_logs(job_name, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_logs_status
  ON public.cron_logs(status, executed_at DESC);

-- ============================================================
-- 4. Configurar pg_cron jobs (MANUAL en Supabase Dashboard)
-- ============================================================

-- IMPORTANTE: Los siguientes comandos deben ejecutarse manualmente
-- en Supabase Dashboard → SQL Editor con permisos de SUPERUSER
--
-- Job 1: Fetch-News cada 6 horas
-- SELECT cron.schedule('fetch-news-every-6-hours', '0 */6 * * *', 'SELECT public.fetch_news_cron();');
--
-- Job 2: Auto-Publish cada 12 horas
-- SELECT cron.schedule('auto-publish-news-every-12-hours', '0 */12 * * *', 'SELECT public.auto_publish_news_cron();');
--
-- Ver jobs programados:
-- SELECT * FROM cron.job ORDER BY schedule;
--
-- Eliminar un job (si es necesario):
-- SELECT cron.unschedule('fetch-news-every-6-hours');
--
-- Ver historial de ejecuciones de pg_cron:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;

-- ============================================================
-- 5. Vista para monitorear cron jobs
-- ============================================================

CREATE OR REPLACE VIEW public.cron_jobs_status AS
SELECT
  job_name,
  COUNT(*) FILTER (WHERE status = 'success') as total_success,
  COUNT(*) FILTER (WHERE status = 'error') as total_errors,
  MAX(executed_at) FILTER (WHERE status = 'success') as last_success,
  MAX(executed_at) FILTER (WHERE status = 'error') as last_error,
  MAX(executed_at) as last_run
FROM public.cron_logs
WHERE executed_at > NOW() - INTERVAL '7 days'
GROUP BY job_name
ORDER BY last_run DESC;

-- ============================================================
-- 6. Función de cleanup de logs antiguos
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_cron_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Eliminar logs de más de 30 días
  DELETE FROM public.cron_logs
  WHERE created_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE NOTICE 'Deleted % old cron logs', deleted_count;
END;
$$;

-- Programar cleanup mensual (ejecutar manualmente en Dashboard)
-- SELECT cron.schedule('cleanup-cron-logs-monthly', '0 0 1 * *', 'SELECT public.cleanup_old_cron_logs();');

-- ============================================================
-- 7. Grants de permisos
-- ============================================================

-- Permitir que funciones accedan a tablas
GRANT SELECT, INSERT, UPDATE ON public.news_articles TO postgres;
GRANT SELECT, INSERT ON public.cron_logs TO postgres;
GRANT SELECT ON public.cron_jobs_status TO postgres;

-- ============================================================
-- 8. Comentarios de documentación
-- ============================================================

COMMENT ON FUNCTION public.fetch_news_cron() IS
  'Ejecuta Edge Function fetch-news para scrapear noticias automáticamente. Se ejecuta cada 6 horas via pg_cron.';

COMMENT ON FUNCTION public.auto_publish_news_cron() IS
  'Publica automáticamente noticias en draft que cumplen criterios de calidad (>1000 chars, imagen destacada, <24h). Se ejecuta cada 12 horas.';

COMMENT ON TABLE public.cron_logs IS
  'Registro de ejecuciones de cron jobs para monitoreo y debugging.';

COMMENT ON VIEW public.cron_jobs_status IS
  'Vista resumen del estado de cron jobs en los últimos 7 días.';

-- ============================================================
-- 9. Test manual de funciones (opcional)
-- ============================================================

-- Probar función fetch-news
-- SELECT public.fetch_news_cron();

-- Probar función auto-publish
-- SELECT public.auto_publish_news_cron();

-- Ver logs
-- SELECT * FROM public.cron_logs ORDER BY executed_at DESC LIMIT 10;

-- Ver estado de jobs
-- SELECT * FROM public.cron_jobs_status;
