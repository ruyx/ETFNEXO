# 🔧 Configurar Cron Job para Importación Automática de Google Sheets

**Fecha**: 2026-07-01
**Estado**: ✅ Edge Function desplegada, ✅ Cron Job CONFIGURADO Y ACTIVO

---

## 📋 Resumen

Este documento explica cómo configurar el **cron job automático** para importar noticias desde Google Sheets cada día a las 06:00 UTC.

### ✅ Estado Actual
- ✅ Edge Function `import-gsheets-news` **desplegada y funcionando**
- ✅ Script manual funciona correctamente
- ✅ Cron job **CONFIGURADO Y ACTIVO** en Supabase (ejecución diaria 06:00 UTC)

---

## 🚀 Método Correcto (2026): SQL Editor

En 2026, Supabase usa **pg_cron** que se configura mediante SQL, no hay una UI específica de "Cron" en el dashboard.

### Paso 1: Ir al SQL Editor

**URL correcta**: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new

O navegar manualmente:
1. Abre https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
2. Click en **"SQL Editor"** en el menú lateral izquierdo
3. Click en **"New query"**

### Paso 2: Copiar y Ejecutar el Script SQL

Copia y pega el siguiente SQL completo en el editor:

```sql
-- ============================================
-- ETF Nexo - Configurar Cron Job para Google Sheets Import
-- ============================================
-- Fecha: 2026-07-01
-- Descripción: Configurar importación automática diaria desde Google Sheets
-- ============================================

-- 1. Verificar que pg_cron está habilitado
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Eliminar cualquier cron job anterior de import-gsheets
SELECT cron.unschedule('import-gsheets-daily')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'import-gsheets-daily'
);

-- 3. Crear/Actualizar función que llama a la Edge Function
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url text := 'https://utvioubcqkwwzvufhups.supabase.co';
  v_function_url text;
  v_service_key text;
  v_request_id bigint;
BEGIN
  v_function_url := v_supabase_url || '/functions/v1/import-gsheets-news';

  -- Obtener service_role_key desde configuración
  -- Nota: Debe estar configurado en app.settings.service_role_key
  v_service_key := current_setting('app.settings.service_role_key', true);

  -- Llamar a Edge Function usando pg_net
  SELECT INTO v_request_id
    net.http_post(
      url := v_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 120000  -- 2 minutos timeout
    );

  -- Log de éxito
  INSERT INTO public.cron_logs (job_name, status, message, executed_at)
  VALUES ('import-gsheets', 'success', 'Google Sheets import triggered', NOW());

  RAISE NOTICE 'Google Sheets import cron job executed successfully';

EXCEPTION
  WHEN OTHERS THEN
    -- Log de error
    INSERT INTO public.cron_logs (job_name, status, error_message, executed_at)
    VALUES ('import-gsheets', 'error', SQLERRM, NOW());

    RAISE NOTICE 'Error in import-gsheets cron: %', SQLERRM;
END;
$$;

-- 4. Programar cron job para ejecutarse diariamente a las 06:00 UTC
SELECT cron.schedule(
  'import-gsheets-daily',    -- Nombre del job
  '0 6 * * *',               -- Cron expression: diario a las 06:00 UTC
  'SELECT public.import_gsheets_cron();'
);

-- 5. Verificar que el job fue creado
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

### Paso 3: Click en "Run" o presiona `Ctrl+Enter`

Deberías ver en los resultados:
```
jobid | jobname               | schedule    | active | command
------|----------------------|-------------|--------|--------------------------------
1     | import-gsheets-daily | 0 6 * * *   | true   | SELECT public.import_gsheets_cron();
```

---

## ✅ Verificación

### 1. Verificar que el cron job existe

Ejecuta en SQL Editor:
```sql
SELECT jobname, schedule, active, command
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

**Resultado esperado**: 1 fila mostrando el job activo

### 2. Probar manualmente (sin esperar al horario)

Ejecuta en SQL Editor:
```sql
SELECT public.import_gsheets_cron();
```

Debería ejecutarse sin errores y luego verificar:
```sql
SELECT * FROM public.cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 5;
```

### 3. Ver historial de ejecuciones de pg_cron

```sql
SELECT
  jobid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'import-gsheets-daily')
ORDER BY start_time DESC
LIMIT 10;
```

---

## 🛠️ Gestión del Cron Job

### Deshabilitar temporalmente
```sql
UPDATE cron.job
SET active = false
WHERE jobname = 'import-gsheets-daily';
```

### Reactivar
```sql
UPDATE cron.job
SET active = true
WHERE jobname = 'import-gsheets-daily';
```

### Eliminar completamente
```sql
SELECT cron.unschedule('import-gsheets-daily');
```

### Cambiar horario
```sql
-- Eliminar el job actual
SELECT cron.unschedule('import-gsheets-daily');

-- Crear con nuevo horario (ejemplo: cada 12 horas)
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 */12 * * *',
  'SELECT public.import_gsheets_cron();'
);
```

---

## 🔍 Troubleshooting

### "ERROR: extension pg_cron does not exist"

Supabase habilita pg_cron por defecto, pero si aparece este error:
1. Ve a Dashboard → Database → Extensions
2. Busca "pg_cron"
3. Click en "Enable"

### "ERROR: setting app.settings.service_role_key is not set"

El service_role_key debe configurarse en Supabase. Alternativa temporal:

```sql
-- Reemplazar en la función, línea del v_service_key:
v_service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c';
```

⚠️ **Esto hardcodea la key en la función. Para producción, usar Supabase Vault.**

### Ver logs de errores
```sql
SELECT *
FROM public.cron_logs
WHERE status = 'error'
ORDER BY executed_at DESC
LIMIT 10;
```

---

## 🔄 Alternativa: Ejecución Manual

Si prefieres **NO configurar el cron automático** y ejecutar manualmente cuando necesites actualizar:

### Opción A: Desde la terminal local
```bash
cd /home/suario/ruy
curl -X POST "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c"
```

### Opción B: Script local con variables de entorno
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/import-google-sheet-with-scraping.ts
```

---

## 📊 Resultado Esperado

Una vez configurado correctamente:

- ✅ Cada día a las **06:00 UTC**, el sistema importará automáticamente
- ✅ Solo se importan artículos **nuevos** (no duplicados)
- ✅ Logs disponibles en `cron_logs` y `cron.job_run_details`
- ✅ Puedes ejecutar manualmente en cualquier momento con `SELECT public.import_gsheets_cron();`

---

## 📚 Referencias

- [Supabase pg_cron Documentation](https://supabase.com/docs/guides/database/extensions/pg_cron)
- [pg_cron GitHub](https://github.com/citusdata/pg_cron)
- Script SQL completo: `/tmp/setup_cron_import_gsheets.sql` (local)

---

**Última actualización**: 2026-07-01
**Estado**: Edge Function desplegada ✅ | Cron Job ACTIVO ✅ | Encoding UTF-8 corregido ✅
