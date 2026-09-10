// url=https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=7-57
// source=src/components/Chips/Chips.tsx
// component=Chips.Filter
import figma from 'figma'

/**
 * Componente composto no formato parserless.
 *
 * Aqui o "componente" é só metadado (comentário `component=` no topo) — não há
 * import do namespace, então nada obriga o snippet a usar `Chips.Filter`.
 * É justamente por isso que o cuidado tem de ser manual:
 *  - o snippet escreve `<Chips.Filter>` explicitamente
 *  - `imports` importa o NAMESPACE `{ Chips }`, não o membro
 */
const instance = figma.selectedInstance

const label = instance.getString('label')
const selected = instance.getEnum('Selected', { True: true, False: false })
const dismissible = instance.getEnum('Dismissible', { True: true, False: false })
const disabled = instance.getEnum('State', { Default: false, Disabled: true })

const hasCount = instance.getBoolean('Has count')
const count = hasCount ? instance.getString('count') : undefined

export default {
  example: figma.code`
<Chips.Filter
  label="${label}"${count !== undefined ? `
  count={${count}}` : ''}${selected ? '\n  selected' : ''}${dismissible ? '\n  dismissible' : ''}${disabled ? '\n  disabled' : ''}
/>`,
  imports: ["import { Chips } from '@/components/Chips'"],
  id: 'chips-filter',
  metadata: { nestable: true },
}
