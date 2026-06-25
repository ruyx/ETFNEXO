# 🛡️ Sistema Blindado de Noticias - Solo Google Sheets

**Fecha:** 24 de junio de 2026
**Estado:** 📋 Listo para implementar
**Objetivo:** Importación automática diaria desde Google Sheet, 100% protegido contra RSS

---

## 🎯 Concepto del Sistema Blindado

### Características
- ✅ **Automático:** Importa del Google Sheet diariamente a las 06:00 UTC
- ✅ **Blindado:** fetch-news RSS permanentemente desactivado
- ✅ **Protegido:** Solo artículos del Google Sheet pueden publicarse
- ✅ **Monitoreado:** Logs automáticos de todas las ejecuciones
- ✅ **Verificable:** Funciones SQL para auditar el sistema

### Flujo Automático

```
📅 Todos los días a las 06:00 UTC
   ↓
🔄 Cron job ejecuta import_gsheets_cron()
   ↓
📡 Función llama a Edge Function import-gsheets-news
   ↓
📊 Edge Function lee Google Sheet CSV
   ↓
✅ Importa y publica artículos nuevos
   ↓
📝 Registra resultado en cron_logs
   ↓
🌐 Artículos aparecen en etfnexo.com/noticias
```

---

## 📋 Prerequisitos

Antes de implementar el sistema, verificar:

### 1. Edge Function Desplegada ✅

**Verificar:**
```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

**Si retorna 404:**
Desplegar la función primero:
- Dashboard → Functions → Deploy new function
- Nombre: `import-gsheets-news`
- Código: `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`

### 2. Extensión pg_net Habilitada ✅

**Verificar en Dashboard:**
- Database → Extensions
- Buscar "pg_net"
- Estado: Enabled (verde)

**Si no está habilitada:**
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 3. Service Role Key Configurada ✅

**Obtener Service Role Key:**
- Dashboard → Settings → API
- Copiar `service_role` (secret key)

**Configurar en PostgreSQL:**
```sql
-- Ejecutar en SQL Editor (reemplazar con tu key real)
ALTER DATABASE postgres
SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 🚀 Implementación del Sistema Blindado

### Opción A: Ejecutar SQL Completo (Recomendado)

1. **Ir a SQL Editor:**
   - URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

2. **Copiar y ejecutar:**
   - Archivo: `/home/suario/ruy/docs/SISTEMA_BLINDADO_GOOGLE_SHEETS.sql`
   - O usar migración: `/home/suario/ruy/supabase/migrations/20260624181500_sistema_blindado_google_sheets.sql`

3. **Verificar resultado:**
   - Debe mostrar tabla de cron jobs
   - `import-gsheets-daily` debe aparecer como ✅ CORRECTO
   - `fetch-news-every-6-hours` NO debe existir

### Opción B: Paso a Paso Manual

#### Paso 1: Deshabilitar fetch-news

```sql
-- Eliminar cron de RSS
SELECT cron.unschedule('fetch-news-every-6-hours')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours'
);

-- Marcar como desactivado
COMMENT ON FUNCTION public.fetch_news_cron() IS
  '🚫 DESACTIVADO PERMANENTEMENTE - Solo Google Sheets';
```

#### Paso 2: Crear función wrapper

```sql
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id bigint;
  v_function_url text;
BEGIN
  v_function_url := 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news';

  SELECT net.http_post(
    url := v_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  INSERT INTO public.cron_logs (job_name, status, message, executed_at)
  VALUES ('import-gsheets', 'success',
          'Google Sheets import triggered (request_id: ' || v_request_id || ')',
          now());
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.cron_logs (job_name, status, message, error_message, executed_at)
    VALUES ('import-gsheets', 'error', 'Error calling Edge Function', SQLERRM, now());
    RAISE;
END;
$$;
```

#### Paso 3: Programar cron job diario

```sql
-- Programar para 06:00 UTC todos los días
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 6 * * *',
  'SELECT public.import_gsheets_cron();'
);
```

#### Paso 4: Verificar instalación

```sql
-- Ver cron jobs activos
SELECT jobname, schedule, active, command
FROM cron.job
ORDER BY jobname;

-- Debe mostrar:
-- import-gsheets-daily | 0 6 * * * | true | SELECT public.import_gsheets_cron();
```

---

## 🔍 Verificación y Monitoreo

### Verificar Estado del Sistema

```sql
-- Ver cron jobs
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname IN ('import-gsheets-daily', 'fetch-news-every-6-hours');

-- Resultado esperado:
-- ✅ import-gsheets-daily     | 0 6 * * *      | true
-- ❌ fetch-news-every-6-hours | NO DEBE EXISTIR
```

### Ver Logs de Ejecución

```sql
-- Últimos 10 logs de import-gsheets
SELECT
  executed_at,
  status,
  message,
  error_message
FROM cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 10;
```

### Ver Estadísticas de Noticias

```sql
-- Contar artículos por fuente
SELECT
  CASE
    WHEN source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
    THEN '❌ RSS (No deseado)'
    WHEN source_name IS NULL OR source_name NOT IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
    THEN '✅ Google Sheets'
    ELSE 'Otros'
  END as fuente_tipo,
  COUNT(*) as total
FROM news_articles
WHERE status = 'published'
GROUP BY fuente_tipo;

-- Resultado esperado:
-- ✅ Google Sheets | ~20-50 (según tu sheet)
-- ❌ RSS          | 0
```

### Ejecutar Importación Manual (Para Probar)

