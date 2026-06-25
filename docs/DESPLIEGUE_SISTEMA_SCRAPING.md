# 🚀 Despliegue del Sistema de Scraping Completo

**Objetivo:** Sistema que scrapea automáticamente el contenido completo de cada artículo del Google Sheet

---

## 📋 ¿Qué hace este sistema?

Cuando agregas un link en el Google Sheet, el sistema:

✅ **Descarga el artículo completo** desde el sitio web
✅ **Extrae automáticamente:**
   - Imagen destacada de alta calidad
   - Título real del artículo
   - Contenido completo del artículo (párrafos formateados)
   - Autor real (no solo el link)
   - Fecha de publicación
   - Fuente/publicación

✅ **Muestra en tu web** con formato de cards profesional
✅ **Se ejecuta automáticamente** todos los días a las 06:00 UTC

---

## 🎯 Pasos de Implementación

### PASO 1: Desplegar Edge Function de Importación

**Dashboard → Edge Functions → Deploy a new function**

URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions

1. Click "Deploy a new function"
2. Nombre: `import-gsheets-news`
3. Copiar TODO el código desde: `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`
4. Click "Deploy"

**Verificar deployment:**
```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [TU_SERVICE_KEY]"

# Debe retornar:
# {"total":58,"imported":X,"skipped":Y,"errors":0}
```

---

### PASO 2: Habilitar Extensión pg_net 🔌

**Dashboard → Database → Extensions**

URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/database/extensions

1. Buscar: "pg_net"
2. Click en "Enable"
3. Esperar confirmación ✅

---

### PASO 3: Configurar Service Role Key 🔑

**Dashboard → SQL Editor**

URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

**Primero, obtener la key:**
1. Dashboard → Settings → API
2. Copiar `service_role` (secret key)

**Luego, ejecutar este SQL:**
```sql
-- Configurar service_role_key
ALTER DATABASE postgres
SET app.settings.service_role_key = 'TU_SERVICE_KEY_AQUI';

-- Verificar
SELECT current_setting('app.settings.service_role_key', true);
```

---

### PASO 4: Crear Función Wrapper y Cron Job

**Dashboard → SQL Editor**

```sql
-- ============================================
-- SISTEMA DE IMPORTACIÓN AUTOMÁTICA CON SCRAPING
-- ============================================

-- 1. Deshabilitar fetch-news RSS antiguo
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours') THEN
    PERFORM cron.unschedule('fetch-news-every-6-hours');
  END IF;
END $$;

-- 2. Crear función wrapper para llamar a la Edge Function
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

---

### PASO 5: Probar el Sistema 🧪

**Ejecutar importación manual:**

```sql
-- Ejecutar manualmente
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

**Verificar artículos importados:**

```sql
-- Ver últimos artículos scrapeados
SELECT
  title,
  source_name,
  author_name,
  featured_image_url,
  LENGTH(content) as content_length,
  published_at
FROM news_articles
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Checklist de Verificación

Después de ejecutar todos los pasos:

- [ ] **Edge Function desplegada**
  ```bash
  curl -X POST .../import-gsheets-news -H "Authorization: Bearer [KEY]"
  # Debe retornar JSON con resultados
  ```

- [ ] **Extensión pg_net habilitada**
  - Verificar en: Database → Extensions → pg_net (verde)

- [ ] **Service role key configurada**
  ```sql
  SELECT current_setting('app.settings.service_role_key', true);
  -- Debe retornar la key
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

- [ ] **Artículos con contenido completo**
  ```sql
  SELECT
    title,
    CASE
      WHEN featured_image_url IS NOT NULL THEN '✅ Con imagen'
      ELSE '❌ Sin imagen'
    END as imagen,
    CASE
      WHEN LENGTH(content) > 500 THEN '✅ Contenido completo'
      ELSE '❌ Contenido incompleto'
    END as contenido,
    author_name
  FROM news_articles
  WHERE status = 'published'
  ORDER BY created_at DESC
  LIMIT 10;
  ```

- [ ] **Verificar en la web**
  - Ir a: https://etfnexo.com/noticias
  - Deben aparecer artículos con:
    - ✅ Imágenes destacadas de alta calidad
    - ✅ Contenido completo del artículo
    - ✅ Autor real (no links)
    - ✅ Fuente bien identificada
    - ✅ Formato de cards atractivo

---

## 🎉 Resultado Final

Una vez completados todos los pasos:

