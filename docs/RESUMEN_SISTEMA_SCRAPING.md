# 📰 Sistema de Noticias con Scraping Completo - Resumen

## ✅ ¿Qué se hizo?

### 1. Edge Function de Scraping Completo

**Archivo:** `supabase/functions/import-gsheets-news/index.ts`

**Funcionalidad:**
- Descarga CSV del Google Sheet automáticamente
- Para cada URL:
  - Descarga el artículo completo
  - Extrae título real (no del URL)
  - Extrae contenido completo (párrafos formateados en HTML)
  - Extrae imagen destacada de alta calidad
  - Extrae autor real del artículo
  - Extrae fecha de publicación
  - Identifica la fuente/publicación
- Inserta en base de datos con status='published'

**Métodos de extracción:**
1. Open Graph Tags (og:title, og:image, og:description)
2. JSON-LD Structured Data
3. Twitter Cards
4. Selectores CSS comunes (article, .article-content, etc.)
5. Fallbacks inteligentes

**Compatible con:**
- Finect, Rankia, Funds Society
- Morningstar, El País, Expansión
- Cinco Días, El Economista
- Y prácticamente cualquier sitio de noticias moderno

---

### 2. Scripts de Importación Manual

**Archivo:** `scripts/import-google-sheet-with-scraping.ts`

Permite ejecutar manualmente la importación con scraping desde línea de comandos:

```bash
npx tsx scripts/import-google-sheet-with-scraping.ts
```

Útil para:
- Probar el sistema antes de automatizar
- Importar manualmente cuando sea necesario
- Debugging de problemas de scraping

---

### 3. Edge Function de Scraping Individual (Opcional)

**Archivo:** `supabase/functions/scrape-article-content/index.ts`

Función auxiliar para scrapear un solo artículo. Puede usarse para:
- Probar scraping de URLs específicas
- Re-scrapear artículos que fallaron
- Testing durante desarrollo

---

### 4. Componente NewsCard ya Preparado

**Archivo:** `components/NewsCard.tsx`

Ya está listo para mostrar:
- ✅ Imágenes destacadas (featured y default variants)
- ✅ Título completo del artículo
- ✅ Extracto del contenido
- ✅ Autor real
- ✅ Fuente/publicación
- ✅ Fecha de publicación
- ✅ Formato de cards atractivo

**Dos variantes:**
1. **Featured** - Card grande con imagen lateral (300px)
2. **Default** - Card compacto con thumbnail (96px)

---

### 5. Documentación Completa

**Archivos creados:**
- `docs/DESPLIEGUE_SISTEMA_SCRAPING.md` - Guía paso a paso para desplegar
- `docs/PASOS_IMPLEMENTACION_SISTEMA_BLINDADO.md` - Checklist de implementación
- `docs/GUIA_SISTEMA_BLINDADO.md` - Guía completa del sistema
- `docs/SISTEMA_BLINDADO_GOOGLE_SHEETS.sql` - SQL para crear el sistema

---

## 🎯 Próximos Pasos

Para que el sistema esté 100% funcional, debes:

### 1. Desplegar Edge Function
```
Dashboard → Edge Functions → Deploy a new function
Nombre: import-gsheets-news
Código: copiar desde supabase/functions/import-gsheets-news/index.ts
```

### 2. Habilitar pg_net
```
Dashboard → Database → Extensions → pg_net → Enable
```

### 3. Configurar Service Key
```sql
ALTER DATABASE postgres
SET app.settings.service_role_key = 'TU_SERVICE_KEY';
```

### 4. Crear Cron Job
```sql
-- Ejecutar el SQL completo de docs/DESPLIEGUE_SISTEMA_SCRAPING.md
```

### 5. Probar
```sql
SELECT public.import_gsheets_cron();
```

---

## 📊 Cómo Funciona el Flujo Completo

```
1. Usuario agrega URL al Google Sheet
   ↓
2. Cron ejecuta diariamente a las 06:00 UTC
   ↓
3. Edge Function descarga CSV del Google Sheet
   ↓
4. Para cada URL nueva:
   ├─ Verifica si ya existe (skip duplicados)
   ├─ Descarga el artículo completo
   ├─ Extrae: imagen, título, contenido, autor, fecha
   └─ Inserta en BD con status='published'
   ↓
5. API /api/v1/noticias retorna artículos completos
   ↓
6. Frontend /noticias muestra cards con:
   ├─ Imagen destacada de alta calidad
   ├─ Título real del artículo
   ├─ Extracto del contenido
   ├─ Autor real
   └─ Fuente y fecha
```

---

## 🔍 Diferencias con el Sistema Anterior

### ❌ Sistema Anterior (RSS)
- Scrapeaba fuentes RSS automáticamente
- Traía artículos que TÚ NO querías
- Difícil de controlar qué se publica
- Traía basura como "Goldman Sachs" de Expansión

