# ETF Nexo - Sistema de Diseño Completo

**Versión**: 1.0
**Fecha**: Junio 2026
**Basado en**: Manual de Imagen ETF Nexo V1.0 - NanoBanana
**Stack**: Next.js 14 + Tailwind CSS + shadcn/ui

---

## 🎨 Paleta de Colores

### Colores Principales

```css
:root {
  /* Primaria Azul - Color corporativo principal */
  --color-primary-blue: #235D87;
  --color-primary-blue-rgb: 35, 93, 135;
  --color-primary-blue-cmyk: 74%, 31%, 0%, 47%;

  /* Primaria Teal - Innovación y frescura */
  --color-primary-teal: #5DABB8;
  --color-primary-teal-rgb: 93, 171, 184;
  --color-primary-teal-cmyk: 49%, 7%, 0%, 28%;

  /* Primaria Naranja - Energía y crecimiento */
  --color-primary-orange: #F95602;
  --color-primary-orange-rgb: 249, 86, 2;
  --color-primary-orange-cmyk: 0%, 65%, 99%, 2%;

  /* Cream Background - Fondo principal */
  --color-cream-bg: #FAF9F6;
  --color-cream-bg-rgb: 250, 249, 246;

  /* Accent Gray - Jerarquía visual */
  --color-accent-gray: #6B7280;
  --color-accent-gray-rgb: 107, 114, 128;
}
```

### Paleta Extendida para UI

```css
:root {
  /* Blues - Escala completa */
  --blue-50: #EFF6FB;
  --blue-100: #D4E8F5;
  --blue-200: #A9D1EB;
  --blue-300: #7EBAE1;
  --blue-400: #5393C7;
  --blue-500: #235D87;  /* Primary */
  --blue-600: #1C4A6B;
  --blue-700: #15384F;
  --blue-800: #0E2534;
  --blue-900: #07131A;

  /* Teals - Escala completa */
  --teal-50: #EFFBFC;
  --teal-100: #D4F3F6;
  --teal-200: #A9E7ED;
  --teal-300: #7EDBE4;
  --teal-400: #5DABB8;  /* Primary */
  --teal-500: #4A8A94;
  --teal-600: #3A6D75;
  --teal-700: #2B5157;
  --teal-800: #1C3638;
  --teal-900: #0E1B1C;

  /* Oranges - Escala completa */
  --orange-50: #FEF3E9;
  --orange-100: #FDE0C7;
  --orange-200: #FCC18F;
  --orange-300: #FAA257;
  --orange-400: #F95602;  /* Primary */
  --orange-500: #C74502;
  --orange-600: #953301;
  --orange-700: #642201;
  --orange-800: #321100;
  --orange-900: #190800;

  /* Neutrals - Grises y blancos */
  --neutral-0: #FFFFFF;
  --neutral-50: #FAF9F6;   /* Cream background */
  --neutral-100: #F3F4F6;
  --neutral-200: #E5E7EB;
  --neutral-300: #D1D5DB;
  --neutral-400: #9CA3AF;
  --neutral-500: #6B7280;  /* Accent gray */
  --neutral-600: #4B5563;
  --neutral-700: #374151;
  --neutral-800: #1F2937;
  --neutral-900: #111827;

  /* Semánticos */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
}
```

### Uso de Colores por Contexto

```typescript
// Mapeo de colores a propósitos
const colorUsage = {
  // Navegación y headers
  navigation: 'var(--color-primary-blue)',
  navHover: 'var(--blue-600)',

  // CTAs principales
  primaryCTA: 'var(--color-primary-orange)',
  primaryCTAHover: 'var(--orange-600)',

  // Datos positivos (rendimientos, scores)
  positive: 'var(--color-primary-teal)',
  positiveAccent: 'var(--teal-600)',

  // Fondos
  bodyBg: 'var(--neutral-50)',
  cardBg: 'var(--neutral-0)',
  sectionBg: 'var(--neutral-100)',

  // Textos
  textPrimary: 'var(--neutral-900)',
  textSecondary: 'var(--neutral-500)',
  textMuted: 'var(--neutral-400)',

  // Bordes
  borderDefault: 'var(--neutral-200)',
  borderHover: 'var(--neutral-300)',
  borderFocus: 'var(--color-primary-blue)',
}
```

