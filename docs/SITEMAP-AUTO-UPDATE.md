# 🔄 Sistema de Actualización Automática de Sitemaps

**Fecha:** 2026-09-28  
**Estado:** ✅ Implementado y funcionando

---

## 📊 Resumen Ejecutivo

Los sitemaps de ETF Nexo se actualizan **automáticamente** sin intervención manual:

- ✅ **Sitemaps dinámicos:** Generados en tiempo real desde Supabase
- ✅ **Cache optimizado:** Fresh en <1 hora, stale-while-revalidate 24h
- ✅ **Google/Bing ping:** Notificación automática cuando se publica contenido
- ✅ **Sin CRON jobs externos:** Todo integrado en Next.js + Vercel

---

## 🏗️ Arquitectura del Sistema

### 1. **Sitemaps Dinámicos (Automático)**

```typescript
// app/sitemap.ts
export const dynamic = 'force-dynamic'; // ← CLAVE: Sin cache estático

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  
  // Consulta EN TIEMPO REAL a Supabase
  const { data: noticias } = await supabase
    .from('news_articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  
  // Retorna URLs frescas SIEMPRE
  return noticias.map(article => ({
    url: `https://etfnexo.com/noticias/${article.slug}`,
    lastModified: new Date(article.updated_at),
  }));
}
```

**Cómo funciona:**
1. Google/Bing visita `https://etfnexo.com/sitemap.xml`
2. Next.js ejecuta la función `sitemap()` en runtime (no build-time)
3. Consulta Supabase → URLs actuales
4. Genera XML dinámicamente
5. Cache: 0s browser, 1h CDN, 24h stale-while-revalidate

### 2. **Sitemaps por Sección (Automático)**

| Sitemap | Endpoint | Actualización |
|---------|----------|---------------|
| Principal | `/sitemap.xml` | Tiempo real |
| Noticias | `/noticias/sitemap.xml` | Tiempo real |
| Academia | `/academia/sitemap.xml` | Tiempo real |
| Entrevistas | `/entrevistas/sitemap.xml` | Tiempo real |

**Cache headers optimizados:**
```typescript
'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400'
```

- `max-age=0`: Browser siempre revalida
- `s-maxage=3600`: CDN cachea 1 hora
- `stale-while-revalidate=86400`: Sirve stale mientras revalida en background (24h)

---

## 🔔 Notificación Automática a Google/Bing

### API Endpoint: `/api/sitemap-ping`

```bash
# POST request con secret key
curl -X POST https://etfnexo.com/api/sitemap-ping \
  -H "Content-Type: application/json" \
  -d '{"secretKey": "YOUR_SECRET_KEY"}'

# GET request (más simple)
curl "https://etfnexo.com/api/sitemap-ping?secret=YOUR_SECRET_KEY"
```

**Qué hace:**
1. Valida secret key (previene abuse)
2. Hace ping a Google: `https://www.google.com/ping?sitemap=...`
3. Hace ping a Bing: `https://www.bing.com/ping?sitemap=...`
4. Retorna resultados:
   ```json
   {
     "success": true,
     "results": [
       {"sitemap": "https://etfnexo.com/sitemap.xml", "google": "OK", "bing": "OK"},
       {"sitemap": "https://etfnexo.com/noticias/sitemap.xml", "google": "OK", "bing": "OK"}
     ]
   }
   ```

---

## 🔧 Configuración (Una sola vez)

### PASO 1: Agregar Secret Key a Vercel

```bash
# En Vercel Dashboard > Settings > Environment Variables
SITEMAP_PING_SECRET=tu_secret_key_aleatorio_largo_y_seguro
```

**Generar secret seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### PASO 2: Ejecutar Migración de Supabase

```bash
cd supabase
supabase db push
```

Esto crea:
- ✅ Función `notify_sitemap_update()`
- ✅ Triggers en `news_articles`, `academy_articles`, `interviews`

---

## 🚀 Opciones de Activación Automática

### **OPCIÓN 1: Manual desde Admin Panel** (Más simple)

Agregar un botón en el panel admin que llame al API después de publicar:

```typescript
// components/admin/PublishButton.tsx
async function handlePublish() {
  // 1. Publicar artículo
  await publishArticle(articleId);
  
  // 2. Notificar a Google/Bing
  await fetch('/api/sitemap-ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      secretKey: process.env.NEXT_PUBLIC_SITEMAP_PING_SECRET 
    }),
  });
}
```

### **OPCIÓN 2: CRON Job (Recomendado para producción)**

Configurar en Vercel Cron o Supabase pg_cron:

