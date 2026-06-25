-- ============================================
-- Reactivar Sistema Automático de Noticias
-- ============================================
-- Fecha: 2026-06-24
-- Descripción: Reactivar el cron job de fetch-news que fue desactivado el 12/06
-- ============================================

-- Paso 1: Actualizar comentario de la función (marcarla como activa)
COMMENT ON FUNCTION public.fetch_news_cron() IS
  '[REACTIVADO 2026-06-24] Ejecuta Edge Function fetch-news para scrapear noticias automáticamente. Se ejecuta cada 6 horas via pg_cron.';

-- Paso 2: Programar cron job de fetch-news (cada 6 horas)
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);

-- Paso 3: Verificar que el job fue creado
SELECT
  jobname,
  schedule,
  command,
  active
FROM cron.job
WHERE jobname = 'fetch-news-every-6-hours';

-- Paso 4: Verificar todos los jobs activos
SELECT
  jobname,
  schedule,
  command,
  active
FROM cron.job
ORDER BY jobname;

-- Paso 5: Log de confirmación
INSERT INTO public.cron_logs (job_name, status, message, executed_at)
VALUES (
  'system-admin',
  'success',
  'Reactivado fetch-news-every-6-hours cron job',
  NOW()
);

-- ============================================
-- Resultado esperado:
-- ============================================
-- Job Name: fetch-news-every-6-hours
-- Schedule: 0 */6 * * * (cada 6 horas: 00:00, 06:00, 12:00, 18:00 UTC)
-- Command: SELECT public.fetch_news_cron();
-- Active: true
-- ============================================
