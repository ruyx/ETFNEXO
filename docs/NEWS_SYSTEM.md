# Sistema de Noticias Automáticas - ETF Nexo

## Resumen

Sistema completo de scraping y publicación de noticias desde medios españoles especializados en economía y finanzas, con filtrado inteligente de contenido sidebar y limpieza automática.

## ✅ Estado Actual (v3 - RSS-First)

**Sistema completo y funcionando en producción:**
- ✅ Base de datos configurada con tablas y vistas
- ✅ Edge Function desplegada con **scraper RSS-first v3**
- ✅ **8 fuentes RSS** de medios españoles especializados
- ✅ **Scraping inteligente** con threshold de 1000 caracteres
- ✅ **Filtros anti-sidebar** (30+ patrones excluidos)
- ✅ **Soporte UTF-8/Windows-1252** para caracteres españoles
- ✅ **Imágenes destacadas** desde media:content RSS
- ✅ Endpoints API implementados y funcionando
- ✅ Desplegado en producción: https://etfnexo.vercel.app

**Última ejecución:**
- Total procesado: 63 artículos
- Artículos con contenido completo: 100% (8,980-15,625 chars)
- Calidad de contenido: Sin sidebars, sin botones sociales
- Encoding: UTF-8 correcto (tildes, eñes)

## Arquitectura del Sistema

### 1. Base de Datos (Supabase)

#### Tablas Principales:

**`news_articles`** - Artículos de noticias
- `id`, `title`, `slug`, `excerpt`, `content` (HTML)
- `category_id` - Referencia a categoría
- `source_name`, `source_url` - Tracking de fuente original
- `featured_image_url` - URL de imagen destacada
- `status` - `'draft'` | `'published'` | `'archived'`
- `published_at`, `views_count`, `shares_count`

**`news_categories`** - Categorías de noticias
- Pre-pobladas: ETFs, Gestoras, Mercados, Regulación, Educación, Opinión

**`news_tags`** - Tags flexibles para clasificación
- Pre-poblados: iShares, Vanguard, Amundi, Renta Variable, etc.

**Vista Principal:**

**`news_articles_with_metadata`** - Vista completa con todos los datos relacionados

Migración: `supabase/migrations/20260604000001_create_news_system.sql`

### 2. Edge Function - Scraper RSS-First v3

**Archivo:** `supabase/functions/fetch-news/index.ts`

**Estrategia RSS-First:**
1. **Extrae contenido de RSS** (media:description, description)
2. **Threshold de 1000 chars** - Si RSS > 1000 chars, usa ese contenido
3. **Fallback a HTML scraping** - Solo si RSS < 1000 chars
4. **Limpieza inteligente** - Elimina sidebars, botones, autores

#### Fuentes Configuradas (8 fuentes especializadas):

```typescript
const RSS_FEEDS: RSSFeed[] = [
  {
    url: 'https://e00-expansion.uecdn.es/rss/fondos-de-inversion.xml',
    sourceName: 'Expansión',
    categoryName: 'ETFs'
  },
  {
    url: 'https://e00-expansion.uecdn.es/rss/finanzas-personales.xml',
    sourceName: 'Expansión',
    categoryName: 'Educación'
  },
  {
    url: 'https://cincodias.elpais.com/rss/tags/fondos-inversion.xml',
    sourceName: 'Cinco Días',
    categoryName: 'ETFs'
  },
  {
    url: 'https://cincodias.elpais.com/rss/tags/gestoras-fondos.xml',
    sourceName: 'Cinco Días',
    categoryName: 'Gestoras'
  },
  {
    url: 'https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml',
    sourceName: 'El Mundo Inversión',
    categoryName: 'Mercados'
  },
  {
    url: 'https://www.elconfidencial.com/rss/mercados/',
    sourceName: 'El Confidencial',
    categoryName: 'Mercados'
  },
  {
    url: 'https://www.finect.com/rss/noticias/etfs',
    sourceName: 'Finect',
    categoryName: 'ETFs'
  },
  {
    url: 'https://www.fondosgm.com/rss.xml',
    sourceName: 'FondosGM',
    categoryName: 'Gestoras'
  }
];
```

**Fuentes de datos:** Excel `Listado Medios ETFs.xlsx` con URLs RSS verificadas

#### Proceso de Scraping:

**1. Parse RSS con extracción media tags:**
```typescript
interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  mediaDescription?: string; // Contenido completo <media:description>
  mediaContent?: string;     // URL imagen <media:content>
  source?: string;
  guid?: string;
}
```

