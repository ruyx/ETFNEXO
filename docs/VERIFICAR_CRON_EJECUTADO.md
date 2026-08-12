# 🔍 Verificar si el Cron Job se Ejecutó

**Fecha**: 2026-07-03 07:03 UTC
**Estado Cron Job**: ✅ Configurado y activo (jobid=8)
**Problema**: El cron debió ejecutarse a las 06:00 UTC (hace 1 hora) pero **NO hay noticias del 3 de julio**

---

## 🚨 Diagnóstico Urgente

### 1. Verificar Historial de Ejecuciones

Ejecuta este SQL en Supabase Dashboard:

```sql
-- Ver las últimas 10 ejecuciones del cron job
SELECT
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time,
  (end_time - start_time) as duration
FROM cron.job_run_details
WHERE jobid = 8
ORDER BY start_time DESC
LIMIT 10;
```

**Qué buscar:**
- ✅ Si hay filas: El cron SÍ se ejecutó → Ver `status` y `return_message`
- ❌ Si NO hay filas: El cron NUNCA se ejecutó → Problema de configuración

### 2. Verificar Logs Personalizados

```sql
-- Ver logs de la función import_gsheets_cron()
SELECT * FROM public.cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 10;
```

**Qué buscar:**
- ✅ Si hay logs con `status='success'`: La función se ejecutó correctamente
- ❌ Si hay logs con `status='error'`: Ver `error_message` para diagnóstico
- ❌ Si NO hay logs: La función nunca se ejecutó o la tabla `cron_logs` no existe

### 3. Probar Ejecución Manual

```sql
-- Ejecutar manualmente la función del cron
SELECT public.import_gsheets_cron();
```

**Resultado esperado:**
- Mensaje: "Google Sheets import cron executed. Request ID: [número]"
- Sin errores

Si aparece un error, copiar el mensaje completo para diagnóstico.

---

## 🔧 Posibles Problemas y Soluciones

### Problema 1: La función no existe

**Síntoma**: Error "function public.import_gsheets_cron() does not exist"

**Solución**: Ejecutar el script de configuración completo:
```bash
cat /tmp/configurar_cron_definitivo_v2.sql
```
Copiar y ejecutar TODO el contenido en SQL Editor.

### Problema 2: pg_net no está habilitado

**Síntoma**: Error "extension pg_net does not exist"

**Solución**:
```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### Problema 3: Service role key incorrecta

**Síntoma**: La función se ejecuta pero la Edge Function no responde o devuelve 401

**Solución**: Verificar que la key hardcoded en la función es correcta:
```sql
-- Ver la definición de la función
\df+ public.import_gsheets_cron
```

Debe contener:
```
v_service_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c';
```

### Problema 4: El cron está configurado pero no se ejecuta

**Síntoma**: El job aparece con `active=true` pero nunca se ejecuta

**Causa posible**:
- pg_cron no está corriendo en el servidor
- El timezone del servidor es diferente

**Diagnóstico**:
```sql
-- Ver configuración de timezone
SHOW timezone;

-- Ver si pg_cron está activo
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

**Solución temporal**: Ejecutar manualmente cada día hasta resolver:
```sql
SELECT public.import_gsheets_cron();
```

---

## 📊 Estado Actual del Sistema

### Lo que SÍ funciona:
- ✅ Edge Function desplegada y operativa
- ✅ Importación manual funciona (probada el 2 de julio)
- ✅ Cron job configurado con `active=true`
- ✅ Script SQL completo y correcto

### Lo que NO funciona:
- ❌ Ejecución automática del cron a las 06:00 UTC
- ❌ No se importaron noticias el 3 de julio a las 06:00 UTC

### Noticias en BD:
- **1 de julio**: 4 artículos
- **2 de julio**: 0 artículos (no se ejecutó el cron)
- **3 de julio**: 0 artículos (no se ejecutó el cron a las 06:00)

---

## 🚀 Acción Inmediata Requerida

**Paso 1**: Ejecuta los 3 scripts SQL arriba en Supabase Dashboard

**Paso 2**: Comparte los resultados para diagnosticar el problema

**Paso 3**: Mientras tanto, ejecuta manualmente:
```sql
SELECT public.import_gsheets_cron();
```

---

## 📞 Comandos Útiles

### Ver estado del cron job
```sql
SELECT jobid, jobname, schedule, active, command
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

### Desactivar temporalmente (si es necesario)
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

### Eliminar y recrear (último recurso)
```sql
-- Eliminar
SELECT cron.unschedule('import-gsheets-daily');

-- Recrear
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 6 * * *',
  'SELECT public.import_gsheets_cron();'
);
```

---

**Última actualización**: 2026-07-03 07:03 UTC
**Urgencia**: 🔴 ALTA - Sistema no está funcionando automáticamente
