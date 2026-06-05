# Sistema de Publicación Automática de Noticias - ETF Nexo

## Resumen

Sistema completo de publicación de noticias automática que obtiene contenido de Google News RSS y otras fuentes, lo procesa y lo publica en el sitio web.

## ✅ Estado Actual

**Sistema completo y funcionando en producción:**
- ✅ Base de datos configurada con tablas y vistas
- ✅ Edge Function desplegada en Supabase con **filtros anti-crypto**
- ✅ Endpoints API implementados y funcionando
- ✅ **266 noticias** importadas (76 artículos crypto eliminados)
- ✅ **16 noticias** publicadas en el sitio
- ✅ **Filtrado automático**: 30+ keywords de crypto excluidas
- ✅ **5 fuentes RSS** especializadas en ETFs tradicionales
- ✅ Desplegado en producción: https://etfnexo.vercel.app

**Referencias de calidad documentadas:**
- ETFdb.com - Base de datos completa de ETFs
- Morningstar Global - Ratings y análisis institucional
- Ver documentación completa: `docs/NEWS_SOURCES.md`

## Arquitectura del Sistema

### 1. Base de Datos (Supabase)

#### Tablas Principales:

**`news_articles`** - Artículos de noticias
- `id`, `title`, `slug`, `excerpt`, `content`
- `category_id` - Referencia a categoría
- `source_name`, `source_url` - Tracking de fuente original
- `status` - `'draft'` | `'published'` | `'archived'`
- `published_at`, `views_count`, `shares_count`

**`news_categories`** - Categorías de noticias
- Pre-pobladas: ETFs, Gestoras, Mercados, Regulación, Educación, Opinión

**`news_tags`** - Tags flexibles para clasificación
- Pre-poblados: iShares, Vanguard, Amundi, Renta Variable, etc.

**`news_article_tags`** - Relación N:M artículos-tags

**`news_related_etfs`** - Relación artículos con ETFs específicos

#### Vista Principal:

**`news_articles_with_metadata`** - Vista completa con todos los datos relacionados

Migración: `supabase/migrations/20260604000001_create_news_system.sql`

### 2. Edge Function (Supabase Functions)

**Archivo:** `supabase/functions/fetch-news/index.ts`

**Función:** Obtener y procesar noticias automáticamente

**Fuentes Configuradas (5 fuentes especializadas):**
1. Google News ETF España - Fondos cotizados tradicionales
2. Google News Gestoras - BlackRock, Vanguard, iShares, Amundi, Invesco, SPDR
3. Google News ETF Renta Variable - Acciones y bolsa
4. Google News ETF Renta Fija - Bonos y deuda
5. Finect ETFs - Red social financiera española

**Filtros Anti-Crypto Implementados:**
- 30+ palabras clave excluidas (bitcoin, ethereum, crypto, blockchain, etc.)
- Filtrado en URL de Google News (-Bitcoin -crypto -criptomonedas)
- Filtrado en Edge Function (verificación de título y descripción)
- Ver lista completa: `docs/NEWS_SOURCES.md`

**Proceso:**
1. Obtiene noticias de cada fuente RSS
2. Parse de XML a JSON
3. **NUEVO:** Filtra artículos con keywords de crypto
4. Verifica duplicados por `source_url`
5. Genera slug único
6. Inserta en `news_articles` con status `'draft'`

**Cómo ejecutar manualmente:**
```bash
curl -X POST 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news' \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```

**Resultado última ejecución:**
- Total procesado: 145 artículos
- Insertados: 85 artículos nuevos
- Duplicados: 50 artículos
- **Filtrados (crypto)**: 10 artículos excluidos ✅
- Errores: 0

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
      "title": "Bitcoin ETFs sangran 4.300 millones...",
      "slug": "bitcoin-etfs-sangran-4300-millones",
      "excerpt": "Resumen...",
      "featured_image_url": "https://...",
      "published_at": "2026-06-05T...",
      "category_name": "ETFs",
      "category_slug": "etfs",
      "category_color": "#3B82F6",
      "author_name": "Redacción ETF Nexo",
      "views_count": 0
    }
  ],
  "count": 20,
  "limit": 20,
  "offset": 0
}
```

#### GET `/api/v1/noticias/[slug]`
Obtener un artículo individual

**Respuesta:**
```json
{
  "data": {
    "id": "uuid",
    "title": "...",
    "content": "Contenido completo...",
    "tags": [...],
    "related_etfs": [...]
  }
}
```

## Workflow de Publicación

### 1. Obtener Noticias (Automático o Manual)

**Opción A: Ejecutar Edge Function manualmente**
```bash
curl -X POST 'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news' \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

**Opción B: Configurar Cron Job en Supabase**
1. Ir a Supabase Dashboard → Edge Functions
2. Seleccionar `fetch-news`
3. Configurar Cron: `0 */6 * * *` (cada 6 horas)
4. Guardar

### 2. Revisar Noticias en Draft

```sql
-- Ver noticias recientes en draft
SELECT id, LEFT(title, 60) as title, source_name, source_published_at::date
FROM news_articles
WHERE status = 'draft'
ORDER BY source_published_at DESC
LIMIT 20;
```

