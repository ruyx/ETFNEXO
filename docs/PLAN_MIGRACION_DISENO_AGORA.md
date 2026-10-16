# Plan de migración del sistema de diseño Agora a Next.js

**Fecha:** 16 de octubre de 2026
**Origen:** `etfnexo-astro/src/styles/agora-design-system.css` (609 líneas) + `Header.astro` + `Footer.astro`
**Destino:** `ruy` (Next.js 14, Tailwind 3, CSS por componentes)
**Estado:** fases 1 a 5 implementadas el 16 oct 2026 en la rama `feat/design-system-agora` (ver sección 9). Pendiente: revisión visual del usuario en el preview de Vercel y merge a `main`.

---

## 1. Objetivo

Que la web en producción use el mismo lenguaje visual que el PoC Astro: fondo azul marino `#001529`, naranja `#FD6D0A` como color de acción, azul `#276EF0` como secundario, Playfair Display para títulos y Urbanist para cuerpo, secciones alternas oscuro/claro/blanco, tarjetas con radio 16 px y elevación en hover.

Sin reescribir la aplicación: cambio **token-first**, de forma que la mayor parte de los 12.168 líneas de CSS y los 69 ficheros TSX cambien de aspecto sin tocarlos, y solo se editen a mano los componentes visibles de las páginas públicas.

## 2. Estado actual de `ruy`

### 2.1 Tres fuentes de verdad en conflicto

| Fuente | Qué define | Primario | Tipografía |
|---|---|---|---|
| `app/styles/base/variables.css` (162 líneas) | Variables CSS usadas por los 17 ficheros de `app/styles/components` | `#3B82F6` | Inter |
| `tailwind.config.ts` | Escalas `blue`, `teal`, `orange`, `neutral`, `fontFamily`, `fontSize` | `#235D87` (manual de marca) | Archivo |
| `app/globals.css` | `@import` de Inter desde Google Fonts, `--font-sans`, `@layer` con utilidades | — | Inter |

Consecuencia: `text-blue-600` en JSX resuelve a `#1C4A6B` (escala de marca), no al azul de Tailwind. Las clases `text-slate-*` sí son las de Tailwind por defecto porque `slate` no está sobreescrita.

### 2.2 Volumen a tocar

| Métrica | Valor |
|---|---|
| Ficheros CSS | 25 (12.168 líneas) |
| Usos de clases Tailwind de color escritas a mano en TSX | 1.002 |
| Ficheros TSX públicos (`app/` sin `admin/`) | 25 |
| Ficheros TSX de admin | 44 |
| Clases de color más frecuentes | `text-slate-900` ×105, `text-slate-600` ×75, `text-slate-500` ×63, `border-slate-200` ×63, `text-slate-300` ×37, `bg-slate-50` ×32, `text-blue-600` ×27 |

Los 5 ficheros con más clases hardcodeadas: `app/admin/agentes/crear/page.tsx` (107), `app/newsletter/page.tsx` (105), `components/webmcp/PortfolioAnalysisPanel.tsx` (75), `app/components-demo/page.tsx` (74), `app/page.tsx` (57).

## 3. Mapa de tokens (actual → Agora)

### Colores

| Actual (`variables.css`) | Agora | Nota |
|---|---|---|
| `--color-primary: #3B82F6` | `--color-primary: #FD6D0A` | El naranja pasa a ser la acción principal |
| `--color-primary-dark: #2563EB` | `--color-primary-dark: #E66100` | |
| `--color-primary-light: #60A5FA` | `--color-primary-light: #FD8A3B` | |
| (no existe) | `--color-secondary: #276EF0` | Enlaces y acentos azules |
| `--color-slate-900: #0F172A` | `--text-primary: #001529` | Título y fondo oscuro |
| `--color-slate-800: #1E293B` | `--bg-dark-alt: #1A2C3E` | |
| `--color-slate-700: #334155` | `--bg-dark-lighter: #334454` | |
| `--color-slate-600: #475569` | `--text-secondary: #66737F` | |
| `--color-slate-500: #64748B` | `--text-secondary: #66737F` | |
| `--color-slate-400: #94A3B8` | `--text-muted: #99A1A9` | |
| `--color-slate-300: #CBD5E1` | `--text-light: #CCD0D4` | |
| `--color-slate-200: #E2E8F0` | `--border-light: #E5E8EA` | |
| `--color-slate-100: #F1F5F9` | `--bg-light: #F1F6FB` | |
| `--color-slate-50: #F8FAFC` | `--bg-light: #F1F6FB` | |
| `--color-white: #FFFFFF` | `--bg-white: #FDFDFD` | |
| `--header-bg: slate-900` | `--header-bg: var(--bg-dark)` | Header oscuro |
| `--color-success/error/warning` | se mantienen | Agora no los define; conservar los actuales |