---

## 🔤 Tipografía

### Familia de Fuentes: Archivo

**Fuente principal**: [Archivo](https://fonts.google.com/specimen/Archivo) - Google Fonts

```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,100..900;1,100..900&display=swap');

:root {
  --font-heading: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### Escala Tipográfica

```css
:root {
  /* Headings */
  --text-h1: 3.5rem;     /* 56px - Hero titles */
  --text-h1-mobile: 2.5rem;  /* 40px */

  --text-h2: 2.5rem;     /* 40px - Section titles */
  --text-h2-mobile: 2rem;    /* 32px */

  --text-h3: 2rem;       /* 32px - Card titles */
  --text-h3-mobile: 1.5rem;  /* 24px */

  --text-h4: 1.5rem;     /* 24px - Sub-headers */
  --text-h4-mobile: 1.25rem; /* 20px */

  --text-h5: 1.25rem;    /* 20px - Small headers */
  --text-h5-mobile: 1.125rem; /* 18px */

  /* Body text */
  --text-base: 1rem;     /* 16px - Texto normal */
  --text-sm: 0.875rem;   /* 14px - Texto pequeño */
  --text-xs: 0.75rem;    /* 12px - Labels, captions */

  /* Display */
  --text-display: 4.5rem; /* 72px - Landing hero */
  --text-display-mobile: 3rem; /* 48px */

  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  /* Letter spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

### Clases de Tipografía

```css
/* Titulares - Archivo Bold */
.heading-1 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-h1);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--neutral-900);
}

.heading-2 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-h2);
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--neutral-900);
}

.heading-3 {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-h3);
  line-height: var(--leading-normal);
  color: var(--neutral-900);
}

/* Cuerpo de texto - Archivo Regular */
.body-large {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: 1.125rem; /* 18px */
  line-height: var(--leading-relaxed);
  color: var(--neutral-700);
}

.body-base {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--neutral-700);
}

.body-small {
  font-family: var(--font-body);
  font-weight: 400;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--neutral-600);
}

/* Secundaria/Citas - Archivo Italic */
.text-italic {
  font-family: var(--font-body);
  font-weight: 400;
  font-style: italic;
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--neutral-600);
}

/* Números financieros - Archivo Bold */
.financial-number {
  font-family: var(--font-heading);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tracking-tight);
}
```

---

## 🏗️ Elementos Gráficos y Patrones

### Logo y Símbolo

**Construcción**:
- Basado en espiral y flechas ascendentes
- Símbolo de infinito + crecimiento
- Tamaño mínimo: 20mm ancho
- Zona de respeto: usar "X" (ancho de letra "S") y "E" (altura de letra "E")

**Variantes**:
```typescript
const logoVariants = {
  full: '/logo/etf-nexo-full.svg',           // Logo + texto
  symbol: '/logo/etf-nexo-symbol.svg',       // Solo símbolo
  horizontal: '/logo/etf-nexo-horizontal.svg', // Layout horizontal
  monochrome: '/logo/etf-nexo-mono.svg',     // Versión monocromática
}
```

### Patrón Scala

**Uso**: Fondos decorativos, texturas sutiles

```css
.pattern-scala {
  background-image: url('/patterns/scala-pattern.svg');
  background-size: 200px 200px;
  background-repeat: repeat;
  opacity: 0.05;
}
```

**Aplicación**:
- Hero sections
- Fondos de cards secundarios
- Separadores de secciones

### Iconografía

**Estilo**: Outlined, 2px stroke, redondeado

```typescript
// Iconos del sistema (Lucide React)
import {
  TrendingUp,      // Crecimiento
  Users,           // Comunidad
  Accessibility,   // Accesibilidad
  Lightbulb,       // Conocimiento
  BarChart3,       // Analytics
  Shield,          // Confianza
} from 'lucide-react'

