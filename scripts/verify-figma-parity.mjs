/**
 * Compara um dump das Figma Variables com tokens.ts, MODO A MODO.
 *
 * Uso: node scripts/verify-figma-parity.mjs <figma-dump.json>
 *
 * O dump é o retorno do script de leitura em docs/figma-dump.md, no formato:
 *   { variables: [ { collection, name, type, web,
 *                    value|valuesByMode, alias|aliasByMode } ] }
 *
 * Falha se: token faltando/extra no Figma, valor diferente em qualquer modo,
 * alias diferente, ou code syntax fora do nome da CSS custom property.
 */
import { readFileSync } from 'node:fs'
import { loadTokens, flatten } from './load-tokens.mjs'

const dumpPath = process.argv[2]
if (!dumpPath) {
  console.error('uso: node scripts/verify-figma-parity.mjs <figma-dump.json>')
  process.exit(2)
}

const t = await loadTokens()
const expected = flatten(t)
const figma = JSON.parse(readFileSync(dumpPath, 'utf8')).variables
const figmaByName = new Map(figma.map((v) => [v.name, v]))

const errors = []
let checks = 0
const up = (s) => String(s).toUpperCase()

for (const e of expected) {
  const f = figmaByName.get(e.name)
  if (!f) {
    errors.push(`FALTANDO no Figma: ${e.name}`)
    continue
  }
  if (f.collection !== e.collection) errors.push(`${e.name}: collection Figma=${f.collection} esperado=${e.collection}`)
  if (f.type !== e.type) errors.push(`${e.name}: type Figma=${f.type} esperado=${e.type}`)
  if (f.web !== `var(${e.css})`) errors.push(`${e.name}: code syntax Figma=${f.web} esperado=var(${e.css})`)

  if (e.valuesByMode) {
    if (!f.valuesByMode) {
      errors.push(`${e.name}: esperado multi-modo (${Object.keys(e.valuesByMode).join('|')}), Figma tem um único valor`)
      continue
    }
    for (const [mode, hex] of Object.entries(e.valuesByMode)) {
      checks++
      if (!(mode in f.valuesByMode)) {
        errors.push(`${e.name}: modo ${mode} não existe no Figma`)
        continue
      }
      if (up(f.valuesByMode[mode]) !== up(hex)) {
        errors.push(`${e.name}[${mode}]: valor Figma=${f.valuesByMode[mode]} esperado=${hex}`)
      }
      const fAlias = f.aliasByMode ? f.aliasByMode[mode] : null
      if (fAlias !== e.aliasByMode[mode]) {
        errors.push(`${e.name}[${mode}]: alias Figma=${fAlias} esperado=${e.aliasByMode[mode]}`)
      }
    }
  } else {
    checks++
    const exp = e.type === 'COLOR' ? up(e.value) : e.value
    const act = e.type === 'COLOR' ? up(f.value) : f.value
    if (String(act) !== String(exp)) errors.push(`${e.name}: valor Figma=${f.value} esperado=${e.value}`)
  }
}

for (const f of figma) {
  if (!expected.some((e) => e.name === f.name)) {
    errors.push(`EXTRA no Figma (não existe em tokens.ts): ${f.name}`)
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} divergência(s) Figma <-> código:\n` + errors.map((e) => '  - ' + e).join('\n'))
  process.exit(1)
}
const modal = expected.filter((e) => e.valuesByMode).length
console.log(`✓ ${expected.length} tokens idênticos entre tokens.ts e as Figma Variables`)
console.log(`  ${checks} checagens de valor — ${modal} semânticos x ${t.brands.length} modos (${t.brands.join(', ')})`)
console.log(`  (nome, collection, tipo, valor por modo, alias por modo e code syntax)`)
