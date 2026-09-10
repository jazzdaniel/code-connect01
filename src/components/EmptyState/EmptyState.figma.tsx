import figma from '@figma/code-connect'
import { EmptyState } from './EmptyState'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DEMO 3 — COMPOSIÇÃO / INSTÂNCIAS ANINHADAS
 * ─────────────────────────────────────────────────────────────────────────────
 * O EmptyState não tem nenhum estilo próprio interessante: o que importa é que
 * ele RECEBE outros componentes do design system como props ReactNode.
 *
 * No Figma isso aparece de duas formas diferentes, que se mapeiam com helpers
 * diferentes:
 *
 *   a) `illustration` é uma INSTANCE_SWAP  -> figma.instance('Illustration')
 *      O designer troca a ilustração pelo painel de propriedades.
 *
 *   b) `action` / `secondaryAction` são instâncias de Button FIXAS na
 *      estrutura, controladas por booleans -> figma.children('<nome do layer>')
 *      O designer não troca o componente, só liga/desliga e edita o label.
 *
 * Nos dois casos o snippet do componente filho é renderizado pelo Code Connect
 * DELE (Button.figma.tsx / Illustration.figma.tsx). É isso que produz um
 * snippet aninhado real em vez de um placeholder.
 */
figma.connect(
  EmptyState,
  'https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=8-35',
  {
    props: {
      title: figma.string('title'),

      description: figma.boolean('Has description', {
        true: figma.string('description'),
        false: undefined,
      }),

      size: figma.enum('Size', {
        md: 'md',
        sm: 'sm',
      }),

      // (a) INSTANCE_SWAP — resolve para o Code Connect do set Illustration
      illustration: figma.instance('Illustration'),

      // (b) instâncias aninhadas por nome de layer, com o boolean controlando
      //     a presença. Os layers `action` e `secondaryAction` são filhos
      //     diretos do componente, então `figma.children` basta — não precisa
      //     de nestedProps como no Chips.Group.
      action: figma.boolean('Has action', {
        true: figma.children('action'),
        false: undefined,
      }),
      secondaryAction: figma.boolean('Has secondary action', {
        true: figma.children('secondaryAction'),
        false: undefined,
      }),
    },

    example: ({ title, description, size, illustration, action, secondaryAction }) => (
      <EmptyState
        size={size}
        title={title}
        description={description}
        illustration={illustration}
        action={action}
        secondaryAction={secondaryAction}
      />
    ),

    // O EmptyState só importa a si mesmo: os imports de Button e das
    // ilustrações vêm dos `imports` dos respectivos arquivos .figma.tsx e são
    // concatenados no snippet final pelo Code Connect.
    imports: ["import { EmptyState } from '@/components/EmptyState'"],
  },
)
