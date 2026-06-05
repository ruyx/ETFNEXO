# ⚡ Guía Rápida de Estilos

## 🎯 Modificaciones Más Comunes

### 📏 Cambiar Altura del Logo

**Archivo**: `app/styles/base/variables.css` (línea ~47)

```css
--logo-height: 2rem;          /* ← CAMBIAR AQUÍ (actual: 32px) */
--logo-height-mobile: 1.75rem; /* ← CAMBIAR AQUÍ (actual: 28px) */
```

**Ejemplos**:
- Logo grande: `3rem` (48px)
- Logo muy grande: `4rem` (64px)
- Logo pequeño: `1.5rem` (24px)

---

### 🎨 Cambiar Color Principal (Azul → Otro)

**Archivo**: `app/styles/base/variables.css` (línea ~26)

```css
--color-primary: #3B82F6;     /* ← CAMBIAR AQUÍ */
```

**Ejemplos**:
- Verde: `#10B981`
- Morado: `#8B5CF6`
- Naranja: `#F97316`

---

### 📦 Cambiar Tamaño de Cards

**Archivo**: `app/styles/base/variables.css` (línea ~56)

```css
--card-padding: var(--spacing-6);  /* ← CAMBIAR (actual: 24px) */
```

**Ejemplos**:
- Más compacto: `var(--spacing-4)` (16px)
- Más espacioso: `var(--spacing-8)` (32px)

---

### 🔘 Cambiar Tamaño de Botones

**Archivo**: `app/styles/base/variables.css` (línea ~62)

```css
--btn-padding-x: var(--spacing-6);  /* Horizontal */
--btn-padding-y: var(--spacing-3);  /* Vertical */
```

---

## 📍 Dónde Están los Archivos

```
app/
├── globals.css               # Importa todo (NO modificar)
└── styles/
    ├── base/
    │   └── variables.css     # ⭐ TODAS LAS VARIABLES
    └── components/
        ├── header.css        # Header y logo
        ├── buttons.css       # Botones
        ├── cards.css         # Cards
        └── progress-bars.css # Barras progreso
```

## ⚙️ Sistema de Espaciado (8px)

```
--spacing-1  = 4px
--spacing-2  = 8px
--spacing-3  = 12px
--spacing-4  = 16px
--spacing-6  = 24px
--spacing-8  = 32px
--spacing-12 = 48px
--spacing-16 = 64px
```

## 🚀 Cambios Rápidos

1. Abrir `app/styles/base/variables.css`
2. Buscar la variable (Ctrl+F)
3. Modificar el valor
4. Guardar
5. El navegador se actualiza automáticamente

## 📚 Documentación Completa

Ver `STYLES_README.md` para documentación detallada.
