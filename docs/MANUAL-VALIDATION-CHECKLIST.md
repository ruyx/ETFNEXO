# Manual Validation Checklist - ETF Nexo
**Pre-Lanzamiento Final**
**Fecha:** 2026-09-28

## 🔍 Validación Manual en Navegador

### 1. Homepage (https://etfnexo.com)

**Desktop:**
- [ ] Hero image carga correctamente (LCP)
- [ ] Navigation menu visible y funcional
- [ ] Cookie banner aparece en primera visita
- [ ] Cookie banner NO aparece si ya se aceptó/rechazó
- [ ] Botón "Ver Rankings" funciona
- [ ] Botón "Últimas Noticias" funciona
- [ ] Sección de noticias carga (12 artículos)
- [ ] Skeleton loaders se muestran antes de cargar
- [ ] Footer visible con todos los links

**Mobile (DevTools 375px):**
- [ ] Botón hamburguesa visible (≥48px)
- [ ] Menu desktop OCULTO
- [ ] Click en hamburguesa abre drawer
- [ ] Backdrop oscuro visible
- [ ] Links en drawer funcionan
- [ ] Click en link cierra drawer
- [ ] Hero responsive (imagen + texto legible)
- [ ] Touch targets ≥48px (botones CTA)
- [ ] Cookie banner responsive

---

### 2. Rankings Page (https://etfnexo.com/rankings)

**Verificar:**
- [ ] Tabla de ETFs carga correctamente
- [ ] 170+ ETFs listados
- [ ] ETFNexo Score visible
- [ ] Filtros funcionan (región, asset class)
- [ ] Ordenamiento por columnas funciona
- [ ] Links a detalle de ETF funcionan
- [ ] Ads slots con skeleton loaders
- [ ] Mobile: tabla scrollable horizontalmente

---

### 3. Noticias (https://etfnexo.com/noticias)

**Listado:**
- [ ] Grid de noticias (cards)
- [ ] Featured images cargan (Next.js Image)
- [ ] Excerpt visible
- [ ] Fecha formateada correctamente
- [ ] Source name visible
- [ ] Click en card navega a detalle

**Detalle (cualquier artículo):**
- [ ] Título H1 visible
- [ ] Featured image hero
- [ ] Contenido formateado correctamente
- [ ] Links externos funcionan
- [ ] Schema.org Article (verificar en view-source)
- [ ] Breadcrumbs si existen
- [ ] Related articles si existen

---

### 4. Academia (https://etfnexo.com/academia)

**Listado:**
- [ ] Artículos Academia listados
- [ ] Categorías visibles
- [ ] Difficulty badges (beginner/intermediate/advanced)
- [ ] Reading time visible
- [ ] Click navega a detalle

**Artículo "Qué son los ETFs":**
- [ ] URL: https://etfnexo.com/academia/que-son-los-etf
- [ ] Título H1: "¿Qué son los ETFs? Guía Completa..."
- [ ] Featured image carga (Pexels CDN)
- [ ] TL;DR section visible (estilo destacado)
- [ ] Tabla comparativa renderiza correctamente
- [ ] Grid de ventajas (6 cards con bordes de colores)
- [ ] FAQs expandibles (<details> funciona)
- [ ] CTA final a /rankings (botón morado)
- [ ] Schema.org FAQPage (verificar view-source)

---

### 5. Google Analytics & Cookies

**Sin aceptar cookies:**
- [ ] Cookie banner visible
- [ ] GA4 script NO cargado (Network tab)
- [ ] Click "Rechazar" → banner desaparece
- [ ] localStorage: cookie-consent = 'rejected'
- [ ] Refresh página → banner NO aparece

**Aceptar cookies:**
- [ ] Limpiar localStorage
- [ ] Refresh página
- [ ] Click "Aceptar todas"
- [ ] GA4 scripts cargan (Network tab: gtag/js)
- [ ] localStorage: cookie-consent = 'accepted'
- [ ] dataLayer presente en console: `window.dataLayer`

**Event tracking (con cookies aceptadas):**
- [ ] Scroll 50% página → Network: collect?event=scroll_depth
- [ ] Esperar 30s → Network: collect?event=time_on_page
- [ ] Click "Ver Rankings" → Network: collect?event=cta_click
- [ ] Click "Newsletter" → Network: collect?event=cta_click

---

### 6. SEO Meta Tags (View Source)

**Homepage:**
```html
<title>ETF Nexo - Rankings, Noticias y Academia de ETFs | ETF Nexo</title>
<meta name="description" content="Plataforma líder de análisis...">
<meta property="og:title" content="...">
<meta property="og:image" content="/og-image-home.png">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
```

**Artículo Academia:**
```html
<title>¿Qué son los ETFs? Guía Completa 2026...</title>
<meta name="description" content="✓ Qué son los ETFs ✓ Cómo funcionan...">
<meta property="og:type" content="article">
<script type="application/ld+json">{"@type":"Article",...}</script>
<script type="application/ld+json">{"@type":"FAQPage",...}</script>
```

---

### 7. Core Web Vitals (Chrome DevTools)

**Lighthouse (Desktop):**
- [ ] Performance: >85
- [ ] Accessibility: >90
- [ ] Best Practices: >90
- [ ] SEO: >90

**Lighthouse (Mobile):**
- [ ] Performance: >75
- [ ] LCP: <2.5s (verde)
- [ ] CLS: <0.1 (verde)
- [ ] INP: <200ms (verde)

