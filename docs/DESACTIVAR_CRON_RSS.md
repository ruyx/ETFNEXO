# 🚫 Desactivar Cron Jobs de RSS

## Problema

Los cron jobs de RSS **TODAVÍA ESTÁN CORRIENDO** y agregando artículos basura.

Evidencia:
- Se encontraron 46 artículos de Expansión agregados HOY (25 de junio) a las 12:00 UTC
- 1 artículo de Funds Society también agregado hoy

**Esto significa que hay un cron job activo que está scrapeando RSS y agregando noticias que NO quieres.**

---

## Solución: Desactivar Cron Jobs

### PASO 1: Verificar Cron Jobs Activos

**Ir a:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

**Ejecutar este SQL:**

```sql
-- Ver TODOS los cron jobs activos
SELECT
  jobname,
  schedule,
  active,
  command
FROM cron.job
ORDER BY jobname;
```

**Resultado esperado:**

Probablemente verás uno o más de estos:
- `fetch-news-every-6-hours` ← **ESTE es el culpable**
- `fetch-news`
- `import-gsheets-daily` (este SÍ debe existir, es bueno)

---

### PASO 2: Desactivar Cron Jobs de RSS

**Ejecutar este SQL:**

```sql
-- Desactivar TODOS los cron jobs de RSS
DO $$
BEGIN
  -- Desactivar fetch-news-every-6-hours
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours') THEN
    PERFORM cron.unschedule('fetch-news-every-6-hours');
    RAISE NOTICE '✅ fetch-news-every-6-hours desactivado';
  ELSE
    RAISE NOTICE 'ℹ️  fetch-news-every-6-hours no existe';
  END IF;

  -- Desactivar fetch-news (por si acaso)
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news') THEN
    PERFORM cron.unschedule('fetch-news');
    RAISE NOTICE '✅ fetch-news desactivado';
  ELSE
    RAISE NOTICE 'ℹ️  fetch-news no existe';
  END IF;

  -- Desactivar cualquier variante
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname LIKE '%fetch-news%') THEN
    FOR job_rec IN SELECT jobname FROM cron.job WHERE jobname LIKE '%fetch-news%'
    LOOP
      PERFORM cron.unschedule(job_rec.jobname);
      RAISE NOTICE '✅ % desactivado', job_rec.jobname;
    END LOOP;
  END IF;
END $$;

-- Verificar que quedaron desactivados
SELECT
  jobname,
  schedule,
  active,
  CASE
    WHEN jobname LIKE '%fetch-news%' THEN '❌ DEBE ESTAR DESACTIVADO'
    WHEN jobname = 'import-gsheets-daily' THEN '✅ ESTE SÍ DEBE ESTAR'
    ELSE '⚙️ OTRO'
  END as estado
FROM cron.job
ORDER BY jobname;
```

---

### PASO 3: Verificar que NO hay fetch-news

**Ejecutar:**

```sql
-- Debe retornar 0 filas
SELECT * FROM cron.job
WHERE jobname LIKE '%fetch-news%';
```

**Resultado esperado:**
```
(0 rows)
```

Si retorna filas, el cron job TODAVÍA está activo.

---

### PASO 4: Verificar que import-gsheets-daily SÍ existe

```sql
-- Debe retornar 1 fila
SELECT * FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

**Resultado esperado:**
```
jobname                | schedule     | active
-----------------------|--------------|-------
import-gsheets-daily   | 0 6 * * *    | true
```

---

## ✅ Resultado Final

Una vez ejecutados los pasos:

```
📊 Estado de Cron Jobs:

❌ fetch-news-every-6-hours → DESACTIVADO (no debe aparecer)
❌ fetch-news → DESACTIVADO (no debe aparecer)
✅ import-gsheets-daily → ACTIVO (debe aparecer)

📰 Noticias en BD:
- Total: 46 artículos
- Fuente: Todos del Google Sheet
- Sin artículos de Expansión, Finect, Rankia, Funds Society
```

---

## 🔍 Cómo Verificar si el Problema se Resolvió

### Opción 1: Esperar 6 horas

Espera 6 horas y verifica si aparecen nuevos artículos de Expansión:

```sql
SELECT
  title,
  source_name,
  created_at
FROM news_articles
WHERE source_name = 'Expansión'
  AND created_at > NOW() - INTERVAL '6 hours'
ORDER BY created_at DESC;
```

**Debe retornar 0 filas.**

---

### Opción 2: Ver la web

1. Ir a: https://etfnexo.com/noticias
2. **NO deben aparecer** artículos de:
   - Expansión
   - Finect
   - Rankia
   - Funds Society
   - Cinco Días
3. **SOLO deben aparecer** artículos sobre ETFs que TÚ agregaste al Google Sheet

---

## 🚨 Si el Problema Persiste

Si después de 6-12 horas siguen apareciendo artículos de RSS:

### 1. Verificar Edge Functions

```bash
# Ver si hay Edge Functions que scrapen RSS
cd /home/suario/ruy
ls -la supabase/functions/
```

Si existe `supabase/functions/fetch-news/`, **ELIMÍNALA**:

```bash
rm -rf supabase/functions/fetch-news/
git add -A
git commit -m "Remove fetch-news Edge Function"
git push
```

### 2. Verificar si fetch-news se re-creó

Vuelve a ejecutar:

```sql
SELECT * FROM cron.job WHERE jobname LIKE '%fetch-news%';
```

Si aparece de nuevo, alguien lo está re-creando automáticamente.

---

## 📚 Documentación Relacionada

- `docs/SISTEMA_BLINDADO_GOOGLE_SHEETS.sql` - Sistema correcto que DEBE estar activo
- `docs/DESPLIEGUE_SISTEMA_SCRAPING.md` - Guía de deployment del sistema bueno
- `scripts/emergency-cleanup-all-rss.ts` - Script para limpiar artículos RSS

---

**Última actualización:** 25 de junio de 2026, 12:20 UTC
**Estado:** 46 artículos RSS eliminados, cron jobs pendientes de desactivar
