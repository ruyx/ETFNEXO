# 🚀 Desplegar Edge Function de Scraping - Supabase Dashboard

## ⚠️ PROBLEMA ACTUAL

Los artículos **NO tienen contenido ni imágenes** porque la Edge Function `scrape-article-content` **NO está desplegada**.

Los artículos se están guardando solo con:
```
Content: "Artículo importado desde www.finect.com"  (39 chars)
Excerpt: "Noticia sobre ETFs del 09/06/2026"  (33 chars)
Featured Image: null
```

---

## ✅ SOLUCIÓN: Desplegar Edge Function Manualmente

### Opción 1: Desplegar desde Supabase Dashboard (RECOMENDADO)

#### Paso 1: Ir a Edge Functions

1. Abrir https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
2. Click en **"Edge Functions"** en el menú lateral
3. Click en **"New Function"** o **"Deploy Function"**

#### Paso 2: Subir el Código

1. Nombre de la función: `scrape-article-content`
2. Copiar y pegar el código desde `supabase/functions/scrape-article-content/index.ts`
3. Click en **"Deploy"**

#### Paso 3: Verificar Despliegue

```bash
# Desde terminal local, probar que la función responde
curl -X POST \
  https://utvioubcqkwwzvufhups.supabase.co/functions/v1/scrape-article-content \
  -H "Authorization: Bearer [TU_SERVICE_ROLE_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.finect.com/usuario/avillanuevae/articulos/blackrock-se-suma-a-la-fiebre-de-los-etfs-del-espacio-y-lanza-ishares-space-technologies-star"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "title": "BlackRock se suma a la fiebre de los ETFs del espacio...",
    "content": "...",
    "excerpt": "...",
    "featured_image_url": "https://...",
    "author_name": "...",
    "source_name": "Finect",
    "published_at": "2026-05-..."
  }
}
```

---

### Opción 2: Desplegar desde CLI (si tienes permisos)

```bash
# Login
supabase login

# Desplegar función
supabase functions deploy scrape-article-content
```

Si ves error **403**, usa la Opción 1 (Dashboard).

---

## 🔄 Después de Desplegar: Re-scrapear Artículos

Una vez desplegada la función, los artículos existentes **seguirán sin contenido**. Necesitas re-scrapearlos:

### Opción A: Borrar y Reimportar Todo

```bash
# 1. Limpiar BD
set -a && source .env.local && set +a && npx tsx scripts/cleanup-rss-news.ts

# 2. Importar de nuevo (ahora con scraping funcionando)
set -a && source .env.local && set +a && npx tsx scripts/import-google-sheet-with-scraping.ts
```

### Opción B: Re-scrapear Solo los Artículos Existentes

```bash
# Usar script de actualización (si existe)
set -a && source .env.local && set +a && npx tsx scripts/update-articles-with-scraping.ts
```

---

## ✅ Verificar que el Scraping Funciona

```bash
# Ver si los artículos ahora tienen contenido
set -a && source .env.local && set +a && npx tsx scripts/check-article-content.ts
```

**Antes:**
```
[1] 6092218 Mejores Etfs Oro
    Content: 39 chars ❌
    Featured Image: ❌ NO
```

**Después:**
```
[1] Los mejores ETFs de oro para invertir en 2026
    Content: 4500 chars ✅
    Featured Image: ✅ SI
```

---

## 🧪 Probar con un Artículo Específico

```typescript
// En Node.js
const response = await fetch(
  'https://utvioubcqkwwzvufhups.supabase.co/functions/v1/scrape-article-content',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer [SERVICE_ROLE_KEY]',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: 'https://www.finect.com/usuario/avillanuevae/articulos/su-mejor-mes-de-2026-los-etfs-europeos-captan-36400-millones-en-mayo-en-un-regreso-hacia-la-bolsa-eeuu-y-huida-de-europa'
    })
  }
)

const result = await response.json()
console.log(result)
```

---

## 📝 Notas Importantes

1. **La función está en**: `supabase/functions/scrape-article-content/index.ts`
2. **Permisos necesarios**: Owner o Billing admin en Supabase
3. **Edge Functions** son serverless - se ejecutan en Deno, no en Node.js
4. **Límites**: 500,000 invocaciones/mes en plan Free
5. **Timeout**: 150 segundos por invocación

---

## 🆘 Troubleshooting

### "403 Forbidden al desplegar desde CLI"
✅ Usa Supabase Dashboard (Opción 1)

### "404 Not Found al llamar a la función"
❌ La función no está desplegada - seguir Opción 1

### "Error: Failed to fetch article: 403/404"
⚠️ La URL del artículo puede estar protegida o no existir
Solución: Actualizar URLs en el Google Sheet

### "Content: 39 chars" después de desplegar
❌ Los artículos antiguos no se actualizan solos
Solución: Ejecutar re-scraping (ver arriba)

---

## 📊 Impacto Esperado

Antes: **0 artículos con imágenes y contenido real**
Después: **>90% de artículos con contenido completo y featured images**

Una vez desplegada la función, el sistema diario (06:00 UTC) scrapeará automáticamente todos los artículos nuevos.