// Configuración estándar
const iconConfig = {
  size: 24,
  strokeWidth: 2,
  className: 'text-current'
}
```

---

## 📐 Espaciado y Layout

### Sistema de Espaciado (8px base)

```css
:root {
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-5: 1.25rem;   /* 20px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-10: 2.5rem;   /* 40px */
  --spacing-12: 3rem;     /* 48px */
  --spacing-16: 4rem;     /* 64px */
  --spacing-20: 5rem;     /* 80px */
  --spacing-24: 6rem;     /* 96px */

  /* Contenedores */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
  --container-2xl: 1536px;

  /* Padding de secciones */
  --section-padding-y: var(--spacing-16);
  --section-padding-y-mobile: var(--spacing-10);

  /* Border radius */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */
  --radius-2xl: 1.5rem;   /* 24px */
  --radius-full: 9999px;
}
```

### Grid System

```css
.container {
  width: 100%;
  max-width: var(--container-xl);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--spacing-4);
  padding-right: var(--spacing-4);
}

.grid-cols-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: var(--spacing-6);
}

/* Breakpoints */
@media (min-width: 640px) {  /* sm */
  .container { padding-left: var(--spacing-6); padding-right: var(--spacing-6); }
}

@media (min-width: 768px) {  /* md */
  .container { padding-left: var(--spacing-8); padding-right: var(--spacing-8); }
}

@media (min-width: 1024px) { /* lg */
  .container { padding-left: var(--spacing-10); padding-right: var(--spacing-10); }
}
```

---

## 🎭 Efectos y Sombras

### Sombras

```css
:root {
  /* Elevación */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

  /* Sombras de color (brand) */
  --shadow-blue: 0 10px 30px -10px rgba(35, 93, 135, 0.3);
  --shadow-teal: 0 10px 30px -10px rgba(93, 171, 184, 0.3);
  --shadow-orange: 0 10px 30px -10px rgba(249, 86, 2, 0.3);
}
```

### Glassmorphism (Sutil)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: var(--shadow-lg);
}

.glass-card-dark {
  background: rgba(35, 93, 135, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(93, 171, 184, 0.2);
}
```

### Gradientes

```css
:root {
  /* Gradiente principal (Blue → Teal) */
  --gradient-primary: linear-gradient(135deg, #235D87 0%, #5DABB8 100%);

  /* Gradiente secundario (Teal → Orange) */
  --gradient-secondary: linear-gradient(135deg, #5DABB8 0%, #F95602 100%);

  /* Gradiente sutil para fondos */
  --gradient-subtle: linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%);

  /* Overlay oscuro */
  --gradient-overlay-dark: linear-gradient(180deg, rgba(17, 24, 39, 0) 0%, rgba(17, 24, 39, 0.8) 100%);
}
```

---

## 📱 Componentes Base

### Botones

```css
/* Primary Button - CTA principal */
.btn-primary {
  background: var(--color-primary-orange);
  color: white;
  font-family: var(--font-heading);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: var(--shadow-orange);
}

.btn-primary:hover {
  background: var(--orange-600);
  box-shadow: var(--shadow-lg);
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--color-primary-blue);
  font-family: var(--font-heading);
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-primary-blue);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  background: var(--color-primary-blue);
  color: white;
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--neutral-700);
  padding: 0.75rem 1.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-ghost:hover {
  background: var(--neutral-100);
  color: var(--neutral-900);
}
```

### Cards

```css
.card {
  background: var(--neutral-0);
  border-radius: var(--radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--neutral-200);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--color-primary-teal);
}

.card-header {
  margin-bottom: var(--spacing-4);
  padding-bottom: var(--spacing-4);
  border-bottom: 1px solid var(--neutral-200);
}

.card-title {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: var(--text-h4);
  color: var(--neutral-900);
  margin: 0;
}
```

### Inputs

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--neutral-900);
  background: var(--neutral-0);
  border: 2px solid var(--neutral-300);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-blue);
  box-shadow: 0 0 0 3px rgba(35, 93, 135, 0.1);
}

