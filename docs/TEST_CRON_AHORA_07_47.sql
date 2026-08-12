-- ============================================
-- PRUEBA: Ejecutar Cron Job a las 07:47 UTC
-- ============================================
-- Hora actual: 07:44 UTC
-- Hora programada: 07:47 UTC (en 3 minutos)
-- ============================================

-- Paso 1: Eliminar el cron de prueba anterior
SELECT cron.unschedule('import-gsheets-TEST');

-- Paso 2: Crear cron job para 07:47 UTC
SELECT cron.schedule(
  'import-gsheets-TEST',
  '47 7 7 7 *',
  'SELECT public.import_gsheets_cron();'
);

-- Paso 3: Verificar que se creó correctamente
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'import-gsheets-TEST';
