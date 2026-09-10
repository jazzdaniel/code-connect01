import figma from '@figma/code-connect'
import { SearchIllustration, EmptyBoxIllustration, ErrorIllustration } from './index'

/**
 * Mesmo padrão do Icon: um set `Illustration` no Figma, três SVGs em código.
 * Usado como instance swap dentro do EmptyState.
 */
figma.connect(
  SearchIllustration,
  'https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo?node-id=3-20',
  {
    props: {
      illustration: figma.enum('Name', {
        Search: <SearchIllustration />,
        EmptyBox: <EmptyBoxIllustration />,
        Error: <ErrorIllustration />,
      }),
    },
    example: ({ illustration }) => illustration,
    imports: [
      "import { SearchIllustration, EmptyBoxIllustration, ErrorIllustration } from '@/components/Illustrations'",
    ],
  },
)