**2. Estrategia RSS-First (threshold 1000 chars):**
```typescript
// Priorizar contenido RSS sobre scraping
if (item.mediaDescription && item.mediaDescription.length > 1000) {
  content = formatTextToHTML(item.mediaDescription);
  console.log(`📰 Using media:description (${content.length} chars)`);
}
else if (item.description && item.description.length > 1000) {
  content = formatTextToHTML(item.description);
  console.log(`📰 Using description (${content.length} chars)`);
}

// Solo scrape HTML si RSS insuficiente
if (!content || content.length < 1000) {
  // Fetch HTML y limpiar...
}
```

**3. Limpieza Inteligente de Contenido:**

**Lista negra de frases (30+ patrones):**
- Botones sociales: "compartir en facebook", "compartir en twitter"
- Navegación: "leer más", "artículos relacionados", "suscríbete"
- Autores en MAYÚSCULAS: "MIRIAM PRIETO", "JOSÉ MARÍA RODRÍGUEZ"
- Timestamps: "07:54 El Ibex...", "06:45 La Primera de Expansión..."
- Sidebars: "Qué hacer con los valores", "Crónica de bolsa"

**Filtros aplicados:**
```typescript
const excludedPhrases = [
  'compartir en facebook',
  'compartir en twitter',
  'compartir en linkedin',
  'enviar por email',
  'suscríbete',
  'newsletter',
  'leer más',
  'la primera de expansión',
  'crónica de bolsa',
  'artículos relacionados',
  // ... 20+ más
];

const shouldExcludeText = (text: string): boolean => {
  const lowerText = text.toLowerCase();

  // Filtrar frases excluidas
  if (excludedPhrases.some(phrase => lowerText.includes(phrase))) return true;

  // Filtrar autores en MAYÚSCULAS
  if (text === text.toUpperCase() && text.length < 50 && text.length > 5) return true;

  // Filtrar timestamps (07:54 formato)
  if (/^\d{2}:\d{2}\s+/.test(text)) return true;

  // Filtrar snippets muy cortos
  if (text.length < 40) return true;

  return false;
};
```

**Detección inteligente de listas (navegación vs contenido):**
```typescript
// Detectar si lista es navegación o contenido editorial
lists.forEach((list) => {
  let hasTimestamps = false;
  let hasLinks = false;

  listItems.forEach((li) => {
    if (/^\d{2}:\d{2}/.test(text)) hasTimestamps = true;
    if (text.length < 100 && !text.includes('.')) hasLinks = true;
  });

  // Solo agregar si NO es navegación
  if (!hasTimestamps && !hasLinks && items.length > 0) {
    paragraphs.push(`<${tag}>${items.join('')}</${tag}>`);
  }
});
```

**Detención automática en secciones de navegación:**
```typescript
// Detenerse al encontrar sidebar
for (const para of paragraphs) {
  if (para.includes('compartir en facebook') ||
      para.includes('artículos') && para.includes('<li>') ||
      /\d{2}:\d{2}/.test(para)) {
    break; // Detenerse aquí
  }
  finalContent.push(para);
}
```

**4. Soporte encoding UTF-8/Windows-1252:**
```typescript
// Detectar encoding (Expansión usa windows-1252)
let html = await response.text();
if (html.includes('�') || sourceName === 'Expansión') {
  const buffer = await response.arrayBuffer();
  html = new TextDecoder('windows-1252').decode(buffer);
}
```

**5. Extracción de imagen destacada:**
```typescript
// Prioridad: media:content > OpenGraph > primera imagen
featuredImage = item.mediaContent ||
                extractOpenGraphImage(html) ||
                extractFirstImage(html);
```

**6. Verificación de duplicados y insert:**
```typescript
// Evitar duplicados por source_url
const { data: existing } = await supabase
  .from('news_articles')
  .select('id')
  .eq('source_url', item.link)
  .single();

if (!existing) {
  await supabase.from('news_articles').insert({
    title: item.title,
    slug: generateSlug(item.title),
    excerpt: item.description.substring(0, 300),
    content: content,
    source_name: sourceName,
    source_url: item.link,
    featured_image_url: featuredImage,
    category_id: categoryId,
    status: 'draft',
    source_published_at: new Date(item.pubDate)
  });
}
```

### 3. API Endpoints

#### GET `/api/v1/noticias`
Listar noticias publicadas

