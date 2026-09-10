/**
 * Sync no sentido FIGMA -> CÓDIGO.
 *
 * Lê um dump das Figma Variables e reescreve os VALORES em
 * src/tokens/tokens.ts e src/tokens/tokens.css. Não altera nomes, estrutura
 * nem comentários: só substitui valores de tokens que já existem, e avisa
 * (sem escrever) quando um token foi adicionado, removido ou re-aliasado no
 * Figma — essas mudanças são decisões de arquitetura, não sync automático.
 *
 * Uso:
 *   node scripts/sync-tokens-from-figma.mjs <figma-dump.json> [--dry-run]
 *
 * Complementa scripts/export-tokens.mjs, que faz o caminho inverso.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { loadTokens, flatten } from './load-tokens.mjs'

const [dumpPath, ...flags] = process.argv.slice(2)
const dryRun = flags.includes('--dry-run')
if (!dumpPath) {
  console.error('uso: node scripts/sync-tokens-from-figma.mjs <figma-dump.json> [--dry-run]')
  process.exit(2)
}

const figma = JSON.parse(readFileSync(dumpPath, 'utf8')).variables
const t = await loadTokens()
const code = flatten(t)

const codeByName = new Map(code.map((t) => [t.name, t]))
const figmaByName = new Map(figma.map((v) => [v.name, v]))

/** avisos estruturais — não sincronizados automaticamente */
const warnings = []
for (const v of figma) if (!codeByName.has(v.name)) warnings.push(`NOVO no Figma (adicione à mão em tokens.ts): ${v.name} = ${v.value}`)
for (const t of code) if (!figmaByName.has(t.name)) warnings.push(`REMOVIDO no Figma (ainda existe em tokens.ts): ${t.name}`)
for (const t of code) {
  const v = figmaByName.get(t.name)
  if (v && t.alias && v.alias && v.alias !== t.alias) {
    warnings.push(`ALIAS mudou: ${t.name} agora aponta para ${v.alias} (era ${t.alias}) — ajuste tokens.ts à mão`)
  }
}

/** mudanças de valor — essas sim sincronizam */
const changes = []
const modeChanges = []
for (const row of code) {
  const v = figmaByName.get(row.name)
  if (!v) continue
  if (row.valuesByMode) {
    // Semânticos são aliases por modo. Trocar o alias de um modo é editar a
    // tabela `semantic` em tokens.ts, então reportamos com a linha exata a
    // mudar em vez de reescrever a expressão.
    for (const [mode, alias] of Object.entries(row.aliasByMode)) {
      const fAlias = v.aliasByMode ? v.aliasByMode[mode] : null
      if (fAlias && fAlias !== alias) {
        const [, family, step] = fAlias.split('/')
        modeChanges.push(
          `${row.name}[${mode}]: ${alias} -> ${fAlias}\n      em tokens.ts, bloco ${mode}: '${row.name}': color.${family}[${step}],`,
        )
      }
    }
    continue
  }
  const before = row.type === 'COLOR' ? String(row.value).toUpperCase() : row.value
  const after = row.type === 'COLOR' ? String(v.value).toUpperCase() : v.value
  if (String(before) !== String(after)) changes.push({ ...row, before, after })
}

if (modeChanges.length) {
  console.log(`\n${modeChanges.length} alias de modo mudou no Figma (edite tokens.ts à mão):`)
  for (const m of modeChanges) console.log('    - ' + m)
}

if (!changes.length) {
  if (!modeChanges.length) console.log('✓ nenhum valor divergente — código já está igual ao Figma')
  if (warnings.length) console.warn('\n⚠ ' + warnings.join('\n⚠ '))
  process.exit(0)
}

let ts = readFileSync('src/tokens/tokens.ts', 'utf8')
let css = readFileSync('src/tokens/tokens.css', 'utf8')
const applied = []
const derived = []
const skipped = []

for (const c of changes) {
  // ── tokens.ts ────────────────────────────────────────────────────────
  // Só primitivos de cor e escalares têm valor literal no TS; os semânticos
  // são expressões (color.brand[500]) e seguem o primitivo automaticamente.
  let tsHit = false
  if (c.collection === 'Primitives') {
    const re = new RegExp(`('${c.before}'|"${c.before}")`, 'g')
    if (re.test(ts)) {
      ts = ts.replace(re, `'${c.after}'`)
      tsHit = true
    }
  } else if (c.type !== 'COLOR') {
    // escalares: última parte do nome é a chave no objeto TS
    const key = c.name.split('/').pop()
    const quoted = /^[a-z]+$/.test(key) ? key : `'${key}'`
    const re = new RegExp(`((?:${key}|'${key}'|"${key}"):\\s*)${c.before}\\b`)
    if (re.test(ts)) {
      ts = ts.replace(re, `$1${c.after}`)
      tsHit = true
    }
  }

  // ── tokens.css ───────────────────────────────────────────────────────
  // Substitui só declarações com valor LITERAL. As que usam var(--x) são
  // aliases e seguem o primitivo sozinhas — reescrevê-las achataria o
  // aliasing (foi exatamente o que um lookahead ingênuo fazia aqui, porque
  // `\s*` faz backtracking e deixa o lookahead passar).
  const cssValue = c.type === 'FLOAT' ? `${c.after}px` : c.after
  let cssHit = false
  css = css.replace(new RegExp(`(${c.css}\\s*:\\s*)([^;]+);`), (match, head, value) => {
    if (value.trim().startsWith('var(')) return match // alias: não toca
    cssHit = true
    return `${head}${cssValue};`
  })

  if (tsHit || cssHit) {
    applied.push(`${c.name}: ${c.before} -> ${c.after}${tsHit ? '' : ' (só CSS)'}${cssHit ? '' : ' (só TS)'}`)
  } else if (c.alias) {
    // esperado: semântico é alias, o valor vem do primitivo em ambos os lados
    derived.push(`${c.name} -> ${c.after} (via ${c.alias})`)
  } else {
    skipped.push(`${c.name}: ${c.before} -> ${c.after} (nenhum literal encontrado — verifique à mão)`)
  }
}

if (!dryRun) {
  writeFileSync('src/tokens/tokens.ts', ts)
  writeFileSync('src/tokens/tokens.css', css)
}

console.log(`${dryRun ? '[dry-run] ' : ''}${applied.length} token(s) atualizado(s):`)
for (const a of applied) console.log('  ' + a)
if (derived.length) {
  console.log(`\n${derived.length} semântico(s) atualizado(s) por alias (nenhuma edição necessária):`)
  for (const d of derived) console.log('  ' + d)
}
if (skipped.length) {
  console.warn(`\n⚠ ${skipped.length} não aplicado(s):`)
  for (const s of skipped) console.warn('  ' + s)
}
if (warnings.length) console.warn('\n⚠ ' + warnings.join('\n⚠ '))
if (!dryRun) console.log('\nAgora rode: npm run tokens:build && npm run tokens:verify && npm run tokens:contrast')
