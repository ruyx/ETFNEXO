# 🚨 Corrección Crítica del Sistema de Noticias

**Fecha:** 24 de junio de 2026, ~18:00 UTC
**Estado:** 🔴 **PROBLEMA CRÍTICO DETECTADO Y EN CORRECCIÓN**

---

## 🔍 Problema Identificado

### Situación Actual
```
Total artículos publicados: 83
├─ Artículos de RSS: 77 ❌ (NO DESEADOS)
├─ Artículos de Google Sheets: 0 ❌ (FALTANTES)
└─ Artículos fuente desconocida: 6
```

### Origen del Problema

**TODOS los artículos en la web son de RSS scraping**, incluyendo:
- "El último reto de los analistas de Goldman Sachs: escribir un 'Marca' del Mundial"
- "¿Cuál es el propósito de Berkshire Hathaway?"
- Y otros 75 artículos más...

**NO HAY NI UN SOLO artículo del Google Sheet** en la base de datos.

### Por qué pasó esto

1. **12 junio 2026**: El cron de fetch-news fue desactivado correctamente (migración)
2. **24 junio 2026**: Se reactivó incorrectamente pensando que era necesario
3. **24 junio ~17:30**: Se ejecutó fetch-news manualmente → insertó 45 artículos RSS
4. **24 junio 00:00/12:00**: Auto-publish publicó automáticamente los artículos RSS
5. **NUNCA se ejecutó** import-gsheets-news para importar del Google Sheet

---

## 🛠️ Plan de Corrección (3 Pasos)

### Paso 1: Deshabilitar Fetch-News Cron ⏸️

**Ejecutar en Supabase Dashboard:**
URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql

```sql
-- Desactivar el cron job de fetch-news
SELECT cron.unschedule('fetch-news-every-6-hours');

-- Verificar que se eliminó (debería retornar 0 filas)
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'fetch-news-every-6-hours';
```

**Resultado esperado:** 0 filas (el cron job ya no existe)

---

### Paso 2: Eliminar Artículos de RSS 🗑️

**Ejecutar en Supabase Dashboard:**

```sql
-- Eliminar 77 artículos de fuentes RSS
DELETE FROM news_articles
WHERE source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia');

-- Verificar resultado
SELECT
  COUNT(*) as total_publicados,
  COUNT(CASE WHEN source_name IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia') THEN 1 END) as de_rss,
  COUNT(CASE WHEN source_name IS NULL OR source_name NOT IN ('Funds Society', 'Finect', 'Estrategias de Inversión', 'Expansión', 'Rankia') THEN 1 END) as otros
FROM news_articles
WHERE status = 'published';
```

**Resultado esperado:**
- `de_rss`: 0 (todos eliminados)
- `otros`: 6 (los de fuente desconocida se mantienen)
- `total_publicados`: 6

---

### Paso 3: Importar Noticias del Google Sheet 📥

**Ejecutar la Edge Function de importación:**

```bash
curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]"
```

**Fuente del Google Sheet:**
- URL CSV: https://docs.google.com/spreadsheets/d/e/2PACX-1vStrEBHOhxe_R-p_bbPXzglHsBWHDnCbScB30VGumBKYg2hhFN5cG6OYlQ5PjlZHPXRlGoL1Grl4CTq/pub?output=csv

**Resultado esperado:**
- Noticias importadas del Google Sheet
- Status: `published` (directamente publicadas)
- Fuente: Sin `source_name` o `source_name = 'Google Sheets'`

---

## 📊 Desglose de Artículos RSS a Eliminar

### Por Fuente

#### Expansión (44 artículos)
Ejemplos:
- ¿Cuál es el propósito de Berkshire Hathaway?
- 20 valores europeos, uno del Ibex, para nadar en Bolsa si llega la corrección
- El Banco de Inglaterra mantiene los tipos, pero alerta de "presiones inflacionistas"
- BMW da la voz de alarma mientras China presiona a fabricantes europeos
- **El último reto de los analistas de Goldman Sachs: escribir un 'Marca' del Mundial** ← Mencionado por el usuario

#### Finect (17 artículos)
Ejemplos:
- Allianz GI lanzará sus primeros 5 ETFs activos en Europa este verano
- ING paga 50 euros a quien invierta 100 euros en ETFs antes del 30 de junio
- SpaceX aterriza en el WisdomTree Space Economy ETF tras su histórica salida a Bolsa

#### Rankia (15 artículos)
Ejemplos:
- Mejores ETFs de Defensa 2026: sector militar y aeroespacial
- ETFs monetarios: los mejores para invertir en 2026
- ¿Merecen la pena los ETFs de Trading 212 en 2026?

