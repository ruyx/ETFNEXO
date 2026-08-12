-- ============================================
-- Deshabilitar Cron Job Obsoleto de RSS
-- ============================================
-- Fecha: 2026-07-07
-- Razón: Google Sheets es la ÚNICA fuente de noticias (regla de oro)
-- Este script desactiva el cron job de RSS que ya no se usa
-- ============================================

-- Verificar estado actual
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
ORDER BY jobname;

-- Deshabilitar cron job de RSS (obsoleto)
UPDATE cron.job
SET active = false
WHERE jobname = 'fetch-news-every-6-hours';

-- Verificar que se desactivó correctamente
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'fetch-news-every-6-hours';

-- ============================================
-- Estado final esperado:
-- ============================================
-- ACTIVOS (active = true):
--   ✅ import-gsheets-daily (10:00 UTC diario)
--   ✅ auto-publish-news-every-12-hours (cada 12h)
--
-- DESHABILITADOS (active = false):
--   ❌ fetch-news-every-6-hours (obsoleto, Edge Function no existe)
-- ============================================
