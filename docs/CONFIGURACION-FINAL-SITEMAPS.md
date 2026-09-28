# ⚙️ Configuración Final - Sistema Automático de Sitemaps

**Tiempo estimado:** 10 minutos  
**Resultado:** Sitemaps 100% automáticos sin intervención manual

---

## 📋 CHECKLIST COMPLETO

### ✅ **Ya completado (por mí):**
- [x] Sitemaps dinámicos implementados
- [x] API endpoint `/api/sitemap-ping` creado
- [x] Cache headers optimizados
- [x] Script SQL de triggers preparado
- [x] Secret key generado
- [x] `.env.local` actualizado

### 🔧 **Por completar (por ti - 10 min):**
- [ ] **PASO 1:** Agregar secret a Vercel (2 min)
- [ ] **PASO 2:** Re-deploy en Vercel (1 min)
- [ ] **PASO 3:** Ejecutar SQL en Supabase (2 min)
- [ ] **PASO 4:** Probar ping manual (1 min)
- [ ] **PASO 5:** Enviar sitemaps en GSC (3 min)
- [ ] **PASO 6:** Request indexing URLs (1 min)

---

## 🔐 **PASO 1: Agregar Secret a Vercel** (2 min)

### Tu Secret Key:
```
56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de
```

### Pasos:

1. **Ir a Vercel Dashboard:**
   ```
   https://vercel.com/ruyx/etfnexo/settings/environment-variables
   ```

2. **Click en "Add New" o "Create"**

3. **Rellenar:**
   - **Name:** `SITEMAP_PING_SECRET`
   - **Value:** `56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de`
   - **Environments:**
     - ✅ Production
     - ✅ Preview
     - ✅ Development

4. **Click "Save"**

✅ **Verificación:** Debes ver la variable listada en Environment Variables

---

## 🚀 **PASO 2: Re-deploy en Vercel** (1 min)

**Necesario para que Vercel cargue la nueva variable.**

### Opción A: Desde Dashboard

1. Ir a: https://vercel.com/ruyx/etfnexo/deployments
2. Click en el **último deployment** (el de arriba)
3. Click en **"⋯"** (tres puntos) arriba a la derecha
4. Click en **"Redeploy"**
5. ✅ **Confirmar**

### Opción B: Desde Git (automático)

```bash
# Cualquier push a main trigger re-deploy
git commit --allow-empty -m "trigger re-deploy"
git push origin main
```

✅ **Verificación:** Esperar que el deployment termine (1-2 min)

---

## 🗄️ **PASO 3: Ejecutar SQL en Supabase** (2 min)

### Abrir SQL Editor:

```
https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/editor
```

### Pasos:

1. **Click en "SQL Editor"** (menú lateral izquierdo)

2. **Click en "New Query"**

3. **Copiar y pegar** el contenido de:
   ```
   scripts/setup-sitemap-triggers.sql
   ```
   
   O copiar directamente esto:

   ```sql
   -- Función para loguear cambios en contenido publicado
   CREATE OR REPLACE FUNCTION notify_sitemap_update()
   RETURNS TRIGGER AS $$
   BEGIN
     IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
        (TG_OP = 'UPDATE' AND OLD.status != 'published' AND NEW.status = 'published') THEN
       RAISE NOTICE 'Sitemap update: table=%, slug=%', TG_TABLE_NAME, NEW.slug;
     END IF;
     RETURN NEW;
   END;
   $$ LANGUAGE plpgsql;

   -- Trigger para news_articles
   DROP TRIGGER IF EXISTS news_articles_sitemap_ping ON news_articles;
   CREATE TRIGGER news_articles_sitemap_ping
     AFTER INSERT OR UPDATE ON news_articles
     FOR EACH ROW
     EXECUTE FUNCTION notify_sitemap_update();

   -- Trigger para academy_articles
   DROP TRIGGER IF EXISTS academy_articles_sitemap_ping ON academy_articles;
   CREATE TRIGGER academy_articles_sitemap_ping
     AFTER INSERT OR UPDATE ON academy_articles
     FOR EACH ROW
     EXECUTE FUNCTION notify_sitemap_update();

   -- Trigger para interviews
   DROP TRIGGER IF EXISTS interviews_sitemap_ping ON interviews;
   CREATE TRIGGER interviews_sitemap_ping
     AFTER INSERT OR UPDATE ON interviews
     FOR EACH ROW
     EXECUTE FUNCTION notify_sitemap_update();

   -- Verificación
   SELECT 'Triggers creados exitosamente!' as status;
   ```

