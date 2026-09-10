import type { SVGProps } from 'react'

/**
 * Ilustrações/SVGs. No Figma vivem como um component set `Illustration`
 * com a prop `name`, para permitir instance swap dentro do EmptyState.
 *
 * As cores referenciam as CSS custom properties de `tokens.css` em vez de hex
 * literal — é o equivalente, em SVG, aos fills ligados a variables no Figma.
 * Sem isso as ilustrações são o único lugar do DS que sai de sincronia quando
 * um primitivo muda.
 *
 * Search e Error usam tokens SEMÂNTICOS, então acompanham a marca ativa.
 * EmptyBox usa neutros de propósito: é ilustração neutra em todas as marcas.
 */
export type IllustrationProps = SVGProps<SVGSVGElement>

export const SearchIllustration = (p: IllustrationProps) => (
  <svg width={96} height={96} viewBox="0 0 96 96" fill="none" {...p}>
    <circle cx="48" cy="48" r="48" fill="var(--bg-selected)" />
    <circle cx="43" cy="43" r="18" stroke="var(--action-primary-default)" strokeWidth="4" />
    <path d="m57 57 12 12" stroke="var(--action-primary-default)" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 43h16M43 35v16" stroke="var(--bg-surface)" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export const EmptyBoxIllustration = (p: IllustrationProps) => (
  <svg width={96} height={96} viewBox="0 0 96 96" fill="none" {...p}>
    <circle cx="48" cy="48" r="48" fill="var(--color-neutral-100)" />
    <path d="M24 40h48v30a4 4 0 0 1-4 4H28a4 4 0 0 1-4-4V40Z" fill="var(--color-neutral-0)" stroke="var(--color-neutral-500)" strokeWidth="4" />
    <path d="M20 28h56v12H20z" fill="var(--color-neutral-200)" stroke="var(--color-neutral-500)" strokeWidth="4" />
    <path d="M40 52h16" stroke="var(--color-neutral-500)" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export const ErrorIllustration = (p: IllustrationProps) => (
  <svg width={96} height={96} viewBox="0 0 96 96" fill="none" {...p}>
    <circle cx="48" cy="48" r="48" fill="var(--color-neutral-100)" />
    <path d="M48 24l24 42H24l24-42Z" fill="var(--color-neutral-0)" stroke="var(--action-danger-default)" strokeWidth="4" strokeLinejoin="round" />
    <path d="M48 40v12" stroke="var(--action-danger-default)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="48" cy="58" r="2.5" fill="var(--action-danger-default)" />
  </svg>
)
