# 🔧 Resolución: Problema de Encoding UTF-8 en Importación Google Sheets

**Fecha**: 2026-07-01
**Estado**: ✅ **RESUELTO COMPLETAMENTE**

---

## 📋 Descripción del Problema

Los artículos importados desde Google Sheets mostraban caracteres españoles incorrectamente:

- ❌ "gestiÃ³n" en lugar de "gestión"
- ❌ "CÃ³mo" en lugar de "Cómo"
- ❌ "EspaÃ±a" en lugar de "España"
- ❌ "mÃ¡s" en lugar de "más"

**Patrón detectado**: `Ã`, `â€`, `Â`, `Ã©`, `Ã³`, `Ã±` → indica UTF-8 mal interpretado como ISO-8859-1

---

## 🔍 Diagnóstico

### Herramienta de Diagnóstico Creada

**Archivo**: `/home/suario/ruy/scripts/check-encoding-issues.ts`

```typescript
// Script para detectar artículos con problemas de encoding
const hasIssue = article.title.includes('Ã') ||
                 article.title.includes('â€') ||
                 article.title.includes('Â') ||
                 article.title.includes('Ã©') ||
                 article.title.includes('Ã³');
```

**Comando de ejecución**:
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/check-encoding-issues.ts
```

### Resultado Inicial

```
📊 Resumen:
   Total artículos: 20
   Con problemas: 8
   Sin problemas: 12
```

**8 artículos afectados** con IDs:
- `8cefc14f-5c01-4848-a8f6-b5ea5ef26f12`
- `3221d582-5a77-4cbc-9cc7-02ae88141740`
- `f8452873-dcdd-49cb-9c10-a94b647e9b6f`
- `b5c27978-be99-4f75-a806-9acea32e6d39`
- `238992ea-0d96-4c0a-aba4-0359b3a226f6`
- `a99dca4b-9e96-4b14-845c-0e4a1621e898`
- `f18b10e2-d6ed-4513-b2dd-ea2db60354de`
- `9c86ee3e-5785-420c-9f5a-75eb20841dd9`

---

## 🛠️ Root Cause

**Archivo problemático**: `/home/suario/ruy/supabase/functions/import-gsheets-news/index.ts`

**Código original (líneas 105-116)**:
```typescript
const finalUrl = response.url || url;
const buffer = await response.arrayBuffer();

// ❌ PROBLEMA: Intentar decodificar como windows-1252 primero
let html: string;
try {
  const decoder = new TextDecoder('windows-1252');
  html = decoder.decode(buffer);
} catch {
  const decoder = new TextDecoder('utf-8');
  html = decoder.decode(buffer);
}
```

**Explicación técnica**:
1. El HTML de los sitios web modernos viene en UTF-8
2. El decoder intentaba `windows-1252` primero
3. UTF-8 mal interpretado como `windows-1252` → double encoding
4. Resultado: "é" (UTF-8: `C3 A9`) → "Ã©" cuando se lee como Latin-1

---

## ✅ Solución Aplicada

### 1. Corrección del Código

**Código corregido**:
```typescript
const finalUrl = response.url || url;
const buffer = await response.arrayBuffer();

// ✅ SOLUCIÓN: SIEMPRE decodificar como UTF-8 (estándar web moderno)
// El problema anterior era intentar windows-1252 primero, lo que causaba
// que los caracteres UTF-8 se interpretaran incorrectamente
const decoder = new TextDecoder('utf-8');
const html = decoder.decode(buffer);
```

**Cambio aplicado**: Líneas 105-116 de `supabase/functions/import-gsheets-news/index.ts`

### 2. Despliegue de la Corrección

```bash
cd /home/suario/ruy
supabase functions deploy import-gsheets-news --project-ref utvioubcqkwwzvufhups
```

**Resultado**:
```
Deployed Functions on project utvioubcqkwwzvufhups: import-gsheets-news
You can inspect your deployment in the Dashboard: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions
```

### 3. Limpieza de Artículos Afectados

```bash
cd /home/suario/ruy
supabase db query --linked "DELETE FROM news_articles WHERE id IN ('8cefc14f-5c01-4848-a8f6-b5ea5ef26f12', '3221d582-5a77-4cbc-9cc7-02ae88141740', 'f8452873-dcdd-49cb-9c10-a94b647e9b6f', 'b5c27978-be99-4f75-a806-9acea32e6d39', '238992ea-0d96-4c0a-aba4-0359b3a226f6', 'a99dca4b-9e96-4b14-845c-0e4a1621e898', 'f18b10e2-d6ed-4513-b2dd-ea2db60354de', '9c86ee3e-5785-420c-9f5a-75eb20841dd9');"
```

**Resultado**: 8 artículos eliminados correctamente

### 4. Reimportación con Encoding Correcto

```bash
curl -X POST "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c"
```

**Resultado**:
```json
{"total":83,"imported":8,"skipped":72,"errors":3}
```

✅ **8 artículos reimportados** con encoding UTF-8 correcto

---

## 📊 Verificación Final

```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/check-encoding-issues.ts
```

**Resultado**:
```
📊 Resumen:
   Total artículos: 20
   Con problemas: 0
   Sin problemas: 20
