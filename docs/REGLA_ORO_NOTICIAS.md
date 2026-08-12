# 🏆 Regla de Oro: Google Sheets - Única Fuente de Noticias

**Fecha establecida**: 7 de julio 2026
**Estado**: ✅ ACTIVA Y OBLIGATORIA

---

## 📜 La Regla

**Google Sheets es la ÚNICA fuente autorizada de noticias para ETF Nexo.**

- ❌ NO usar scrapers RSS
- ❌ NO usar fuentes automáticas externas
- ❌ NO agregar sistemas de scraping de terceros
- ✅ SOLO importar desde el Google Sheet oficial

---

## 🎯 Razón

Esta regla garantiza:
- **Control total** sobre el contenido publicado
- **Calidad editorial** revisada antes de publicar
- **Sin duplicados** ni contenido spam
- **Branding consistente** con los valores de ETF Nexo

---

## 🔧 Sistema Configurado

### ✅ ACTIVOS (Únicos permitidos):

```
1. import-gsheets-daily
   ├─ Edge Function: import-gsheets-news
   ├─ Horario: Diario a las 10:00 UTC
   └─ Función: Importar noticias desde Google Sheet oficial

2. auto-publish-news-every-12-hours
   ├─ Función SQL: auto_publish_news_cron()
   ├─ Horario: Cada 12 horas (00:00 y 12:00 UTC)
   └─ Función: Auto-publicar noticias que cumplan criterios de calidad
```

### ❌ DESHABILITADOS (Obsoletos):

```
fetch-news-every-6-hours
├─ Estado: DEBE estar deshabilitado (active = false)
├─ Edge Function: fetch-news.DISABLED (renombrada)
└─ Razón: Sistema RSS obsoleto, NO SE USA
```

---

## 📊 Verificación del Sistema

### Comandos para verificar cumplimiento:

```sql
-- Ver todos los cron jobs activos
SELECT jobid, jobname, schedule, active, command
FROM cron.job
ORDER BY jobname;

-- Verificar que solo Google Sheets esté activo
SELECT jobname, active
FROM cron.job
WHERE jobname IN (
  'fetch-news-every-6-hours',    -- DEBE estar false
  'import-gsheets-daily'          -- DEBE estar true
);

-- Ver Edge Functions desplegadas
-- Solo debe aparecer: import-gsheets-news
```

### Edge Functions esperadas:

```bash
supabase functions list --project-ref utvioubcqkwwzvufhups

# Resultado esperado:
✅ import-gsheets-news    | ACTIVE
✅ scrape-article-content | ACTIVE (para scraping de contenido individual)

❌ fetch-news             | NO DEBE APARECER (está .DISABLED)
```

---

## 🚨 Protocolo de Violación

Si alguien sugiere o intenta:
- Agregar scrapers RSS
- Usar APIs de noticias externas
- Importar desde otras fuentes

**Respuesta obligatoria:**
> "❌ Esto viola la Regla de Oro. Google Sheets es la ÚNICA fuente de noticias autorizada. Consultar docs/REGLA_ORO_NOTICIAS.md"

---

## 🔧 Mantenimiento del Sistema

### Para DESHABILITAR el cron obsoleto de RSS:

1. Ir a: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new
2. Ejecutar: `docs/DESHABILITAR_CRON_RSS.sql`
3. Verificar: `active = false` para `fetch-news-every-6-hours`

### Para AGREGAR noticias nuevas:

1. Editar el Google Sheet oficial
2. Agregar filas con formato correcto
3. El sistema importará automáticamente a las 10:00 UTC
4. Auto-publicación cada 12 horas si cumple criterios (>1000 chars + imagen)

---

## 📈 Estado Actual (7 julio 2026)

```
✅ Google Sheets Import: ACTIVO
   └─ Última ejecución: 6 julio 10:00 UTC
   └─ Próxima ejecución: 8 julio 10:00 UTC

✅ Auto-Publish: ACTIVO
   └─ Última ejecución: 7 julio 00:00 UTC
   └─ Próxima ejecución: 7 julio 12:00 UTC

⚠️  Cron RSS: ACTIVO (debe deshabilitarse)
   └─ Edge Function: NO EXISTE (.DISABLED)
   └─ Acción requerida: Ejecutar DESHABILITAR_CRON_RSS.sql

📊 Noticias en BD: 69 publicadas
   └─ Última: "Los mejores ETFs de dividendos 2026" (7 julio 07:12 UTC)
```

---

## 📚 Archivos Relacionados

- `docs/DESHABILITAR_CRON_RSS.sql` - Script para limpiar sistema
- `supabase/functions/import-gsheets-news/` - Única Edge Function de noticias
- `supabase/functions/fetch-news.DISABLED/` - Sistema RSS deshabilitado
- `supabase/migrations/20260610000001_setup_cron_jobs.sql` - Configuración original

---

**Última actualización**: 7 julio 2026
**Responsable**: ETF Nexo Team
**Criticidad**: 🔴 ALTA - No modificar sin aprobación explícita
