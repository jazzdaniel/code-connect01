import type { ReactNode } from 'react'
import './EmptyState.css'

export type EmptyStateSize = 'sm' | 'md'

export interface EmptyStateProps {
  /** No Figma: text property `title`. */
  title: string
  /** No Figma: boolean prop `Has description` + text property `description`. */
  description?: string
  /**
   * SVG/ilustração. No Figma: instance swap `illustration`
   * apontando para o component set `Illustration`.
   */
  illustration?: ReactNode
  /**
   * Ação primária. No Figma: boolean prop `Has action` + nested instance
   * do componente `Button` — é aqui que aparece o mapeamento de
   * **componentes aninhados** (`figma.children` / `figma.instance`).
   */
  action?: ReactNode
  /** Ação secundária (link/ghost). No Figma: boolean prop `Has secondary action`. */
  secondaryAction?: ReactNode
  /** No Figma: variant property `Size`. */
  size?: EmptyStateSize
}

/**
 * Estado vazio. Demonstra **composição**: recebe outros componentes do DS
 * (Button, Illustration) via props do tipo ReactNode.
 */
export function EmptyState({
  title,
  description,
  illustration,
  action,
  secondaryAction,
  size = 'md',
}: EmptyStateProps) {
  return (
    <div className={`ds-empty-state ds-empty-state--${size}`}>
      {illustration ? <div className="ds-empty-state__illustration">{illustration}</div> : null}
      <div className="ds-empty-state__text">
        <h3 className="ds-empty-state__title">{title}</h3>
        {description ? <p className="ds-empty-state__description">{description}</p> : null}
      </div>
      {action || secondaryAction ? (
        <div className="ds-empty-state__actions">
          {action}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  )
}
