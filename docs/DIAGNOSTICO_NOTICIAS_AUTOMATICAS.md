# 📋 Diagnóstico: Sistema de Noticias Automáticas - ETF Nexo

**Fecha:** 24 de junio de 2026
**Proyecto:** /home/suario/ruy
**Estado:** ⚠️ **SISTEMA PARCIALMENTE OPERATIVO**

---

## 🔍 Resumen Ejecutivo

El sistema de publicación automática de noticias **NO está funcionando completamente** debido a que:

1. ✅ **Auto-publicación:** Funciona correctamente (se ejecuta cada 12h)
2. ❌ **Scraping de noticias:** DESACTIVADO desde el 12 de junio
3. ⚠️ **Resultado:** No entran noticias nuevas, solo se publican las ya existentes

---

## 📊 Estado Actual

### Noticias en Base de Datos
```
✅ Total publicadas:  38 noticias
📝 En borrador:       0 noticias
📅 Programadas:       0 noticias
```

**Últimas noticias publicadas:**
- 19/06/2026: "Invertir en ETFs de Revolut: ¿sí o no?"
- 19/06/2026: "Allianz GI lanzará sus primeros 5 ETFs activos"
- 18/06/2026: "Cathie Wood: revolución de productividad de la IA"
- 17/06/2026: "ING paga 50 euros por invertir en ETFs"

### Cron Jobs

#### ✅ Auto-Publish (FUNCIONANDO)
```
Job:              auto-publish-news
Frecuencia:       Cada 12 horas (00:00, 12:00 UTC)
Última ejecución: 24/06/2026 00:00:00
Estado:           ✅ Éxito (14 ejecuciones en 7 días)
Resultado:        "Published 0 articles" (no hay noticias nuevas que publicar)
```

#### ❌ Fetch-News (DESACTIVADO)
```
Job:              fetch-news (RSS scraping)
Estado:           ❌ DESACTIVADO desde 12/06/2026
Última ejecución: Nunca (0 logs en la base de datos)
Razón:            Reemplazado por importación manual desde Google Sheets
```

---

## 🕵️ Análisis del Problema

### Cronología

**10 de junio 2026:**
- ✅ Se configuró sistema automático completo:
  - `fetch_news_cron()` - Scraping RSS cada 6 horas
  - `auto_publish_news_cron()` - Publicación automática cada 12 horas
  - Edge Functions: `fetch-news` (RSS) y `import-gsheets-news` (manual)

**12 de junio 2026:**
- ⚠️ **Cambio crítico:** Migración `20260612000001_disable_fetch_news_cron.sql`
  - Se desactivó el scraping automático de RSS
  - Se comentó la función `fetch_news_cron()` como "[DESACTIVADO]"
  - Razón: "reemplazada por import-gsheets-news manual"

**Estado actual:**
- ❌ No entran noticias nuevas automáticamente
- ✅ El cron de auto-publicación sí funciona, pero no tiene nada que publicar
- ⚠️ Las 38 noticias fueron importadas manualmente (Google Sheets)

### Por Qué No Funciona

1. **fetch-news cron job eliminado:**
   - El comando `cron.unschedule('fetch-news-every-6-hours')` lo eliminó
   - No hay logs de ejecución en `cron_logs`
   - La función existe pero está marcada como desactivada

2. **Import-gsheets-news es manual:**
   - No tiene cron job programado
   - Requiere ejecución manual por curl/API
   - Nadie lo está ejecutando regularmente

3. **Auto-publish no tiene noticias nuevas:**
   - Solo publica noticias en `draft` con criterios de calidad
   - Como no entran noticias nuevas, no hay nada que publicar
   - Por eso dice "Published 0 articles"

---

## 🛠️ Soluciones Propuestas

### Opción 1: Reactivar Sistema RSS Automático (RECOMENDADO)

**Ventajas:**
- ✅ Sistema 100% automático
- ✅ Noticias frescas cada 6 horas
- ✅ No requiere intervención manual
- ✅ Scraping de 5 fuentes españolas de calidad

