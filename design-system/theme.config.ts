/**
 * ETF Nexo - Corporate Design System
 * Centralized Theme Configuration
 *
 * GOLDEN RULE: ZERO hardcoded values in components
 * All styling must reference this theme configuration
 */

export const theme = {
  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fonts: {
      heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'SF Mono', 'Monaco', 'Cascadia Code', 'Menlo', monospace",
    },

    sizes: {
      // Display
      display: '3.5rem',      // 56px
      displayMobile: '2.5rem', // 40px

      // Headings
      h1: '2.25rem',          // 36px
      h1Mobile: '1.875rem',   // 30px
      h2: '1.875rem',         // 30px
      h2Mobile: '1.5rem',     // 24px
      h3: '1.5rem',           // 24px
      h3Mobile: '1.25rem',    // 20px
      h4: '1.125rem',         // 18px
      h4Mobile: '1rem',       // 16px

      // Body
      lg: '1rem',             // 16px
      base: '0.875rem',       // 14px
      sm: '0.75rem',          // 12px
      xs: '0.625rem',         // 10px
    },

    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeights: {
      tight: '1.1',
      snug: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },

    letterSpacing: {
      tighter: '-0.025em',
      tight: '-0.02em',
      normal: '-0.011em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ============================================
  // COLORS - Corporate Palette
  // ============================================
  colors: {
    // Primary - Blue accent
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',  // Main corporate blue
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
    },

    // Neutral - Main palette (slate)
    neutral: {
      0: '#FFFFFF',
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },

    // Semantic colors
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#10B981',
      600: '#059669',
      700: '#047857',
    },

    warning: {
      50: '#FEF3C7',
      100: '#FDE68A',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },

    error: {
      50: '#FEE2E2',
      100: '#FECACA',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
    },
  },

  // ============================================
  // SPACING - 4px base unit
  // ============================================
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
  },

  // ============================================
  // BORDER RADIUS - Minimal
  // ============================================
  radius: {
    none: '0',
    sm: '0.25rem',    // 4px
    DEFAULT: '0.375rem', // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    full: '9999px',
  },

  // ============================================
  // SHADOWS - Subtle corporate
  // ============================================
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.02)',
    none: 'none',
  },

  // ============================================
  // TRANSITIONS - Smooth corporate
  // ============================================
  transitions: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ============================================
  // Z-INDEX - Layering system
  // ============================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // ============================================
  // BREAKPOINTS - Responsive
  // ============================================
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const

// Type exports for TypeScript autocomplete
export type Theme = typeof theme
export type ThemeColors = typeof theme.colors
export type ThemeSpacing = typeof theme.spacing
export type ThemeTypography = typeof theme.typography
