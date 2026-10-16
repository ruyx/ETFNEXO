import type { Config } from 'tailwindcss'

/**
 * Tailwind - Sistema de Diseño ETF Nexo ("Agora")
 *
 * Los colores se declaran en hexadecimal (no var()) para que funcionen los
 * modificadores de opacidad (bg-slate-800/50). Deben coincidir con
 * app/styles/base/variables.css, que es la fuente de verdad.
 *
 * Las escalas `slate` y `blue` se redefinen a propósito: el código existente
 * usa text-slate-* y text-blue-* en ~1.000 sitios y así adopta la paleta
 * Agora sin editar JSX. En código nuevo, preferir primary/secondary/dark/light.
 */
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
          DEFAULT: '#FD6D0A',
          light: '#FD8A3B',
          lighter: '#FE9954',
          dark: '#E66100',
          50: '#FFF3EA',
          100: '#FFE3CC',
        },
        secondary: {
          DEFAULT: '#276EF0',
          light: '#6291F7',
          dark: '#1E5AD4',
          50: '#EAF1FE',
          100: '#D4E2FD',
        },
        dark: {
          DEFAULT: '#001529',
          alt: '#1A2C3E',
          lighter: '#334454',
        },
        light: {
          DEFAULT: '#F1F6FB',
          white: '#FDFDFD',
          gray: '#F4F4F4',
          beige: '#F4F2F0',
        },
        // Escala neutra Agora (sustituye a slate por defecto de Tailwind)
        slate: {
          50: '#F1F6FB',
          100: '#E5E8EA',
          200: '#CCD0D4',
          300: '#B2B9BF',
          400: '#99A1A9',
          500: '#66737F',
          600: '#4D5A66',
          700: '#334454',
          800: '#1A2C3E',
          900: '#001529',
          950: '#000D1A',
        },
        // Escala azul = secundario Agora (enlaces, acentos)
        blue: {
          50: '#EAF1FE',
          100: '#D4E2FD',
          200: '#A9C5FB',
          300: '#7EA8F9',
          400: '#6291F7',
          500: '#276EF0',
          600: '#276EF0',
          700: '#1E5AD4',
          800: '#17469F',
          900: '#0F2E6A',
        },
        // Escala naranja = primario Agora
        orange: {
          50: '#FFF3EA',
          100: '#FFE3CC',
          200: '#FEC59A',
          300: '#FE9954',
          400: '#FD8A3B',
          500: '#FD6D0A',
          600: '#E66100',
          700: '#B84E00',
          800: '#8A3A00',
          900: '#5C2700',
        },
      },
      fontFamily: {
        heading: ['var(--font-playfair)', 'Georgia', 'Times New Roman', 'serif'],
        body: ['var(--font-urbanist)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        sans: ['var(--font-urbanist)', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'hero': ['4.5rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'display': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'display-mobile': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
        'h1': ['3.75rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h1-mobile': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'h2': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'h2-mobile': ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'h3': ['2.25rem', { lineHeight: '1.2' }],
        'h3-mobile': ['1.5rem', { lineHeight: '1.3' }],
        'h4': ['1.875rem', { lineHeight: '1.3' }],
        'h4-mobile': ['1.25rem', { lineHeight: '1.4' }],
        'h5': ['1.5rem', { lineHeight: '1.4' }],
        'h5-mobile': ['1.125rem', { lineHeight: '1.5' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body-base': ['1rem', { lineHeight: '1.5' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
      },
      boxShadow: {
        'sm': '0 2px 4px rgba(0, 21, 41, 0.04)',
        'md': '0 4px 12px rgba(0, 21, 41, 0.06)',
        'lg': '0 8px 24px rgba(0, 21, 41, 0.08)',
        'xl': '0 12px 32px rgba(0, 21, 41, 0.12)',
        '2xl': '0 20px 48px rgba(0, 21, 41, 0.16)',
        'primary': '0 8px 20px rgba(253, 109, 10, 0.3)',
        'primary-lg': '0 12px 32px rgba(253, 109, 10, 0.4)',
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(135deg, #001529 0%, #1A2C3E 100%)',
        'gradient-primary': 'linear-gradient(135deg, #FD6D0A 0%, #FD8A3B 100%)',
        'gradient-subtle': 'linear-gradient(180deg, #F1F6FB 0%, #FDFDFD 100%)',
        'gradient-overlay-dark': 'linear-gradient(180deg, rgba(0, 21, 41, 0) 0%, rgba(0, 21, 41, 0.8) 100%)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'section-sm': '3.75rem',
        'section-md': '5rem',
        'section-lg': '7.5rem',
      },
      borderRadius: {
        'card': '1rem',
        'btn': '0.5rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