#### Funds Society (1 artículo)
- Daniel Quinn

---

## ✅ Checklist de Corrección

### Verificación Pre-Corrección
- [x] Identificados 77 artículos RSS a eliminar
- [x] Confirmado que NO hay artículos del Google Sheet
- [x] SQL de limpieza generado

### Ejecución
- [ ] **Paso 1:** Deshabilitar fetch-news cron
- [ ] **Paso 2:** Eliminar 77 artículos RSS
- [ ] **Paso 3:** Importar noticias del Google Sheet

### Verificación Post-Corrección
- [ ] **Cron Jobs:**
  - [ ] fetch-news-every-6-hours: ❌ DESACTIVADO (no debe existir)
  - [ ] auto-publish-news-every-12-hours: ✅ ACTIVO (sigue funcionando)

- [ ] **Base de Datos:**
  - [ ] Artículos RSS eliminados (0 de Expansión, Finect, Rankia, Funds Society)
  - [ ] Artículos del Google Sheet importados
  - [ ] Solo noticias deseadas publicadas

- [ ] **Sitio Web:**
  - [ ] Verificar que solo aparecen noticias del Google Sheet
  - [ ] Confirmar que artículos como "Goldman Sachs Mundial" ya no existen

---

## 🎯 Sistema Final Esperado

### Flujo Correcto (Solo Google Sheets)

```
📝 Google Sheet (Fuente única)
   ↓
🔄 import-gsheets-news (Edge Function - SOLO MANUAL)
   ↓
💾 news_articles (status = 'published')
   ↓
🌐 etfnexo.com/noticias
```

### Cron Jobs Finales

```
✅ auto-publish-news-every-12-hours
   Horarios: 00:00, 12:00 UTC
   Acción: Publica noticias en draft (si las hay)
   Nota: Generalmente no hará nada, porque import-gsheets ya publica directamente

❌ fetch-news-every-6-hours
   Estado: DESACTIVADO PERMANENTEMENTE
   Razón: Solo queremos noticias del Google Sheet, no RSS
```

### Edge Functions

```
✅ import-gsheets-news
   Uso: MANUAL (cuando se actualice el Google Sheet)
   Fuente: Google Sheets CSV
   Status: 'published' (directo)

❌ fetch-news
   Uso: DESACTIVADO
   Fuente: RSS (5 fuentes españolas)
   Razón: No queremos contenido automático de RSS
```

---

## 📝 Documentación a Actualizar

Después de la corrección, actualizar estos archivos:

1. **ACTUALIZACION_FINAL_24_JUNIO.md**
   - Agregar sección de "Corrección Crítica"
   - Explicar el malentendido del sistema

2. **SISTEMA_NOTICIAS_REACTIVADO.md**
   - Marcar como "OBSOLETO - Ver CORRECCION_SISTEMA_NOTICIAS.md"

3. **REACTIVACION_NOTICIAS_AUTOMATICAS.md**
   - Marcar como "OBSOLETO - El sistema NO debe usar RSS"

---

## 🔄 Nuevo Workflow Manual Correcto

### Cuando Actualizar Noticias

1. **Actualizar el Google Sheet:**
   - URL: https://docs.google.com/spreadsheets/d/1z... (el que uses)
   - Agregar nuevas filas con: título, contenido, fecha, etc.

2. **Ejecutar import-gsheets-news:**
   ```bash
   curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \
     -H "Authorization: Bearer [SERVICE_KEY]"
   ```

3. **Verificar en la web:**
   - https://etfnexo.com/noticias
   - Confirmar que aparecen las nuevas noticias

---

## 🚫 Lo que NO Hacer

- ❌ NO reactivar fetch-news cron
- ❌ NO ejecutar fetch-news Edge Function
- ❌ NO confiar en scraping RSS automático
- ❌ NO usar las fuentes: Expansión, Finect, Rankia, Funds Society, Estrategias de Inversión

---

## ✅ Resultado Final Deseado

```
📊 Estado de Noticias:
   Total publicadas: ~20-50 (solo del Google Sheet)
   De RSS: 0 ❌
   De Google Sheet: 100% ✅

🔄 Sistema:
   fetch-news cron: DESACTIVADO ❌
   auto-publish cron: ACTIVO ✅ (por si acaso)
   import-gsheets: MANUAL ✅

🌐 Web:
   Solo noticias curadas del Google Sheet
   Contenido de calidad controlado manualmente
   Sin artículos automáticos de RSS
```

---

**Próximo Paso Inmediato:** Ejecutar los 3 pasos de corrección en Supabase Dashboard

**Actualizado:** 24 de junio de 2026, 18:00 UTC
**Por:** Claude Code - Corrección de Malentendido del Sistema