```
🛡️ SISTEMA DE SCRAPING ACTIVO

✅ Automático: Scrapea e importa diariamente a las 06:00 UTC
✅ Completo: Extrae imagen, contenido, autor, fecha
✅ Protegido: fetch-news RSS desactivado
✅ Verificado: Solo artículos del Google Sheet con contenido real
✅ Monitoreado: Logs automáticos en cron_logs

📊 Próxima ejecución: Mañana a las 06:00 UTC
🌐 Web: Artículos completos con imágenes y contenido real
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

### Ver artículos con más detalle
```sql
SELECT
  title,
  source_name,
  author_name,
  featured_image_url,
  LENGTH(content) as chars,
  published_at
FROM news_articles
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;
```

### Verificar calidad del scraping
```sql
-- Artículos sin imagen (deberían ser muy pocos)
SELECT COUNT(*) as sin_imagen
FROM news_articles
WHERE featured_image_url IS NULL AND status = 'published';

-- Artículos con contenido corto (posible fallo de scraping)
SELECT title, LENGTH(content) as chars
FROM news_articles
WHERE LENGTH(content) < 500 AND status = 'published'
ORDER BY created_at DESC;
```

---

## 🔍 Cómo Funciona el Scraping

### Extracción Inteligente

El sistema usa múltiples métodos para extraer contenido:

**1. Open Graph Tags (Preferido)**
```html
<meta property="og:title" content="Título del artículo">
<meta property="og:description" content="Resumen...">
<meta property="og:image" content="https://...imagen.jpg">
```

**2. JSON-LD Structured Data**
```json
{
  "@type": "NewsArticle",
  "headline": "Título",
  "author": {"name": "Juan Pérez"},
  "datePublished": "2026-06-24",
  "image": "https://...imagen.jpg"
}
```

**3. Selectors CSS Comunes**
```css
article /* Contenido principal */
.article-content /* Párrafos del artículo */
.author-name /* Nombre del autor */
[itemprop="articleBody"] /* Marcado semántico */
```

**4. Fallbacks Inteligentes**
- Si no hay Open Graph → usa Twitter Cards
- Si no hay JSON-LD → busca meta tags
- Si no hay autor → extrae de byline
- Si no hay fecha → usa la del Google Sheet

### Fuentes Compatibles

El scraper funciona con:
- ✅ Finect
- ✅ Rankia
- ✅ Funds Society
- ✅ Morningstar
- ✅ El País / Cinco Días
- ✅ Expansión
- ✅ El Economista
- ✅ Y prácticamente cualquier sitio de noticias moderno

---

## 🆘 Troubleshooting

### Error: Edge Function no responde

**Síntoma:**
```sql
SELECT public.import_gsheets_cron();
-- ERROR: request to remote server failed
```

**Solución:**
1. Verificar que la Edge Function está desplegada:
   - Dashboard → Edge Functions → import-gsheets-news debe estar "Active"
2. Verificar logs de la función:
   - Dashboard → Functions → import-gsheets-news → Logs
3. Probar manualmente con curl

---

### Error: Scraping falla en algunos artículos

**Síntoma:**
```sql
-- En logs aparece: "Failed to scrape content"
```

**Solución:**
1. Verificar si el sitio tiene bloqueo anti-bot
2. Ver logs detallados de la Edge Function
3. El sistema tiene fallback: crea entrada básica si scraping falla

---

### Error: Sin imágenes en algunos artículos

**Síntoma:**
Artículos publicados sin `featured_image_url`

**Solución:**
- Es normal en algunos casos (sitio sin Open Graph)
- El sistema intenta múltiples métodos de extracción
- Si es crítico, se puede agregar manualmente en BD

---

## 📊 Métricas de Éxito

Un sistema bien configurado debe mostrar:

```sql
-- > 90% de artículos con imagen
SELECT
  ROUND(COUNT(CASE WHEN featured_image_url IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as porcentaje_con_imagen
FROM news_articles
WHERE status = 'published';

-- > 95% con contenido > 500 caracteres
SELECT
  ROUND(COUNT(CASE WHEN LENGTH(content) > 500 THEN 1 END) * 100.0 / COUNT(*), 2) as porcentaje_contenido_completo
FROM news_articles
WHERE status = 'published';

-- > 80% con autor identificado
SELECT
  ROUND(COUNT(CASE WHEN author_name IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 2) as porcentaje_con_autor
FROM news_articles
WHERE status = 'published';
```

**Resultados esperados:**
- Imágenes: >90%
- Contenido completo: >95%
- Autores: >80%

---

**Última actualización:** 25 de junio de 2026, 12:15 UTC
**Por:** Claude Code - Sistema de Scraping Completo
