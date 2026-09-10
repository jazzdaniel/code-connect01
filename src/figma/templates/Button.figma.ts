// url=https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=4-78
// source=src/components/Button/Button.tsx
// component=Button
import figma from 'figma'

/**
 * Mesmo mapeamento do Button.figma.tsx, no formato PARSERLESS.
 *
 * Diferenças em relação ao formato parser-based (figma.connect):
 *  - não importa o componente React; nada é compilado
 *  - o snippet é uma template string (figma.code), não JSX
 *  - as props são LIDAS imperativamente de instance.get*()
 *  - publica-se com `figma connect publish` apontando para .figma.ts
 *
 * O modelo mental é o mesmo: TEXT -> string, VARIANT -> enum,
 * BOOLEAN -> boolean, INSTANCE_SWAP -> instância aninhada.
 */
const instance = figma.selectedInstance

const label = instance.getString('label')

const variant = instance.getEnum('Variant', {
  Primary: 'primary',
  Secondary: 'secondary',
  Ghost: 'ghost',
  Danger: 'danger',
})

const size = instance.getEnum('Size', {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
})

const disabled = instance.getEnum('State', {
  Default: false,
  Disabled: true,
})

// BOOLEAN decide se existe ícone; getInstanceSwap resolve qual.
const hasIcon = instance.getBoolean('Has icon')
const icon = hasIcon ? instance.getInstanceSwap('Icon') : null
let iconCode
if (icon && icon.type === 'INSTANCE') {
  // executeTemplate() devolve ResultSection[], NÃO string.
  // Nunca concatenar com + ou .join() — só interpolar dentro de figma.code.
  iconCode = icon.executeTemplate().example
}

export default {
  example: figma.code`
<Button
  variant="${variant}"
  size="${size}"${disabled ? '\n  disabled' : ''}${iconCode ? figma.code`
  iconLeft={${iconCode}}` : ''}
>
  ${label}
</Button>`,
  imports: ["import { Button } from '@/components/Button'"],
  id: 'button',
  metadata: { nestable: true },
}
