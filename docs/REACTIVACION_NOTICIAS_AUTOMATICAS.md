# 🚀 Reactivación del Sistema de Noticias Automáticas

**Fecha:** 24 de junio de 2026
**Estado:** ✅ **SCRIPTS LISTOS - REQUIERE EJECUCIÓN MANUAL DE 1 COMANDO SQL**

---

## 📊 Resumen del Diagnóstico

### Problema Identificado
El sistema de scraping automático de noticias fue **desactivado el 12 de junio** mediante migración SQL. Desde entonces:
- ❌ No entran noticias nuevas automáticamente
- ✅ Auto-publicación funciona, pero no tiene noticias que publicar
- 📰 Solo quedan 38 noticias antiguas (última del 19 de junio)

### Última Ejecución Exitosa de Fetch-News
```
Fecha: 12 de junio 2026, 06:00 UTC
Estado: ✅ success
Desde entonces: 0 ejecuciones
```

---

## 🛠️ Solución: 1 Comando SQL

Para reactivar el sistema completo, ejecuta este SQL en Supabase Dashboard:

### Paso 1: Ir al SQL Editor
**URL:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

### Paso 2: Ejecutar este SQL

```sql
-- Programar cron job de fetch-news (cada 6 horas)
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);

-- Verificar que se creó correctamente
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'fetch-news-every-6-hours';
```

### Paso 3: Verificar Resultado Esperado

Deberías ver algo como:
```
jobname                   | schedule      | command                        | active
--------------------------|---------------|--------------------------------|-------
fetch-news-every-6-hours  | 0 */6 * * *   | SELECT public.fetch_news_cron();| true
```

---

## 📅 Horarios de Ejecución Automática

Una vez reactivado:

### Fetch-News (Scraping RSS)
```
Frecuencia: Cada 6 horas
Horarios: 00:00, 06:00, 12:00, 18:00 UTC
Acción: Scrapea 5 fuentes RSS españolas
Resultado: 8-20 noticias nuevas por día
```

### Auto-Publish (Ya Activo)
```
Frecuencia: Cada 12 horas
Horarios: 00:00, 12:00 UTC
Acción: Publica noticias con >1000 chars + imagen
Estado actual: ✅ Funcionando (Published 0 articles - esperando noticias)
```

---

## 🔍 Scripts de Verificación Creados

He creado scripts automáticos para monitorear el sistema:

### 1. Reactivar Cron Job (Genera instrucciones)
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/reactivate-cron-job.ts
```
**Output:**
- Estado actual del sistema
- SQL listo para copiar/pegar
- URL del Dashboard
- Instrucciones paso a paso

### 2. Verificar Estado de Noticias
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/check-news.ts
```
**Output:**
- Últimas 10 noticias publicadas
- Noticias en borrador
- Estadísticas globales

### 3. Verificar Cron Jobs
```bash
cd /home/suario/ruy
set -a && source .env.local && set +a
npx tsx scripts/check-cron-status.ts
```
**Output:**
- Logs de ejecución de cron jobs
- Estado de fetch-news
- Estado de auto-publish

---

## 📝 Archivos Creados

### Scripts Ejecutables
- ✅ `scripts/reactivate-cron-job.ts` - Generador de instrucciones SQL
- ✅ `scripts/check-news.ts` - Verificador de noticias
- ✅ `scripts/check-cron-status.ts` - Monitor de cron jobs

### Archivos SQL
- ✅ `scripts/reactivate-fetch-news-cron.sql` - SQL de reactivación completo

### Documentación
- ✅ `docs/DIAGNOSTICO_NOTICIAS_AUTOMATICAS.md` - Análisis completo del problema
- ✅ `docs/REACTIVACION_NOTICIAS_AUTOMATICAS.md` - Esta guía

---

## 🔧 Alternativas Evaluadas

### ❌ Opción 1: Supabase CLI `db query --linked`
```
Problema: Cuenta sin permisos de Owner
Error: "Your account does not have the necessary privileges"
```

