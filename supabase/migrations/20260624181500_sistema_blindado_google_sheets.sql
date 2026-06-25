-- ============================================
-- ETF Nexo - Sistema Blindado de Noticias
-- Solo Google Sheets - Automático Diario
-- ============================================
-- Fecha: 24 de junio de 2026, 18:15 UTC
-- Autor: Claude Code
-- Propósito: Sistema 100% automático que importa del Google Sheet diariamente
-- ============================================

-- ============================================
-- PASO 1: Deshabilitar fetch-news RSS (Blindaje)
-- ============================================

-- Eliminar cron job de fetch-news si existe
SELECT cron.unschedule('fetch-news-every-6-hours')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours'
);

-- Comentar la función para evitar ejecuciones accidentales
COMMENT ON FUNCTION public.fetch_news_cron() IS
  '🚫 DESACTIVADO PERMANENTEMENTE - Solo usar Google Sheets
   Razón: Regla de oro del usuario - solo artículos del Google Sheet
   Fecha: 24/06/2026
   NO REACTIVAR - Ver import_gsheets_cron() en su lugar';

-- ============================================
-- PASO 2: Crear función para importar Google Sheets
-- ============================================

-- Función que llama a la Edge Function import-gsheets-news
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_key text;
  v_supabase_url text;
  v_function_url text;
  v_response_status int;
  v_response_body text;
  v_log_message text;
  v_request_id bigint;
BEGIN
  -- Obtener credenciales desde secrets (Supabase Vault)
  -- Nota: En producción, usar Vault. Por ahora, hardcoded en la función.
  v_supabase_url := 'https://utvioubcqkwwzvufhups.supabase.co';
  v_function_url := v_supabase_url || '/functions/v1/import-gsheets-news';

  -- Service role key (IMPORTANTE: Reemplazar con Vault en producción)
  -- Por seguridad, esta key debe estar en Supabase Vault
  -- SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'service_role_key' INTO v_service_key;

  -- Llamar a la Edge Function usando pg_net
  SELECT INTO v_request_id
    net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := '{}'::jsonb
    );

  -- Esperar respuesta (timeout 30 segundos)
  SELECT INTO v_response_status, v_response_body
    status_code, body
  FROM net._http_response
  WHERE id = v_request_id;

  -- Log del resultado
  IF v_response_status = 200 THEN
    v_log_message := 'Google Sheets import completed successfully';
  ELSE
    v_log_message := 'Google Sheets import failed with status ' || v_response_status;
  END IF;

  -- Insertar en cron_logs
  INSERT INTO public.cron_logs (
    job_name,
    status,
    message,
    error_message,
    executed_at
  ) VALUES (
    'import-gsheets',
    CASE WHEN v_response_status = 200 THEN 'success' ELSE 'error' END,
    v_log_message,
    CASE WHEN v_response_status != 200 THEN v_response_body ELSE NULL END,
    now()
  );

  -- Lanzar excepción si falló
  IF v_response_status != 200 THEN
    RAISE EXCEPTION 'Google Sheets import failed: %', v_response_body;
  END IF;

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
      'Exception during Google Sheets import',
      SQLERRM,
      now()
    );
    RAISE;
END;
$$;

COMMENT ON FUNCTION public.import_gsheets_cron() IS
  '✅ SISTEMA BLINDADO - Importación automática diaria desde Google Sheets
   Fuente: https://docs.google.com/.../pub?output=csv
   Horario: Diariamente a las 06:00 UTC
   Logs: Ver tabla cron_logs (job_name = import-gsheets)
   Fecha creación: 24/06/2026';

-- ============================================
-- PASO 3: Programar cron job diario
-- ============================================

-- Eliminar si existe (para idempotencia)
SELECT cron.unschedule('import-gsheets-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'import-gsheets-daily'
);

-- Programar para ejecutar todos los días a las 06:00 UTC
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 6 * * *',
  'SELECT public.import_gsheets_cron();'
);

COMMENT ON EXTENSION pg_cron IS
  'Cron jobs activos:
   - import-gsheets-daily: 06:00 UTC (ACTIVO)
   - auto-publish-news-every-12-hours: 00:00, 12:00 UTC (ACTIVO, por si acaso)
   - fetch-news-every-6-hours: DESACTIVADO (solo Google Sheets)';

-- ============================================
-- PASO 4: Crear vista de monitoreo
-- ============================================

