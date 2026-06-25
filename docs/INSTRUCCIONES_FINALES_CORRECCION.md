# 🎯 Instrucciones Finales para Completar la Corrección

**Fecha:** 24 de junio de 2026, ~18:15 UTC
**Estado:** 🟡 Limpieza RSS completada - Falta desplegar función y deshabilitar cron

---

## ✅ Lo que ya se hizo

### 1. Limpieza de Artículos RSS
```
✅ Eliminados: 77 artículos de RSS
📊 Restantes: 6 artículos (también parecen ser de fuentes externas)
```

**Artículos eliminados incluyen:**
- "El último reto de los analistas de Goldman Sachs" (Expansión)
- "¿Cuál es el propósito de Berkshire Hathaway?" (Expansión)
- Y 75 artículos más de Finect, Rankia, Funds Society

---

## 📋 Pasos Pendientes (Ejecutar en Supabase Dashboard)

### PASO 1: Deshabilitar Cron de Fetch-News ⏸️

**URL:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

**SQL a ejecutar:**
```sql
-- Deshabilitar el cron job de fetch-news
SELECT cron.unschedule('fetch-news-every-6-hours');

-- Verificar que se eliminó (debe retornar 0 filas)
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'fetch-news-every-6-hours';
```

**Resultado esperado:**
```
0 filas (el cron job ya no existe)
```

---

### PASO 2: Desplegar import-gsheets-news Edge Function 🚀

**Opción A: Desde Supabase Dashboard (Recomendado)**

1. Ir a: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions
2. Click en "Deploy a new function"
3. Nombre: `import-gsheets-news`
4. Código: Copiar desde `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`
5. Deploy

**Opción B: Desde CLI (si tienes permisos de Owner)**

```bash
cd /home/suario/ruy
supabase functions deploy import-gsheets-news
```

**Verificar deployment:**
```bash
# Debería retornar 200 o el resultado de la importación
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

---

### PASO 3: Importar Noticias del Google Sheet 📥

Una vez desplegada la función, ejecutar:

```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

**Fuente de datos:**
- URL del Google Sheet: https://docs.google.com/spreadsheets/d/e/2PACX-1vStrEBHOhxe_R-p_bbPXzglHsBWHDnCbScB30VGumBKYg2hhFN5cG6OYlQ5PjlZHPXRlGoL1Grl4CTq/pub?output=csv

**Resultado esperado:**
```json
{
  "success": true,
  "message": "Import completed",
  "results": {
    "total": N,       // Noticias en el Sheet
    "inserted": M,    // Noticias nuevas importadas
    "skipped": X      // Duplicados
  }
}
```

---

### PASO 4: Eliminar los 6 Artículos Restantes (Opcional) 🗑️

Los 6 artículos restantes también parecen ser de fuentes externas (Fundssociety, Cincodias).

**SQL para eliminarlos:**
```sql
-- Ver cuáles son
SELECT id, title, source_name, source_url
FROM news_articles
WHERE status = 'published';

-- Si confirmas que NO son del Google Sheet, eliminarlos:
DELETE FROM news_articles
WHERE source_name IN ('Fundssociety', 'Cincodias');

-- O eliminar TODOS y empezar desde cero:
DELETE FROM news_articles WHERE status = 'published';
```

---

## 🔍 Verificación Final

### 1. Verificar que NO hay artículos RSS

```sql
SELECT COUNT(*) as total_rss
FROM news_articles
WHERE source_name IN (
  'Funds Society', 'Finect', 'Estrategias de Inversión',
  'Expansión', 'Rankia', 'Fundssociety', 'Cincodias'
)
AND status = 'published';
```

**Resultado esperado:** `total_rss = 0`

---

### 2. Verificar artículos del Google Sheet

```sql
SELECT id, title, source_name, published_at, created_at
FROM news_articles
WHERE status = 'published'
ORDER BY published_at DESC;
```

**Resultado esperado:**
- Solo artículos del Google Sheet
- `source_name` vacío o 'Google Sheets'
- Títulos que reconoces de tu hoja de cálculo

---

### 3. Verificar cron jobs activos

```sql
SELECT jobname, schedule, command, active
FROM cron.job
ORDER BY jobname;
```

**Resultado esperado:**
```
jobname                        | schedule      | command                           | active
-------------------------------|---------------|-----------------------------------|-------
auto-publish-news-every-12-hours | 0 */12 * * * | SELECT public.auto_publish_news(); | true
```

**NO debe aparecer:**
- `fetch-news-every-6-hours` (debe estar desactivado)

---

### 4. Verificar en la web

1. Ir a: https://etfnexo.com/noticias
2. Verificar que:
   - ❌ NO aparece "El último reto de Goldman Sachs"
   - ❌ NO aparecen artículos de Expansión, Finect, Rankia
   - ✅ SOLO aparecen artículos de tu Google Sheet

---

## 📊 Estado Final Esperado

```
📰 Noticias:
   Total publicadas: ~10-50 (según tu Google Sheet)
   De RSS: 0 ❌
   Del Google Sheet: 100% ✅

⚙️ Cron Jobs:
   fetch-news: DESACTIVADO ❌
   auto-publish: ACTIVO ✅ (por si acaso hay drafts)

🚀 Edge Functions:
   fetch-news: ❌ NO USAR
   import-gsheets-news: ✅ DEPLOYADA Y FUNCIONANDO

🔐 Regla de Oro:
   Solo artículos del Google Sheet
```

---

## 🔄 Workflow Futuro (Correcto)

### Cuando quieras actualizar noticias:

1. **Editar el Google Sheet:**
   - Agregar nuevas filas con noticias
   - Columnas: priority, date, url, author

2. **Ejecutar import-gsheets-news:**
   ```bash
   curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
     -H "Authorization: Bearer [SERVICE_KEY]"
   ```

3. **Verificar en la web:**
   - https://etfnexo.com/noticias
   - Confirmar que aparecen las nuevas noticias

---

## 🚫 Lo que NUNCA hacer

- ❌ NO ejecutar `fetch-news`
- ❌ NO reactivar el cron `fetch-news-every-6-hours`
- ❌ NO confiar en scraping automático de RSS
- ❌ NO usar fuentes: Expansión, Finect, Rankia, Funds Society

---

## 📝 Scripts Útiles

### Verificar estado de noticias
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/check-news.ts
```

### Identificar fuentes
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/identify-news-sources.ts
```

---

## ✅ Checklist Final

- [x] Artículos RSS eliminados (77)
- [ ] Cron fetch-news desactivado
- [ ] Función import-gsheets-news desplegada
- [ ] Noticias del Google Sheet importadas
- [ ] Verificado en la web que solo aparecen artículos del Google Sheet
- [ ] Los 6 artículos restantes revisados/eliminados
- [ ] Documentación actualizada

---

**Próximo paso inmediato:**
1. Ejecutar PASO 1 (deshabilitar cron) en Supabase Dashboard
2. Ejecutar PASO 2 (desplegar función) en Supabase Dashboard
3. Ejecutar PASO 3 (importar Google Sheet)

**Actualizado:** 24 de junio de 2026, 18:15 UTC
**Por:** Claude Code - Sistema de Corrección
