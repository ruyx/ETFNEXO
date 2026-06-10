# Automatización - Configuración de Cron Jobs

## Resumen

Guía paso a paso para configurar la automatización completa de ETF Nexo:
1. **Noticias:** Scraping automático cada 6 horas + publicación automática cada 12 horas
2. **Rankings:** Actualización automática al consultar API (sin configuración necesaria)

## Prerequisitos

- Acceso a Supabase Dashboard como Owner/Admin
- Permisos para habilitar extensiones en Supabase
- Migración `20260610000001_setup_cron_jobs.sql` aplicada

## Paso 1: Aplicar Migración SQL

### Opción A: Via Supabase CLI (Recomendado)

```bash
# Cargar password desde .env.local
DB_PASSWORD=$(grep SUPABASE_DB_PASSWORD .env.local | cut -d= -f2)

# Aplicar migración
SUPABASE_DB_PASSWORD="${DB_PASSWORD}" \
  ./bin/supabase-etf db push --linked

# Verificar que migración se aplicó
SUPABASE_DB_PASSWORD="${DB_PASSWORD}" \
  ./bin/supabase-etf db query \
  --sql "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%cron%';" \
  --linked
```

**Resultado esperado:**
```
     routine_name
----------------------
 fetch_news_cron
 auto_publish_news_cron
 cleanup_old_cron_logs
```

### Opción B: Via Supabase Dashboard

1. Ir a **Supabase Dashboard** → tu proyecto
2. Navegar a **SQL Editor**
3. Copiar contenido de `supabase/migrations/20260610000001_setup_cron_jobs.sql`
4. Ejecutar (botón "Run")
5. Verificar que no hay errores

## Paso 2: Habilitar Extensiones Necesarias

### Habilitar `pg_cron`

1. Ir a **Supabase Dashboard** → **Database** → **Extensions**
2. Buscar "pg_cron"
3. Click en **Enable** (Toggle verde)
4. Esperar confirmación (~30 segundos)

### Habilitar `pg_net` (para llamadas HTTP)

1. Misma pantalla: **Database** → **Extensions**
2. Buscar "pg_net"
3. Click en **Enable**

**Verificar extensiones:**
```sql
SELECT * FROM pg_extension
WHERE extname IN ('pg_cron', 'pg_net');
```

## Paso 3: Configurar Service Role Key en BD

Para que `fetch_news_cron()` pueda llamar a Edge Function, necesitamos guardar el SERVICE_ROLE_KEY de forma segura.

### Opción A: Usar Supabase Vault (Recomendado para producción)

```sql
-- Habilitar extensión vault
CREATE EXTENSION IF NOT EXISTS vault;

-- Guardar service_role_key en vault
INSERT INTO vault.secrets (name, secret)
VALUES (
  'service_role_key',
  'YOUR_SERVICE_ROLE_KEY_HERE'  -- Reemplazar con key real
);

-- Actualizar función para usar vault
CREATE OR REPLACE FUNCTION public.fetch_news_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  service_key TEXT;
BEGIN
  -- Obtener key desde vault
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  -- Llamar a Edge Function
  PERFORM
    net.http_post(
      url := 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || service_key,
        'Content-Type', 'application/json'
      ),
      timeout_milliseconds := 180000
    );
END;
$$;
```

### Opción B: Configurar en Base de Datos (Temporal/Testing)

```sql
-- Crear configuración de app
ALTER DATABASE postgres SET app.settings.service_role_key TO 'YOUR_SERVICE_ROLE_KEY_HERE';

-- Verificar
SHOW app.settings.service_role_key;
```

**⚠️ Importante:** No commitear el service_role_key en git. Usar Vault en producción.

## Paso 4: Programar Cron Jobs

Ir a **Supabase Dashboard** → **SQL Editor** y ejecutar:

### Job 1: Fetch-News (Cada 6 horas)

```sql
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);
```

**Horario de ejecución:**
- 00:00 (medianoche)
- 06:00
- 12:00
- 18:00

### Job 2: Auto-Publish (Cada 12 horas)

```sql
SELECT cron.schedule(
  'auto-publish-news-every-12-hours',
  '0 */12 * * *',
  'SELECT public.auto_publish_news_cron();'
);
```

**Horario de ejecución:**
- 00:00 (medianoche)
- 12:00 (mediodía)

### Job 3: Cleanup Logs (Mensual)