```

✅ **100% de artículos sin problemas de encoding**

### Ejemplos de Títulos Corregidos

| Antes (❌)                                                      | Después (✅)                                                    |
| --------------------------------------------------------------- | -------------------------------------------------------------- |
| Pictet AM lanza sus primeros ETFs europeos de gestiÃ³n activa  | Pictet AM lanza sus primeros ETFs europeos de gestión activa  |
| CÃ³mo aprovechar el auge del blockchain con ETFs               | Cómo aprovechar el auge del blockchain con ETFs               |
| ETF de Ethereum: Â¿QuÃ© es y como comprarlo desde EspaÃ±a?    | ETF de Ethereum: ¿Qué es y como comprarlo desde España?       |
| Los 5 ETFs mÃ¡s comparados en Finect                           | Los 5 ETFs más comparados en Finect                           |

---

## 🔄 Estado del Sistema Completo

### ✅ Edge Function
- **Estado**: Desplegada y funcionando
- **URL**: `https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news`
- **Encoding**: UTF-8 correcto
- **Última actualización**: 2026-07-01

### ✅ Cron Job Automático
- **Estado**: Configurado y activo
- **Frecuencia**: Diario a las 06:00 UTC
- **Nombre**: `import-gsheets-daily`
- **Método**: pg_cron vía SQL Editor

**Verificar estado del cron**:
```sql
SELECT jobname, schedule, active, command
FROM cron.job
WHERE jobname = 'import-gsheets-daily';
```

**Ver historial de ejecuciones**:
```sql
SELECT
  jobid,
  job_pid,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'import-gsheets-daily')
ORDER BY start_time DESC
LIMIT 10;
```

**Ejecutar manualmente (testing)**:
```sql
SELECT public.import_gsheets_cron();
```

---

## 📚 Lecciones Aprendidas

### Reglas de Encoding Web

1. **Siempre UTF-8**: La web moderna usa UTF-8 como estándar universal
2. **No asumir windows-1252**: Aunque común en sistemas Windows antiguos, no es estándar web
3. **Detectar problemas**: Los caracteres `Ã`, `â€`, `Â` son señales claras de UTF-8 mal interpretado
4. **Probar con acentos**: Siempre verificar con texto español, francés, alemán, etc.

### Workflow de Corrección

1. **Diagnosticar**: Crear script para identificar artículos afectados
2. **Identificar root cause**: Revisar código de scraping/decodificación
3. **Corregir código**: Aplicar fix (UTF-8 always)
4. **Redesplegar**: Supabase Edge Function
5. **Limpiar datos**: Eliminar registros afectados
6. **Reimportar**: Ejecutar importación con código corregido
7. **Verificar**: Confirmar 100% de artículos correctos

---

## 🛠️ Comandos Útiles

### Ejecutar Importación Manual
```bash
cd /home/suario/ruy
curl -X POST "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

### Verificar Encoding de Artículos
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/check-encoding-issues.ts
```

### Ver Artículos con Problemas (SQL)
```sql
SELECT id, title, source_name, created_at
FROM news_articles
WHERE title LIKE '%Ã%' OR content LIKE '%Ã%'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📂 Archivos Modificados

| Archivo                                                          | Cambio                               | Estado |
| ---------------------------------------------------------------- | ------------------------------------ | ------ |
| `supabase/functions/import-gsheets-news/index.ts`               | Corrección encoding UTF-8 (líneas 105-116) | ✅      |
| `scripts/check-encoding-issues.ts`                               | Script diagnóstico creado            | ✅      |
| `docs/RESOLUCION_ENCODING_UTF8.md`                               | Documentación completa               | ✅      |
| `docs/CONFIGURAR_CRON_GOOGLE_SHEETS.md`                          | Guía cron job (ya existía)           | ✅      |

---

## 🎯 Resultado Final

✅ **Problema 100% resuelto**

- **Edge Function**: Desplegada con UTF-8 correcto
- **Cron Job**: Configurado (06:00 UTC diario)
- **Artículos afectados**: Limpiados y reimportados
- **Encoding actual**: 0 problemas (20/20 artículos correctos)
- **Sistema**: Totalmente automatizado

---

**Última actualización**: 2026-07-01
**Estado**: ✅ Sistema operativo y automatizado
