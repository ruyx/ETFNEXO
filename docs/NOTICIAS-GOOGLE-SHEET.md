# Sistema de Noticias - Google Sheet ÚNICO

## ✅ Estado Actual del Sistema

**Base de datos**: 0 artículos (limpia)
**Fuentes permitidas**: Solo Google Sheet
**Sistemas deshabilitados**: RSS feeds automáticos (Expansión, Finect, Rankia, Funds Society)

---

## 🚨 IMPORTANTE: Solo Google Sheet

El sistema ahora SOLO acepta noticias que estén en el Google Sheet configurado.
**No hay scraping automático de fuentes externas.**

---

## 📋 Cómo Importar Noticias del Google Sheet

### Opción 1: Importación Manual (Recomendado)

```bash
# Desde la raíz del proyecto
pnpm tsx scripts/import-google-sheet-with-scraping.ts
```

Este script:
1. Lee el Google Sheet configurado en `GOOGLE_SHEETS_NEWS_URL`
2. Extrae metadata de cada URL (título, imagen, autor, contenido)
3. Inserta solo las noticias que están en el Sheet

### Opción 2: Supabase Edge Function (Automático)

```bash
# Ejecutar función desde Supabase
curl -X POST \
  https://[PROJECT_ID].supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

---

## 🗑️ Sistemas Eliminados

Los siguientes sistemas fueron **DESHABILITADOS** y **NO DEBEN REACTIVARSE**:

### ❌ `/supabase/functions/fetch-news.DISABLED/`
- **Qué hacía**: Scrapeaba automáticamente RSS de Expansión, Finect, Rankia, etc.
- **Por qué se eliminó**: Agregaba noticias sin autorización del usuario
- **Estado**: Renombrado a `.DISABLED` para prevenir ejecución

### ❌ Cron Jobs de Supabase
Si tienes cron jobs configurados en Supabase Dashboard, **desactívalos**:

1. Ve a Supabase Dashboard → Database → Cron
2. Busca jobs relacionados con `fetch-news`
3. Elimínalos o desactívalos

---

## 🔍 Verificar Estado Actual

### Ver distribución de noticias por fuente

```bash
pnpm tsx scripts/check-sources.ts
```

**Output esperado:**
```
📊 Distribución por fuente:
────────────────────────────────────────────────────────────
TOTAL: X artículos (solo del Google Sheet)
```

### Limpiar noticias no autorizadas (si aparecen)

```bash
pnpm tsx scripts/cleanup-rss-news.ts
```

Este script elimina cualquier noticia de:
- Expansión
- Finect
- Rankia
- Funds Society
- Estrategias de Inversión
- Artículos sin fuente

---

## 📊 Google Sheet Esperado

El Google Sheet debe tener estas columnas:

| URL | Título (opcional) | Categoría (opcional) |
|-----|------------------|---------------------|
| https://... | ... | ETFs |
| https://... | ... | Gestoras |

**Solo la columna URL es obligatoria.**
El sistema scrapeará automáticamente:
- Título (desde meta tags o `<h1>`)
- Imagen destacada (Open Graph, Twitter Cards)
- Autor
- Contenido del artículo

---

## ⚠️ Prevenir Futuros Problemas

### NO hacer:
- ❌ NO reactivar `/supabase/functions/fetch-news`
- ❌ NO crear nuevos cron jobs automáticos sin autorización
- ❌ NO agregar fuentes RSS hardcoded en el código

### SÍ hacer:
- ✅ Agregar URLs al Google Sheet manualmente
- ✅ Ejecutar `import-google-sheet-with-scraping.ts` cuando quieras actualizar
- ✅ Verificar con `check-sources.ts` periódicamente

---

## 🔧 Troubleshooting

### "No se importan noticias del Sheet"

1. Verifica que `GOOGLE_SHEETS_NEWS_URL` esté configurado en `.env.local`
2. Verifica que el Sheet sea público o tengas permisos
3. Ejecuta el script con logs:
   ```bash
   pnpm tsx scripts/import-google-sheet-with-scraping.ts
   ```

### "Aparecen noticias de Expansión otra vez"

Alguien reactivó el sistema RSS. Ejecuta:
```bash
pnpm tsx scripts/cleanup-rss-news.ts
```

---

## 📝 Cambios Aplicados (2026-06-26)

- ✅ Deshabilitado `fetch-news` Supabase Function
- ✅ Eliminados 98 artículos de fuentes RSS
- ✅ Creado script de limpieza `cleanup-rss-news.ts`
- ✅ Creado script de verificación `check-sources.ts`
- ✅ Base de datos limpia (0 artículos)

---

## 📞 Soporte

Si tienes dudas sobre el sistema de noticias, consulta este documento antes de modificar código.
