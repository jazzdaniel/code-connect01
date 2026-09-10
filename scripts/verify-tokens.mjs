/**
 * Checa a paridade tokens.ts <-> tokens.css, inclusive por marca.
 * Falha se um token não existir no CSS, tiver valor diferente, ou se um
 * semântico não estiver expresso como alias var(--primitivo).
 *
 * Rodar: npm run tokens:verify
 */
import { readFileSync } from 'node:fs'
import { loadTokens, flatten, cssVar } from './load-tokens.mjs'

const t = await loadTokens()
const rows = flatten(t)
// tira os comentários ANTES de fatiar em blocos: sem isso o /* … */ de topo
// entra no grupo de seletores e nenhum bloco casa.
const css = readFileSync('src/tokens/tokens.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** extrai as declarações de um bloco cujo seletor casa com `test` */
const blockDecls = (test) => {
  const map = new Map()
  const re = /([^{}]+)\{([^}]*)\}/g
  let m
  while ((m = re.exec(css))) {
    const selectors = m[1].split(',').map((s) => s.trim()).filter(Boolean)
    if (!selectors.some(test)) continue
    for (const d of m[2].matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      map.set(d[1], d[2].trim())
    }
  }
  return map
}

const root = blockDecls((s) => s === ':root')
const resolve = (raw, depth = 0) => {
  if (depth > 8) return raw
  const m = String(raw).match(/^var\((--[a-z0-9-]+)\)$/)
  return m ? resolve(root.get(m[1]) ?? raw, depth + 1) : raw
}
const norm = (s) => String(s).replace(/^Inter.*/, 'Inter').toUpperCase()

const errors = []

// ── primitivos e escalares: declarados no :root ────────────────────────
for (const r of rows.filter((x) => x.collection !== 'Color')) {
  if (!root.has(r.css)) {
    errors.push(`${r.name}: ${r.css} não existe no :root de tokens.css`)
    continue
  }
  const expected = r.cssValue ?? (r.type === 'FLOAT' ? `${r.value}px` : String(r.value))
  const actual = resolve(root.get(r.css))
  if (norm(actual) !== norm(expected)) {
    errors.push(`${r.name}: CSS ${r.css}=${actual} != token ${expected}`)
  }
}

// ── semânticos: um bloco por marca, sempre como alias ──────────────────
for (const brand of t.brands) {
  const attr = `[data-brand='${t.brandAttr(brand)}']`
  const decls = blockDecls((s) => s === attr)
  if (!decls.size) {
    errors.push(`marca ${brand}: bloco ${attr} não encontrado em tokens.css`)
    continue
  }
  for (const r of rows.filter((x) => x.collection === 'Color')) {
    const raw = decls.get(r.css)
    if (!raw) {
      errors.push(`${brand}/${r.name}: ${r.css} ausente em ${attr}`)
      continue
    }
    const expectedAlias = `var(${cssVar(r.aliasByMode[brand])})`
    if (raw !== expectedAlias) {
      errors.push(`${brand}/${r.name}: CSS=${raw} esperado=${expectedAlias} (semântico deve ser alias, não hex)`)
      continue
    }
    const actual = resolve(raw)
    if (norm(actual) !== norm(r.valuesByMode[brand])) {
      errors.push(`${brand}/${r.name}: resolve para ${actual}, token diz ${r.valuesByMode[brand]}`)
    }
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} divergência(s):\n` + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
const nSem = rows.filter((r) => r.collection === 'Color').length
console.log(`✓ ${rows.length} tokens em paridade entre tokens.ts e tokens.css`)
console.log(`  ${nSem} semânticos x ${t.brands.length} marcas (${t.brands.join(', ')}) = ${nSem * t.brands.length} declarações, todas como alias`)
