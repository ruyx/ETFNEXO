# Experimento Astro y auditoría de performance — ETF Nexo

**Fechas:** 15 y 16 de octubre de 2026
**Repos:** `ruy` (producción, Next.js 14) y `etfnexo-astro` (PoC, Astro 7)
**Estado:** experimento cerrado. Decisión: NO migrar la plataforma completa a Astro ahora. Bug crítico de la home corregido y desplegado.

---

## 1. Objetivo

Evaluar si migrar ETF Nexo de Next.js 14 a Astro mejora de forma significativa el rendimiento (Lighthouse, Core Web Vitals, peso de JavaScript) como para justificar una migración de unas 60 rutas, panel de administración, autenticación, API y WebMCP.

Criterio definido en `etfnexo-astro/POC-PHASE-2-PLAN.md`:

| Resultado | Performance móvil real |
|---|---|
| Aprobar migración | ≥ 90 |
| Evaluar | 85 a 89 |
| Rechazar | < 85 |

## 2. Cronología

| Hora (15 oct) | Hito |
|---|---|
| 11:40 | `npm create astro` plantilla mínima. Astro 7.3, Tailwind 4, React 19 como integración. |
| 12:44 | Primera página `/noticias` con datos mock. Supabase configurado pero sin datos reales (ver hallazgo 6.3). |
| 13:35 a 13:58 | Se elimina el adapter Node. Output estático puro, `prerender = true`. |
| 14:03 | Deploy manual a Vercel con `vercel --prod` (el plan Hobby bloquea el auto-deploy desde GitHub). |
| 14:09 | Lighthouse fase 1 sobre `/noticias` sin header ni footer: 94 / 92 / 100 / 100. |
| 14:24 | Fase 2 día 1: `design-system.css` consolidado con el diseño azul e Inter real de Next.js. |
| 14:40 | Giro de diseño: sistema inspirado en agorareal.com. Naranja `#FD6D0A`, azul marino `#001529`, Playfair Display + Urbanist. |
| 15:17 | Último commit: home, header con menú móvil en JS vanilla, footer, aviso legal, cookies, `/noticias` con 120 artículos mock e infinite scroll. |

| Hora (16 oct) | Hito |
|---|---|
| 08:33 | Recuperación de contexto tras caída del equipo. Build Astro OK. Producción Astro coincide con HEAD. |
| 09:00 | Lighthouse local sobre Astro y Next.js en producción (8 auditorías). |
| 09:05 | Causa raíz del bloqueo de la home de Next.js localizada. |
| 09:14 | Commit `3480335` en `main`, deploy automático de Vercel. |
| 09:19 | Lighthouse de verificación en producción. |

## 3. Resultado del PoC Astro

Stack final en `etfnexo-astro`:

- Astro 7.3.8, output `static`, sin adapter. Puerto dev 5001.
- Tailwind CSS 4 vía plugin de Vite. React 19 instalado pero sin islas en uso.
- 4 páginas: `/`, `/noticias`, `/aviso-legal`, `/politica-cookies`.
- 0 KB de JavaScript de framework. Menú móvil en ~2 KB de JS vanilla.
- Sistema de diseño en `src/styles/agora-design-system.css` (609 líneas, tokens + componentes base).
- Build completo en 0,8 s.

## 4. Medición comparativa (16 oct, Lighthouse 13.5 local, Chrome 148, misma máquina y red)

| Página | Dispositivo | Perf | A11y | BP | SEO | LCP | TBT | CLS | JS | Peso |
|---|---|---|---|---|---|---|---|---|---|---|
| Astro `/` | móvil | 92 | 91 | 100 | 100 | 2,7 s | 0 ms | 0,03 | 0 KB | 85 KB |
| Astro `/noticias` | móvil | 86 | 91 | 100 | 100 | 4,1 s | 0 ms | 0,00 | 0 KB | 389 KB |
| Next.js `/` (antes del fix) | móvil | 45 | 94 | 100 | 100 | 3,7 s | 59.630 ms | 0,12 | 228 KB | 731 KB |
| Next.js `/noticias` | móvil | 95 | 94 | 100 | 92 | 2,7 s | 60 ms | 0,01 | 217 KB | 582 KB |
| Astro `/` | escritorio | 100 | 86 | 100 | 100 | 0,5 s | 0 ms | 0,03 | 0 KB | 85 KB |
| Astro `/noticias` | escritorio | 99 | 86 | 100 | 100 | 1,0 s | 0 ms | 0,01 | 0 KB | 657 KB |
| Next.js `/` (antes del fix) | escritorio | 43 | 94 | 100 | 100 | 0,7 s | 950 ms | 0,40 | 253 KB | 903 KB |
| Next.js `/noticias` | escritorio | 97 | 94 | 100 | 92 | 1,0 s | 0 ms | 0,01 | 252 KB | 732 KB |