.input::placeholder {
  color: var(--neutral-400);
}
```

---

## 🎯 Valores de Marca

### Pilares

1. **Conocimiento Democratizado** 💡
   - Color principal: Teal (#5DABB8)
   - Icono: Lightbulb

2. **Comunidad** 👥
   - Color principal: Blue (#235D87)
   - Icono: Users

3. **Accesibilidad Para Todos** ♿
   - Color principal: Teal (#5DABB8)
   - Icono: Accessibility

4. **Crecimiento - Inversión Inteligente** 📈
   - Color principal: Orange (#F95602)
   - Icono: TrendingUp

### Voz de Marca

**Tono**: Auténtica, Clara, Empática, Profesional

**Estilo de comunicación**:
- ✅ Directo y sin jerga innecesaria
- ✅ Educativo pero accesible
- ✅ Cercano y humano
- ✅ Transparente sobre datos y metodología

**Evitar**:
- ❌ Lenguaje demasiado técnico sin explicación
- ❌ Promesas de rendimiento garantizado
- ❌ Tono condescendiente
- ❌ Frialdad corporativa excesiva

---

## 📸 Fotografía y Tono Visual

### Estilo Fotográfico

**Temática**: Humano y Conectado + Analítico y Confiable

**Características**:
- Personas reales trabajando juntas
- Ambientes de oficina modernos pero cálidos
- Diversidad en edad, género, etnia
- Luz natural, colores cálidos
- Mezcla con visualizaciones de datos

**Composición**:
- Cercanía: planos medios y primeros planos
- Autenticidad: situaciones reales, no posed
- Transparencia: espacios abiertos, iluminación clara

---

## ❌ Usos Prohibidos

### No Hacer

1. **Cambio de colores incorrecto**
   - ❌ No alterar los colores principales
   - ❌ No usar gradientes no autorizados

2. **Mala resolución**
   - ❌ No usar logos pixelados
   - ❌ No estirar o deformar el logo

3. **Bajo resolución innecesario**
   - ❌ No usar imágenes de baja calidad

4. **Excesivos efectos**
   - ❌ No abusar de sombras o brillos
   - ❌ No aplicar efectos 3D no autorizados

---

## 🎨 Tailwind CSS Configuration

```javascript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#235D87',
          teal: '#5DABB8',
          orange: '#F95602',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAF9F6',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        blue: {
          50: '#EFF6FB',
          100: '#D4E8F5',
          200: '#A9D1EB',
          300: '#7EBAE1',
          400: '#5393C7',
          500: '#235D87',
          600: '#1C4A6B',
          700: '#15384F',
          800: '#0E2534',
          900: '#07131A',
        },
        teal: {
          50: '#EFFBFC',
          100: '#D4F3F6',
          200: '#A9E7ED',
          300: '#7EDBE4',
          400: '#5DABB8',
          500: '#4A8A94',
          600: '#3A6D75',
          700: '#2B5157',
          800: '#1C3638',
          900: '#0E1B1C',
        },
        orange: {
          50: '#FEF3E9',
          100: '#FDE0C7',
          200: '#FCC18F',
          300: '#FAA257',
          400: '#F95602',
          500: '#C74502',
          600: '#953301',
          700: '#642201',
          800: '#321100',
          900: '#190800',
        },
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        heading: ['Archivo', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display': ['4.5rem', { lineHeight: '1.1' }],
        'h1': ['3.5rem', { lineHeight: '1.2' }],
        'h2': ['2.5rem', { lineHeight: '1.25' }],
        'h3': ['2rem', { lineHeight: '1.3' }],
        'h4': ['1.5rem', { lineHeight: '1.4' }],
        'h5': ['1.25rem', { lineHeight: '1.5' }],
      },
      boxShadow: {
        'blue': '0 10px 30px -10px rgba(35, 93, 135, 0.3)',
        'teal': '0 10px 30px -10px rgba(93, 171, 184, 0.3)',
        'orange': '0 10px 30px -10px rgba(249, 86, 2, 0.3)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #235D87 0%, #5DABB8 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #5DABB8 0%, #F95602 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}

export default config
```

---

**Última actualización**: Junio 2026
**Versión del manual**: 1.0 - NanoBanana
**Aplicable a**: Todas las plataformas (Web, App, Social Media, Presentaciones)