### Tipografía

| Actual | Agora |
|---|---|
| `--font-sans: Inter` (todo) | `--font-heading: Playfair Display` + `--font-body: Urbanist` |
| `font-size` hasta 5xl (48 px) | hasta `--font-size-hero` (72 px) |
| h1 48 px | h1 60 px escritorio, 36 px móvil |
| `font-mono` para cifras financieras | se mantiene (Playfair no es apta para tablas numéricas) |

### Forma y espacio

| Token | Actual | Agora |
|---|---|---|
| `--card-radius` | 8 px | 16 px |
| `--card-padding` | 24 px | 32 px |
| `--btn-padding` | 12 × 24 px, 14 px de fuente | 14 × 32 px, 16 px de fuente |
| `--radius-sm/md/lg` | 6 / 8 / 12 px | 8 / 12 / 16 px |
| Sombras | gris neutro | teñidas de azul marino `rgba(0,21,41,…)` + `--shadow-primary` naranja |
| Transiciones | 150 / 200 / 300 ms lineales | 150 / 300 / 500 ms `cubic-bezier(0.4,0,0.2,1)` |
| Padding de sección | no existe | 60 / 80 / 120 px (móvil / tablet / escritorio) |

## 4. Estrategia: token-first con alias de compatibilidad

La clave para no tocar 12.000 líneas de CSS es **mantener los nombres de variable antiguos como alias** de los nuevos durante la migración:

```css
/* variables.css (nuevo) */
:root {
  /* Tokens Agora (fuente de verdad) */
  --color-primary: #FD6D0A;
  --bg-dark: #001529;
  --text-secondary: #66737F;
  /* ... */

  /* Alias de compatibilidad: el CSS existente sigue funcionando */
  --color-slate-900: var(--text-primary);
  --color-slate-600: var(--text-secondary);
  --color-slate-200: var(--border-light);
  --color-slate-50:  var(--bg-light);
  /* ... */
}
```

Y en `tailwind.config.ts`, redefinir las escalas que el JSX ya usa para que apunten a los tokens:

```ts
colors: {
  primary: { DEFAULT: 'var(--color-primary)', dark: 'var(--color-primary-dark)', light: 'var(--color-primary-light)' },
  secondary: { DEFAULT: 'var(--color-secondary)', ... },
  slate: { 50: 'var(--bg-light)', 200: 'var(--border-light)', 500: 'var(--text-secondary)', 600: 'var(--text-secondary)', 900: 'var(--text-primary)', ... },
  blue: { 600: 'var(--color-secondary)', 700: 'var(--color-secondary-dark)', ... },
},
fontFamily: { heading: ['var(--font-heading)'], body: ['var(--font-body)'], sans: ['var(--font-body)'] },
```

Así las 1.002 clases hardcodeadas cambian de color sin editar JSX. Después, en las páginas públicas, se sustituyen progresivamente por clases semánticas (`text-primary`, `bg-dark`, `.btn-primary`, `.card`).

## 5. Fases

### Fase 0: decisiones (requiere al usuario)

Ver sección 7.

### Fase 1: tokens y fuentes (1 día)

1. Reescribir `app/styles/base/variables.css` con los tokens Agora + alias de compatibilidad.
2. Redefinir `tailwind.config.ts` (colores, `fontFamily`, `borderRadius`, `boxShadow`) sobre las variables.
3. Cargar Playfair Display y Urbanist con `next/font/google` en `app/layout.tsx` (elimina el `@import` bloqueante de `globals.css` y mejora LCP). Exponerlas como `--font-heading` y `--font-body`.
4. Base global: `body` con `--font-body`, `h1..h6` con `--font-heading`, enlaces azul → naranja en hover.
5. Build + captura de las 8 páginas públicas en 4 breakpoints (320, 768, 1024, 1440) como referencia "antes".

**Resultado:** toda la web cambia de paleta y tipografía de golpe. Habrá incoherencias visuales que se corrigen en las fases siguientes.

### Fase 2: layout (1 día)

1. `components/Header.tsx` + `header.css`: fondo `--bg-dark`, logo blanco, enlaces blancos con subrayado animado naranja, CTA "Ver Rankings" naranja, menú móvil tipo drawer. Portar de `Header.astro`. Recuperar los 6 enlaces (Noticias, Academia, Entrevistas, Rankings, ETFs, Gestoras).
2. `components/Footer.tsx`: 4 columnas, fondo oscuro, hover naranja, bloque legal con las 5 páginas. Portar de `Footer.astro`.
3. `MarketTicker.tsx`: integrarlo en el header oscuro **con altura reservada** (resuelve también el CLS pendiente de la home).
4. Utilidades de sección: `.section`, `.section--dark`, `.section--light`, `.section--white`, `.container` con los paddings Agora.

### Fase 3: componentes públicos (2 días)

