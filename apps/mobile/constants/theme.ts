import { Platform } from 'react-native'

// ── Palette — MonoSystem (monochromatic) ──────────────────────────────────────
export const colors = {
  ink900: '#0A0A0A',
  ink800: '#1A1A1A',
  ink700: '#3D3D3D',
  ink600: '#5C5C5C',
  ink500: '#8A8A8A',
  ink400: '#B8B8B8',
  ink300: '#DCDCDC',
  ink200: '#EDEDED',
  ink150: '#F2F2F2',
  ink100: '#F7F7F7',
  ink50:  '#FAFAFA',
  ink0:   '#FFFFFF',
  trueBlack: '#000000',
} as const

// ── Typography ────────────────────────────────────────────────────────────────
export const fonts = {
  display: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  sans: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
} as const

// ── Radii ────────────────────────────────────────────────────────────────────
export const radii = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 999,
} as const

// ── Spacing (4-pt grid) ───────────────────────────────────────────────────────
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
  12: 48,
  16: 64,
} as const

// ── Shadows ──────────────────────────────────────────────────────────────────
export const shadows = {
  sm: {
    shadowColor: colors.ink900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: colors.ink900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
} as const

// ── Legacy compat (tabs use this) ─────────────────────────────────────────────
export const PRIMARY_BUTTON_BG = colors.ink900
export const PRIMARY_BUTTON_TEXT = colors.ink0
