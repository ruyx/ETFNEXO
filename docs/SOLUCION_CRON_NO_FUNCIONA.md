# 🔧 Solución: Cron Job No Funciona Automáticamente

**Fecha**: 2026-07-02
**Problema**: La Edge Function `import-gsheets-news` funciona manualmente, pero el cron job automático no se ejecuta
**Estado Edge Function**: ✅ FUNCIONAL (importó 2 artículos nuevos manualmente)
**Estado Cron Job**: ❌ NO CONFIGURADO O INACTIVO

---

## 🔍 Diagnóstico

### ✅ Lo que SÍ funciona:
- Edge Function desplegada y operativa
- Importación manual funciona correctamente: `88 total, 2 importados, 83 omitidos, 3 errores`
- Google Sheet accesible
- Scraping de artículos funcional
- Encoding UTF-8 correcto

### ❌ Lo que NO funciona:
- Cron job automático no se ejecuta a las 06:00 UTC
- Función `import_gsheets_cron()` posiblemente no está creada o tiene errores
- Conexión directa a PostgreSQL falla con credenciales actuales

---

## 🚀 Solución: Configurar Cron Job en Supabase Dashboard

### Paso 1: Abrir SQL Editor en Supabase

**URL directa**: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new

O navegar manualmente:
1. Ve a https://supabase.com/dashboard
2. Selecciona el proyecto **utvioubcqkwwzvufhups**
3. Click en **"SQL Editor"** en el menú lateral
4. Click en **"New query"**

### Paso 2: Ejecutar el Script SQL Completo

Copia **TODO** el contenido del archivo `/tmp/configurar_cron_definitivo.sql` y pégalo en el SQL Editor.

El script completo está disponible en: `/tmp/configurar_cron_definitivo.sql`

**Qué hace este script:**
1. Habilita extensiones necesarias (`pg_cron`, `pg_net`, `http`)
2. Elimina cualquier cron job anterior con el mismo nombre
3. Crea la función `import_gsheets_cron()` con el service_role_key hardcoded (temporal)
4. Otorga permisos necesarios
5. Programa el cron job para ejecutarse diariamente a las 06:00 UTC
6. Crea la tabla `cron_logs` si no existe
7. Verifica que el job fue creado

### Paso 3: Verificar que se Creó Correctamente

Después de ejecutar el script, deberías ver en los resultados:

```
jobid | jobname               | schedule    | active | command
------|----------------------|-------------|--------|--------------------------------
1     | import-gsheets-daily | 0 6 * * *   | t      | SELECT public.import_gsheets_cron();
```

Si `active = t` (true), el cron está activo. ✅

---

## 🧪 Probar que Funciona

### Opción A: Ejecutar Manualmente la Función (Recomendado)

En SQL Editor:
```sql
SELECT public.import_gsheets_cron();
```

Esto debería ejecutarse sin errores y luego puedes verificar:

```sql
-- Ver logs de ejecución
SELECT * FROM public.cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 5;
```

### Opción B: Ejecutar la Edge Function Directamente (Alternativa)

Desde la terminal:
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
curl -X POST "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json"
```

**Output esperado**:
```json
{"total":88,"imported":2,"skipped":83,"errors":3}
```

---

## 📊 Monitoreo del Cron Job

### Ver Estado del Cron Job

```sql
SELECT jobname, schedule, active, command
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

### Ver Historial de Ejecuciones

```sql
-- Logs de la aplicación (nuestra tabla)
SELECT * FROM public.cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 10;

-- Logs internos de pg_cron
SELECT
  jobid,
  runid,
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

### Verificar Cuándo Será la Próxima Ejecución

El cron `0 6 * * *` significa:
- **Minuto**: 0
- **Hora**: 6 (06:00)
- **Día del mes**: Cualquiera
- **Mes**: Cualquiera
- **Día de la semana**: Cualquiera

**Próxima ejecución**: Mañana a las 06:00 UTC (07:00 CET en verano, 08:00 CET en invierno)

---

## 🛠️ Gestión del Cron Job

### Desactivar Temporalmente

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

### Cambiar Horario (Ejemplo: Cada 12 Horas)

```sql
-- Eliminar el job actual
SELECT cron.unschedule('import-gsheets-daily');