**Web Vitals Extension:**
- [ ] Instalar: https://chrome.google.com/webstore/detail/web-vitals
- [ ] Navegar homepage
- [ ] LCP: Verde (<2.5s)
- [ ] CLS: Verde (<0.1)
- [ ] INP: Verde (<200ms)

---

### 8. Mobile Devices (Reales)

**iPhone (Safari):**
- [ ] Homepage carga correctamente
- [ ] Mobile menu funciona
- [ ] Touch en botones responde (≥48px)
- [ ] Zoom funciona (max-scale=5)
- [ ] Cookie banner responsive
- [ ] Imágenes responsive (srcset)

**Android (Chrome):**
- [ ] Homepage carga correctamente
- [ ] Mobile menu funciona
- [ ] Touch targets adecuados
- [ ] Smooth scroll
- [ ] Ads no causan layout shift

---

### 9. Sitemaps & Robots.txt

**Robots.txt:**
```
URL: https://etfnexo.com/robots.txt
```
- [ ] Accesible (status 200)
- [ ] Allow: / presente
- [ ] Disallow: /admin presente
- [ ] Sitemap links presentes (4 sitemaps)

**Sitemaps:**
- [ ] https://etfnexo.com/sitemap.xml (status 200, XML válido)
- [ ] https://etfnexo.com/noticias/sitemap.xml (status 200)
- [ ] https://etfnexo.com/academia/sitemap.xml (status 200)
- [ ] https://etfnexo.com/entrevistas/sitemap.xml (status 200)

**Validar XML:**
- [ ] View source de cada sitemap
- [ ] <urlset> tag presente
- [ ] <url> entries >0
- [ ] <loc> URLs absolutas (https://...)
- [ ] <lastmod> fechas válidas

---

### 10. Security Headers (curl)

```bash
curl -I https://etfnexo.com
```

**Verificar presencia:**
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy: camera=()...
- [ ] Strict-Transport-Security: max-age=31536000

---

### 11. External Tools Validation

**Google Mobile-Friendly Test:**
```
URL: https://search.google.com/test/mobile-friendly
Test: https://etfnexo.com
```
- [ ] Result: Page is mobile-friendly ✅

**Google Rich Results Test:**
```
URL: https://search.google.com/test/rich-results
Test: https://etfnexo.com/academia/que-son-los-etf
```
- [ ] Article detected ✅
- [ ] FAQPage detected ✅
- [ ] No errors

**PageSpeed Insights:**
```
URL: https://pagespeed.web.dev/
Test: https://etfnexo.com
```
- [ ] Mobile score: >75
- [ ] Desktop score: >85
- [ ] CWV: All green

---

### 12. Navegación Cross-Browser

**Chrome:**
- [ ] Homepage funciona
- [ ] Navigation funciona
- [ ] Forms funcionan
- [ ] No console errors

**Firefox:**
- [ ] Homepage funciona
- [ ] Mobile menu funciona
- [ ] Cookie banner funciona

**Safari (macOS/iOS):**
- [ ] Homepage funciona
- [ ] Touch/hover interactions
- [ ] No layout issues

**Edge:**
- [ ] Homepage funciona
- [ ] GA4 tracking funciona

---

### 13. Pexels API (Admin)

**Si tienes acceso a /admin:**
- [ ] Login funciona
- [ ] Crear artículo Academia
- [ ] Search Pexels images funciona (status 200)
- [ ] Imagen se puede seleccionar
- [ ] Imagen se guarda en featured_image_url

**API directa (browser):**
```
URL: https://etfnexo.com/api/pexels/search?query=investment
```
- [ ] Status: 200
- [ ] Response: {"photos":[...]}
- [ ] Photos count: >0

---

### 14. Error Pages

**404 Not Found:**
```
URL: https://etfnexo.com/pagina-que-no-existe
```
- [ ] Página 404 custom (si existe)
- [ ] Header/footer presentes
- [ ] Link de vuelta a home

**500 Error (simular):**
- [ ] Error boundary funciona (si está implementado)
- [ ] No información sensible expuesta

---

## ✅ Checklist de Aprobación Final

**Antes de considerar "listo para lanzamiento":**

- [ ] ✅ Todos los checks de Homepage (desktop + mobile) PASS
- [ ] ✅ Cookie banner GDPR funcional
- [ ] ✅ GA4 tracking verificado
- [ ] ✅ Artículo Academia accesible y bien formateado
- [ ] ✅ Mobile menu funciona en mobile real
- [ ] ✅ Core Web Vitals >80% verde (PageSpeed Insights)
- [ ] ✅ Sitemaps accesibles (4/4)
- [ ] ✅ Security headers presentes (5/5)
- [ ] ✅ Mobile-Friendly Test PASS
- [ ] ✅ Rich Results Test detecta Schema.org
- [ ] ✅ Pexels API funciona (status 200)
- [ ] ✅ No errores críticos en console
- [ ] ✅ Cross-browser básico (Chrome + Firefox + Safari)

**Pendientes post-lanzamiento (no bloqueantes):**
- [ ] ⚠️ Google Search Console verification
- [ ] ⚠️ Enviar sitemaps a GSC
- [ ] ⚠️ Request indexing URLs principales
- [ ] ⚠️ Monitorear métricas primeros 7 días

---

## 📊 Resultados Esperados

**Lighthouse (Desktop):**
- Performance: 90-95
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Lighthouse (Mobile):**
- Performance: 80-85
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Core Web Vitals:**
- LCP: <2.0s (Good)
- INP: <100ms (Good)
- CLS: <0.05 (Good)

Si alguno de estos scores está significativamente más bajo, investigar antes de lanzar.