```sql
-- Ejecutar la función manualmente
SELECT public.import_gsheets_cron();

-- Verificar resultado en logs
SELECT * FROM cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 1;
```

---

## 📅 Horario de Ejecución

### Importación Google Sheets
```
Cron: import-gsheets-daily
Horario: 06:00 UTC (todos los días)
Próxima ejecución: Mañana a las 06:00 UTC
```

### Auto-Publish (Opcional)
```
Cron: auto-publish-news-every-12-hours
Horario: 00:00, 12:00 UTC
Nota: Probablemente no haga nada porque import-gsheets
      ya publica directamente (status='published')
```

---

## 🚫 Protecciones del Sistema Blindado

### 1. Cron fetch-news Desactivado
- ✅ No se ejecuta automáticamente
- ✅ Función marcada como DESACTIVADA en comentarios
- ✅ Si alguien intenta reactivarlo, los comentarios advierten

### 2. Validación de Fuentes
- ✅ Solo artículos del Google Sheet se importan
- ✅ RSS sources están bloqueadas
- ✅ Filtro anti-crypto activo

### 3. Monitoreo Continuo
- ✅ Logs automáticos de cada ejecución
- ✅ Registro de errores si algo falla
- ✅ Funciones SQL de verificación disponibles

---

## 🔧 Mantenimiento y Actualización

### Actualizar Noticias Manualmente

Si necesitas forzar una actualización antes de las 06:00 UTC:

```sql
SELECT public.import_gsheets_cron();
```

O via curl:
```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_KEY]"
```

### Cambiar Horario de Ejecución

Si quieres cambiar de 06:00 UTC a otro horario:

```sql
-- Eliminar cron actual
SELECT cron.unschedule('import-gsheets-daily');

-- Crear con nuevo horario (ejemplo: 12:00 UTC)
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 12 * * *',  -- 12:00 UTC
  'SELECT public.import_gsheets_cron();'
);
```

### Ejecutar Múltiples Veces al Día

Si quieres importar varias veces al día:

```sql
-- Opción 1: Cada 6 horas
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 */6 * * *',  -- 00:00, 06:00, 12:00, 18:00 UTC
  'SELECT public.import_gsheets_cron();'
);

-- Opción 2: Cada 12 horas
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 */12 * * *',  -- 00:00, 12:00 UTC
  'SELECT public.import_gsheets_cron();'
);
```

---

## 🆘 Troubleshooting

### Error: "function net.http_post does not exist"

**Solución:** Habilitar extensión pg_net

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Error: "unrecognized configuration parameter app.settings.service_role_key"

**Solución:** Configurar service_role_key

```sql
ALTER DATABASE postgres
SET app.settings.service_role_key = 'eyJhbGciOiJIUzI1NiIs...';
```

### Error: Edge Function retorna 404

**Solución:** Desplegar import-gsheets-news

1. Dashboard → Functions → Deploy
2. Nombre: `import-gsheets-news`
3. Código: copiar desde `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`

### No aparecen artículos nuevos después de 24 horas

**Diagnóstico:**

```sql
-- 1. Verificar que el cron está activo
SELECT * FROM cron.job WHERE jobname = 'import-gsheets-daily';

-- 2. Ver logs de errores
SELECT * FROM cron_logs
WHERE job_name = 'import-gsheets'
  AND status = 'error'
ORDER BY executed_at DESC
LIMIT 5;

-- 3. Probar ejecución manual
SELECT public.import_gsheets_cron();
```

---

## 📊 Métricas Esperadas

### Ejecuciones
```
Por día: 1 importación (06:00 UTC)
Por semana: 7 importaciones
Por mes: ~30 importaciones
```

### Noticias Importadas
```
Por día: 0-10 artículos nuevos (según actualices el Google Sheet)
Por semana: 0-50 artículos
Por mes: 0-200 artículos
```

### Fuentes
```
RSS: 0% (SIEMPRE)
Google Sheets: 100% (SIEMPRE)
```

---

## ✅ Checklist de Implementación

### Prerequisitos
- [ ] Edge Function `import-gsheets-news` desplegada
- [ ] Extensión `pg_net` habilitada
- [ ] Service Role Key configurada en PostgreSQL
- [ ] Artículos RSS eliminados (77 eliminados ✅)

### Implementación
- [ ] SQL ejecutado en Supabase Dashboard
- [ ] Cron `import-gsheets-daily` programado
- [ ] Cron `fetch-news-every-6-hours` desactivado
- [ ] Función `import_gsheets_cron()` creada

### Verificación
- [ ] Cron job aparece en `cron.job` tabla
- [ ] Sin artículos RSS en `news_articles`
- [ ] Ejecución manual funciona correctamente
- [ ] Logs registran ejecuciones exitosas

---

## 🎉 Resultado Final

Una vez implementado:

```
🛡️ SISTEMA BLINDADO ACTIVO

✅ Importación automática: 06:00 UTC diario
✅ Fuente única: Google Sheets CSV
✅ RSS bloqueado: fetch-news desactivado
✅ Monitoreo activo: Logs automáticos
✅ Verificable: Funciones SQL de auditoría

📊 Estadísticas:
   - Artículos RSS: 0 (protegido)
   - Artículos Google Sheet: 100%
   - Ejecuciones: 1 por día automática
   - Intervención manual: 0 (100% automático)
```

---

**Próximo paso:** Ejecutar SQL en Supabase Dashboard

**Actualizado:** 24 de junio de 2026, 18:30 UTC
**Por:** Claude Code - Sistema Blindado