### 3. Publicar Noticias

**Opción A: Publicar por categoría (SQL)**
```sql
UPDATE news_articles
SET
  status = 'published',
  published_at = source_published_at
WHERE id IN (
  SELECT id
  FROM news_articles
  WHERE status = 'draft'
  AND category_id IN (SELECT id FROM news_categories WHERE slug = 'etfs')
  ORDER BY source_published_at DESC
  LIMIT 20
);
```

**Opción B: Publicar artículos específicos**
```sql
UPDATE news_articles
SET status = 'published', published_at = NOW()
WHERE id IN ('uuid1', 'uuid2', ...);
```

**Opción C: Usar Supabase CLI**
```bash
SUPABASE_DB_PASSWORD="..." \
  supabase db query --file /path/to/publish.sql --linked
```

### 4. Verificar Publicación

Visitar: https://etfnexo.vercel.app

Las noticias publicadas aparecerán automáticamente en:
- Hero Section (primeras 4)
- Latest News Grid (6 artículos)

## Configuración de Fuentes RSS

Para agregar/modificar fuentes, editar el archivo:
`supabase/functions/fetch-news/index.ts`

```typescript
const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'Google News ETF España',
    url: 'https://news.google.com/rss/search?q=ETF+OR+fondos+cotizados+when:7d&hl=es&gl=ES&ceid=ES:es',
    category: 'etfs',
    language: 'es'
  },
  // Agregar más fuentes aquí...
];
```

Luego redesplegar:
```bash
supabase functions deploy fetch-news
```

## Mantenimiento

### Ver Estadísticas

```sql
-- Noticias por estado
SELECT status, COUNT(*) as total
FROM news_articles
GROUP BY status;

-- Noticias por categoría
SELECT c.name, COUNT(a.id) as total
FROM news_categories c
LEFT JOIN news_articles a ON c.id = a.category_id AND a.status = 'published'
GROUP BY c.id, c.name;

-- Top 10 noticias más vistas
SELECT LEFT(title, 50) as title, views_count, published_at::date
FROM news_articles
WHERE status = 'published'
ORDER BY views_count DESC
LIMIT 10;
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
  AND a.source_url = b.source_url
  AND a.source_url IS NOT NULL;
```

### Archivar Noticias Antiguas

```sql
-- Archivar noticias de más de 6 meses
UPDATE news_articles
SET status = 'archived'
WHERE status = 'published'
  AND published_at < NOW() - INTERVAL '6 months';
```

## Próximas Mejoras

### Mejoras Recomendadas:

1. **Web Scraping Completo**
   - Actualmente solo se guarda el `description` del RSS
   - Implementar scraping del artículo completo desde la URL original
   - Extraer imágenes, contenido HTML limpio

2. **Clasificación Automática con IA**
   - Usar OpenAI/Claude para:
     - Categorizar automáticamente
     - Generar tags relevantes
     - Detectar ETFs mencionados
     - Crear excerpt optimizado

3. **SEO Automático**
   - Auto-generar `meta_title` y `meta_description`
   - Optimizar slugs
   - Generar `featured_image_url` desde OpenGraph

4. **Panel de Administración**
   - UI para revisar/editar drafts
   - Publicación con un click
   - Programar publicaciones
   - Analytics integrados

5. **Cron Job Automático**
   - Ya configurado en Supabase
   - Ejecutar cada 6 horas: `0 */6 * * *`

6. **Notificaciones**
   - Email cuando hay nuevos drafts
   - Webhook a Slack/Discord
   - Alertas de noticias importantes

7. **Más Fuentes**
   - FundsPeople RSS
   - BlackRock Blog
   - Morningstar
   - Expansión/El Economista con filtros de ETF

## Troubleshooting

### Error: "Duplicated source_url"
**Solución:** La función automáticamente detecta y omite duplicados. No requiere acción.

### Error: "Category not found"
**Solución:** Verificar que el slug de categoría existe en `news_categories`

### Noticias no aparecen en el sitio
**Checklist:**
1. ¿Status es `'published'`?
2. ¿`published_at` está configurado?
3. ¿La API devuelve datos? → `curl https://etfnexo.vercel.app/api/v1/noticias`
4. ¿Despliegue completado en Vercel?

### Edge Function timeout
**Solución:** Reducir número de fuentes o ajustar timeout en Supabase Dashboard

## Archivos Relacionados

- `supabase/migrations/20260604000001_create_news_system.sql` - Schema de BD
- `supabase/functions/fetch-news/index.ts` - Edge Function
- `app/api/v1/noticias/route.ts` - API de listado
- `app/api/v1/noticias/[slug]/route.ts` - API de artículo individual
- `app/page.tsx` - Homepage con noticias
- `types/database.types.ts` - Tipos de TypeScript

## Contacto y Soporte

Para más información o soporte:
- Repositorio: (agregar URL del repo)
- Documentación Supabase: https://supabase.com/docs
- Documentación Next.js: https://nextjs.org/docs
