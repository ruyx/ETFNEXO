-- ============================================
-- ETF Nexo - Sistema Blindado Google Sheets
-- Importación Automática Diaria
-- ============================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql
-- ============================================

-- ============================================
-- PARTE 1: DESHABILITAR FETCH-NEWS (BLINDAJE)
-- ============================================

-- Eliminar cron job de fetch-news si existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours') THEN
    PERFORM cron.unschedule('fetch-news-every-6-hours');
    RAISE NOTICE '✅ Cron fetch-news-every-6-hours desactivado';
  ELSE
    RAISE NOTICE 'ℹ️  Cron fetch-news-every-6-hours ya estaba desactivado';
  END IF;
END $$;

-- Marcar función como desactivada
COMMENT ON FUNCTION public.fetch_news_cron() IS
  '🚫 DESACTIVADO PERMANENTEMENTE
   Razón: Solo usar Google Sheets (Regla de Oro)
   Fecha: 24/06/2026
   NO REACTIVAR - Ver sistema blindado Google Sheets';

-- ============================================
-- PARTE 2: FUNCIÓN WRAPPER PARA IMPORT-GSHEETS
-- ============================================

-- Esta función será llamada por el cron job
-- Llama a la Edge Function import-gsheets-news usando pg_net
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id bigint;
  v_response record;
  v_function_url text;
BEGIN
  -- URL de la Edge Function
  v_function_url := 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news';

  -- Llamar a la Edge Function usando pg_net (extensión HTTP de Supabase)
  SELECT net.http_post(
    url := v_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  -- Registrar en logs
  INSERT INTO public.cron_logs (
    job_name,
    status,
    message,
    executed_at
  ) VALUES (
    'import-gsheets',
    'success',
    'Google Sheets import triggered (request_id: ' || v_request_id || ')',
    now()
  );

EXCEPTION
  WHEN OTHERS THEN
    -- Log de error
    INSERT INTO public.cron_logs (
      job_name,
      status,
      message,
      error_message,
      executed_at
    ) VALUES (
      'import-gsheets',
      'error',
      'Error calling import-gsheets Edge Function',
      SQLERRM,
      now()
    );
    RAISE;
END;
$$;

COMMENT ON FUNCTION public.import_gsheets_cron() IS
  '✅ Sistema Blindado - Importación automática Google Sheets
   Horario: 06:00 UTC diario
   Fuente: Google Sheets CSV
   Logs: tabla cron_logs (job_name = import-gsheets)';

-- ============================================
-- PARTE 3: PROGRAMAR CRON JOB DIARIO
-- ============================================

-- Eliminar si existe (para poder re-ejecutar este script)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'import-gsheets-daily') THEN
    PERFORM cron.unschedule('import-gsheets-daily');
    RAISE NOTICE '⚠️  Cron import-gsheets-daily existente eliminado (se recreará)';
  END IF;
END $$;

-- Programar cron job para ejecutar diariamente a las 06:00 UTC
SELECT cron.schedule(
  'import-gsheets-daily',          -- Nombre del cron job
  '0 6 * * *',                      -- Horario: 06:00 UTC todos los días
  'SELECT public.import_gsheets_cron();'  -- Función a ejecutar
);

-- ============================================
-- PARTE 4: VERIFICACIÓN DEL SISTEMA
-- ============================================

-- Mostrar cron jobs activos
SELECT
  jobname,
  schedule,
  CASE
    WHEN jobname = 'import-gsheets-daily' THEN '✅ CORRECTO (Sistema Blindado)'
    WHEN jobname = 'fetch-news-every-6-hours' THEN '❌ ERROR (Debe estar desactivado)'
    WHEN jobname LIKE '%auto-publish%' THEN '⚙️ AUXILIAR (Puede mantenerse)'
    ELSE '❓ OTRO'
  END as estado,
  active,
  command
FROM cron.job
ORDER BY
  CASE
    WHEN jobname = 'import-gsheets-daily' THEN 1
    WHEN jobname LIKE '%fetch-news%' THEN 2
    ELSE 3
  END;

-- Verificar que NO hay artículos RSS
SELECT
  COUNT(*) as total_articulos_rss,
  CASE
    WHEN COUNT(*) = 0 THEN '✅ CORRECTO (Sin artículos RSS)'
    ELSE '❌ ERROR (' || COUNT(*) || ' artículos RSS encontrados)'
  END as estado
FROM news_articles
WHERE source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
  AND status = 'published';

-- Mostrar estadísticas de noticias
SELECT
  status,
  COUNT(*) as total,
  COUNT(CASE WHEN source_name IS NULL OR source_name NOT IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia') THEN 1 END) as google_sheets,
  COUNT(CASE WHEN source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia') THEN 1 END) as rss
FROM news_articles
GROUP BY status
ORDER BY
  CASE status
    WHEN 'published' THEN 1
    WHEN 'draft' THEN 2
    WHEN 'scheduled' THEN 3
    ELSE 4
  END;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================

/*
Cron Jobs:
✅ import-gsheets-daily     | 0 6 * * *      | active: true
⚙️ auto-publish-...         | 0 */12 * * *   | active: true (opcional)
❌ fetch-news-...           | NO DEBE EXISTIR

Artículos:
✅ total_articulos_rss: 0
✅ Noticias published: Solo del Google Sheet

Próxima ejecución:
🕐 Mañana a las 06:00 UTC (importación automática)
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================

/*
1. PREREQUISITO: Edge Function import-gsheets-news DEBE estar desplegada
   - Verificar en: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions
   - Si no está, desplegarla desde: /home/suario/ruy/supabase/functions/import-gsheets-news/

2. SERVICE ROLE KEY: Configurar en Supabase
   - Dashboard → Settings → API → service_role (secret)
   - Configurar con: ALTER DATABASE postgres SET app.settings.service_role_key = 'eyJ...';

3. EXTENSIÓN pg_net: Debe estar habilitada
   - Dashboard → Database → Extensions
   - Buscar "pg_net" → Enable

4. FUENTE DE DATOS:
   - Google Sheet CSV: https://docs.google.com/.../pub?output=csv
   - Solo artículos de esta fuente serán publicados

5. MONITOREO:
   - Ver logs: SELECT * FROM cron_logs WHERE job_name = 'import-gsheets' ORDER BY executed_at DESC LIMIT 10;
   - Ver crons: SELECT * FROM cron.job;
*/
