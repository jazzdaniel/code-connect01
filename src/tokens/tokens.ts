/**
 * Design tokens — FONTE ÚNICA DE VERDADE.
 *
 * Duas camadas, espelhando as collections do Figma:
 *
 *   color     -> collection "Primitives"  (1 modo)   valores brutos
 *   semantic  -> collection "Color"       (3 modos)  aliases, um modo por marca
 *
 * Os modos da collection "Color" aparecem no seletor de Appearance do Figma,
 * então trocar de marca no design é a mesma operação que trocar
 * `data-brand` no HTML.
 *
 * Derivados deste arquivo:
 *   scripts/build-css.mjs      -> src/tokens/tokens.css
 *   scripts/export-tokens.mjs  -> scripts/figma-tokens.json (payload das variables)
 */

/** Paleta + neutros. Nomes 1:1 com `color/<família>/<passo>` no Figma. */
export const color = {
  // ── paleta ────────────────────────────────────────────────────────────
  ink: { 900: '#180502' },
  maroon: { 900: '#360C0C', 800: '#401A1B' },
  plum: { 700: '#633040' },
  rose: { 600: '#9E4565', 400: '#C76689' },
  sand: { 400: '#E2B27D' },
  cream: { 100: '#F6E6B9' },
  gold: { 500: '#C6983A' },
  olive: { 500: '#828F27' },
  teal: { 500: '#0D9288' },
  sky: { 500: '#4FA2DC' },
  orange: { 500: '#CB4B16' },
  red: { 500: '#C91521' },
  magenta: { 500: '#D91072' },
  indigo: { 900: '#2A1E5B' },
  // ── neutros ───────────────────────────────────────────────────────────
  // A paleta não tem tons claros intermediários nem cinzas, então superfície,
  // borda e texto secundário continuam vindo de uma rampa neutra.
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
} as const

/** Uma marca = um modo da collection "Color" no Figma. */
export const brands = ['Ember', 'Rose', 'Deep'] as const
export type Brand = (typeof brands)[number]
export const defaultBrand: Brand = 'Ember'

/** Atributo usado no HTML para trocar de marca (espelha o modo do Figma). */
export const brandAttr = (brand: Brand) => brand.toLowerCase()

export type SemanticToken =
  | 'bg/surface'
  | 'bg/subtle'
  | 'bg/selected'
  | 'text/primary'
  | 'text/secondary'
  | 'text/on-brand'
  | 'text/brand'
  | 'text/danger'
  | 'border/default'
  | 'border/strong'
  | 'border/brand'
  | 'action/primary/default'
  | 'action/primary/hover'
  | 'action/danger/default'
  | 'action/danger/hover'

/**
 * Tokens semânticos por marca. Cada valor é um alias para um primitivo — nunca
 * um hex solto — exatamente como no Figma.
 *
 * Todos os 39 pares texto/fundo que os componentes produzem passam WCAG AA
 * (4.5:1). Ver `npm run tokens:contrast`.
 */
export const semantic: Record<Brand, Record<SemanticToken, string>> = {
  Ember: {
    'bg/surface': color.neutral[0],
    'bg/subtle': color.neutral[50],
    'bg/selected': color.cream[100],
    'text/primary': color.ink[900],
    'text/secondary': color.neutral[500],
    'text/on-brand': color.neutral[0],
    'text/brand': color.maroon[800],
    'text/danger': color.red[500],
    'border/default': color.neutral[200],
    'border/strong': color.neutral[300],
    'border/brand': color.orange[500],
    'action/primary/default': color.orange[500],
    'action/primary/hover': color.maroon[800],
    'action/danger/default': color.red[500],
    'action/danger/hover': color.maroon[900],
  },
  Rose: {
    'bg/surface': color.neutral[0],
    'bg/subtle': color.neutral[50],
    'bg/selected': color.sand[400],
    'text/primary': color.maroon[900],
    'text/secondary': color.neutral[500],
    'text/on-brand': color.neutral[0],
    'text/brand': color.plum[700],
    'text/danger': color.red[500],
    'border/default': color.neutral[200],
    'border/strong': color.neutral[300],
    'border/brand': color.rose[600],
    'action/primary/default': color.rose[600],
    'action/primary/hover': color.plum[700],
    'action/danger/default': color.red[500],
    'action/danger/hover': color.maroon[900],
  },
  Deep: {
    'bg/surface': color.neutral[0],
    'bg/subtle': color.neutral[50],
    'bg/selected': color.sky[500],
    'text/primary': color.indigo[900],
    'text/secondary': color.neutral[500],
    'text/on-brand': color.neutral[0],
    'text/brand': color.indigo[900],
    'text/danger': color.red[500],
    'border/default': color.neutral[200],
    'border/strong': color.neutral[300],
    'border/brand': color.teal[500],
    'action/primary/default': color.indigo[900],
    'action/primary/hover': color.ink[900],
    'action/danger/default': color.red[500],
    'action/danger/hover': color.ink[900],
  },
}

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

export const tokens = { color, semantic, brands, space, radius, size, font, border } as const