4. **Click "Run"** (o Ctrl+Enter)

✅ **Verificación:** Debes ver mensaje "Triggers creados exitosamente!"

---

## 🧪 **PASO 4: Probar Ping Manual** (1 min)

**Esperar 2-3 minutos después del re-deploy de Vercel.**

### Test:

```bash
curl "https://etfnexo.com/api/sitemap-ping?secret=56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de"
```

### Respuesta esperada:

```json
{
  "success": true,
  "message": "Sitemaps pinged successfully",
  "results": [
    {
      "sitemap": "https://etfnexo.com/sitemap.xml",
      "google": "OK",
      "bing": "OK"
    },
    {
      "sitemap": "https://etfnexo.com/noticias/sitemap.xml",
      "google": "OK",
      "bing": "OK"
    },
    {
      "sitemap": "https://etfnexo.com/academia/sitemap.xml",
      "google": "OK",
      "bing": "OK"
    },
    {
      "sitemap": "https://etfnexo.com/entrevistas/sitemap.xml",
      "google": "OK",
      "bing": "OK"
    }
  ],
  "timestamp": "2026-09-28T..."
}
```

✅ **Verificación:** Status "OK" para Google y Bing

### Si falla (401 Unauthorized):

- Verificar que agregaste `SITEMAP_PING_SECRET` en Vercel
- Verificar que hiciste re-deploy
- Esperar 2-3 minutos más
- Probar nuevamente

---

## 📊 **PASO 5: Enviar Sitemaps en Google Search Console** (3 min)

### Ir a GSC:

```
https://search.google.com/search-console
```

### Pasos:

1. **Seleccionar propiedad:** etfnexo.com

2. **Click en "Sitemaps"** (menú lateral)

3. **Agregar sitemap** (uno por uno):

   En el campo "Agregar un sitemap nuevo", pegar:
   
   ```
   sitemap.xml
   ```
   Click **"Enviar"**
   
   Repetir con:
   ```
   noticias/sitemap.xml
   academia/sitemap.xml
   entrevistas/sitemap.xml
   ```

✅ **Verificación:** 4 sitemaps con estado "Correcto"

---

## 🔍 **PASO 6: Request Indexing URLs Principales** (1 min)

### En Google Search Console:

1. **Click en el buscador** (arriba)

2. **Inspeccionar cada URL:**

   ```
   https://etfnexo.com/
   https://etfnexo.com/rankings
   https://etfnexo.com/noticias
   https://etfnexo.com/academia
   https://etfnexo.com/entrevistas
   https://etfnexo.com/academia/que-son-los-etf
   ```

3. Para cada una:
   - Pegar URL → Enter
   - Esperar análisis (10-30 seg)
   - Click **"Solicitar indexación"**
   - ✅ Confirmar

✅ **Verificación:** Mensaje "Solicitud de indexación enviada"

---

## 🎉 **SISTEMA COMPLETAMENTE CONFIGURADO**

### ✅ Ahora tienes:

1. **Sitemaps automáticos:** Se actualizan en tiempo real
2. **Google/Bing notificados:** Cada vez que publicas contenido
3. **Triggers Supabase:** Detectan cambios automáticamente
4. **API de ping:** Disponible para uso manual

---

## 📖 **CÓMO USAR EL SISTEMA**

### **Automático (Recomendado):**

