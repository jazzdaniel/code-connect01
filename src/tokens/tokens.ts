/**
 * Design tokens — FONTE ÚNICA DE VERDADE.
 *
 * Cada chave aqui tem um nome 1:1 com uma Figma Variable:
 *   color.brand.500        -> color/brand/500
 *   space.4                -> space/4
 *   radius.md              -> radius/md
 *
 * O script `scripts/tokens-to-figma.mjs` lê este arquivo e gera o payload
 * usado para criar as variables no Figma, garantindo paridade exata.
 */

export const color = {
  brand: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    500: '#0F50DF',
    600: '#0E41D1',
    700: '#0F2C8B',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    500: '#6B7280',
    700: '#374151',
    900: '#111827',
  },
  danger: {
    50: '#FEF2F2',
    500: '#CB2222',
    600: '#6D0A0A',
  },
} as const

/** Tokens semânticos — referenciam os primitivos acima (aliases no Figma). */
export const semantic = {
  'bg/surface': color.neutral[0],
  'bg/subtle': color.neutral[50],
  'bg/selected': color.brand[50],
  'text/primary': color.neutral[900],
  'text/secondary': color.neutral[500],
  'text/on-brand': color.neutral[0],
  'text/brand': color.brand[600],
  'text/danger': color.danger[500],
  'border/default': color.neutral[200],
  'border/strong': color.neutral[300],
  'border/brand': color.brand[500],
  'action/primary/default': color.brand[500],
  'action/primary/hover': color.brand[600],
  'action/danger/default': color.danger[500],
  'action/danger/hover': color.danger[600],
} as const

export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
} as const

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  full: 999,
} as const

export const size = {
  'control/sm': 32,
  'control/md': 40,
  'control/lg': 48,
  'icon/sm': 16,
  'icon/md': 20,
  'illustration/sm': 64,
  'illustration/md': 96,
} as const

export const font = {
  family: 'Inter',
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
  },
} as const

export const border = {
  width: {
    thin: 1,
  },
} as const

export const tokens = { color, semantic, space, radius, size, font, border } as const