```sql
SELECT cron.schedule(
  'cleanup-cron-logs-monthly',
  '0 0 1 * *',
  'SELECT public.cleanup_old_cron_logs();'
);
```

**Horario:** Día 1 de cada mes a medianoche

### Verificar Jobs Programados

```sql
-- Ver todos los jobs
SELECT * FROM cron.job ORDER BY schedule;

-- Ver historial de ejecuciones
SELECT * FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 20;
```

**Resultado esperado:**
```
        jobid | jobname                          | schedule     | command
-------------+----------------------------------+--------------+--------------------------------------
 1234567890 | fetch-news-every-6-hours         | 0 */6 * * *  | SELECT public.fetch_news_cron();
 1234567891 | auto-publish-news-every-12-hours | 0 */12 * * * | SELECT public.auto_publish_news_cron();
 1234567892 | cleanup-cron-logs-monthly        | 0 0 1 * *    | SELECT public.cleanup_old_cron_logs();
```

## Paso 5: Test Manual de Funciones

Antes de esperar 6 horas, probar manualmente:

### Test Fetch-News

```sql
-- Ejecutar scraper manualmente
SELECT public.fetch_news_cron();

-- Ver log de ejecución
SELECT *
FROM public.cron_logs
WHERE job_name = 'fetch-news'
ORDER BY executed_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
job_name   | status  | message | executed_at
-----------+---------+---------+-------------------------
fetch-news | success | NULL    | 2026-06-10 14:30:00+00
```

### Test Auto-Publish

```sql
-- Ejecutar auto-publish manualmente
SELECT public.auto_publish_news_cron();

-- Ver cuántos artículos se publicaron
SELECT *
FROM public.cron_logs
WHERE job_name = 'auto-publish-news'
ORDER BY executed_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
job_name         | status  | message            | executed_at
-----------------+---------+--------------------+-------------------------
auto-publish-news| success | Published 5 articles| 2026-06-10 14:32:00+00
```

### Verificar Noticias Publicadas

```sql
-- Ver noticias publicadas recientemente
SELECT
  title,
  status,
  published_at,
  LENGTH(content) as content_length
FROM news_articles
WHERE status = 'published'
  AND published_at > NOW() - INTERVAL '1 hour'
ORDER BY published_at DESC;
```

## Paso 6: Monitoreo de Cron Jobs

### Vista de Estado General

```sql
-- Ver resumen de últimos 7 días
SELECT * FROM public.cron_jobs_status;
```

**Resultado esperado:**
```
job_name         | total_success | total_errors | last_success        | last_error | last_run
-----------------+---------------+--------------+---------------------+------------+---------------------
fetch-news       | 28            | 0            | 2026-06-10 12:00:00 | NULL       | 2026-06-10 12:00:00
auto-publish-news| 14            | 0            | 2026-06-10 12:00:00 | NULL       | 2026-06-10 12:00:00
```

### Ver Logs Detallados

```sql
-- Últimos 20 logs de todos los jobs
SELECT
  job_name,
  status,
  message,
  error_message,
  executed_at
FROM public.cron_logs
ORDER BY executed_at DESC
LIMIT 20;
```

### Alertas de Errores

```sql
-- Ver solo errores de las últimas 24 horas
SELECT *
FROM public.cron_logs
WHERE status = 'error'
  AND executed_at > NOW() - INTERVAL '24 hours'
ORDER BY executed_at DESC;
```

## Paso 7: Desactivar/Modificar Cron Jobs

### Desactivar un Job Temporalmente

```sql
-- Desactivar fetch-news
SELECT cron.unschedule('fetch-news-every-6-hours');

-- Verificar que se eliminó
SELECT * FROM cron.job WHERE jobname = 'fetch-news-every-6-hours';
```

### Modificar Frecuencia

```sql
-- Cambiar a cada 3 horas (más frecuente)
SELECT cron.unschedule('fetch-news-every-6-hours');
SELECT cron.schedule(
  'fetch-news-every-3-hours',
  '0 */3 * * *',
  'SELECT public.fetch_news_cron();'
);
```

### Re-activar Job

```sql
-- Volver a programar
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);
```

## Troubleshooting

### Error: "extension pg_cron is not available"

**Solución:**
1. Ir a **Dashboard** → **Database** → **Extensions**
2. Habilitar "pg_cron"
3. Esperar 1 minuto
4. Reintentar comandos de `cron.schedule`

