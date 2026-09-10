# Code Connect Demo — props, variantes, imports e componentes compostos

Demo de duas pontas: uma pequena biblioteca **React + TypeScript** e o **mesmo
design system replicado no Figma**, com tokens em paridade exata e os arquivos
de **Code Connect** que ligam os dois.

- **Repo:** https://github.com/jazzdaniel/code-connect01
- **Figma:** https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo
  (3 marcas via modos da collection Color: Ember, Rose, Deep)
- **App:** `npm run dev`

## Os três componentes e o que cada um demonstra

| Componente | Figma | Pergunta que responde |
|---|---|---|
| `Button` | set `Button` (24 variantes) | **props** e **variantes** — enum, boolean, text property, instance swap |
| `Chips.Filter` / `Chips.Group` | sets `Chips.Filter` (8) e `Chips.Group` | **componentes compostos** e **imports** |
| `EmptyState` | set `EmptyState` (2) | **composição** — instâncias aninhadas (Illustration + Button) |

Componentes de apoio: `Icon` (6 variantes) e `Illustration` (3 variantes), ambos
usados como `INSTANCE_SWAP`.

## As quatro respostas, em uma linha cada

**Props** — `figma.string('label')` lê a text property. O nome no Figma e o nome
da prop em código não precisam coincidir (`label` → `children`).

**Variantes** — `figma.enum('Variant', { Primary: 'primary', ... })`. O mapa tem
de cobrir *todos* os valores do eixo; um valor faltando gera `undefined`
silencioso no snippet. Um eixo de variante também pode virar boolean
(`State: Default|Disabled` → `disabled`).

**Imports** — `imports: ["import { Button } from '@/components/Button'"]`. É
**texto literal**, não é derivado do código. É o que faz o Dev Mode mostrar de
onde o componente vem. Os caminhos são reescritos via `importPaths` no
`figma.config.json`.

**Componentes compostos** — `figma.connect(Chips.Filter, ...)` aceita member
access; o `example` precisa renderizar `<Chips.Filter />` **com** o namespace e
o `imports` precisa importar o namespace `{ Chips }`, não o membro. Quando a
estrutura do Figma tem um wrapper que o JSX não tem (`Chips.Group > items >
chips`), use `figma.nestedProps('items', { chips: figma.children('Chips.Filter') })`.

## Marcas: modos do Figma = `data-brand` no HTML

A collection **Color** tem três modos, um por marca. Os 15 tokens semânticos
são os mesmos nos três; só o primitivo que cada um aliasa muda.

| token | Ember | Rose | Deep |
|---|---|---|---|
| `action/primary/default` | `orange/500` | `rose/600` | `indigo/900` |
| `action/primary/hover` | `maroon/800` | `plum/700` | `ink/900` |
| `bg/selected` | `cream/100` | `sand/400` | `sky/500` |
| `text/primary` | `ink/900` | `maroon/900` | `indigo/900` |
| `text/brand` | `maroon/800` | `plum/700` | `indigo/900` |
| `border/brand` | `orange/500` | `rose/600` | `teal/500` |
| superfícies, bordas neutras, danger | iguais nas três | | |

Trocar de marca é a **mesma operação** nos dois lados:

- **Figma:** o modo da collection Color — no seletor de Appearance, ou fixado
  num frame com `setExplicitVariableModeForCollection`. A página *Foundations*
  tem uma matriz *Semantic × Brand* onde cada coluna é um modo fixado, e a
  página *Playground* tem os mesmos componentes lado a lado nas três marcas.
- **Código:** `data-brand="rose"` no `<html>`. O `tokens.css` emite um bloco
  `[data-brand]` por marca. O app tem um seletor no topo (feito com o próprio
  `Chips.Filter`).

Os componentes **não sabem** que marcas existem: eles consomem só semânticos.
Nenhum arquivo de componente mudou quando as três marcas foram adicionadas.

### Contraste é verificado, não presumido

A paleta é escura e saturada, então as combinações não são obviamente seguras.
`npm run tokens:contrast` deriva os 13 pares texto/fundo que os CSS dos
componentes realmente produzem, cruza pelas 3 marcas e falha abaixo de 4.5:1.

```
✓ 39 pares texto/fundo passam WCAG AA (4.5:1) nas 3 marcas
```

Isso mudou uma decisão de design: `teal/500` como `action/primary` do Deep dava
3.83:1 com texto branco. Deep passou a usar `indigo/900` no botão e `teal/500`
em `border/brand`.

## Tokens: paridade verificada, não prometida

Duas camadas, espelhando as collections do Figma:

```
tokens.ts
  color     -> collection "Primitives"  1 modo    24 valores brutos (16 paleta + 8 neutros)
  semantic  -> collection "Color"       3 modos   15 aliases x Ember/Rose/Deep
  space/radius/size -> "Spacing"        1 modo    21
  font              -> "Typography"     1 modo    12
```

`tokens.css` é **gerado** a partir de `tokens.ts` — 45 declarações semânticas
escritas à mão seriam drift garantido.

```
                 build-css.mjs
tokens.ts  ─────────────────────▶  tokens.css
     │       export-tokens.mjs
     ├─────────────────────────▶  scripts/figma-tokens.json ──▶ Figma Variables
     ▲                                                                │
     └──────── sync-tokens-from-figma.mjs ◀──────── dump das variables ┘
```

| Comando | O que faz |
|---|---|
| `npm run tokens:build` | `tokens:export` + `tokens:css` |
| `npm run tokens:css` | gera `src/tokens/tokens.css` |
| `npm run tokens:export` | gera `scripts/figma-tokens.json` |
| `npm run tokens:sync <dump.json>` | **Figma → código**: reescreve valores de primitivos |
| `npm run tokens:verify` | `tokens.ts` ⇄ `tokens.css`, marca por marca |
| `npm run tokens:verify-figma <dump.json>` | `tokens.ts` ⇄ Figma Variables, modo por modo |
| `npm run tokens:contrast` | WCAG AA em todos os pares × marcas |