Lecturas:

1. **Página contra página, Next.js gana en móvil** (`/noticias` 95 frente a 86). La página Astro está penalizada por las imágenes de picsum.photos sin optimizar (LCP 4,1 s) y por las dos familias de Google Fonts que bloquean el render unos 830 ms. Son artefactos del test, no de la arquitectura.
2. **La ventaja estructural de Astro es real**: 0 KB de JS, TBT 0, 85 KB totales en la home y 99 a 100 en escritorio.
3. **La home de Next.js no era lenta, estaba rota** (ver sección 5).

## 5. Bug crítico de la home de Next.js

### Causa raíz

`components/RankingSlider.tsx` pedía `/api/v1/rankings` sin parámetro `limit`. El endpoint tiene un límite por defecto de 1.000 y devolvía 811 ETFs (308 KB). El componente triplicaba la lista para el efecto de bucle infinito.

| Métrica (Lighthouse móvil) | Home | Noticias (referencia) |
|---|---|---|
| Elementos DOM | 100.455 | 417 |
| Hijos del contenedor animado | 2.433 | 14 |
| Style & Layout en hilo principal | 125 s | — |
| TBT | 59.630 ms | 60 ms |

Cada frame de la animación `translateX` obligaba al navegador a mantener un carril de 2.433 tarjetas de 420 px.

### Corrección (commit `3480335`)

- `components/RankingSlider.tsx`: petición con `?limit=10`, lista duplicada una sola vez (la animación `.animate-scroll` desplaza -50%, dos copias cierran el bucle sin salto), eliminada la clase inexistente `hover:pause`.
- `app/globals.css`: `prefers-reduced-motion` detiene el carrusel.

### Verificación en producción

| Home etfnexo.com | Perf | TBT | Speed Index | Nodos DOM | CLS |
|---|---|---|---|---|---|
| Antes, móvil | 45 | 59.630 ms | 22,5 s | 100.455 | 0,116 |
| Después, móvil | **80** | **10 ms** | **3,0 s** | **1.522** | 0,115 |
| Antes, escritorio | 43 | 950 ms | 7,4 s | 100.457 | 0,399 |
| Después, escritorio | **78** | **0 ms** | **1,1 s** | **1.524** | 0,454 |

## 6. Hallazgos colaterales

### 6.1 Seguridad (acción requerida)

- **Service role key de Supabase escrita en el repo `ruy`**: `README_SETUP.md`, `SETUP_AUTOMATION_NOW.md`, `SETUP_FINNHUB.md`, `SETUP_STATUS.md`. Está en el historial de git. Rotar en el panel de Supabase y eliminar de los documentos.
- **Token personal de GitHub incrustado en la URL del remote** de `etfnexo-astro/.git/config`. Revocarlo y usar un credential helper.

### 6.2 Repositorio `etfnexo-astro`

- La carpeta `design-new/` (HTML de 12 MB, 4 capturas de ~20 MB, 264 assets de agorareal.com) entró en el último commit. Son referencias, no código. Sacarla del repo.
- `global.css` usa `--color-slate-50` para el fondo del body, variable que solo existe en el `design-system.css` azul ya no importado. Cae a blanco. Apuntar a `--bg-white`.
- Conviven dos sistemas de diseño en `src/styles`: `design-system.css` (azul/Inter) y `agora-design-system.css` (activo).
- El hero de la home mantiene el copy en inglés copiado de Agora ("Built for the way ETF investors operate").
- La documentación habla de 6 enlaces de navegación; el `Header.astro` tiene 4 (faltan Entrevistas y Gestoras).

### 6.3 El "problema de DNS en WSL" no era de DNS

El `.env` del PoC apunta al proyecto Supabase `ycxjpmqidphocvvfxkdb`, que no existe en DNS público (NXDOMAIN). Producción usa `utvioubcqkwwzvufhups` (68 referencias en `ruy`). Por eso el PoC tuvo que funcionar con datos mock.

### 6.4 Tres fuentes de verdad de diseño en `ruy`

