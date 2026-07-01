# 📋 Changelog - Sistema de Noticias ETF Nexo

---

## [2026-07-01] - Corrección Encoding UTF-8 + Cron Job Configurado

### ✅ Fixed
- **Problema de encoding UTF-8**: Caracteres españoles (á, é, í, ó, ú, ñ) se mostraban como "Ã©", "Ã³", etc.
  - **Root cause**: Edge Function intentaba decodificar como `windows-1252` primero
  - **Solución**: Modificado para usar SIEMPRE `UTF-8` (estándar web moderno)
  - **Archivo**: `/supabase/functions/import-gsheets-news/index.ts` (líneas 105-116)
  - **Resultado**: 100% de artículos sin problemas de encoding (verificado con 20 artículos)

### ✅ Added
- **Script de diagnóstico**: `/scripts/check-encoding-issues.ts`
  - Detecta automáticamente artículos con problemas de encoding
  - Identifica patrones: "Ã", "â€", "Â", "Ã©", "Ã³"
  - Uso: `npx tsx scripts/check-encoding-issues.ts`

### ✅ Configured
- **Cron job automático**: `import-gsheets-daily`
  - Frecuencia: Diario a las 06:00 UTC
  - Método: pg_cron vía SQL Editor
  - Estado: ACTIVO y funcionando
  - Comando verificación: `SELECT * FROM cron.job WHERE jobname = 'import-gsheets-daily'`

### 🗑️ Cleaned
- Eliminados 8 artículos con encoding incorrecto
- Reimportados con UTF-8 correcto
- IDs afectados documentados en `/docs/RESOLUCION_ENCODING_UTF8.md`

### 📄 Documentation
- Creado `/docs/RESOLUCION_ENCODING_UTF8.md` - Guía completa del problema y solución
- Actualizado `/docs/CONFIGURAR_CRON_GOOGLE_SHEETS.md` - Estado cron job activo
- Actualizado `/docs/NOTICIAS-GOOGLE-SHEET.md` - Fase 4 completada

---

## [2026-06-30] - Edge Function Desplegada

### ✅ Deployed
- **Edge Function**: `import-gsheets-news`
  - URL: `https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news`
  - Estado: Desplegada y funcionando
  - Método: `supabase functions deploy`

### ✅ Fixed
- Problema: Edge Function no estaba desplegada (404)
- Solución: Autenticación con Supabase CLI + despliegue manual
- Resultado: 10 artículos importados, 70 omitidos (ya existían), 3 errores de scraping

### 📄 Documentation
- Actualizado `/docs/NOTICIAS-GOOGLE-SHEET.md` con comandos de importación manual

---

## [2026-06-26] - Sistema Google Sheet Único

### ✅ Added
- **Sistema automático diario**: Importación desde Google Sheet a las 06:00 UTC
- **Cron job**: `import-gsheets-daily` (inicialmente configurado, luego verificado activo en 2026-07-01)
- **Función PL/pgSQL**: `import_gsheets_cron()` para llamar a Edge Function vía pg_net
- **Vista de monitoreo**: `news_system_status` para verificar estado del sistema
- **Función de verificación**: `verify_news_system()` para diagnósticos

### 🗑️ Removed
- **Deshabilitado**: `/supabase/functions/fetch-news` (RSS automático)
- **Eliminados**: 98 artículos de fuentes RSS no autorizadas (Expansión, Finect, Rankia, etc.)
- **Limpieza completa**: Solo artículos del Google Sheet permanecen

### ✅ Created
- Script de limpieza: `/scripts/cleanup-rss-news.ts`
- Script de verificación: `/scripts/check-sources.ts`
- Script de importación: `/scripts/import-google-sheet-with-scraping.ts`
- Migración SQL: `20260624181500_sistema_blindado_google_sheets.sql`

### 📄 Documentation
- Creado `/docs/NOTICIAS-GOOGLE-SHEET.md` - Guía completa del nuevo sistema
- Creado `/docs/DESACTIVAR_CRON_RSS.md` - Cómo desactivar sistemas RSS
- Creado `/docs/CONFIGURAR_CRON_GOOGLE_SHEETS.md` - Configuración pg_cron

### 📊 Data
- **Población inicial**: 56 artículos del Google Sheet
- **Distribución**: Finect (21), Rankia (16), Funds Society (13), Morningstar (5), Cinco Días (1)
- ⚠️ **Problema conocido**: Algunos artículos sin imágenes (URLs antiguas/bloqueadas)

---

## Estado del Sistema - Resumen

| Componente                      | Estado | Última actualización |
| ------------------------------- | ------ | -------------------- |
| Edge Function                   | ✅ Activa | 2026-07-01           |
| Cron Job Automático             | ✅ Activo | 2026-07-01           |
| Encoding UTF-8                  | ✅ Corregido | 2026-07-01           |
| Google Sheet único              | ✅ Operativo | 2026-06-26           |
| RSS automático (fetch-news)     | ❌ Deshabilitado | 2026-06-26           |
| Script de diagnóstico encoding  | ✅ Creado | 2026-07-01           |
| Documentación completa          | ✅ Actualizada | 2026-07-01           |

---

## Comandos Útiles

### Verificar Estado del Sistema
```bash
# Verificar encoding de artículos
cd /home/suario/ruy
npx tsx scripts/check-encoding-issues.ts

# Verificar distribución por fuente
npx tsx scripts/check-sources.ts

# Importar manualmente desde Google Sheet
npx tsx scripts/import-google-sheet-with-scraping.ts
```

### Gestión del Cron Job
```sql
-- Ver estado del cron job
SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'import-gsheets-daily';

-- Ver historial de ejecuciones
SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'import-gsheets-daily') ORDER BY start_time DESC LIMIT 10;

-- Ejecutar manualmente
SELECT public.import_gsheets_cron();
```

### Desplegar Edge Function
```bash
cd /home/suario/ruy
supabase functions deploy import-gsheets-news --project-ref utvioubcqkwwzvufhups
```

---

**Última actualización**: 2026-07-01
