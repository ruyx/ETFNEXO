# 🚀 Pasos para Implementar el Sistema Blindado

**Objetivo:** Sistema 100% automático que importa del Google Sheet diariamente a las 06:00 UTC

---

## 📋 Resumen de lo que ya se hizo

✅ **Eliminados 77 artículos RSS** (incluyendo "Goldman Sachs" de Expansión)
✅ **Documentación completa creada**
✅ **SQL del sistema blindado generado**
✅ **Scripts de verificación listos**

---

## 🎯 Pasos Pendientes (Ejecutar en orden)

### PASO 1: Habilitar Extensión pg_net 🔌

**Dashboard → Database → Extensions**

URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/database/extensions

1. Buscar: "pg_net"
2. Click en "Enable"
3. Esperar confirmación ✅

---

### PASO 2: Configurar Service Role Key 🔑

**Dashboard → SQL Editor**

URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

**Primero, obtener la key:**
1. Dashboard → Settings → API
2. Copiar `service_role` (secret key) - Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ...`

**Luego, ejecutar este SQL** (reemplazar `TU_SERVICE_KEY` con la key copiada):

```sql
-- Configurar service_role_key para que la función pueda llamar a la Edge Function
ALTER DATABASE postgres
SET app.settings.service_role_key = 'TU_SERVICE_KEY_AQUI';
```

**Verificar:**
```sql
-- Debe retornar la key configurada
SELECT current_setting('app.settings.service_role_key', true);
```

---

### PASO 3: Desplegar Edge Function import-gsheets-news 🚀

**Opción A - Desde Dashboard (Más fácil):**

1. Ir a: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions
2. Click "Deploy a new function"
3. Nombre: `import-gsheets-news`
4. Copiar código desde: `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`
5. Click "Deploy"

**Opción B - Desde CLI (Si tienes permisos de Owner):**

```bash
cd /home/suario/ruy
supabase functions deploy import-gsheets-news
```

**Verificar deployment:**
```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_KEY]"

# Debe retornar algo como:
# {"success":true,"results":{...}}
```

---

### PASO 4: Ejecutar SQL del Sistema Blindado 🛡️

**Dashboard → SQL Editor**

URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

**Copiar y ejecutar TODO el contenido de:**
`/home/suario/ruy/docs/SISTEMA_BLINDADO_GOOGLE_SHEETS.sql`

O ejecutar este SQL simplificado:

```sql
-- ============================================
-- SISTEMA BLINDADO - VERSIÓN RÁPIDA
-- ============================================

-- 1. Deshabilitar fetch-news
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours') THEN
    PERFORM cron.unschedule('fetch-news-every-6-hours');
  END IF;
END $$;

-- 2. Crear función wrapper
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_request_id bigint;
BEGIN
  SELECT net.http_post(
    url := 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) INTO v_request_id;

  INSERT INTO public.cron_logs (job_name, status, message, executed_at)
  VALUES ('import-gsheets', 'success',
          'Import triggered (request: ' || v_request_id || ')', now());
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.cron_logs (job_name, status, error_message, executed_at)
    VALUES ('import-gsheets', 'error', SQLERRM, now());
    RAISE;
END;
$$;

-- 3. Programar cron diario a las 06:00 UTC
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'import-gsheets-daily') THEN
    PERFORM cron.unschedule('import-gsheets-daily');
  END IF;
END $$;

SELECT cron.schedule(
  'import-gsheets-daily',
  '0 6 * * *',
  'SELECT public.import_gsheets_cron();'
);

-- 4. Verificar instalación
SELECT
  jobname,
  schedule,
  CASE
    WHEN jobname = 'import-gsheets-daily' THEN '✅ CORRECTO'
    WHEN jobname = 'fetch-news-every-6-hours' THEN '❌ ERROR (debe estar desactivado)'
    ELSE '⚙️ OTRO'
  END as estado,
  active
FROM cron.job
ORDER BY jobname;
```

**Resultado esperado:**
```
jobname                | schedule     | estado        | active
-----------------------|--------------|---------------|-------
import-gsheets-daily   | 0 6 * * *    | ✅ CORRECTO  | true
```

**NO debe aparecer:**
- `fetch-news-every-6-hours`

---

### PASO 5: Probar el Sistema 🧪

**Ejecutar importación manual:**

```sql
-- Ejecutar la función manualmente para probar
SELECT public.import_gsheets_cron();

-- Ver resultado en logs
SELECT
  executed_at,
  status,
  message,
  error_message