| Componente | Cambio |
|---|---|
| `buttons.css` | `.btn-primary` naranja con elevación y `--shadow-primary`; `.btn-secondary` outline; `.btn-secondary--on-dark`; `.btn-ghost` |
| `cards.css`, `NewsCard`, `AcademyCard`, `InterviewCard`, `ETFCard` | radio 16 px, padding 32 px, hover `translateY(-4px)` + `--shadow-xl`, título en Playfair |
| `CategoryBadge`, `DifficultyBadge`, `ReadingTimeBadge`, `SponsorBadge` | píldoras con `--radius-full`, variantes sobre fondo claro y oscuro |
| `ProgressBar`, `ScoreRing`, `ETFRating` | colores de progreso sobre tokens; cifras siguen en mono tabular |
| `RankingSlider` | tarjeta con nuevo radio y sombra; sin cambio funcional |
| `AdSlot`, `StickyNewsBanner`, `FixedTopBanner` | contenedores con altura reservada y bordes `--border-light` |
| `CookieBanner` | fondo oscuro, CTA naranja |

### Fase 4: páginas públicas (2 días)

Orden por tráfico y visibilidad: `/` (hero oscuro con palabra destacada en naranja, features sobre `--bg-light`, CTA oscuro), `/noticias` y `/noticias/[slug]`, `/rankings`, `/etfs` y `/etfs/[isin]`, `/academia`, `/entrevistas`, `/gestoras`, legales, `/login` y `/signup`, `not-found`, `unauthorized`.

En cada página: sustituir clases Tailwind de color hardcodeadas por semánticas, aplicar ritmo de secciones alternas, añadir `fade-in-up` en hero y tarjetas.

### Fase 5: admin (1 día)

Las 44 páginas de admin y sus 5.000 líneas de CSS (`admin.css`, `admin-extension.css`, `admin-ads.css`) heredan los tokens vía alias en la fase 1 y en esta fase se rediseñan: header y sidebar oscuros, tablas y formularios sobre `--bg-light`/`--bg-white`, botones `.btn-*`, badges de estado con los colores semánticos conservados. Prioridad por uso: noticias, academia, entrevistas, ads, agentes, usuarios.

### Fase 6: QA y lanzamiento (1 día)

- Regresión visual: capturas de las 8 páginas públicas en 320 / 768 / 1024 / 1440 contra la referencia de la fase 1.
- Lighthouse móvil y escritorio en `/`, `/noticias`, `/rankings`. Objetivo: Performance ≥ 90, A11y ≥ 95, CLS < 0,1.
- Contraste AA en todos los pares texto/fondo nuevos (ver riesgo 6.1).
- Modo edición y contenidos largos en tarjetas (regla `min-height`, nunca `height`).
- Limpieza: eliminar `design-system/theme.config.ts` y `QUICK_STYLE_GUIDE.md` / `STYLES_README.md` si quedan obsoletos, actualizar `design-system/MASTER.md`.

**Total estimado: 8 días.**

## 6. Riesgos

| # | Riesgo | Mitigación |
|---|---|---|
| 6.1 | **Contraste del botón naranja con texto blanco: 2,8:1**, falla AA (Lighthouse ya lo marcó en Astro). | Aceptado por decisión del usuario (sección 7). Si en el futuro se quiere AA: texto `#001529` sobre naranja (~6,5:1) o botones en `#C74502` con texto blanco (4,6:1). |
| 6.2 | Playfair Display en títulos de tablas de rankings y fichas ETF puede restar legibilidad a cifras. | Cifras y tickers siempre en `font-mono` tabular; Playfair solo en h1 a h3 editoriales. |
| 6.3 | Redefinir `slate` y `blue` en Tailwind cambia 1.002 usos de golpe; algún fondo claro puede volverse oscuro o viceversa. | Fase 1 cierra con captura comparativa de todas las páginas; corregir desviaciones en fases 3 y 4. |
| 6.4 | Cambio de fuentes provoca CLS por swap. | `next/font` con `display: swap` y `adjustFontFallback` automático. |
| 6.5 | Admin se degrada visualmente. | Alias de compatibilidad + revisión de fase 5; admin no es público. |
| 6.6 | Manual de marca (`MASTER.md`) define azul `#235D87`, teal `#5DABB8`, Archivo. El sistema Agora se aleja del teal y de Archivo. | Decisión explícita del usuario (sección 7). El naranja Agora `#FD6D0A` y el de marca `#F95602` son casi idénticos. |

## 7. Decisiones tomadas (16 oct 2026)

