-- ============================================
-- PRUEBA: Ejecutar Cron Job en 3 Minutos
-- ============================================
-- Hora actual UTC: 07:38
-- Hora programada: 07:42 (en ~4 minutos)
-- Fecha: 7 julio 2026
-- ============================================

-- Paso 1: Eliminar el cron job actual
SELECT cron.unschedule('import-gsheets-daily');

-- Paso 2: Crear cron job temporal para AHORA (07:42 UTC)
-- IMPORTANTE: Este cron se ejecutará SOLO HOY a las 07:42 UTC
SELECT cron.schedule(
  'import-gsheets-TEST',           -- Nombre temporal
  '42 7 7 7 *',                    -- Minuto 42, Hora 7, Día 7, Mes 7, Cualquier día semana
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

-- ============================================
-- Resultado esperado:
-- ============================================
-- jobid | jobname              | schedule    | active | command
-- ------|----------------------|-------------|--------|----------------------------------
-- XX    | import-gsheets-TEST  | 42 7 7 7 *  | t      | SELECT public.import_gsheets_cron();
-- ============================================

-- ============================================
-- DESPUÉS DE VERIFICAR (en 5 minutos):
-- ============================================
-- 1. Ejecutar: docs/VERIFICAR_EJECUCION_CRON.sql
-- 2. Si funciona: Ejecutar docs/RESTAURAR_CRON_DEFINITIVO.sql
-- ============================================