-- Crear con nuevo horario
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 */12 * * *',  -- Cada 12 horas
  'SELECT public.import_gsheets_cron();'
);
```

### Eliminar Completamente

```sql
SELECT cron.unschedule('import-gsheets-daily');
```

---

## 🔧 Troubleshooting

### "ERROR: extension pg_cron does not exist"

1. Ve a **Dashboard → Database → Extensions**
2. Busca **"pg_cron"**
3. Click en **"Enable"**
4. Ejecuta el script SQL nuevamente

### "ERROR: permission denied for schema cron"

El usuario necesita permisos. Ejecuta:
```sql
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA cron TO postgres;
```

### El cron no se ejecuta pero está activo

Verifica:
1. Que la extensión `pg_cron` esté habilitada
2. Que la función `import_gsheets_cron()` exista:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'import_gsheets_cron';
   ```
3. Que no haya errores en logs:
   ```sql
   SELECT * FROM cron.job_run_details
   WHERE status = 'failed'
   ORDER BY start_time DESC LIMIT 5;
   ```

### Ver errores detallados

```sql
-- Errores de pg_cron
SELECT
  job_name,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'import-gsheets-daily')
  AND status = 'failed'
ORDER BY start_time DESC
LIMIT 10;

-- Errores en nuestra tabla de logs
SELECT * FROM public.cron_logs
WHERE status = 'error'
ORDER BY executed_at DESC
LIMIT 10;
```

---

## 📝 Resultado Esperado

Una vez configurado correctamente:

- ✅ Cada día a las **06:00 UTC**, el sistema importará automáticamente
- ✅ Solo se importan artículos **nuevos** (no duplicados)
- ✅ Logs disponibles en `cron_logs` y `cron.job_run_details`
- ✅ Puedes ejecutar manualmente en cualquier momento con `SELECT public.import_gsheets_cron();`
- ✅ La Edge Function procesa ~88 artículos del Google Sheet
- ✅ Encoding UTF-8 correcto (sin caracteres raros)

---

## 🔐 Nota Importante: Service Role Key Hardcoded

⚠️ **El script actual tiene el service_role_key hardcoded en la función SQL.**

Esto es **temporal para que funcione inmediatamente**. Para producción:

### Opción A: Usar Supabase Vault (Recomendado)

```sql
-- Guardar key en Vault
SELECT vault.create_secret('service_role_key', 'eyJhbGciOi...');

-- Actualizar función para usar Vault
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_service_key text;
BEGIN
  -- Obtener key desde Vault
  SELECT decrypted_secret INTO v_service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key';

  -- ... resto de la función
END;
$$;
```

### Opción B: Usar Variables de Entorno de Supabase

Configurar en **Dashboard → Settings → API → Custom config**:
```
app.settings.service_role_key = "eyJhbGciOi..."
```

Y en la función:
```sql
v_service_key := current_setting('app.settings.service_role_key', true);
```

---

## 📞 Resumen

**Estado actual**:
- ✅ Edge Function funcional (probada manualmente)
- ❌ Cron job NO configurado
- 📝 Script SQL listo para ejecutar

**Próximo paso**:
1. Ve a Supabase SQL Editor
2. Ejecuta `/tmp/configurar_cron_definitivo.sql`
3. Verifica con `SELECT * FROM cron.job WHERE jobname = 'import-gsheets-daily';`
4. Prueba manualmente con `SELECT public.import_gsheets_cron();`

**Fecha de próxima ejecución automática**: Mañana 3 de julio 2026 a las 06:00 UTC

---

**Última actualización**: 2026-07-02
**Autor**: Claude Code