| # | Decisión | Resultado |
|---|---|---|
| 1 | Tipografía | **Playfair Display + Urbanist**, como en el PoC Astro. Archivo deja de usarse. |
| 2 | Contraste de botones | **Texto blanco sobre naranja `#FD6D0A`, igual que en Astro.** Decisión consciente del usuario: el ratio 2,8:1 no cumple AA y Lighthouse lo marcará en `color-contrast`. Se documenta como excepción. |
| 3 | Teal `#5DABB8` del manual de marca | Se elimina de los tokens (no existe en el sistema Agora). Permanece solo en `MASTER.md` como histórico. |
| 4 | Admin | **Se incluye** en esta migración (fase 5 pasa a obligatoria). Estimación total: 8 días. |
| 5 | Ticker de mercado | Barra separada bajo el header, fondo `--bg-dark-alt`, **altura reservada** de 40 px para evitar el CLS. |
| 6 | Lanzamiento | **Rama `feat/design-system-agora`**, previews de Vercel por fase, merge a `main` tras la fase 6. |

## 8. Ficheros que se crean o cambian

| Acción | Fichero |
|---|---|
| Reescribir | `app/styles/base/variables.css` |
| Reescribir | `tailwind.config.ts` (bloque `theme.extend`) |
| Editar | `app/layout.tsx` (next/font), `app/globals.css` (quitar `@import` de Inter, base tipográfica) |
| Editar | `app/styles/components/header.css`, `buttons.css`, `cards.css`, `noticias.css`, `rankings.css`, `etfs.css`, `gestoras.css`, `academia.css`, `legal.css` |
| Editar | `components/Header.tsx`, `Footer.tsx`, `MarketTicker.tsx`, `NewsCard.tsx`, `AcademyCard.tsx`, `InterviewCard.tsx`, `ETFCard.tsx`, badges, `CookieBanner.tsx` |
| Editar | 25 páginas públicas en `app/` |
| Nuevo | `app/styles/base/sections.css` (ritmo de secciones y utilidades Agora) |
| Actualizar | `design-system/MASTER.md` |

## 9. Estado de ejecución (16 oct 2026)

| Fase | Commit | Estado | Notas |
|---|---|---|---|
| 1 Tokens y fuentes | `d5ebe2f` | Hecha | `variables.css` define además 35 variables que el código usaba sin declarar (`--font-heading`, `--font-body`, `--color-neutral-*`). Fuentes autoalojadas con `next/font`, sin peticiones a Google Fonts. |
| 2 Layout | `7112466` | Hecha | Header oscuro con 6 enlaces y CTA, footer oscuro, ticker con altura reservada, banner superior de la home con altura fija. |
| 3 Componentes | `8bf4c12` | Hecha | Botones, tarjetas (imagen a sangre, hover con elevación), badges, banner de cookies, menú de usuario. |
| 4 Páginas públicas | `3133650` | Hecha | Heros oscuros unificados en noticias, academia, entrevistas, rankings, ETFs y gestoras (antes azul, verde, morado y blanco). Home con palabra destacada y secciones alternas. |
| Fix encabezados | `9b09793` | Hecha | Los h1-h6 heredan el color del contexto para seguir blancos en secciones oscuras. |
| 5 Admin | pendiente de commit | Hecha | 25 hex sustituidos por tokens en `admin.css`, `admin-ads.css` y `login.css`. El admin reutiliza el Header público y su CSS ya era 95 % variables, así que hereda la paleta por los alias. No se ha podido revisar visualmente (requiere sesión). |
| 6 QA | en curso | Parcial | Capturas locales de 8 páginas públicas en 1440 y 375 px con datos reales (reenvío de `/api/*` a producción). Lighthouse local en home y noticias. Falta la revisión visual del usuario en el preview protegido de Vercel. |

### Verificación visual realizada

El preview de Vercel está protegido por SSO y no es accesible desde la automatización. Se verificó en local compilando con valores ficticios de Supabase (solo para que arranque el middleware) y reenviando las llamadas `/api/*` a producción desde Puppeteer. Capturas en el scratchpad de la sesión (`shots/despues/`), referencia de producción en `shots/antes/`.

Comprobado con estilos computados: títulos de hero en blanco (`rgb(255,255,255)`) y Playfair Display, botón primario `#FD6D0A` con texto blanco, encabezados de contenido en `#001529`.

### Hallazgos durante la migración (fuera del alcance del diseño)

- **AdSlot dejaba un esqueleto permanente cuando no hay anuncio activo** (p. ej. `home_after_ranking` devuelve `{"ads":[]}`). En contenedores flex colapsaba a una línea blanca de 1 px. Corregido: sin anuncio no renderiza nada.
- **`/rankings` y `/etfs` renderizan los 811 ETFs de golpe**: páginas de 107.000 y 91.000 px de alto. Afecta a rendimiento y a la captura de pantalla móvil. Conviene paginar o virtualizar (mejora pendiente, no incluida aquí).
- La clase `hover-lift` se usaba en todas las tarjetas pero no existía en ningún CSS. Eliminada.
