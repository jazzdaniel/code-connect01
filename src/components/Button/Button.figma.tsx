import figma from '@figma/code-connect'
import { Button } from './Button'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DEMO 1 — PROPS e VARIANTES
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma (component set `Button`, node 4-78):
 *
 *   label                TEXT
 *   Has icon             BOOLEAN
 *   Icon                 INSTANCE_SWAP
 *   Variant              VARIANT  Primary | Secondary | Ghost | Danger
 *   Size                 VARIANT  sm | md | lg
 *   State                VARIANT  Default | Disabled
 *
 * Código (ButtonProps):
 *
 *   children   ReactNode
 *   variant    'primary' | 'secondary' | 'ghost' | 'danger'
 *   size       'sm' | 'md' | 'lg'
 *   disabled   boolean
 *   iconLeft   ReactNode
 *   fullWidth  boolean            <- não existe no Figma (ver nota no fim)
 *
 * Regra de ouro: cada helper do `figma.*` corresponde a UM tipo de
 * propriedade do Figma, e o nome passado é o nome EXATO (case-sensitive).
 */
figma.connect(
  Button,
  'https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=4-78',
  {
    props: {
      // ── TEXT -> children ──────────────────────────────────────────────
      // `figma.string` lê a text property. O nome da prop em código pode
      // ser diferente do nome no Figma (aqui: label -> children).
      children: figma.string('label'),

      // ── VARIANT -> union de strings ───────────────────────────────────
      // O mapa TEM de cobrir todos os valores do eixo. Se faltar um,
      // o snippet sai com `variant={undefined}`.
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Secondary: 'secondary',
        Ghost: 'ghost',
        Danger: 'danger',
      }),

      // Quando os valores do Figma já são iguais aos do código, o mapa
      // continua obrigatório — é ele que declara o eixo como enum.
      size: figma.enum('Size', {
        sm: 'sm',
        md: 'md',
        lg: 'lg',
      }),

      // ── VARIANT -> boolean ────────────────────────────────────────────
      // No Figma "estado" virou um eixo de variante; em código é um boolean.
      // `figma.enum` resolve porque o valor mapeado pode ser de qualquer tipo.
      // `undefined` no caso Default faz a prop desaparecer do snippet.
      disabled: figma.enum('State', {
        Default: undefined,
        Disabled: true,
      }),

      // ── BOOLEAN + INSTANCE_SWAP -> ReactNode ──────────────────────────
      // Dois mecanismos combinados: o boolean decide SE há ícone,
      // `figma.instance` resolve QUAL ícone (renderizando o Code Connect
      // do componente Icon — ver src/components/icons/Icon.figma.tsx).
      iconLeft: figma.boolean('Has icon', {
        true: figma.instance('Icon'),
        false: undefined,
      }),
    },

    example: ({ children, variant, size, disabled, iconLeft }) => (
      <Button variant={variant} size={size} disabled={disabled} iconLeft={iconLeft}>
        {children}
      </Button>
    ),

    // ── IMPORTS ───────────────────────────────────────────────────────────
    // Sem isto, o Dev Mode mostra `<Button>` sem dizer de onde ele vem.
    // O caminho deve ser o que o time realmente usa (aqui o alias `@/`,
    // configurado em figma.config.json -> importPaths).
    imports: ["import { Button } from '@/components/Button'"],
  },
)

/**
 * NOTA — prop que existe em código e não no Figma: `fullWidth`.
 *
 * Não invente uma propriedade no Figma só para fechar o mapeamento, e não
 * emita um atributo que não está em ButtonProps. Duas saídas legítimas:
 *
 *  1. Deixar de fora (feito aqui). No Figma o efeito equivalente é
 *     redimensionar a instância para "Fill".
 *  2. Publicar uma segunda variação com `variant="fullWidth"` via
 *     `figma.connect(Button, url, { variant: { ... } })`, que conecta o
 *     MESMO componente de código a uma combinação específica de variantes.
 */