| Fuente | Primario | Tipografía |
|---|---|---|
| `app/styles/base/variables.css` | `#3B82F6` (Blue-600) | Inter |
| `tailwind.config.ts` | `#235D87` azul, `#5DABB8` teal, `#F95602` naranja | Archivo |
| `design-system/MASTER.md` (manual de marca) | igual que Tailwind | Archivo |

En el código, `text-blue-600` resuelve a `#1C4A6B` (escala de marca), no al Blue-600 de Tailwind. Ver `docs/PLAN_MIGRACION_DISENO_AGORA.md`.

## 7. Decisión

**No migrar la plataforma completa a Astro.** Con la home arreglada, Next.js rinde 95 en `/noticias` y ningún dato de la prueba justifica cuatro semanas de migración.

Astro queda como **candidato para páginas públicas de contenido** (noticias, academia, entrevistas) si en un segundo test con imágenes reales optimizadas y fuentes autoalojadas supera 95 en móvil.

**Lo que sí se adopta del experimento es el sistema de diseño Agora**, que se migrará a Next.js (plan separado).

## 8. Mejoras posibles

### Next.js (producción)

| Prioridad | Mejora | Evidencia | Impacto esperado |
|---|---|---|---|
| Alta | Reservar altura fija al `MarketTicker` y al `AdSlot` de la home para que el hero no se desplace al cargar | CLS 0,45 escritorio, culpable `section.relative` del hero | CLS < 0,1, Performance home a ~90 |
| Alta | Cargar Inter con `next/font` en lugar de `@import` de Google Fonts en `globals.css` | render-blocking ~1.000 ms en ambas páginas | FCP y LCP -0,5 a -1 s |
| Alta | Límite por defecto del endpoint `/api/v1/rankings` (hoy 1.000) y paginación | 308 KB por llamada sin `limit` | Protege a cualquier consumidor futuro |
| Media | `sizes` y dimensiones explícitas en imágenes de `NewsCard` | `unsized-images`, `image-delivery` 187 KB | LCP y CLS en noticias |
| Media | Eliminar `legacy-javascript` y JS no usado (39 KB) | `unused-javascript`, `legacy-javascript-insight` | TBT y peso |
| Media | Orden de encabezados y contraste en tarjetas | `heading-order`, `color-contrast` | A11y 94 → 100 |
| Baja | Canonical en `/noticias` | `canonical` falla en SEO (92) | SEO 100 |
| Baja | `viewport` como export propio en lugar de `metadata` | warning de build | Limpieza |

### Astro (si se retoma)

- Imágenes reales de Supabase a través del componente `<Image>` de Astro (AVIF/WebP, `srcset`).
- Fuentes autoalojadas con `font-display: swap` y preload del peso principal.
- Añadir `<main>`, corregir el contraste del botón naranja con texto blanco (2,8:1) y el salto h2 → h4 del footer.
- Conectar al proyecto Supabase correcto y retirar el modo mock.
- Sacar `design-new/` del repo.

## 9. Cómo repetir las mediciones

Lighthouse local con el Chrome de Puppeteer (no depende de la cuota de PageSpeed Insights):

```bash
export CHROME_PATH=/home/suario/.cache/puppeteer/chrome/linux-148.0.7778.97/chrome-linux64/chrome
npx lighthouse https://etfnexo.com/ --output=json --output-path=./home-mobile.json \
  --chrome-flags="--headless=new --no-sandbox --disable-gpu --disable-dev-shm-usage" \
  --only-categories=performance,accessibility,best-practices,seo
# escritorio: añadir --preset=desktop
```

Los valores absolutos dependen de la CPU de la máquina. Comparar siempre las dos webs en la misma sesión.

## 10. Ficheros de referencia

- `etfnexo-astro/POC-PHASE-2-PLAN.md`: criterios GO/NO-GO.
- `etfnexo-astro/LIGHTHOUSE-RESULTS-FINAL.md`: medición fase 1 (diseño antiguo).
- `etfnexo-astro/AGORA-DESIGN-ANALYSIS.md`, `AGORA-REDESIGN-SUMMARY.md`, `HEADER-FOOTER-SUMMARY.md`: sistema de diseño Agora.
- `etfnexo-astro/src/styles/agora-design-system.css`: tokens y componentes a migrar.
- `ruy/docs/PLAN_MIGRACION_DISENO_AGORA.md`: plan de migración del sistema de diseño.