**Query params:**
- `limit` (default: 20) - Número de resultados
- `offset` (default: 0) - Paginación
- `featured=true` - Solo noticias destacadas (primeras 4)
- `category=slug` - Filtrar por categoría
- `search=texto` - Búsqueda por título/excerpt

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Everwood compra Tudefrigo por 70 millones...",
      "slug": "everwood-compra-tudefrigo-70-millones",
      "excerpt": "Resumen...",
      "featured_image_url": "https://e00-expansion.uecdn.es/...",
      "published_at": "2026-06-09T...",
      "category_name": "ETFs",
      "category_slug": "etfs",
      "category_color": "#3B82F6",
      "author_name": "Expansión",
      "views_count": 0
    }
  ],
  "count": 20,
  "limit": 20,
  "offset": 0
}
```

#### GET `/api/v1/noticias/[slug]`
Obtener un artículo individual con contenido completo

## Deployment y Ejecución

### Desplegar Edge Function

```bash
# Cargar SUPABASE_DB_PASSWORD desde .env.local
DB_PASSWORD=$(grep SUPABASE_DB_PASSWORD .env.local | cut -d= -f2)

# Deploy function
SUPABASE_DB_PASSWORD="${DB_PASSWORD}" ./bin/supabase-etf functions deploy fetch-news --no-verify-jwt
```

### Ejecutar Scraper Manualmente

```bash
# Obtener SERVICE_ROLE_KEY desde .env.local
SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2)

# Ejecutar con timeout de 180s
timeout 180 curl -X POST \
  "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json"
```

### Verificar Contenido en Base de Datos

```bash
# Ver estadísticas de contenido por fuente
cat > /tmp/check_stats.sql << 'SQL'
SELECT
  source_name,
  COUNT(*) as total_articles,
  ROUND(AVG(LENGTH(content))) as avg_content_length,
  MIN(LENGTH(content)) as min_length,
  MAX(LENGTH(content)) as max_length
FROM news_articles
GROUP BY source_name
ORDER BY total_articles DESC;
SQL

DB_PASSWORD=$(grep SUPABASE_DB_PASSWORD .env.local | cut -d= -f2)
SUPABASE_DB_PASSWORD="${DB_PASSWORD}" ./bin/supabase-etf db query \
  --file /tmp/check_stats.sql --linked
```

### Limpiar Base de Datos (Testing)

```bash
# Eliminar todos los artículos (útil para testing)
DB_PASSWORD=$(grep SUPABASE_DB_PASSWORD .env.local | cut -d= -f2)
SUPABASE_DB_PASSWORD="${DB_PASSWORD}" ./bin/supabase-etf db query \
  --sql "DELETE FROM news_articles; SELECT COUNT(*) as remaining;" \
  --linked
```

## Configuración de Cron Job (Automático)

### Opción A: Supabase Cron (Recomendado)

1. Ir a **Supabase Dashboard** → Database → Functions
2. Crear nueva función SQL:

```sql
-- Crear función que llama a Edge Function
CREATE OR REPLACE FUNCTION public.fetch_news_cron()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Llamar a Edge Function usando pg_net
  PERFORM net.http_post(
    url := 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    )
  );
END;
$$;
```

3. Configurar **pg_cron** schedule:

```sql
-- Ejecutar cada 6 horas
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);

-- Ver jobs programados
SELECT * FROM cron.job;
```

### Opción B: GitHub Actions (Alternativa)

Crear `.github/workflows/fetch-news.yml`:

```yaml
name: Fetch News

on:
  schedule:
    - cron: '0 */6 * * *'  # Cada 6 horas
  workflow_dispatch:  # Permitir ejecución manual

jobs:
  fetch-news:
    runs-on: ubuntu-latest
    steps:
      - name: Call Supabase Edge Function
        run: |
          curl -X POST \
            "${{ secrets.SUPABASE_URL }}/functions/v1/fetch-news" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json"
```

**Configurar secrets en GitHub:**
- `SUPABASE_URL`: https://utvioubcqkwwzvufhups.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY`: (desde .env.local)

### Opción C: Vercel Cron Jobs

Crear `app/api/cron/fetch-news/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verificar authorization header (protección)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Llamar a Supabase Edge Function
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-news`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
```

Configurar en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/fetch-news",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

## Workflow de Publicación

### 1. Scraper Automático (Cada 6 horas)
- Cron job ejecuta `fetch-news`
- Nuevos artículos se crean con `status = 'draft'`

### 2. Revisar Noticias en Draft

```sql
-- Ver noticias recientes en draft
SELECT
  id,
  LEFT(title, 60) as title,
  source_name,
  LENGTH(content) as content_length,
  source_published_at::date as pub_date
FROM news_articles
WHERE status = 'draft'
ORDER BY source_published_at DESC
LIMIT 20;
```

### 3. Publicar Noticias

**Opción A: Publicar todas las noticias en draft**
```sql
UPDATE news_articles
SET
  status = 'published',
  published_at = source_published_at
