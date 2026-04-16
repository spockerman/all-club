import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#10B981',
        secondary: '#10B981',
        'on-background': '#2c3437',
        surface: '#f7f9fb',
        background: '#f1f1ee',
        'surface-container': '#eaeff2',
        'surface-container-low': '#f0f4f7',
        'surface-container-high': '#e3e9ed',
        'surface-container-lowest': '#ffffff',
        'primary-container': '#e5e2e1',
        'on-surface': '#1a1c1e',
        'on-surface-variant': '#596064',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px',
      },
    },
  },
  plugins: [],
}

export default config
