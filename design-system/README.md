# ETF Nexo - Corporate Design System

## 🎯 Overview

ETF Nexo uses a **centralized, governed design system** with strict rules to ensure consistency, maintainability, and professional quality across the entire application.

### Golden Rules
1. ✅ **ZERO hardcoded styles** - All values from theme
2. ✅ **ZERO hardcoded typography** - Predefined classes only
3. ✅ **ZERO hardcoded colors** - Tailwind/theme only
4. ✅ **ZERO hardcoded spacing** - Tailwind scale only

---

## 📁 Structure

```
design-system/
├── theme.config.ts         # Centralized theme configuration
├── README.md               # This file
└── MASTER.md               # Complete brand guidelines

.claude/rules/
└── design-governance.md    # Governance rules (MANDATORY)

app/
└── globals.css             # Global styles and utility classes
```

---

## 🎨 Theme Configuration

### Import and Usage

```typescript
// For programmatic usage (rare - 5% of cases)
import { theme } from '@/design-system/theme.config'

// Access theme values
const color = theme.colors.neutral[600]
const spacing = theme.spacing[4]
const fontSize = theme.typography.sizes.base
```

### Theme Structure

```typescript
theme = {
  typography: {
    fonts: { heading, body, mono },
    sizes: { display, h1, h2, h3, h4, lg, base, sm, xs },
    weights: { light, regular, medium, semibold, bold },
    lineHeights: { tight, snug, normal, relaxed },
    letterSpacing: { tighter, tight, normal, wide, wider, widest }
  },
  colors: {
    primary: { 50-900 },
    neutral: { 0, 50-900 },
    success: { 50, 100, 500-700 },
    warning: { 50, 100, 500-700 },
    error: { 50, 100, 500-700 }
  },
  spacing: { px, 0, 0.5-32 },
  radius: { none, sm, DEFAULT, md, lg, xl, full },
  shadows: { xs, sm, md, lg, xl, none },
  transitions: { fast, base, slow },
  zIndex: { base, dropdown, sticky, fixed, modalBackdrop, modal, popover, tooltip },
  breakpoints: { sm, md, lg, xl, 2xl }
}
```

---

## 📝 Typography System

### Predefined Classes (globals.css)

```tsx
<h1 className="heading-1">       // 36px, semibold, tight
<h2 className="heading-2">       // 30px, semibold, tight
<h3 className="heading-3">       // 24px, semibold, snug
<h4 className="heading-4">       // 18px, semibold, snug

<p className="body-large">       // 16px, normal, relaxed
<p className="body-base">        // 14px, normal, relaxed
<p className="body-small">       // 12px, normal, relaxed

<span className="financial-number"> // Monospace, tabular, medium
```

### Typography Usage

```tsx
// ✅ CORRECT
<h1 className="heading-1 text-slate-900">
  ETF Analytics Platform
</h1>

<p className="body-base text-slate-600">
  Professional financial data
</p>

<span className="financial-number text-emerald-600">
  +24.50%
</span>

// ❌ WRONG - Hardcoded sizes
<h1 className="text-[36px] font-[600]">
<p style={{ fontSize: '14px' }}>
```

---

## 🎨 Color System

### Neutral Palette (90% usage)

```tsx
// Backgrounds
bg-white        // #FFFFFF
bg-slate-50     // #F8FAFC
bg-slate-100    // #F1F5F9
bg-slate-900    // #0F172A

// Text
text-slate-900  // Headings
text-slate-700  // Body primary
text-slate-600  // Body secondary
text-slate-500  // Muted
text-slate-400  // Disabled

// Borders
border-slate-200
border-slate-300
```

### Semantic Colors (10% usage)

```tsx
// Primary action
bg-blue-600     // Buttons
text-blue-600   // Links
border-blue-500 // Focus states

// Success (positive returns, approvals)
text-emerald-600
bg-emerald-50

// Warning (alerts, attention)
text-amber-600
bg-amber-50

// Error (negative returns, errors)
text-red-600
bg-red-50
```

