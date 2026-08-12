-- ============================================
-- Verificar que el Cron Job se Ejecutó
-- ============================================
-- Ejecutar DESPUÉS de las 07:43 UTC
-- ============================================

-- Ver ejecuciones de pg_cron
SELECT
  runid,
  jobid,
  jobname,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'import-gsheets-TEST')
ORDER BY start_time DESC
LIMIT 5;

-- Ver logs de nuestra aplicación
SELECT
  id,
  job_name,
  status,
  message,
  error_message,
  executed_at
FROM public.cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 5;

-- Ver últimas noticias creadas (debe haber nuevas después de 07:42)
SELECT
  id,
  title,
  status,
  created_at,
  published_at,
  LENGTH(content) as content_length,
  featured_image_url IS NOT NULL as has_image
FROM news_articles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- Resultado esperado:
-- ============================================
-- ✅ cron.job_run_details: status = 'succeeded'
-- ✅ public.cron_logs: status = 'success', message = 'Google Sheets import triggered'
-- ✅ news_articles: 1+ noticias nuevas con created_at > 07:42 UTC
-- ============================================