### Error: "permission denied for schema cron"

**Solución:**
- Ejecutar comandos `cron.schedule` en **Supabase SQL Editor** (Dashboard)
- NO funciona desde CLI local (requiere permisos SUPERUSER)

### Error: "relation vault.secrets does not exist"

**Solución:**
```sql
-- Habilitar vault
CREATE EXTENSION IF NOT EXISTS vault;
```

### Cron Job no se ejecuta

**Checklist:**
1. ¿El job está programado? → `SELECT * FROM cron.job;`
2. ¿Hay errores en historial? → `SELECT * FROM cron.job_run_details;`
3. ¿La función funciona manualmente? → `SELECT public.fetch_news_cron();`
4. ¿Hay logs de error? → `SELECT * FROM cron_logs WHERE status = 'error';`

### Edge Function no responde

**Solución:**
```bash
# Verificar que Edge Function está deployed
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)

curl -X POST \
  "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json"
```

Si funciona manualmente pero no desde cron:
1. Verificar que service_role_key está configurado en BD
2. Verificar extensión pg_net habilitada

### Timeout en Edge Function

**Solución:**
```sql
-- Aumentar timeout a 5 minutos
CREATE OR REPLACE FUNCTION public.fetch_news_cron()
...
PERFORM net.http_post(
  url := ...,
  headers := ...,
  timeout_milliseconds := 300000  -- 5 minutos
);
```

## Backup y Restore de Cron Jobs

### Exportar Configuración

```sql
-- Guardar jobs programados
SELECT
  jobname,
  schedule,
  command
FROM cron.job
ORDER BY jobname;

-- Copiar output y guardar en archivo jobs_backup.sql
```

### Restaurar Configuración

```sql
-- Eliminar jobs existentes
SELECT cron.unschedule(jobname)
FROM cron.job;

-- Re-crear desde backup
SELECT cron.schedule('fetch-news-every-6-hours', '0 */6 * * *', 'SELECT public.fetch_news_cron();');
-- ... repetir para cada job
```

## Checklist de Configuración Completa

- [ ] Migración `20260610000001_setup_cron_jobs.sql` aplicada
- [ ] Extensión `pg_cron` habilitada
- [ ] Extensión `pg_net` habilitada
- [ ] Service Role Key configurado en BD o Vault
- [ ] Job `fetch-news-every-6-hours` programado
- [ ] Job `auto-publish-news-every-12-hours` programado
- [ ] Job `cleanup-cron-logs-monthly` programado
- [ ] Test manual de `fetch_news_cron()` exitoso
- [ ] Test manual de `auto_publish_news_cron()` exitoso
- [ ] Ver `cron_jobs_status` sin errores
- [ ] Monitoreo configurado (opcional: alertas por email/Slack)

## Monitoreo Adicional (Opcional)

### Configurar Alertas por Email

```sql
-- Función para enviar email si hay errores
CREATE OR REPLACE FUNCTION notify_cron_errors()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status = 'error' THEN
    -- Usar Supabase Edge Function para enviar email
    PERFORM net.http_post(
      url := 'https://your-project.supabase.co/functions/v1/send-alert-email',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'job_name', NEW.job_name,
        'error', NEW.error_message,
        'timestamp', NEW.executed_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger en cron_logs
CREATE TRIGGER on_cron_error
  AFTER INSERT ON public.cron_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_cron_errors();
```

### Dashboard de Monitoreo (Metabase/Redash)

Queries útiles:

```sql
-- Success rate últimas 24h
SELECT
  job_name,
  COUNT(*) FILTER (WHERE status = 'success')::float /
    NULLIF(COUNT(*), 0) * 100 as success_rate
FROM cron_logs
WHERE executed_at > NOW() - INTERVAL '24 hours'
GROUP BY job_name;

-- Duración promedio (si se captura)
SELECT
  job_name,
  AVG(EXTRACT(EPOCH FROM (finished_at - executed_at))) as avg_duration_seconds
FROM cron_logs
WHERE finished_at IS NOT NULL
GROUP BY job_name;
```

## Referencias

- Supabase pg_cron docs: https://supabase.com/docs/guides/database/extensions/pg_cron
- pg_cron GitHub: https://github.com/citusdata/pg_cron
- Cron expression builder: https://crontab.guru/

## Contacto y Soporte

- Supabase Dashboard: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- SQL Editor: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql
- Extensions: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/database/extensions
