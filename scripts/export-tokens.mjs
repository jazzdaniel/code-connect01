/**
 * tokens.ts -> scripts/figma-tokens.json
 * (payload achatado que o script de Figma Variables consome)
 *
 * Rodar: npm run tokens:export
 */
import { writeFileSync } from 'node:fs'
import { loadTokens, flatten } from './load-tokens.mjs'

const t = await loadTokens()
const rows = flatten(t)
writeFileSync('scripts/figma-tokens.json', JSON.stringify(rows, null, 2) + '\n')

const byCollection = rows.reduce((a, r) => ((a[r.collection] = (a[r.collection] || 0) + 1), a), {})
console.log(`${rows.length} tokens -> scripts/figma-tokens.json`)
console.log(`  modos da collection Color: ${t.brands.join(', ')}`)
console.log('  ' + Object.entries(byCollection).map(([k, v]) => `${k}=${v}`).join('  '))