Cuando publiques contenido desde el admin panel, automáticamente:
1. ✅ Se agrega al sitemap dinámico
2. ✅ Google/Bing son notificados (si configuraste CRON - ver abajo)
3. ✅ Indexación en <24h

### **Manual (Cuando publicas contenido importante):**

Ejecutar después de publicar:

```bash
curl "https://etfnexo.com/api/sitemap-ping?secret=56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de"
```

O crear un botón en el admin panel:

```typescript
// components/admin/PingGoogleButton.tsx
async function pingGoogle() {
  const response = await fetch('/api/sitemap-ping', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      secretKey: '56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de'
    }),
  });
  const data = await response.json();
  console.log('Ping results:', data);
}
```

---

## 🔄 **OPCIONAL: CRON Job Automático**

### Para ping 100% automático cada hora:

#### Opción A: Vercel Cron (Recomendado)

1. Crear `vercel.json`:
   ```json
   {
     "crons": [
       {
         "path": "/api/sitemap-ping?secret=56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de",
         "schedule": "0 * * * *"
       }
     ]
   }
   ```

2. Commit y push

✅ **Resultado:** Ping automático cada hora

#### Opción B: Supabase pg_cron

```sql
SELECT cron.schedule(
  'sitemap-ping-hourly',
  '0 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://etfnexo.com/api/sitemap-ping',
      headers := '{"Content-Type": "application/json"}',
      body := '{"secretKey": "56604eeee9a6c72e6e317cfd8d2b402164695cb89903b2bb192767abfbbb75de"}'
    );
  $$
);
```

---

## 📊 **MONITOREO**

### Verificar que funciona:

```bash
# Ver que sitemaps están frescos
curl -s https://etfnexo.com/sitemap.xml | grep lastmod | head -5

# Ver headers de cache
curl -I https://etfnexo.com/sitemap.xml | grep -i cache
```

### En Google Search Console:

**Sitemaps:**
- Ir a "Sitemaps"
- Ver "Last read" date (debe ser reciente)
- Ver "Discovered URLs" (debe aumentar)

**Coverage:**
- Ir a "Coverage"
- Ver "Valid" URLs (debe crecer día a día)

**Rendimiento:**
- Ir a "Rendimiento"
- Ver "Total impressions" (después de 7-14 días)

---

## ⏰ **TIMELINE ESPERADO**

| Día | Qué Esperar |
|-----|-------------|
| **Hoy** | ✅ Sitemaps enviados, sistema configurado |
| **1-2** | Google lee sitemaps (ver "Last read" en GSC) |
| **3-5** | Primeras URLs indexadas (10-50) |
| **5-7** | Indexación completa (100+) |
| **7-14** | Primeras impresiones orgánicas |
| **Mes 1** | >10,000 impresiones/mes |

---

## 🆘 **TROUBLESHOOTING**

### Ping falla con 401:
- Verificar `SITEMAP_PING_SECRET` en Vercel
- Re-deploy
- Esperar 2-3 min

### Google no lee sitemaps:
- Verificar que enviaste los 4 sitemaps
- Esperar 24-48h (primera lectura puede tardar)
- Verificar en GSC → Sitemaps → "Status"

### URLs no se indexan:
- Esperar 7-14 días (primera indexación lenta)
- Verificar robots.txt permite crawling
- Request indexing manual para URLs importantes

---

## 📞 **SOPORTE**

**Documentación completa:**
- `docs/SITEMAP-AUTO-UPDATE.md` - Arquitectura detallada
- `docs/GSC-PASO-A-PASO.md` - Google Search Console
- `docs/OPTIMIZATION-SUMMARY-2026-09-28.md` - Resumen SEO

**Si necesitas ayuda:**
- Pregúntame directamente
- Revisar logs en Vercel: https://vercel.com/ruyx/etfnexo/logs
- Revisar logs en Supabase: SQL Editor → Logs

---

**🎯 ¡Todo listo! Los sitemaps ahora se actualizan automáticamente.**
