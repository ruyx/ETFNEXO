# Sistema de Noticias - Google Sheet ÚNICO

## ✅ Estado Actual del Sistema

**Base de datos**: 56 artículos (del Google Sheet)
**Fuentes permitidas**: Solo Google Sheet
**Sistemas deshabilitados**: RSS feeds automáticos (Expansión bloqueado)
**Sistema automático**: ✅ ACTIVO - Importación diaria a las 06:00 UTC
**Última importación**: 1 de julio de 2026
**Encoding**: ✅ UTF-8 correcto (problema resuelto)

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

### Opción 2: Sistema Automático Diario (ACTIVO)

✅ **El sistema automático está configurado y activo**

- **Horario**: Todos los días a las 06:00 UTC
- **Cron job**: `import-gsheets-daily`
- **Función**: Llama a la Edge Function `import-gsheets-news`

**Verificar que el cron está activo:**
```sql
-- Conectar a Supabase Dashboard → SQL Editor
SELECT jobname, schedule, active
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

**Ver logs de ejecuciones:**
```sql
SELECT job_name, status, message, executed_at
FROM cron_logs
WHERE job_name = 'import-gsheets'
ORDER BY executed_at DESC
LIMIT 10;
```

**Ejecutar manualmente (si es necesario):**
```bash
curl -X POST \
  https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
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
   npx tsx scripts/import-google-sheet-with-scraping.ts
   ```

### "Aparecen noticias de Expansión otra vez"

Alguien reactivó el sistema RSS. Ejecuta:
```bash
npx tsx scripts/cleanup-rss-news.ts
```

### "Los artículos no tienen imágenes destacadas"

**Problema conocido**: El scraper intenta extraer imágenes de las URLs pero muchas fallan con 404.

**Causas posibles:**
- Enlaces antiguos en el Google Sheet (páginas eliminadas o movidas)
- Sitios bloqueando el scraping
- Cambios en estructura HTML de las páginas

**Soluciones:**
1. **Verificar URLs**: Asegúrate que los enlaces en el Google Sheet sean actuales
2. **Revisar scraper**: El scraper está en `lib/scraper.ts` - podría necesitar actualizaciones
3. **Agregar imágenes manualmente**: Por ahora, los artículos se publican sin imagen pero con todo el contenido

---

## 📝 Cambios Aplicados (2026-06-26)

### Fase 1: Limpieza (Completada)
- ✅ Deshabilitado `fetch-news` Supabase Function
- ✅ Eliminados 98 artículos de fuentes RSS no autorizadas
- ✅ Creado script de limpieza `cleanup-rss-news.ts`
- ✅ Creado script de verificación `check-sources.ts`
- ✅ Base de datos limpiada completamente

### Fase 2: Sistema Automático (Completada)
- ✅ Migración `20260624181500_sistema_blindado_google_sheets.sql` aplicada
- ✅ Cron job `import-gsheets-daily` configurado (06:00 UTC)
- ✅ Función `import_gsheets_cron()` creada
- ✅ Sistema de monitoreo con vista `news_system_status`
- ✅ Función de verificación `verify_news_system()`

### Fase 3: Población Inicial (Completada)
- ✅ Importados 56 artículos del Google Sheet
- ✅ Distribución: Finect (21), Rankia (16), Funds Society (13), Morningstar (5), Cinco Días (1)
- ⚠️ Problema conocido: Artículos sin imágenes (URLs antiguas o bloqueadas)

### Fase 4: Corrección Encoding UTF-8 (Completada - 2026-07-01)
- ✅ Detectado problema: Caracteres españoles mostraban "Ã©" en lugar de "é"
- ✅ Root cause: Edge Function intentaba `windows-1252` antes de UTF-8
- ✅ Solución: Modificado para usar SIEMPRE UTF-8 (estándar web moderno)
- ✅ Limpieza: 8 artículos afectados eliminados y reimportados
- ✅ Verificación: 100% artículos sin problemas (0/20 con errores)
- 📄 Documentación: Ver `/docs/RESOLUCION_ENCODING_UTF8.md`

---

## 📞 Soporte

Si tienes dudas sobre el sistema de noticias, consulta este documento antes de modificar código.