### Color Usage Examples

```tsx
// ✅ CORRECT
<div className="bg-slate-50 border-slate-200">
  <h2 className="text-slate-900">Title</h2>
  <p className="text-slate-600">Content</p>
  <span className="text-emerald-600">+12.5%</span>
</div>

// ❌ WRONG - Hardcoded
<div className="bg-[#F8FAFC] border-[#E2E8F0]">
<p style={{ color: '#475569' }}>
```

---

## 📏 Spacing System

### Tailwind Scale (4px base unit)

```tsx
// Micro spacing
gap-1    // 4px
p-2      // 8px

// Standard
gap-3    // 12px
p-4      // 16px
m-4      // 16px

// Large
gap-6    // 24px
p-6      // 24px
m-8      // 32px

// Section
py-12    // 48px (vertical section padding)
py-16    // 64px
```

### Spacing Usage

```tsx
// ✅ CORRECT
<div className="p-4 gap-3 mt-6">
<div className="px-6 py-12">

// ❌ WRONG - Hardcoded
<div className="p-[16px] gap-[12px]">
<div style={{ padding: '24px' }}>
```

---

## 🔧 Component Patterns

### Card Component

```tsx
// ✅ CORRECT - Using predefined classes
<div className="card bg-white hover-lift">
  <h3 className="heading-4 text-slate-900 mb-2">
    Title
  </h3>
  <p className="body-base text-slate-600">
    Content
  </p>
</div>

// ❌ WRONG - Hardcoded values
<div style={{
  background: '#FFFFFF',
  padding: '16px',
  borderRadius: '8px'
}}>
```

### Button Component

```tsx
// ✅ CORRECT
<button className="btn-primary">
  Primary Action
</button>

<button className="btn-secondary">
  Secondary Action
</button>

// ❌ WRONG
<button className="bg-[#2563EB] text-white px-[20px] py-[10px]">
```

### Financial Data Component

```tsx
// ✅ CORRECT
<div className="flex items-center gap-2">
  <span className="financial-number text-sm text-emerald-600">
    +24.50%
  </span>
  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
</div>

// ❌ WRONG
<span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#059669' }}>
```

---

## ✅ Validation & Enforcement

### Manual Check

Before committing, verify:
```bash
# Search for hardcoded colors
grep -r "bg-\[#" components/
grep -r "text-\[#" components/

# Search for hardcoded sizes
grep -r "text-\[[0-9]" components/

# Search for hardcoded spacing
grep -r "p-\[[0-9]" components/
```

### Automated Validation (Future)

```bash
npm run validate:design
```

---

## 📚 Reference Files

| File | Purpose |
|------|---------|
| `design-system/theme.config.ts` | Central theme configuration |
| `design-system/MASTER.md` | Complete brand guidelines |
| `.claude/rules/design-governance.md` | Governance rules (MANDATORY) |
| `app/globals.css` | Global styles and utilities |
| `tailwind.config.ts` | Tailwind extended configuration |

---

## 🚀 Quick Start

### Creating a New Component

```tsx
import { theme } from '@/design-system/theme.config' // Optional

export default function MyComponent() {
  return (
    <div className="card bg-white p-4">
      <h3 className="heading-4 text-slate-900 mb-2">
        Component Title
      </h3>
      <p className="body-base text-slate-600 mb-4">
        Component description text
      </p>
      <button className="btn-primary">
        Action
      </button>
    </div>
  )
}
```

### Key Principles

1. **Use Tailwind classes** for 95% of styling
2. **Use theme import** only when programmatic values needed
3. **Never hardcode** values (colors, sizes, spacing)
4. **Reference globals.css** for typography classes
5. **Follow .claude/rules/design-governance.md** strictly

---

## 📖 Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Inter Font Family](https://rsms.me/inter/)
- Corporate Design Principles: `.claude/rules/design-governance.md`

---

**Version**: 1.0.0
**Last Updated**: 2026-06-03
**Status**: Production Ready