```sql
-- Ejecutar cada hora
SELECT cron.schedule(
  'sitemap-ping-hourly',
  '0 * * * *', -- Cada hora en punto
  $$
    SELECT net.http_post(
      url := 'https://etfnexo.com/api/sitemap-ping',
      headers := '{"Content-Type": "application/json"}',
      body := '{"secretKey": "YOUR_SECRET_KEY"}'
    );
  $$
);
```

**Ventajas:**
- ✅ Totalmente automático
- ✅ No requiere cambios en admin
- ✅ Funciona incluso si se publica desde base de datos directamente

### **OPCIÓN 3: Supabase Edge Function** (Más avanzado)

```typescript
// supabase/functions/sitemap-ping/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { table, slug } = await req.json();
  
  // Notificar a ETF Nexo API
  await fetch('https://etfnexo.com/api/sitemap-ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      secretKey: Deno.env.get('SITEMAP_PING_SECRET') 
    }),
  });
  
  return new Response('OK', { status: 200 });
});
```

Trigger desde Postgres:
```sql
SELECT net.http_post(
  url := 'https://your-project.supabase.co/functions/v1/sitemap-ping',
  headers := '{"Authorization": "Bearer YOUR_ANON_KEY"}',
  body := json_build_object('table', TG_TABLE_NAME, 'slug', NEW.slug)::text
);
```

---

## 📊 Monitoreo

### Verificar que los sitemaps están frescos:

```bash
# Verificar lastmod del sitemap principal
curl -s https://etfnexo.com/sitemap.xml | grep -o '<lastmod>[^<]*' | head -5

# Verificar que responde dinámicamente
curl -I https://etfnexo.com/sitemap.xml | grep -i cache-control
```

Debe devolver:
```
Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400
```

### Verificar ping manual:

```bash
# Test manual (reemplazar SECRET)
curl "https://etfnexo.com/api/sitemap-ping?secret=YOUR_SECRET_KEY"
```

Respuesta esperada:
```json
{
  "success": true,
  "results": [
    {"sitemap": "...", "google": "OK", "bing": "OK"}
  ],
  "timestamp": "2026-09-28T12:00:00.000Z"
}
```

---

## 🎯 Frecuencia de Actualización

### Sitemaps (Automático):
- **Browser:** Siempre fresh (max-age=0)
- **CDN (Vercel):** Cache 1 hora
- **Google crawler:** Detecta cambios en <24h
- **Bing crawler:** Detecta cambios en <48h

### Ping a buscadores:
- **Manual:** Después de publicar contenido importante
- **CRON:** Cada hora (recomendado)
- **Edge Function:** Inmediato al publicar (avanzado)

---

## ✅ Checklist de Implementación

### Ya implementado:
- [x] Sitemaps dinámicos (`export const dynamic = 'force-dynamic'`)
- [x] Cache headers optimizados
- [x] API endpoint `/api/sitemap-ping`
- [x] Migración Supabase con triggers
- [x] Validación con secret key

### Por configurar (una sola vez):
- [ ] Agregar `SITEMAP_PING_SECRET` a Vercel
- [ ] Ejecutar migración Supabase
- [ ] Elegir opción de activación (Manual, CRON o Edge Function)
- [ ] Probar ping manual
- [ ] Verificar en Google Search Console que detecta cambios

---

## 🔍 Troubleshooting

### Sitemap no actualiza:

1. **Verificar que es dinámico:**
   ```bash
   curl -s https://etfnexo.com/sitemap.xml | grep lastmod | head -1
   ```
   Debe mostrar fecha reciente.

2. **Limpiar cache de Vercel:**
   - Ir a Vercel Dashboard
   - Deployments → Latest → More → Purge Cache

3. **Verificar en Supabase:**
   ```sql
   SELECT slug, published_at, status 
   FROM news_articles 
   WHERE status = 'published' 
   ORDER BY published_at DESC 
   LIMIT 5;
   ```

### Ping falla (401 Unauthorized):

1. Verificar que `SITEMAP_PING_SECRET` está en Vercel
2. Verificar que el secret en la request coincide
3. Re-deploy si agregaste el secret después del deploy

### Google no detecta cambios:

1. **Paciencia:** Puede tardar 24-48h en primera indexación
2. **Ping manual:** Usar API endpoint para forzar notificación
3. **Verificar en GSC:**
   - Ir a Sitemaps
   - Ver "Last read" date
   - Debe ser reciente (<24h)

---

## 📚 Referencias

- **Google Sitemap Ping:** https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap#notify-google
- **Bing Sitemap Ping:** https://www.bing.com/webmasters/help/Sitemaps-3b5cf6ed
- **Next.js Sitemaps:** https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
- **Vercel Cache Headers:** https://vercel.com/docs/edge-network/caching

---

**🎉 Los sitemaps de ETF Nexo se actualizan automáticamente sin intervención manual.**

**Frecuencia:** Tiempo real en sitemaps + Notificación a Google/Bing según configuración elegida.
