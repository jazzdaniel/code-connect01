import figma from '@figma/code-connect'
import { Chips } from './Chips'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DEMO 2 — COMPONENTES COMPOSTOS e IMPORTS
 * ─────────────────────────────────────────────────────────────────────────────
 * Em código não existe um componente chamado `ChipsFilter`. Existe um objeto
 * namespace:
 *
 *   export const Chips = { Group: ChipsGroup, Filter: ChipsFilter }
 *
 * Três consequências práticas para o Code Connect:
 *
 *  1. O primeiro argumento de `figma.connect` é `Chips.Filter` — a referência
 *     ao membro, não um componente top-level. O parser aceita o member access.
 *
 *  2. O `example` precisa renderizar `<Chips.Filter />`, com o namespace, senão
 *     o snippet no Dev Mode não compila no projeto de quem copia.
 *
 *  3. `imports` tem de importar o NAMESPACE (`{ Chips }`), não o membro.
 *     Este é o erro mais comum: gerar `import { Filter } from ...`, que não
 *     existe. O `imports` é texto literal — o Code Connect não o deriva.
 *
 * Cada membro do composto é um `figma.connect` separado, apontando para o
 * componente Figma correspondente.
 */

// ── Membro 1: Chips.Filter ───────────────────────────────────────────────────
// NOTA: a URL tem de ser um STRING LITERAL. O parser do Code Connect lê o
// arquivo estaticamente, então `\`${BASE}?node-id=7-57\`` é rejeitado com
// "The second argument to figma.connect() must be a string literal".
figma.connect(
  Chips.Filter,
  'https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=7-57',
  {
    props: {
      label: figma.string('label'),

      // Eixos booleanos modelados como VARIANT no Figma ("True"/"False" são
      // strings, não booleanos — por isso o mapa é obrigatório).
      selected: figma.enum('Selected', {
        True: true,
        False: undefined,
      }),
      dismissible: figma.enum('Dismissible', {
        True: true,
        False: undefined,
      }),
      disabled: figma.enum('State', {
        Default: undefined,
        Disabled: true,
      }),

      // BOOLEAN que "liga" uma text property. Text properties do Figma são
      // sempre string — o prop em código aceita `number | string` justamente
      // para o snippet gerado compilar sem cast.
      count: figma.boolean('Has count', {
        true: figma.string('count'),
        false: undefined,
      }),
    },
    example: ({ label, selected, dismissible, disabled, count }) => (
      <Chips.Filter
        label={label}
        selected={selected}
        dismissible={dismissible}
        disabled={disabled}
        count={count}
      />
    ),
    imports: ["import { Chips } from '@/components/Chips'"],
  }
)

// ── Membro 2: Chips.Group ────────────────────────────────────────────────────
figma.connect(
  Chips.Group,
  'https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=7-58',
  {
    props: {
      // BOOLEAN -> string opcional
      label: figma.boolean('Has label', {
        true: figma.string('label'),
        false: undefined,
      }),

      // ── CHILDREN ATRAVÉS DE UM LAYER INTERMEDIÁRIO ────────────────────────
      // A estrutura no Figma espelha o DOM:
      //   Chips.Group > items (auto-layout wrap) > Chips.Filter x N
      //
      // `figma.children` casa por NOME DE LAYER, e os chips não são filhos
      // diretos do componente — estão dentro de `items`. `figma.nestedProps`
      // "entra" nesse layer e aplica o mapeamento lá dentro.
      //
      // Sem o nestedProps o `children` viria vazio, que é a falha clássica de
      // mapeamento de composto: a estrutura do Figma tem um wrapper que o
      // JSX não tem.
      items: figma.nestedProps('items', {
        chips: figma.children('Chips.Filter'),
      }),
    },
    example: ({ label, items }) => <Chips.Group label={label}>{items.chips}</Chips.Group>,
    imports: ["import { Chips } from '@/components/Chips'"],
  }
)
