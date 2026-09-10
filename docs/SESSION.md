# Sessão Claude Code — 10/09/2026

Demo de Figma Code Connect construída do zero: biblioteca React+TS, réplica no
Figma, paridade de tokens e multi-marca via modos de variable.

Números aproximados. Tempo = trabalho do agente (não conta espera entre prompts).
A coluna de tokens é **tokens processados**, não custo — ver
[metodologia](#como-os-números-foram-obtidos) no fim.

---

### 1. "criar diretório react/ts + replicar no figma + tokens idênticos; demo: como mapear props, variantes, imports e compostos; escolher 3 componentes"

- **Skills:** `figma-create-new-file`, `figma-use`, `figma-generate-library`, `figma-code-connect`
- **Tools:** `AskUserQuestion`, `Bash` (~20), `use_figma` (~15), `create_new_file`, `whoami`, `get_libraries`, `search_design_system`, `get_context_for_code_connect`, `get_screenshot` (5), `playwright`
- **Entregou:** lib React+TS (Button, Chips.Filter, EmptyState + Icon/Illustration); arquivo Figma com 10 páginas e 44 componentes; 64 tokens com paridade verificada; 6 mapeamentos de Code Connect nos 2 formatos; README
- **Achados:** cache de paint do Figma não resolvia 2 variables (corrigido resolvendo a cadeia de alias); `size/illustration/sm` estava hardcoded no CSS
- **Tempo:** ~35 min · **Tokens processados:** ~275k

### 2. "mostra o path do arquivo do figma"

- **Tools:** nenhuma (respondido do contexto)
- **Entregou:** URL, file key, localização (Drafts da org) e deep links por componente
- **Tempo:** <1 min · **Tokens processados:** ~3k (sem leitura — chute)

### 3. "atualiza os tokens, mudei no figma"

- **Tools:** `use_figma` (1 leitura), `Bash`, `get_screenshot`, `playwright`, `Read`
- **Entregou:** 5 primitivos sincronizados (brand 500/600/700, danger 500/600); novo `sync-tokens-from-figma.mjs` (Figma → código); ilustrações migradas de hex literal para `var()`
- **Achados:** meu 1º regex de sync achatava os aliases do CSS (`\s*` faz backtracking e o lookahead passa) — pego no `--dry-run`
- **Verificação:** pixel dos dois renders (`#0F50DF`/`#CB2222`), não o olho
- **Tempo:** ~12 min · **Tokens processados:** ~35k

### 4. "cria um repo no github"

- **Tools:** `AskUserQuestion`, `Bash` (`gh`, `git`)
- **Entregou:** repo público `jazzdaniel/code-connect01`, 2 commits, 40 arquivos; identidade git local com noreply (a global estava truncada)
- **Efeito colateral:** com remote git, o Code Connect passou a resolver os links de código-fonte (campo `source`, antes vazio)
- **Tempo:** ~6 min · **Tokens processados:** ~7k

### 5. "usar esta paleta de 16 cores + refletir no figma + modos para simular marcas"

- **Tools:** `AskUserQuestion`, `Bash` (~15), `use_figma` (7), `get_screenshot` (3), `playwright` (navigate/find/click/screenshot), `Read`
- **Entregou:** 16 primitivos novos (8 antigos removidos); collection Color com 3 modos (Ember/Rose/Deep); `tokens.css` passou a ser gerado; `verify-contrast.mjs`; páginas *Semantic × Brand* e *Brands* no Figma; seletor de marca no app
- **Achados:** a paleta não tem neutros claros (mantida a rampa neutra); `teal/500` no botão do Deep dava 3.83:1 — trocado por `indigo/900`
- **Verificação:** 72 tokens / 102 checagens / 0 divergências; 39/39 pares em WCAG AA; 0 bindings órfãos em 139 paints
- **Tempo:** ~30 min · **Tokens processados:** ~108k

---

## Totais

| | |
|---|---|
| Prompts | 5 |
| Tempo de agente | ~85 min |
| Tokens processados (estimativa) | ~430k |
| Custo em R$/US$ | não medido — ver metodologia |
| Skills usadas | 4 (todas do plugin Figma) |
| Chamadas `use_figma` | ~23 |
| Commits | 3 |

## Como os números foram obtidos

**Tempo** — derivado de timestamps reais (mtime dos arquivos criados,
screenshots do Playwright, `pushedAt` do repo). As âncoras são verdadeiras; o
início e fim exatos de cada prompt são aproximados.

**Tokens** — delta do contador de orçamento de contexto entre o início do turno
(15.000.000) e a última leitura visível nele:

| Prompt | Última leitura | Delta |
|---|---|---|
| 1 | 14.725.234 | ~275k |
| 2 | — (sem chamadas de tool) | ~3k, chute |
| 3 | 14.965.068 | ~35k |
| 4 | 14.992.880 | ~7k |
| 5 | 14.892.102 | ~108k |

Por que isso **não** é custo:

- **Conta contexto reenviado.** A cada chamada de tool o histórico inteiro volta
  ao modelo. No prompt 1, com dezenas de chamadas, o mesmo contexto foi
  processado muitas vezes.
- **Não separa input de output**, e output custa bem mais por token.
- **Ignora cache de prompt.** Leitura cacheada custa uma fração do input normal,
  e é justamente nos turnos longos (prompt 1) que o cache mais atua — ou seja, o
  número que mais parece caro é o mais superestimado em dinheiro.

Para o valor real: `/cost` na sessão do Claude Code, ou a página de Usage do
Console.

## O que exigiu decisão do usuário

4 perguntas via `AskUserQuestion`, todas onde o palpite mudaria o resultado:
plano/org do Figma, quais 3 componentes, visibilidade e nome do repo, e como
tratar os neutros + quantos modos de marca.

## Padrão que se repetiu

Três vezes o erro apareceu porque eu **verifiquei em vez de presumir**: cache de
paint (prompt 1), regex que achatava aliases (prompt 3) e contraste do teal
(prompt 5). Os dois primeiros só apareceram medindo pixel ou rodando `--dry-run`;
o terceiro, calculando contraste antes de escrever os tokens.