WHERE status = 'draft';
```

**Opción B: Publicar por categoría**
```sql
UPDATE news_articles
SET status = 'published', published_at = source_published_at
WHERE status = 'draft'
  AND category_id IN (SELECT id FROM news_categories WHERE slug = 'etfs')
ORDER BY source_published_at DESC
LIMIT 20;
```

**Opción C: Publicar artículos específicos**
```sql
UPDATE news_articles
SET status = 'published', published_at = NOW()
WHERE id IN ('uuid1', 'uuid2');
```

### 4. Verificar Publicación

Visitar: https://etfnexo.vercel.app/noticias

## Mantenimiento

### Ver Estadísticas

```sql
-- Noticias por estado
SELECT status, COUNT(*) as total
FROM news_articles
GROUP BY status;

-- Noticias por fuente
SELECT source_name, COUNT(*) as total,
       ROUND(AVG(LENGTH(content))) as avg_length
FROM news_articles
GROUP BY source_name
ORDER BY total DESC;

-- Noticias por categoría
SELECT c.name, COUNT(a.id) as total
FROM news_categories c
LEFT JOIN news_articles a ON c.id = a.category_id AND a.status = 'published'
GROUP BY c.id, c.name;
```

### Verificar Calidad de Contenido

```sql
-- Ver muestra de contenido limpio
SELECT
  source_name,
  title,
  LENGTH(content) as chars,
  LEFT(content, 400) as content_preview
FROM news_articles
ORDER BY created_at DESC
LIMIT 5;
```

### Eliminar Duplicados

```sql
-- Encontrar duplicados por source_url
SELECT source_url, COUNT(*) as duplicates
FROM news_articles
WHERE source_url IS NOT NULL
GROUP BY source_url
HAVING COUNT(*) > 1;

-- Eliminar duplicados (mantener el más antiguo)
DELETE FROM news_articles a
USING news_articles b
WHERE a.id > b.id
  AND a.source_url = b.source_url;
```

### Archivar Noticias Antiguas

```sql
-- Archivar noticias de más de 6 meses
UPDATE news_articles
SET status = 'archived'
WHERE status = 'published'
  AND published_at < NOW() - INTERVAL '6 months';
```

## Troubleshooting

### Caracteres mal codificados (compa��as)
**Solución:** El scraper detecta automáticamente windows-1252 y convierte a UTF-8

### Contenido con sidebars ("Compartir en Facebook...")
**Solución:** Ya implementado en v3 con 30+ filtros. Redesplegar si persiste.

### Artículos muy cortos (< 1000 chars)
**Solución:** Threshold es 1000 chars. Si RSS es corto, se scrape HTML completo.

### Imágenes no se muestran
**Solución:** Usar tags `<img>` regulares, no Next.js `<Image fill>`. Ver commit 811c31d.

### Edge Function timeout
**Solución:** Reducir número de fuentes RSS o aumentar timeout en fetch:
```typescript
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000) // 30s timeout
});
```

## Archivos Relacionados

- `supabase/migrations/20260604000001_create_news_system.sql` - Schema de BD
- `supabase/functions/fetch-news/index.ts` - Edge Function (Scraper v3)
- `app/api/v1/noticias/route.ts` - API de listado
- `app/api/v1/noticias/[slug]/route.ts` - API de artículo individual
- `app/page.tsx` - Homepage con noticias
- `app/noticias/page.tsx` - Página de listado de noticias
- `app/noticias/[slug]/page.tsx` - Página de detalle de noticia
- `app/styles/components/noticias.css` - Estilos de noticias
- `types/database.types.ts` - Tipos de TypeScript
- `docs/NEWS_SOURCES.md` - Listado completo de fuentes RSS

## Próximas Mejoras

1. **Auto-publicación inteligente**
   - Publicar automáticamente después de scraping (si calidad > threshold)
   - Clasificación IA para detectar relevancia

2. **Panel de Administración**
   - UI para revisar/editar drafts
   - Publicación con un click
   - Analytics integrados

3. **SEO Automático**
   - Auto-generar meta_title y meta_description
   - Optimizar slugs con IA

4. **Más Fuentes**
   - FundsPeople
   - Morningstar España
   - BlackRock España Blog

5. **Notificaciones**
   - Email cuando hay nuevos drafts
   - Webhook a Slack
   - Alertas de noticias importantes

## Contacto y Soporte

- Supabase Dashboard: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- Edge Functions: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions
- Production: https://etfnexo.vercel.app