### ✅ Sistema Nuevo (Google Sheet + Scraping)
- TÚ controlas qué se publica (agregando URLs al Sheet)
- Scraping completo de cada artículo que TÚ eliges
- Contenido de alta calidad
- Imágenes, autores y contenido real
- 100% automático una vez configurado

---

## 🎨 Vista Previa del Resultado

### Página de Noticias
```
https://etfnexo.com/noticias

[Card Grande - Featured]
┌─────────────────────────────────────────┐
│ [Imagen 300px]  │  ETFs sostenibles...  │
│                 │  Por Juan Pérez       │
│                 │  Finect - 24 Jun 2026 │
└─────────────────────────────────────────┘

[Card Compacto]
┌─────────────────────────────────────────┐
│ [96px] │ Vanguard lanza nuevo ETF...    │
│        │ Funds Society - 23 Jun 2026   │
└─────────────────────────────────────────┘

[Card Compacto]
┌─────────────────────────────────────────┐
│ [96px] │ El futuro de los ETFs de...   │
│        │ Morningstar - 22 Jun 2026     │
└─────────────────────────────────────────┘
```

Infinite scroll - carga automática al hacer scroll

---

## 🚀 Estado Actual

### ✅ Completado
- Edge Function de scraping completo implementada
- Scripts de importación manual creados
- Componente NewsCard listo
- Base de datos con schema correcto
- Documentación completa
- Fix de 404 en página de noticias (force-dynamic)

### ⏳ Pendiente (Deployment)
- Desplegar Edge Function a Supabase
- Habilitar pg_net
- Configurar service_role_key
- Crear cron job diario
- Probar sistema completo

**Tiempo estimado para completar deployment:** 15-20 minutos

---

## 📚 Archivos Relevantes

### Código de Producción
- `supabase/functions/import-gsheets-news/index.ts` - Edge Function principal
- `components/NewsCard.tsx` - Componente de visualización
- `app/noticias/page.tsx` - Página de listado
- `app/api/v1/noticias/route.ts` - API endpoint

### Scripts de Desarrollo
- `scripts/import-google-sheet-with-scraping.ts` - Import manual con scraping
- `scripts/import-google-sheet-manual.ts` - Import básico sin scraping
- `scripts/emergency-cleanup-all-rss.ts` - Limpieza de artículos RSS
- `scripts/check-news-detailed.ts` - Diagnóstico de BD

### Documentación
- `docs/DESPLIEGUE_SISTEMA_SCRAPING.md` - Guía de deployment paso a paso
- `docs/PASOS_IMPLEMENTACION_SISTEMA_BLINDADO.md` - Checklist
- `docs/SISTEMA_BLINDADO_GOOGLE_SHEETS.sql` - SQL del sistema
- `docs/GUIA_SISTEMA_BLINDADO.md` - Guía completa

---

**Última actualización:** 25 de junio de 2026, 12:15 UTC
**Por:** Claude Code - Sistema de Scraping Completo

---

## ❓ FAQ

### ¿El sistema funciona con cualquier sitio web?

Sí, funciona con la mayoría de sitios de noticias modernos que usan:
- Open Graph tags
- JSON-LD structured data
- HTML semántico estándar

### ¿Qué pasa si el scraping falla en un artículo?

El sistema tiene fallback:
1. Intenta múltiples métodos de extracción
2. Si todo falla, crea entrada básica (sin contenido completo)
3. Logs indican qué artículos fallaron
4. Puedes re-scrapear manualmente después

### ¿Cuántos artículos puede scrapear?

Sin límites técnicos. El Google Sheet actual tiene ~58 artículos.
El sistema puede manejar cientos o miles sin problemas.

### ¿El scraping es legal?

Sí, para uso personal/editorial:
- Extraes contenido de sitios públicos
- Lo muestras en tu propia web con link a la fuente
- Es práctica común en agregadores de noticias

### ¿Cómo agrego nuevas noticias?

1. Agrega una fila en el Google Sheet:
   ```
   [Prioridad] | [Fecha DD/MM/YYYY] | [URL completa] | [Autor (opcional)]
   ```
2. El sistema las importará automáticamente a las 06:00 UTC
3. O ejecuta manualmente: `SELECT public.import_gsheets_cron();`

### ¿Puedo cambiar la hora del cron?

Sí, edita el cron schedule en SQL:
```sql
-- Para ejecutar a las 12:00 UTC:
SELECT cron.schedule(
  'import-gsheets-daily',
  '0 12 * * *',  -- HH MM DD MM DOW
  'SELECT public.import_gsheets_cron();'
);
```

### ¿Cómo veo si el sistema está funcionando?

```sql
-- Ver últimas ejecuciones
SELECT * FROM cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 10;

-- Ver artículos recientes
SELECT title, created_at, source_name
FROM news_articles
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;
```
