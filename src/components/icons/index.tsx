import type { SVGProps } from 'react'

/**
 * Ícones — no Figma são um Component Set único `Icon` com a prop `name`.
 * Em código são componentes separados. O mapeamento acontece via
 * `figma.enum('name', { ... })` no arquivo Icon.figma.tsx.
 */
export type IconProps = SVGProps<SVGSVGElement>

const base = (p: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  ...p,
})

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 4.167v11.666M4.167 10h11.666" />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M16.667 5.833 8.333 14.167 4.167 10" />
  </svg>
)

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9.167" cy="9.167" r="5" />
    <path d="m17.5 17.5-4.75-4.75" />
  </svg>
)

export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 5 5 15M5 5l10 10" />
  </svg>
)

export const ChevronDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 7.5 5 5 5-5" />
  </svg>
)

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2.5 5.833h15M7.5 5.833V4.167A1.667 1.667 0 0 1 9.167 2.5h1.666A1.667 1.667 0 0 1 12.5 4.167v1.666M4.167 5.833l.833 10a1.667 1.667 0 0 0 1.667 1.667h6.666A1.667 1.667 0 0 0 15 15.833l.833-10" />
  </svg>
)
