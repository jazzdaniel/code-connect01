import type { ReactNode } from 'react'
import { CheckIcon, XIcon } from '../icons'
import './Chips.css'

export type ChipsGroupProps = {
  /** No Figma: text property `label` do frame Chips.Group (opcional). */
  label?: string
  /** Instâncias de Chips.Filter. No Figma: children do auto-layout. */
  children: ReactNode
}

/**
 * Container do grupo de chips.
 * Parte do **componente composto** `Chips` (ver export no final do arquivo).
 */
function ChipsGroup({ label, children }: ChipsGroupProps) {
  return (
    <div className="ds-chips-group">
      {label ? <span className="ds-chips-group__label">{label}</span> : null}
      <div className="ds-chips-group__items">{children}</div>
    </div>
  )
}

export type ChipsFilterProps = {
  /** Rótulo do chip. No Figma: text property `label`. */
  label: string
  /** Estado selecionado. No Figma: variant `Selected=True|False`. */
  selected?: boolean
  /**
   * Contador opcional. No Figma: boolean prop `Has count` + text property `count`.
   * Aceita string porque as text properties do Figma são sempre string — assim o
   * snippet gerado pelo Code Connect compila sem cast.
   */
  count?: number | string
  /** Mostra o "x" para limpar. No Figma: variant `Dismissible=True|False`. */
  dismissible?: boolean
  disabled?: boolean
  onClick?: () => void
  onDismiss?: () => void
}

/**
 * Chip de filtro. Demonstra o mapeamento de um **membro de componente
 * composto** (`Chips.Filter`) para um componente Figma independente.
 */
function ChipsFilter({
  label,
  selected = false,
  count,
  dismissible = false,
  disabled = false,
  onClick,
  onDismiss,
}: ChipsFilterProps) {
  return (
    <button
      type="button"
      className={[
        'ds-chip',
        selected ? 'ds-chip--selected' : '',
        dismissible ? 'ds-chip--dismissible' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {selected ? (
        <span className="ds-chip__icon">
          <CheckIcon />
        </span>
      ) : null}
      <span className="ds-chip__label">{label}</span>
      {count !== undefined && count !== '' ? (
        <span className="ds-chip__count">{count}</span>
      ) : null}
      {dismissible ? (
        <span
          className="ds-chip__dismiss"
          role="button"
          aria-label={`Remover ${label}`}
          onClick={(e) => {
            e.stopPropagation()
            onDismiss?.()
          }}
        >
          <XIcon width={16} height={16} />
        </span>
      ) : null}
    </button>
  )
}

/**
 * Componente composto exportado como namespace.
 *
 *   import { Chips } from '@/components/Chips'
 *   <Chips.Group label="Filtros">
 *     <Chips.Filter label="Ativos" selected />
 *   </Chips.Group>
 *
 * No Code Connect isto exige `figma.connect(Chips.Filter, ...)` com
 * `imports: ["import { Chips } from '@/components/Chips'"]` e um example que
 * renderize `<Chips.Filter />` — ver Chips.figma.tsx.
 */
export const Chips = {
  Group: ChipsGroup,
  Filter: ChipsFilter,
}
