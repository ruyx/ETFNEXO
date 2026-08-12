-- ============================================
-- Restaurar Cron Job Definitivo
-- ============================================
-- Ejecutar SOLO SI la prueba funcionó correctamente
-- Este script configura el horario definitivo de producción
-- ============================================

-- Paso 1: Eliminar el cron de prueba
SELECT cron.unschedule('import-gsheets-TEST');

-- Paso 2: Deshabilitar cron obsoleto de RSS (si aún está activo)
UPDATE cron.job
SET active = false
WHERE jobname = 'fetch-news-every-6-hours';

-- Paso 3: Crear cron job definitivo
-- Se ejecuta DIARIAMENTE a las 10:00 UTC
SELECT cron.schedule(
  'import-gsheets-daily',          -- Nombre definitivo
  '0 10 * * *',                    -- Diario a las 10:00 UTC
  'SELECT public.import_gsheets_cron();'
);

-- Paso 4: Verificar configuración final
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
ORDER BY jobname;

-- ============================================
-- Resultado esperado:
-- ============================================
-- ACTIVOS (active = true):
--   ✅ auto-publish-news-every-12-hours | 0 */12 * * *
--   ✅ cleanup-cron-logs-monthly        | 0 0 1 * *
--   ✅ import-gsheets-daily             | 0 10 * * *
--
-- DESHABILITADOS (active = false):
--   ❌ fetch-news-every-6-hours         | 0 */6 * * *
-- ============================================

-- ============================================
-- Configuración Final de Producción
-- ============================================
-- 1. Import Google Sheets: 10:00 UTC diario
-- 2. Auto-publish: 00:00 y 12:00 UTC (cada 12h)
-- 3. Cleanup logs: 1 del mes a las 00:00 UTC
-- ============================================
