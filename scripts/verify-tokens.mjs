/**
 * Checa a paridade tokens.ts <-> tokens.css.
 * Falha se algum token não existir no CSS ou tiver valor diferente.
 * Rodar: npm run tokens:verify
 */
import { readFileSync } from 'node:fs'

const tokens = JSON.parse(readFileSync('scripts/figma-tokens.json', 'utf8'))
const css = readFileSync('src/tokens/tokens.css', 'utf8')

const declared = new Map()
for (const m of css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  declared.set(m[1], m[2].trim())
}

const resolve = (raw, depth = 0) => {
  if (depth > 8) return raw
  const m = raw.match(/^var\((--[a-z0-9-]+)\)$/)
  return m ? resolve(declared.get(m[1]) ?? raw, depth + 1) : raw
}

const errors = []
for (const t of tokens) {
  if (!declared.has(t.css)) {
    errors.push(`${t.name}: CSS var ${t.css} não existe em tokens.css`)
    continue
  }
  const actual = resolve(declared.get(t.css))
  const expected = t.cssValue ?? (t.type === 'FLOAT' ? `${t.value}px` : String(t.value))
  const norm = (s) => s.replace(/^Inter.*/, 'Inter').toUpperCase()
  if (norm(actual) !== norm(expected)) {
    errors.push(`${t.name}: CSS ${t.css}=${actual} != token ${expected}`)
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} divergência(s):\n` + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`✓ ${tokens.length} tokens em paridade entre tokens.ts e tokens.css`)
