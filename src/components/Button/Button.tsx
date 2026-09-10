import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Aparência. No Figma: variant property `Variant`. */
  variant?: ButtonVariant
  /** Altura/densidade. No Figma: variant property `Size`. */
  size?: ButtonSize
  /** Rótulo. No Figma: text layer `label` (text property). */
  children: ReactNode
  /** Ícone antes do rótulo. No Figma: boolean prop `Has icon` + instance swap `icon`. */
  iconLeft?: ReactNode
  /** Ocupa toda a largura disponível. No Figma: variant property `Full width`. */
  fullWidth?: boolean
  /** No Figma: variant property `State=Disabled`. */
  disabled?: boolean
}

/**
 * Botão base do design system.
 *
 * Este componente é a demonstração de **props → variantes**:
 * enums (`variant`, `size`), booleans (`fullWidth`, `disabled`),
 * children de texto (`children`) e instance swap (`iconLeft`).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  iconLeft,
  fullWidth = false,
  disabled = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        'ds-button',
        `ds-button--${variant}`,
        `ds-button--${size}`,
        fullWidth ? 'ds-button--full' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      disabled={disabled}
      {...rest}
    >
      {iconLeft ? <span className="ds-button__icon">{iconLeft}</span> : null}
      <span className="ds-button__label">{children}</span>
    </button>
  )
}
