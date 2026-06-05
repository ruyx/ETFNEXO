# 📐 Sistema de Estilos ETF Nexo

Documentación de la estructura de estilos y cómo modificarlos.

## 📁 Estructura de Carpetas

```
app/
├── globals.css                 # Importa todos los módulos
└── styles/
    ├── base/
    │   └── variables.css       # ⭐ TODAS LAS VARIABLES AQUÍ
    ├── components/
    │   ├── header.css          # Header y navegación
    │   ├── buttons.css         # Sistema de botones
    │   ├── cards.css           # Tarjetas de contenido
    │   └── progress-bars.css   # Barras de progreso
    ├── layout/
    │   └── (futuro)
    └── utilities/
        └── (futuro)
```

## 🎯 Cómo Modificar Elementos Comunes

### Cambiar Altura del Logo

**Archivo**: `app/styles/base/variables.css`

```css
/* Buscar y modificar estas líneas: */
--logo-height: 2rem;          /* 32px - AJUSTABLE AQUÍ */
--logo-height-mobile: 1.75rem; /* 28px */
```

**Ejemplos**:
- Logo más alto: `--logo-height: 2.5rem;` (40px)
- Logo más alto: `--logo-height: 3rem;` (48px)
- Logo más pequeño: `--logo-height: 1.5rem;` (24px)

### Cambiar Altura del Header

**Archivo**: `app/styles/base/variables.css`

```css
--header-height: 4.5rem;      /* 72px */
```

### Cambiar Colores Principales

**Archivo**: `app/styles/base/variables.css`

```css
/* Brand */
--color-primary: #3B82F6;     /* Blue-600 */
--color-primary-dark: #2563EB; /* Blue-700 */
--color-primary-light: #60A5FA; /* Blue-400 */
```

### Cambiar Espaciado de Cards

**Archivo**: `app/styles/base/variables.css`

```css
--card-padding: var(--spacing-6);  /* 24px */
--card-radius: 0.5rem;             /* 8px */
```

### Cambiar Tamaños de Botones

**Archivo**: `app/styles/base/variables.css`

```css
--btn-padding-x: var(--spacing-6);  /* Horizontal */
--btn-padding-y: var(--spacing-3);  /* Vertical */
--btn-radius: 0.5rem;
--btn-font-size: var(--font-size-sm);
```

### Cambiar Velocidad de Animaciones

**Archivo**: `app/styles/base/variables.css`

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
--transition-slower: 500ms;
```

## 🎨 Usar las Clases en Componentes

### Header
```tsx
<header className="site-header">
  <div className="site-header__container">
    <Link href="/" className="site-header__logo">
      <img className="site-header__logo-image" />
    </Link>
    <nav className="site-header__nav">
      <Link className="site-header__nav-link">Inicio</Link>
    </nav>
  </div>
</header>
```

### Botones
```tsx
<button className="btn btn-primary">Primario</button>
<button className="btn btn-secondary">Secundario</button>
<button className="btn btn-ghost">Ghost</button>
<button className="btn btn-primary btn-sm">Pequeño</button>
<button className="btn btn-primary btn-lg">Grande</button>
```

### Cards
```tsx
<div className="card">Contenido</div>
<div className="card card--clickable">Card clickeable</div>
<div className="card card--elevated">Card elevada</div>
```

### Progress Bars
```tsx
<ProgressBar
  label="Performance"
  value={85}
  variant="performance"
/>
```

## 📐 Sistema de Espaciado

Basado en múltiplos de 8px:

```css
--spacing-1: 0.25rem;   /* 4px */
--spacing-2: 0.5rem;    /* 8px */
--spacing-3: 0.75rem;   /* 12px */
--spacing-4: 1rem;      /* 16px */
--spacing-6: 1.5rem;    /* 24px */
--spacing-8: 2rem;      /* 32px */
--spacing-12: 3rem;     /* 48px */
--spacing-16: 4rem;     /* 64px */
```

## 🎨 Paleta de Colores

### Brand
- `--color-primary`: Azul principal
- `--color-primary-dark`: Azul oscuro (hover)
- `--color-primary-light`: Azul claro

### Neutrales
- `--color-slate-50` a `--color-slate-900`: Escala de grises

### Semánticos
- `--color-success`: Verde (éxito)
- `--color-error`: Rojo (error)
- `--color-warning`: Amarillo (advertencia)
- `--color-info`: Azul (información)

## ⚡ Reglas de Oro

1. **NUNCA hardcodear valores** - Siempre usar variables CSS
2. **Modificar SOLO en `variables.css`** - Centralizado
3. **Usar clases de componentes** - No Tailwind inline
4. **Reutilizar clases existentes** - Evitar duplicación

## 📝 Ejemplos Rápidos

### Hacer el logo más grande
1. Abrir `app/styles/base/variables.css`
2. Buscar `--logo-height`
3. Cambiar a `3rem` (48px)
4. Guardar - Los cambios se aplican automáticamente

### Cambiar color principal a verde
1. Abrir `app/styles/base/variables.css`
2. Buscar `--color-primary`
3. Cambiar a `#10B981` (emerald-500)
4. Guardar

### Aumentar padding de cards
1. Abrir `app/styles/base/variables.css`
2. Buscar `--card-padding`
3. Cambiar a `var(--spacing-8)` (32px)
4. Guardar

## 🔍 Buscar Variables

Usa grep para encontrar dónde se usa una variable:

```bash
grep -r "--logo-height" app/
grep -r "site-header__logo" app/
```

## 📚 Recursos

- Todas las variables: `app/styles/base/variables.css`
- Header: `app/styles/components/header.css`
- Botones: `app/styles/components/buttons.css`
- Cards: `app/styles/components/cards.css`
- Progress Bars: `app/styles/components/progress-bars.css`