**Pasos:**

1. **Reactivar cron job de fetch-news:**
```sql
-- Ejecutar en Supabase Dashboard → SQL Editor
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);
```

2. **Verificar activación:**
```sql
SELECT * FROM cron.job WHERE jobname = 'fetch-news-every-6-hours';
```

3. **Test manual (opcional):**
```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c"
```

4. **Actualizar comentario de función:**
```sql
COMMENT ON FUNCTION public.fetch_news_cron() IS
  '[REACTIVADO] Ejecuta Edge Function fetch-news para scrapear noticias automáticamente. Se ejecuta cada 6 horas via pg_cron.';
```

**Resultado esperado:**
- 🕐 00:00, 06:00, 12:00, 18:00 UTC → Scraping automático de RSS
- 🕐 00:00, 12:00 UTC → Publicación automática de noticias de calidad
- 📰 8-20 noticias nuevas por día

---

### Opción 2: Programar Importación Automática desde Google Sheets

**Ventajas:**
- ✅ Mantiene el enfoque de curación manual
- ✅ Control total sobre las noticias publicadas

**Desventajas:**
- ⚠️ Requiere mantener Google Sheet actualizado manualmente
- ⚠️ Menos noticias que con RSS automático

**Pasos:**

1. **Crear cron job para import-gsheets-news:**
```sql
-- Ejecutar en Supabase Dashboard → SQL Editor
CREATE OR REPLACE FUNCTION public.import_gsheets_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url TEXT := 'https://utvioubcqkwwzvufhups.supabase.co';
BEGIN
  RAISE NOTICE 'Executing import-gsheets-news cron at %', NOW();

  PERFORM
    net.http_post(
      url := supabase_url || '/functions/v1/import-gsheets-news',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true),
        'Content-Type', 'application/json'
      ),
      timeout_milliseconds := 180000
    );

  INSERT INTO public.cron_logs (job_name, status, executed_at)
  VALUES ('import-gsheets-news', 'success', NOW());

EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.cron_logs (job_name, status, error_message, executed_at)
    VALUES ('import-gsheets-news', 'error', SQLERRM, NOW());
    RAISE NOTICE 'Error in import-gsheets-news cron: %', SQLERRM;
END;
$$;

-- Programar para ejecutarse cada 12 horas
SELECT cron.schedule(
  'import-gsheets-every-12-hours',
  '0 */12 * * *',
  'SELECT public.import_gsheets_cron();'
);
```

---

### Opción 3: Sistema Híbrido (RSS + Google Sheets)

**Ventajas:**
- ✅ RSS automático para volumen
- ✅ Google Sheets para noticias curadas/destacadas

**Pasos:**
1. Reactivar fetch-news (Opción 1)
2. Mantener import-gsheets-news para importaciones manuales ocasionales

---

## 📝 Scripts de Verificación

He creado scripts para monitorear el sistema:

### check-news.ts
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a && npx tsx scripts/check-news.ts
```
**Muestra:**
- Últimas 10 noticias publicadas
- Noticias en borrador
- Estadísticas globales

### check-cron-status.ts
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a && npx tsx scripts/check-cron-status.ts
```
**Muestra:**
- Logs de ejecución de cron jobs
- Estado de auto-publish
- Estado de fetch-news

---

## 🎯 Recomendación Final

**Recomiendo OPCIÓN 1: Reactivar RSS Automático**

**Razones:**
1. Sistema 100% automático (cero intervención)
2. Noticias frescas y relevantes de fuentes españolas
3. Ya está implementado y testeado
4. Solo requiere ejecutar 1 comando SQL

**Próximos pasos:**
1. Ejecutar el comando `cron.schedule` en Supabase Dashboard
2. Esperar 6 horas (primera ejecución)
3. Verificar con `npx tsx scripts/check-news.ts`
4. Confirmar que entran noticias nuevas

---

## 📞 Soporte

- **Dashboard:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- **SQL Editor:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql
- **Docs:** Ver `SETUP_AUTOMATION_NOW.md` para configuración original
