# 🧪 Instrucciones: Probar Cron Job Automático

**Fecha**: 7 julio 2026
**Hora actual**: 07:38 UTC
**Hora programada**: 07:42 UTC (en ~4 minutos)

---

## 📋 Pasos a Seguir

### **Paso 1: Ejecutar Script de Configuración (AHORA)**

1. Ve a: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new

2. Copia y pega el contenido de: `docs/TEST_CRON_AHORA.sql`

3. Click en **"Run"** (esquina inferior derecha)

4. **Resultado esperado:**
```
jobid | jobname              | schedule    | active | command
------|----------------------|-------------|--------|----------------------------------
XX    | import-gsheets-TEST  | 42 7 7 7 *  | t      | SELECT public.import_gsheets_cron();
```

✅ Si ves esto, el cron está programado correctamente.

---

### **Paso 2: Esperar 4-5 Minutos**

⏳ El cron se ejecutará automáticamente a las **07:42 UTC**.

No hagas nada. El sistema ejecutará:
1. Leer Google Sheet
2. Importar noticias nuevas
3. Scrapear contenido completo
4. Guardar en base de datos
5. Auto-publicar si cumplen criterios

---

### **Paso 3: Verificar Ejecución (después de las 07:43 UTC)**

1. Ve de nuevo a SQL Editor

2. Copia y pega el contenido de: `docs/VERIFICAR_EJECUCION_CRON.sql`

3. Click en **"Run"**

4. **Resultado esperado:**

**A) Logs de pg_cron:**
```
status: succeeded ✅
return_message: "1 row"
start_time: 2026-07-07 07:42:00
end_time: 2026-07-07 07:42:XX
```

**B) Logs de aplicación:**
```
job_name: import-gsheets
status: success ✅
message: "Google Sheets import triggered. Request ID: XX"
executed_at: 2026-07-07 07:42:00
```

**C) Noticias nuevas:**
```
Debe haber 1+ noticias con:
- created_at > 07:42:00 UTC ✅
- status = 'published'
- content_length > 1000
- has_image = true
```

---

### **Paso 4: Restaurar Configuración Definitiva**

✅ **Si todo funcionó correctamente:**

1. Ve de nuevo a SQL Editor

2. Copia y pega el contenido de: `docs/RESTAURAR_CRON_DEFINITIVO.sql`

3. Click en **"Run"**

4. Esto configurará el horario de producción:
   - Import Google Sheets: **10:00 UTC diario**
   - Auto-publish: **00:00 y 12:00 UTC** (cada 12h)

---

## 🔍 Monitoreo en Tiempo Real

### Durante la Espera (07:38 - 07:43):

Puedes monitorear con este comando:

```sql
-- Ver si el cron está activo
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname = 'import-gsheets-TEST';

-- Ver estado de la función
SELECT proname FROM pg_proc WHERE proname = 'import_gsheets_cron';
```

---

## 🚨 Troubleshooting

### Si NO se ejecuta a las 07:42:

**1. Verificar que el cron está activo:**
```sql
SELECT * FROM cron.job WHERE jobname = 'import-gsheets-TEST';
```
- `active` debe ser `true` ✅

**2. Verificar que la extensión pg_cron está habilitada:**
```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```
- Debe aparecer 1 fila ✅

**3. Verificar que la función existe:**
```sql
SELECT proname FROM pg_proc WHERE proname = 'import_gsheets_cron';
```
- Debe aparecer `import_gsheets_cron` ✅

**4. Ver errores en logs:**
```sql
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC LIMIT 5;
```

---

## 📊 Checklist de Validación

Después de ejecutar la prueba, verifica:

- [ ] Cron ejecutado a las 07:42 UTC (±1 min)
- [ ] Estado en `cron.job_run_details`: `succeeded`
- [ ] Log en `cron_logs`: `status = 'success'`
- [ ] Al menos 1 noticia nueva importada
- [ ] Noticia auto-publicada (si cumple criterios)
- [ ] Contenido scrapeado completo (>1000 chars)
- [ ] Imagen destacada presente

Si todos los checks ✅, el sistema está funcionando perfectamente.

---

## 🎯 Configuración Final Esperada

Después de ejecutar `RESTAURAR_CRON_DEFINITIVO.sql`:

```
Cron Jobs Activos:
├─ import-gsheets-daily (10:00 UTC diario) ✅
├─ auto-publish-news-every-12-hours (00:00 y 12:00 UTC) ✅
└─ cleanup-cron-logs-monthly (1 del mes 00:00 UTC) ✅

Cron Jobs Deshabilitados:
└─ fetch-news-every-6-hours ❌ (obsoleto)

Edge Functions:
├─ import-gsheets-news ✅
└─ scrape-article-content ✅
```

---

## 📞 Resumen

**¿Qué hace este test?**
- Programa un cron para ejecutarse en 4 minutos
- Verifica que el sistema automático funciona
- Si funciona, restaura horario de producción (10:00 UTC diario)

**Timeline:**
1. 07:38 → Ejecutar `TEST_CRON_AHORA.sql`
2. 07:42 → Sistema se ejecuta automáticamente
3. 07:43 → Ejecutar `VERIFICAR_EJECUCION_CRON.sql`
4. 07:45 → Ejecutar `RESTAURAR_CRON_DEFINITIVO.sql` si todo OK

**Tiempo total:** ~7 minutos

---

**¡Listo para probar!** 🚀
