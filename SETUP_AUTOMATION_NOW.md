# 🚀 Activar Automatización - ETF Nexo (5 MINUTOS)

## ✅ Completado Automáticamente

- ✅ Funciones de cron creadas:
  - `fetch_news_cron()`
  - `auto_publish_news_cron()`
  - `cleanup_old_cron_logs()`
- ✅ Tabla `cron_logs` para monitoreo
- ✅ Vista `cron_jobs_status` para dashboard

## 🎯 Pasos Finales (Manual en Dashboard - 5 minutos)

### Paso 1: Abrir Supabase Dashboard

**URL:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups

### Paso 2: Habilitar Extensiones (1 minuto)

1. Click en **Database** (menú izquierdo)
2. Click en **Extensions**
3. Buscar y habilitar:
   - ✅ `pg_cron` - Click en **Enable**
   - ✅ `pg_net` - Click en **Enable**
4. Esperar confirmación (~30 segundos)

### Paso 3: Configurar Service Role Key (1 minuto)

1. Click en **SQL Editor** (menú izquierdo)
2. Click en **New query**
3. Copiar y pegar este SQL:

```sql
ALTER DATABASE postgres
SET app.settings.service_role_key TO 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczOTgzNDk5MCwiZXhwIjoyMDU1NDEwOTkwfQ.UxEVcYBVVbdBpQdqcN4j7aKk1Q-XwUvACWZFf_PVfNM';
```

4. Click en **Run** (botón verde)
5. Verificar que salga "Success"

### Paso 4: Programar Cron Jobs (2 minutos)

En la misma ventana **SQL Editor**, ejecutar cada comando uno por uno:

#### Job 1: Fetch-News (Cada 6 horas)

```sql
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);
```

**Resultado esperado:** `{"schedule": "fetch-news-every-6-hours"}`

#### Job 2: Auto-Publish (Cada 12 horas)

```sql
SELECT cron.schedule(
  'auto-publish-news-every-12-hours',
  '0 */12 * * *',
  'SELECT public.auto_publish_news_cron();'
);
```

**Resultado esperado:** `{"schedule": "auto-publish-news-every-12-hours"}`

#### Job 3: Cleanup (Mensual)

```sql
SELECT cron.schedule(
  'cleanup-cron-logs-monthly',
  '0 0 1 * *',
  'SELECT public.cleanup_old_cron_logs();'
);
```

### Paso 5: Verificar Configuración (1 minuto)

Ejecutar en **SQL Editor**:

```sql
-- Ver jobs programados
SELECT jobname, schedule, command
FROM cron.job
ORDER BY jobname;
```

**Resultado esperado:**
```
jobname                          | schedule      | command
---------------------------------|---------------|----------------------------------
fetch-news-every-6-hours         | 0 */6 * * *   | SELECT public.fetch_news_cron();
auto-publish-news-every-12-hours | 0 */12 * * *  | SELECT public.auto_publish_news_cron();
cleanup-cron-logs-monthly        | 0 0 1 * *     | SELECT public.cleanup_old_cron_logs();
```

### Paso 6: Test Manual (Opcional - 2 minutos)

Probar manualmente las funciones:

```sql
-- Test fetch-news
SELECT public.fetch_news_cron();

-- Ver log
SELECT * FROM public.cron_logs
WHERE job_name = 'fetch-news'
ORDER BY executed_at DESC
LIMIT 1;
```

**Resultado esperado:** `status = 'success'`

## 📅 Horarios de Ejecución Automática

### Fetch-News (Scraping de noticias)
- **Frecuencia:** Cada 6 horas
- **Horarios:** 00:00, 06:00, 12:00, 18:00 (UTC)
- **Acción:** Scrape 8 fuentes RSS españolas
- **Resultado:** Nuevos artículos en `draft`

### Auto-Publish (Publicación automática)
- **Frecuencia:** Cada 12 horas
- **Horarios:** 00:00, 12:00 (UTC)
- **Acción:** Publica artículos en draft que cumplen:
  - Contenido > 1000 caracteres
  - Tienen imagen destacada
  - Son de las últimas 24 horas
- **Resultado:** Máximo 20 artículos publicados por batch

### Cleanup (Limpieza de logs)
- **Frecuencia:** Mensual
- **Horario:** Día 1 del mes a medianoche
- **Acción:** Elimina logs de cron > 30 días

## 🔍 Monitoreo

### Ver Estado General

```sql
SELECT * FROM public.cron_jobs_status;
```

### Ver Últimos Logs

```sql
SELECT
  job_name,
  status,
  message,
  error_message,
  executed_at
FROM public.cron_logs
ORDER BY executed_at DESC
LIMIT 10;
```

### Ver Solo Errores

```sql
SELECT * FROM public.cron_logs
WHERE status = 'error'
ORDER BY executed_at DESC;
```

## 🎉 Resultado Final

Una vez completados estos pasos, la plataforma estará **100% automatizada**:

✅ **Noticias actualizadas** cada 6 horas automáticamente
✅ **Publicación inteligente** de artículos de calidad cada 12 horas
✅ **Rankings dinámicos** calculados on-the-fly siempre actualizados
✅ **Monitoreo completo** de todos los jobs con logs
✅ **Limpieza automática** de logs antiguos

**La plataforma quedará VIVA y funcionando 24/7 sin intervención manual.**

## 🆘 Troubleshooting

### Error: "extension pg_cron not available"
**Solución:** Verificar que habilitaste `pg_cron` en Extensions

### Error: "permission denied for schema cron"
**Solución:** Ejecutar los comandos `cron.schedule` en SQL Editor del Dashboard (no CLI)

### Error: "current_setting app.settings.service_role_key not found"
**Solución:** Ejecutar Paso 3 correctamente en SQL Editor

### Los jobs no se ejecutan
**Checklist:**
1. ¿pg_cron habilitado? → Database → Extensions
2. ¿service_role_key configurado? → Ejecutar `SHOW app.settings.service_role_key;`
3. ¿Jobs programados? → `SELECT * FROM cron.job;`
4. ¿Edge Function funciona? → Test manual: `curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news -H "Authorization: Bearer SERVICE_KEY"`

## 📞 Soporte

- **Dashboard:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- **SQL Editor:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql
- **Extensions:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/database/extensions
- **Docs:** Ver `docs/AUTOMATION_SETUP.md` para detalles completos