Estado atual: **72 tokens, 102 checagens de valor, 0 divergências.**

O `tokens:sync` só reescreve **valores de primitivos**. Token novo/removido, ou
alias de modo trocado, sai como aviso com a linha exata a editar — isso é
decisão de arquitetura, não sync mecânico.

Cada Figma Variable tem `code syntax` (WEB) apontando para a CSS custom property
real. Os primitivos têm `scopes: []` (invisíveis nos pickers); só os semânticos
aparecem.

### Onde o drift realmente aparece

CSS e Figma seguem os tokens sozinhos. O ponto cego são **SVGs com hex literal**:
as ilustrações eram o único lugar do DS que saía de sincronia. Hoje `Search` e
`Error` usam tokens **semânticos** (`--bg-selected`, `--action-primary-default`),
então acompanham a marca ativa; `EmptyBox` usa neutros de propósito.

```bash
# nenhum hex literal deve existir fora de src/tokens/
grep -rnoE '#[0-9A-Fa-f]{6}' src | grep -v tokens
```

## Estrutura

```
src/
  tokens/
    tokens.ts              ← FONTE ÚNICA dos tokens
    tokens.css             ← as mesmas variáveis como CSS custom properties
  components/
    Button/
      Button.tsx
      Button.figma.tsx     ← props + variantes
    Chips/
      Chips.tsx            ← namespace: { Group, Filter }
      Chips.figma.tsx      ← compostos + imports + nestedProps
    EmptyState/
      EmptyState.tsx
      EmptyState.figma.tsx ← instâncias aninhadas
    icons/Icon.figma.tsx           ← 1 set no Figma → N componentes em código
    Illustrations/Illustration.figma.tsx
  figma/templates/         ← os MESMOS mapeamentos no formato parserless (.figma.ts)
scripts/
  load-tokens.mjs          ← compila tokens.ts e achata para os outros scripts
  build-css.mjs            ← tokens.ts -> tokens.css
  export-tokens.mjs
  sync-tokens-from-figma.mjs
  verify-tokens.mjs
  verify-figma-parity.mjs
  verify-contrast.mjs
figma.config.json
```

## Os dois formatos de Code Connect

Este repo tem os mesmos mapeamentos escritos das duas maneiras, de propósito:

| | parser-based | parserless |
|---|---|---|
| arquivo | `*.figma.tsx` | `*.figma.ts` |
| API | `figma.connect(Component, url, { props, example, imports })` | `export default { example: figma.code\`…\` }` |
| props | declarativas (`figma.enum`, `figma.boolean`, `figma.instance`) | imperativas (`instance.getEnum`, `getBoolean`, `getInstanceSwap`) |
| snippet | JSX real, type-checked contra o componente | template string |
| onde | `src/components/**` | `src/figma/templates/**` |

O `figma.config.json` aponta para o formato parser-based; os templates estão em
`exclude` para os dois não colidirem no publish.

## Publicar

```bash
npx figma connect parse      # valida sem enviar nada — 6 mapeamentos, 0 erros
npx figma connect publish    # precisa de FIGMA_ACCESS_TOKEN
```

Falta **uma** condição para o `publish` funcionar de verdade:

- **Os componentes precisam estar publicados numa team library.** O arquivo do
  Figma ainda não foi publicado — faça isso no Figma (Assets → Publish) antes de
  rodar o `publish`.

O link para o código-fonte já resolve: o `source` de cada mapeamento aponta para
o arquivo no GitHub (`.../blob/main/src/components/...`). Isso depende do
diretório ser um repo git com remote — sem remote, o campo sai vazio no `parse`.

## Armadilhas encontradas ao montar esta demo

Estão todas comentadas nos arquivos, mas em resumo:

- A URL do `figma.connect()` tem de ser **string literal**. Template string com
  interpolação é rejeitada pelo parser (ele lê o arquivo estaticamente).
- Ao sincronizar Figma → CSS, um `(?!var\()` ingênuo **não** protege os aliases:
  `\s*` faz backtracking e o lookahead passa, achatando
  `--text-brand: var(--color-brand-600)` para um hex. O `tokens:sync` captura o
  valor e testa depois.
- O `include` do `figma.config.json` tem de cobrir **também o arquivo-fonte do
  componente**, não só o `.figma.tsx` — senão os imports não resolvem. Path
  aliases precisam ser repetidos em `paths`.
- Text properties do Figma são **sempre string**. `Chips.Filter.count` aceita
  `number | string` justamente para o snippet gerado compilar sem cast.
- `figma.children` casa por **nome de layer**; se o alvo estiver dentro de outro
  frame, precisa de `figma.nestedProps` (ou `traverseInstances: true` no formato
  parserless).
- Props que só existem em código (`Button.fullWidth`) **não devem** virar
  atributo inventado no snippet. Deixe de fora e documente o equivalente em
  Figma (aqui: redimensionar a instância para *Fill*).

## Notas sobre a réplica no Figma

- 24 variantes de Button (`Variant × Size × State`) em vez do produto completo
  com `fullWidth`, que passaria do limite prático de ~30 combinações.
- `State=Disabled` usa `opacity: 0.4`, igual ao CSS.
- As variantes sem borda (Primary/Ghost/Danger) mantêm um stroke **transparente**
  de 1px, espelhando `border: 1px solid transparent` da classe `.ds-button`.
  São os únicos 22 paints não ligados a variável no arquivo — intencionais.
- `fullWidth`, `onClick`/`onDismiss` e os demais handlers não têm equivalente no
  Figma e não estão mapeados.
