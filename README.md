# Code Connect Demo — props, variantes, imports e componentes compostos

Demo de duas pontas: uma pequena biblioteca **React + TypeScript** e o **mesmo
design system replicado no Figma**, com tokens em paridade exata e os arquivos
de **Code Connect** que ligam os dois.

- **Repo:** https://github.com/jazzdaniel/code-connect01
- **Figma:** https://www.figma.com/design/tydc2qcGIgzFu3C4DfEejk/DS-Code-Connect-Demo
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

## Tokens: paridade verificada, não prometida

O sync é **bidirecional** — token pode mudar de qualquer um dos dois lados:

```
                 export-tokens.mjs
tokens.ts  ──────────────────────────────▶  scripts/figma-tokens.json ──▶ Figma Variables
tokens.css                                                                     │
     ▲                                                                         │
     └──────────────── sync-tokens-from-figma.mjs ◀───────── dump das variables ┘
```

| Comando | O que faz |
|---|---|
| `npm run tokens:export` | `tokens.ts` → `scripts/figma-tokens.json` (payload das variables) |
| `npm run tokens:sync <dump.json>` | **Figma → código**: reescreve os valores em `tokens.ts` e `tokens.css` |
| `npm run tokens:verify` | `tokens.ts` ⇄ `tokens.css` — nome e valor de cada CSS var |
| `npm run tokens:verify-figma <dump.json>` | `tokens.ts` ⇄ Figma Variables — nome, collection, tipo, valor, alias e code syntax |

Estado atual: **64 tokens, 0 divergências** nas duas direções.

O `tokens:sync` aceita `--dry-run` e é deliberadamente conservador: só reescreve
**valores de tokens que já existem**. Token novo, removido ou re-aliasado no
Figma sai como aviso, porque isso é decisão de arquitetura e não sync mecânico.
Semânticos não são tocados — são aliases e seguem o primitivo nos dois lados.

Cada Figma Variable tem o `code syntax` (WEB) apontando para a CSS custom
property real — `color/brand/500` → `var(--color-brand-500)`. Os primitivos têm
`scopes: []` (invisíveis nos pickers); só os semânticos aparecem.

### Onde o drift realmente aparece

CSS e Figma seguem os tokens sozinhos (classes usam `var()`, nós usam variables).
O ponto cego são **SVGs com hex literal**: as ilustrações eram o único lugar do
DS que saía de sincronia quando um primitivo mudava. Por isso elas usam
`fill="var(--color-brand-500)"` em vez de hex — o equivalente, em SVG, a um fill
ligado a variable no Figma.

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
  export-tokens.mjs
  verify-tokens.mjs
  verify-figma-parity.mjs
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