FROM cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 1;
```

**Resultado esperado:**
```
executed_at          | status  | message                          | error_message
---------------------|---------|----------------------------------|---------------
2026-06-24 18:30:00  | success | Import triggered (request: 123)  | NULL
```

---

### PASO 6: Verificar Artículos Importados 📰

```sql
-- Ver artículos publicados por fuente
SELECT
  CASE
    WHEN source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia')
    THEN '❌ RSS'
    ELSE '✅ Google Sheets'
  END as tipo_fuente,
  COUNT(*) as total
FROM news_articles
WHERE status = 'published'
GROUP BY tipo_fuente;
```

**Resultado esperado:**
```
tipo_fuente      | total
-----------------|-------
✅ Google Sheets | 10-50
❌ RSS           | 0
```

---

## ✅ Checklist de Verificación Final

Después de ejecutar todos los pasos:

- [ ] **Extensión pg_net habilitada**
  - Verificar en: Database → Extensions → pg_net (verde)

- [ ] **Service role key configurada**
  ```sql
  SELECT current_setting('app.settings.service_role_key', true);
  -- Debe retornar la key
  ```

- [ ] **Edge Function desplegada**
  ```bash
  curl -X POST .../import-gsheets-news -H "Authorization: Bearer [KEY]"
  # Debe retornar JSON de éxito
  ```

- [ ] **Cron job programado**
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'import-gsheets-daily';
  -- Debe retornar 1 fila con active=true
  ```

- [ ] **Cron fetch-news desactivado**
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'fetch-news-every-6-hours';
  -- Debe retornar 0 filas
  ```

- [ ] **Sin artículos RSS**
  ```sql
  SELECT COUNT(*) FROM news_articles
  WHERE source_name IN ('Expansión', 'Finect', 'Rankia', 'Funds Society')
    AND status = 'published';
  -- Debe retornar 0
  ```

- [ ] **Prueba manual exitosa**
  ```sql
  SELECT public.import_gsheets_cron();
  -- Debe ejecutarse sin error
  ```

- [ ] **Verificar en la web**
  - Ir a: https://etfnexo.com/noticias
  - NO debe aparecer "Goldman Sachs" ni artículos de Expansión/Finect/Rankia
  - SOLO artículos de tu Google Sheet

---

## 🎉 Resultado Final

Una vez completados todos los pasos:

```
🛡️ SISTEMA BLINDADO ACTIVO

✅ Automático: Importa diariamente a las 06:00 UTC
✅ Protegido: fetch-news RSS desactivado
✅ Verificado: Solo artículos del Google Sheet
✅ Monitoreado: Logs automáticos en cron_logs

📊 Próxima ejecución: Mañana a las 06:00 UTC
🌐 Web: Solo noticias del Google Sheet
🚫 RSS: 0% (bloqueado permanentemente)
```

---

## 🔧 Comandos Útiles Post-Implementación

### Forzar importación inmediata
```sql
SELECT public.import_gsheets_cron();
```

### Ver últimos logs
```sql
SELECT * FROM cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 10;
```

### Ver cron jobs activos
```sql
SELECT jobname, schedule, active FROM cron.job;
```

### Contar artículos por fuente
```sql
SELECT
  source_name,
  COUNT(*) as total
FROM news_articles
WHERE status = 'published'
GROUP BY source_name
ORDER BY total DESC;
```

---

## 🆘 Si Algo Sale Mal

### Error en PASO 2 (Service Key)
- Asegúrate de copiar la key completa (empieza con `eyJ...`)
- La key debe ir entre comillas simples en el SQL
- Debe ser la `service_role` key (secret), NO la `anon` key

### Error en PASO 3 (Edge Function)
- Verificar que el archivo existe: `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`
- Si usas CLI, verificar permisos con: `supabase projects list`

### Error en PASO 4 (SQL)
- Verificar que pg_net está habilitada primero
- Verificar que service_role_key está configurada
- Ejecutar cada sección del SQL por separado si hay error

### Error en PASO 5 (Prueba manual)
- Ver el error_message en cron_logs
- Verificar logs de la Edge Function en Dashboard → Functions → import-gsheets-news → Logs

---

**¿Necesitas ayuda?** Revisa `docs/GUIA_SISTEMA_BLINDADO.md` para troubleshooting detallado.

**Última actualización:** 24 de junio de 2026, 18:35 UTC
**Por:** Claude Code - Instrucciones de Implementación