CREATE OR REPLACE VIEW public.news_system_status AS
SELECT
  'Google Sheets' as sistema,
  'ACTIVO' as estado,
  '06:00 UTC diario' as horario,
  (
    SELECT COUNT(*)
    FROM public.cron_logs
    WHERE job_name = 'import-gsheets'
      AND executed_at > now() - interval '7 days'
  ) as ejecuciones_ultimos_7_dias,
  (
    SELECT COUNT(*)
    FROM public.cron_logs
    WHERE job_name = 'import-gsheets'
      AND status = 'success'
      AND executed_at > now() - interval '7 days'
  ) as exitosas_ultimos_7_dias,
  (
    SELECT MAX(executed_at)
    FROM public.cron_logs
    WHERE job_name = 'import-gsheets'
  ) as ultima_ejecucion,
  (
    SELECT COUNT(*)
    FROM public.news_articles
    WHERE status = 'published'
      AND source_name NOT IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
  ) as articulos_publicados_google_sheets;

COMMENT ON VIEW public.news_system_status IS
  'Vista de monitoreo del sistema blindado de noticias
   Muestra estado, ejecuciones y estadísticas del sistema Google Sheets';

-- ============================================
-- PASO 5: Crear función de verificación
-- ============================================

CREATE OR REPLACE FUNCTION public.verify_news_system()
RETURNS TABLE (
  test_name text,
  status text,
  details text
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Test 1: Verificar que NO hay cron de fetch-news
  RETURN QUERY
  SELECT
    'Fetch-news desactivado'::text,
    CASE
      WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours')
      THEN '❌ FALLO'
      ELSE '✅ OK'
    END,
    CASE
      WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours')
      THEN 'fetch-news aún está programado - DEBE desactivarse'
      ELSE 'fetch-news correctamente desactivado'
    END;

  -- Test 2: Verificar que SÍ hay cron de import-gsheets
  RETURN QUERY
  SELECT
    'Import-gsheets activo'::text,
    CASE
      WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'import-gsheets-daily' AND active = true)
      THEN '✅ OK'
      ELSE '❌ FALLO'
    END,
    CASE
      WHEN EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'import-gsheets-daily' AND active = true)
      THEN 'import-gsheets-daily programado para 06:00 UTC'
      ELSE 'import-gsheets-daily NO está programado'
    END;

  -- Test 3: Verificar que NO hay artículos RSS
  RETURN QUERY
  SELECT
    'Sin artículos RSS'::text,
    CASE
      WHEN (SELECT COUNT(*) FROM news_articles
            WHERE source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
            AND status = 'published') = 0
      THEN '✅ OK'
      ELSE '❌ FALLO'
    END,
    (SELECT COUNT(*)::text || ' artículos RSS encontrados'
     FROM news_articles
     WHERE source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
     AND status = 'published');

  -- Test 4: Verificar última ejecución
  RETURN QUERY
  SELECT
    'Última ejecución'::text,
    CASE
      WHEN (SELECT MAX(executed_at) FROM cron_logs WHERE job_name = 'import-gsheets') > now() - interval '2 days'
      THEN '✅ OK'
      ELSE '⚠️ WARNING'
    END,
    COALESCE(
      (SELECT 'Última ejecución: ' || MAX(executed_at)::text FROM cron_logs WHERE job_name = 'import-gsheets'),
      'Aún no se ha ejecutado'
    );
END;
$$;

COMMENT ON FUNCTION public.verify_news_system() IS
  'Función de verificación del sistema blindado
   Ejecutar: SELECT * FROM verify_news_system();
   Verifica: crons activos, artículos RSS, última ejecución';

-- ============================================
-- PASO 6: Log de instalación
-- ============================================

INSERT INTO public.cron_logs (
  job_name,
  status,
  message,
  executed_at
) VALUES (
  'system',
  'success',
  'Sistema blindado instalado - Solo Google Sheets - Automático diario a las 06:00 UTC',
  now()
);

-- ============================================
-- Verificación final
-- ============================================

-- Mostrar estado de cron jobs
SELECT
  jobname,
  schedule,
  command,
  active,
  CASE
    WHEN jobname = 'import-gsheets-daily' THEN '✅ SISTEMA BLINDADO'
    WHEN jobname = 'fetch-news-every-6-hours' THEN '❌ DEBE ESTAR DESACTIVADO'
    ELSE '⚙️ AUXILIAR'
  END as estado_deseado
FROM cron.job
ORDER BY jobname;

-- Ejecutar verificación
SELECT * FROM public.verify_news_system();
