import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Plus Jakarta Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          soft: 'hsl(var(--primary-soft))',
          deep: 'hsl(var(--primary-deep))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          soft: 'hsl(var(--warning-soft))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--primary))',
          soft: 'hsl(var(--primary-soft))',
        },
        // Stitch Design System color tokens
        stitch: {
          surface: '#faf8ff',
          'surface-low': '#f2f3ff',
          'surface-card': '#ffffff',
          'surface-container': '#eaedff',
          'surface-high': '#e2e7ff',
          'surface-highest': '#dae2fd',
          primary: '#006948',
          'primary-container': '#00855d',
          'primary-fixed': '#85f8c4',
          'primary-fixed-dim': '#68dba9',
          emerald: '#059669',
          secondary: '#904d00',
          amber: '#d97706',
          orange: '#fe932c',
          tertiary: '#0051d5',
          blue: '#2563eb',
          'tertiary-container': '#316bf3',
          dark: '#131b2e',
          slate: '#0f172a',
          muted: '#3d4a42',
          outline: '#6d7a72',
          'outline-variant': '#bccac0',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)',
        lift: '0 2px 4px rgba(15, 23, 42, 0.04), 0 16px 36px -12px rgba(15, 23, 42, 0.16)',
        card: '0 2px 6px -1px rgba(15, 23, 42, 0.04), 0 8px 16px -2px rgba(15, 23, 42, 0.03)',
        floating: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.6)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        shimmer: 'shimmer 1.8s infinite',
        'fade-up': 'fade-up 0.35s ease-out both',
        'pop-in': 'pop-in 0.2s ease-out both',
      },
      screens: {
        xs: '380px',
      },
    },
  },
  plugins: [animate],
} satisfies Config;
