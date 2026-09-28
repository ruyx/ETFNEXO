# Google Search Console - Guía de Configuración
**Sitio:** https://etfnexo.com

## 📋 Checklist de Verificación

### 1. Verificar Propiedad del Sitio

**Método recomendado:** Meta tag HTML

Agregar en `app/layout.tsx` (dentro del `<head>`):

```tsx
<meta name="google-site-verification" content="CÓDIGO_DE_VERIFICACIÓN" />
```

**Pasos:**
1. Ir a: https://search.google.com/search-console
2. Agregar propiedad → URL prefix: `https://etfnexo.com`
3. Elegir método: HTML tag
4. Copiar código de verificación
5. Agregarlo en layout.tsx
6. Deploy
7. Verificar en GSC

---

### 2. Enviar Sitemaps

**Sitemaps a enviar:**
```
https://etfnexo.com/sitemap.xml
https://etfnexo.com/noticias/sitemap.xml
https://etfnexo.com/academia/sitemap.xml
https://etfnexo.com/entrevistas/sitemap.xml
```

**Pasos:**
1. GSC → Sitemaps (menú izquierdo)
2. Agregar nuevo sitemap
3. Pegar URL completa de cada sitemap
4. Enviar

**Verificación:**
- Estado: Success
- URLs descubiertas: >0
- Última lectura: fecha reciente

---

### 3. Request Indexing (URLs Principales)

**URLs prioritarias para indexar:**
```
https://etfnexo.com/
https://etfnexo.com/rankings
https://etfnexo.com/noticias
https://etfnexo.com/academia
https://etfnexo.com/entrevistas
https://etfnexo.com/academia/que-son-los-etf
```

**Pasos:**
1. GSC → URL Inspection
2. Pegar URL completa
3. Click "Request Indexing"
4. Esperar 2-5 días para ver resultados

---

### 4. Configurar Datos Demográficos

**Target Country:** España 🇪🇸
**Target Language:** Español (es)

**Pasos:**
1. GSC → Settings → International Targeting
2. Country: Spain
3. Language: Spanish

---

### 5. Asociar con Google Analytics

**GA4 Property ID:** G-ZM104ZWBP1

**Pasos:**
1. GSC → Settings → Associations
2. Add association → Google Analytics
3. Seleccionar property: G-ZM104ZWBP1
4. Confirm

**Beneficios:**
- Ver datos de Search Console en GA4
- Métricas combinadas de SEO + Analytics
- Reportes de rendimiento orgánico

---

### 6. Monitorear Métricas Clave

**Métricas a vigilar (primeros 30 días):**

1. **Coverage (Cobertura)**
   - Valid: >100 URLs
   - Error: 0
   - Excluded: Revisar razones

2. **Enhancements (Mejoras)**
   - Core Web Vitals: Good URLs >80%
   - Mobile Usability: No issues
   - Breadcrumbs: Válidos

3. **Performance (Rendimiento)**
   - Total clicks: Incremento semanal
   - Total impressions: >1,000/mes
   - Average CTR: >2%
   - Average position: <20 (primeras 2 páginas)

4. **Experience (Experiencia)**
   - Page Experience: Good
   - HTTPS: 100%
   - Mobile-friendly: 100%

---

### 7. Verificar Structured Data

**Rich Results Test:**
https://search.google.com/test/rich-results

**URLs a testear:**
```
https://etfnexo.com/ → Organization, WebSite
https://etfnexo.com/noticias/[slug] → NewsArticle
https://etfnexo.com/academia/que-son-los-etf → Article, FAQPage
https://etfnexo.com/entrevistas/[slug] → Article
```

**Verificar:**
- ✅ No errors
- ✅ No warnings críticos
- ✅ Rich results detected

---

### 8. Robots.txt Testing

**Tool:** GSC → robots.txt Tester

**Verificar que permite:**
- ✅ /noticias
- ✅ /academia
- ✅ /entrevistas
- ✅ /rankings
- ✅ /etfs
- ✅ /gestoras

**Verificar que bloquea:**
- ✅ /admin
- ✅ /api
- ✅ /perfil
- ✅ /_next

---

### 9. Core Web Vitals Report

**Métricas objetivo:**
- **LCP:** <2.5s (Good)
- **FID/INP:** <100ms (Good)
- **CLS:** <0.1 (Good)

**URLs a optimizar primero:**
- Homepage (/)
- /rankings (alto tráfico esperado)
- /academia/que-son-los-etf (SEO principal)

**Acciones si hay issues:**
1. Identificar URLs con Poor CWV
2. Usar PageSpeed Insights para diagnóstico
3. Aplicar fixes (lazy loading, image optimization, etc.)
4. Re-request validation

---

### 10. Link Building (Opcional)

**Estrategias para mejorar Domain Authority:**

1. **Directorios de inversión:**
   - Rankia (perfil de autor)
   - Finect (artículos guest)
   - InvestingFunds

2. **Backlinks de calidad:**
   - Guest posts en blogs de finanzas
   - Entrevistas con expertos (link en bio)
   - Comparadores de brokers

3. **Social signals:**
   - Twitter/X: @etfnexo (actualizado)
   - LinkedIn: Publicar artículos Academia
   - Reddit r/SpainFIRE (con moderación)

---

## 📊 KPIs a Monitorear (30 días)

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| URLs indexadas | >100 | GSC Coverage |
| Impresiones orgánicas | >10,000 | GSC Performance |
| Clicks orgánicos | >500 | GSC Performance |
| CTR promedio | >2% | GSC Performance |
| Posición promedio | <30 | GSC Performance |
| CWV Good URLs | >80% | GSC Experience |
| Zero errors | 0 | GSC Coverage |
| Backlinks | >10 | GSC Links |

---

## 🚨 Alertas a Configurar

**Email alerts para:**
- ✅ New critical issues detected
- ✅ Coverage errors spike
- ✅ Manual actions received
- ✅ Security issues detected
- ✅ Unparsable structured data

**Configurar en:** GSC → Settings → Email notifications

---

## 📅 Cronograma Post-Lanzamiento

**Semana 1:**
- ✅ Verificar propiedad
- ✅ Enviar sitemaps
- ✅ Request indexing URLs principales

**Semana 2:**
- ✅ Monitorear Coverage
- ✅ Revisar primeros datos de Performance
- ✅ Verificar Structured Data

**Semana 3-4:**
- ✅ Optimizar CWV si hay issues
- ✅ Analizar queries de búsqueda
- ✅ Identificar keywords ganadoras

**Mes 2:**
- ✅ Link building
- ✅ Crear más contenido basado en GSC data
- ✅ Optimizar CTR de páginas con alta impresión/bajo click