### ❌ Opción 2: psql directo
```
Problema: Red IPv6 no accesible desde WSL
Error: "Network is unreachable"
```

### ✅ Opción 3: SQL Manual en Dashboard (RECOMENDADA)
```
Ventajas:
- ✅ Funciona con cualquier cuenta con acceso al proyecto
- ✅ No requiere configuración adicional
- ✅ 1 solo comando SQL
- ✅ Verificación visual inmediata
```

---

## 📊 Estado Actual del Sistema

### Noticias
```
Total publicadas: 38
En borrador: 0
Última noticia: 19 junio 2026
```

### Cron Jobs
```
✅ auto-publish-news
   Última ejecución: 24/06/2026 00:00:00
   Estado: success
   Mensaje: "Published 0 articles"

❌ fetch-news
   Última ejecución: 12/06/2026 06:00:00
   Estado: DESACTIVADO (sin cron job programado)
```

### Edge Functions Disponibles
```
1. fetch-news
   Path: /functions/v1/fetch-news
   Estado: ✅ Deployada (desactivada via cron)

2. import-gsheets-news
   Path: /functions/v1/import-gsheets-news
   Estado: ✅ Deployada (solo manual)
```

---

## 🎯 Checklist Post-Reactivación

Después de ejecutar el SQL:

- [ ] **Verificar que el job fue creado**
  ```sql
  SELECT * FROM cron.job WHERE jobname = 'fetch-news-every-6-hours';
  ```

- [ ] **Esperar primera ejecución** (máximo 6 horas)
  - Próxima ejecución: 00:00, 06:00, 12:00 o 18:00 UTC

- [ ] **Verificar logs de ejecución**
  ```bash
  npx tsx scripts/check-cron-status.ts
  ```

- [ ] **Confirmar nuevas noticias**
  ```bash
  npx tsx scripts/check-news.ts
  ```

- [ ] **Verificar auto-publicación**
  - Revisar que el mensaje cambie de "Published 0 articles" a "Published N articles"

---

## 🆘 Troubleshooting

### Error: "function cron.schedule does not exist"
**Solución:** Habilitar extensión pg_cron
```
Dashboard → Database → Extensions → pg_cron → Enable
```

### Error: "permission denied for schema cron"
**Solución:** Ejecutar el SQL directamente en Dashboard SQL Editor (no CLI)

### El job no se ejecuta
**Checklist:**
1. ¿Existe en cron.job? → `SELECT * FROM cron.job;`
2. ¿Está activo? → Columna `active` debe ser `true`
3. ¿Extension habilitada? → Dashboard → Extensions → pg_cron
4. ¿Función existe? → `\df fetch_news_cron` en psql

### No aparecen noticias nuevas después de 6 horas
1. Verificar logs: `SELECT * FROM cron_logs WHERE job_name = 'fetch-news' ORDER BY executed_at DESC LIMIT 5;`
2. Probar Edge Function manualmente:
   ```bash
   curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news \
     -H "Authorization: Bearer [SERVICE_KEY]"
   ```
3. Revisar logs de la Edge Function en Dashboard → Functions → fetch-news → Logs

---

## 📞 Recursos

- **Dashboard:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- **SQL Editor:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql
- **Functions:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/functions
- **Database:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/database/tables

---

## ✅ Resultado Final Esperado

Una vez completado:

```
🕐 00:00, 06:00, 12:00, 18:00 UTC
   → Fetch-News scrapea RSS automáticamente
   → 8-20 noticias nuevas en borrador

🕐 00:00, 12:00 UTC
   → Auto-Publish evalúa noticias en borrador
   → Publica las de calidad (>1000 chars + imagen)

📊 Resultado
   → ~10-15 noticias publicadas por día
   → Contenido fresco y actualizado 24/7
   → CERO intervención manual requerida
```

---

**Última actualización:** 24 de junio de 2026
**Autor:** Claude Code (Diagnóstico Automatizado)
