// url=https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=8-35
// source=src/components/EmptyState/EmptyState.tsx
// component=EmptyState
import figma from 'figma'

/**
 * Composição no formato parserless.
 *  - `illustration` é INSTANCE_SWAP -> getInstanceSwap
 *  - `action` / `secondaryAction` são instâncias nomeadas -> findInstance
 *
 * findInstance devolve um ErrorHandle (que é TRUTHY) quando não acha nada,
 * então o check `type === 'INSTANCE'` não é opcional.
 */
const instance = figma.selectedInstance

const title = instance.getString('title')
const size = instance.getEnum('Size', { md: 'md', sm: 'sm' })

const hasDescription = instance.getBoolean('Has description')
const description = hasDescription ? instance.getString('description') : undefined

const illustration = instance.getInstanceSwap('Illustration')
let illustrationCode
if (illustration && illustration.type === 'INSTANCE') {
  illustrationCode = illustration.executeTemplate().example
}

const hasAction = instance.getBoolean('Has action')
const action = hasAction ? instance.findInstance('action') : null
let actionCode
if (action && action.type === 'INSTANCE') {
  actionCode = action.executeTemplate().example
}

const hasSecondary = instance.getBoolean('Has secondary action')
const secondary = hasSecondary ? instance.findInstance('secondaryAction') : null
let secondaryCode
if (secondary && secondary.type === 'INSTANCE') {
  secondaryCode = secondary.executeTemplate().example
}

export default {
  example: figma.code`
<EmptyState
  size="${size}"
  title="${title}"${description !== undefined ? `
  description="${description}"` : ''}${illustrationCode ? figma.code`
  illustration={${illustrationCode}}` : ''}${actionCode ? figma.code`
  action={${actionCode}}` : ''}${secondaryCode ? figma.code`
  secondaryAction={${secondaryCode}}` : ''}
/>`,
  imports: ["import { EmptyState } from '@/components/EmptyState'"],
  id: 'empty-state',
  metadata: { nestable: false },
}
