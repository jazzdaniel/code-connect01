/**
 * Compara o dump das Figma Variables (JSON extraído do arquivo Figma) com
 * scripts/figma-tokens.json (gerado de src/tokens/tokens.ts).
 *
 * Uso: node scripts/verify-figma-parity.mjs <figma-dump.json>
 *
 * Falha se: token faltando no Figma, valor diferente, ou code syntax
 * divergente do nome da CSS custom property.
 */
import { readFileSync } from 'node:fs'

const dumpPath = process.argv[2]
if (!dumpPath) {
  console.error('uso: node scripts/verify-figma-parity.mjs <figma-dump.json>')
  process.exit(2)
}

const code = JSON.parse(readFileSync('scripts/figma-tokens.json', 'utf8'))
const figma = JSON.parse(readFileSync(dumpPath, 'utf8')).variables

const figmaByName = new Map(figma.map((v) => [v.name, v]))
const errors = []

for (const t of code) {
  const f = figmaByName.get(t.name)
  if (!f) {
    errors.push(`FALTANDO no Figma: ${t.name}`)
    continue
  }
  if (f.collection !== t.collection) {
    errors.push(`${t.name}: collection Figma=${f.collection} code=${t.collection}`)
  }
  if (f.type !== t.type) {
    errors.push(`${t.name}: type Figma=${f.type} code=${t.type}`)
  }
  const expected = t.type === 'COLOR' ? String(t.value).toUpperCase() : t.value
  const actual = t.type === 'COLOR' ? String(f.value).toUpperCase() : f.value
  if (actual !== expected) {
    errors.push(`${t.name}: valor Figma=${actual} code=${expected}`)
  }
  if (f.web !== `var(${t.css})`) {
    errors.push(`${t.name}: code syntax Figma=${f.web} esperado=var(${t.css})`)
  }
  if (t.alias && f.alias !== t.alias) {
    errors.push(`${t.name}: alias Figma=${f.alias} code=${t.alias}`)
  }
}

const extra = figma.filter((f) => !code.some((t) => t.name === f.name))
for (const f of extra) errors.push(`EXTRA no Figma (não existe em tokens.ts): ${f.name}`)

if (errors.length) {
  console.error(`✗ ${errors.length} divergência(s) Figma <-> código:\n` + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
console.log(`✓ ${code.length} tokens idênticos entre tokens.ts e as Figma Variables`)
console.log(`  (nome, collection, tipo, valor, alias e code syntax conferidos)`)
