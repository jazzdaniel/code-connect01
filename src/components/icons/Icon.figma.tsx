import figma from '@figma/code-connect'
import {
  PlusIcon,
  CheckIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
  TrashIcon,
} from './index'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CASO: 1 component set no Figma  →  N componentes em código
 * ─────────────────────────────────────────────────────────────────────────────
 * No Figma existe UM set `Icon` com a variant property `Name`.
 * Em código cada ícone é um componente separado.
 *
 * `figma.enum` resolve isso: o valor mapeado pode ser JSX, não só string.
 * Por isso o `example` simplesmente devolve o elemento escolhido.
 *
 * Consequência importante: quando um Button tem `figma.instance('Icon')`,
 * o Code Connect renderiza ESTE snippet dentro do snippet do Button.
 * Sem este arquivo, o slot de ícone sairia vazio.
 */
figma.connect(
  PlusIcon,
  'https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=2-21',
  {
    props: {
      // VARIANT -> JSX. Todos os valores do eixo devem estar mapeados:
      // um valor faltando gera `undefined` silencioso no snippet.
      icon: figma.enum('Name', {
        Plus: <PlusIcon />,
        Check: <CheckIcon />,
        Search: <SearchIcon />,
        X: <XIcon />,
        ChevronDown: <ChevronDownIcon />,
        Trash: <TrashIcon />,
      }),
    },
    example: ({ icon }) => icon,
    // IMPORTS: o barrel de ícones. Sem isto o Dev Mode mostra o JSX
    // sem dizer de onde importar.
    imports: [
      "import { PlusIcon, CheckIcon, SearchIcon, XIcon, ChevronDownIcon, TrashIcon } from '@/components/icons'",
    ],
  },
)
