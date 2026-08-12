# ⏰ Cambio de Horario del Cron Job a 10:00 UTC

**Fecha**: 2026-07-03
**Horario anterior**: 06:00 UTC
**Horario nuevo**: 10:00 UTC (11:00 o 12:00 hora española según verano/invierno)

---

## 📋 Script SQL para Ejecutar en Supabase Dashboard

**URL**: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new

### Copiar y Ejecutar Todo:

```sql
-- ============================================
-- ETF Nexo - Cambiar Horario del Cron Job a 10:00 UTC
-- ============================================

-- 1. Eliminar el cron job actual (06:00 UTC)
SELECT cron.unschedule('import-gsheets-daily');

-- 2. Crear el cron job con el nuevo horario (10:00 UTC)
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 10 * * *',
  'SELECT public.import_gsheets_cron();'
);

-- 3. Verificar que el job fue actualizado correctamente
SELECT
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

---

## ✅ Resultado Esperado

Después de ejecutar el script, deberías ver:

```
| jobid | jobname              | schedule   | active | command                              |
|-------|----------------------|------------|--------|--------------------------------------|
| X     | import-gsheets-daily | 0 10 * * * | true   | SELECT public.import_gsheets_cron(); |
```

**Importante**: El `schedule` debe mostrar `0 10 * * *` (no `0 6 * * *`)

---

## 📅 Próximas Ejecuciones

Con el nuevo horario `0 10 * * *`:

- **Hoy 3 julio**: NO se ejecutará de nuevo (ya se ejecutó a las 06:00 UTC)
- **Mañana 4 julio**: Se ejecutará a las **10:00 UTC** (11:00 o 12:00 hora española)
- **Todos los días siguientes**: **10:00 UTC** diariamente

---

## 🕐 Conversión de Horarios

| UTC  | Hora España (Verano CET+2) | Hora España (Invierno CET+1) |
|------|----------------------------|------------------------------|
| 06:00 | 08:00                      | 07:00                        |
| **10:00** | **12:00**                  | **11:00**                    |

**Nuevo horario**: Mediodía en verano, 11:00 AM en invierno (hora española)

---

## 🔍 Verificar que Funciona

### Opción 1: Esperar a Mañana
Verificar mañana 4 de julio después de las 10:00 UTC:

```sql
-- Ver última ejecución
SELECT * FROM public.cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 5;
```

Deberías ver una entrada con `executed_at` cerca de `2026-07-04 10:00:00+00`

### Opción 2: Probar Manualmente Ahora
```sql
-- Ejecutar manualmente para verificar que la función sigue funcionando
SELECT public.import_gsheets_cron();
```

---

## 🛠️ Volver al Horario Anterior (06:00 UTC)

Si necesitas regresar al horario de 06:00 UTC:

```sql
-- Eliminar cron actual
SELECT cron.unschedule('import-gsheets-daily');

-- Recrear con horario 06:00 UTC
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 6 * * *',
  'SELECT public.import_gsheets_cron();'
);
```

---

## 📝 Otros Horarios Útiles

Si necesitas cambiar a otro horario en el futuro:

| Horario Deseado | Cron Expression | Hora España (Verano) |
|-----------------|-----------------|----------------------|
| 08:00 UTC       | `0 8 * * *`     | 10:00                |
| 09:00 UTC       | `0 9 * * *`     | 11:00                |
| **10:00 UTC**   | **`0 10 * * *`**| **12:00**            |
| 12:00 UTC       | `0 12 * * *`    | 14:00                |
| 14:00 UTC       | `0 14 * * *`    | 16:00                |

---

## 📊 Estado del Sistema Después del Cambio

| Componente | Estado | Horario |
|------------|--------|---------|
| Cron Job | ✅ ACTIVO | 10:00 UTC (nuevo) |
| Edge Function | ✅ FUNCIONAL | On-demand |
| Importación Automática | ✅ OPERATIVA | Diaria a las 10:00 UTC |
| Google Sheet | ✅ MONITOREADO | 88 URLs |
| Base de Datos | ✅ ACTUALIZADA | 85 artículos |

---

**Última actualización**: 2026-07-03 07:16 UTC
**Próxima ejecución**: 2026-07-04 10:00:00 UTC
