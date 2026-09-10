// url=https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=7-58
// source=src/components/Chips/Chips.tsx
// component=Chips.Group
import figma from 'figma'

/**
 * O outro membro do composto. Os chips estão dentro do layer `items`, ou seja
 * NÃO são filhos diretos — por isso `traverseInstances: true`.
 *
 * É o equivalente parserless do `figma.nestedProps('items', ...)` usado no
 * Chips.figma.tsx.
 */
const instance = figma.selectedInstance

const hasLabel = instance.getBoolean('Has label')
const label = hasLabel ? instance.getString('label') : undefined

const chips = instance.findConnectedInstances(
  (node) => node.name === 'Chips.Filter',
  { traverseInstances: true },
)

// Cada resultado em sua própria variável — .map().join() renderizaria
// "[object Object]" porque executeTemplate() devolve ResultSection[].
const chip1 = chips[0] && chips[0].type === 'INSTANCE' ? chips[0].executeTemplate().example : undefined
const chip2 = chips[1] && chips[1].type === 'INSTANCE' ? chips[1].executeTemplate().example : undefined
const chip3 = chips[2] && chips[2].type === 'INSTANCE' ? chips[2].executeTemplate().example : undefined

export default {
  example: figma.code`
<Chips.Group${label !== undefined ? ` label="${label}"` : ''}>
  ${chip1}${chip2}${chip3}
</Chips.Group>`,
  imports: ["import { Chips } from '@/components/Chips'"],
  id: 'chips-group',
  metadata: { nestable: false },
}
