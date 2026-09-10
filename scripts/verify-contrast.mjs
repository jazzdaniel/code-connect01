/**
 * Checa WCAG AA (4.5:1) em todos os pares texto/fundo que os componentes
 * realmente produzem, para CADA marca. Falha se algum par ficar abaixo.
 *
 * Rodar: npm run tokens:contrast
 */
import { loadTokens } from './load-tokens.mjs'

const t = await loadTokens()

const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
const lum = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255)
}
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/** pares derivados do CSS dos componentes (Button.css, Chips.css, EmptyState.css) */
const PAIRS = [
  ['label do btn primary', 'text/on-brand', 'action/primary/default'],
  ['label do btn primary :hover', 'text/on-brand', 'action/primary/hover'],
  ['label do btn danger', 'text/on-brand', 'action/danger/default'],
  ['label do btn danger :hover', 'text/on-brand', 'action/danger/hover'],
  ['label do btn ghost', 'text/brand', 'bg/surface'],
  ['btn ghost :hover', 'text/brand', 'bg/selected'],
  ['label do btn secondary', 'text/primary', 'bg/surface'],
  ['chip selecionado', 'text/brand', 'bg/selected'],
  ['chip normal', 'text/primary', 'bg/surface'],
  ['texto do corpo', 'text/primary', 'bg/surface'],
  ['texto secundário', 'text/secondary', 'bg/surface'],
  ['texto secundário em subtle', 'text/secondary', 'bg/subtle'],
  ['título em subtle', 'text/primary', 'bg/subtle'],
]

const AA = 4.5
let fails = 0
let total = 0
const verbose = process.argv.includes('--verbose')

for (const brand of t.brands) {
  const map = t.semantic[brand]
  const lines = []
  for (const [label, fg, bg] of PAIRS) {
    const r = ratio(map[fg], map[bg])
    total++
    const ok = r >= AA
    if (!ok) fails++
    if (!ok || verbose) {
      lines.push(`  ${ok ? '✓' : '✗'} ${label.padEnd(28)} ${r.toFixed(2).padStart(6)}  (${fg} / ${bg})`)
    }
  }
  if (lines.length) console.log(`\n=== ${brand} ===\n` + lines.join('\n'))
}

if (fails) {
  console.error(`\n✗ ${fails}/${total} par(es) abaixo de ${AA}:1`)
  process.exit(1)
}
console.log(`✓ ${total} pares texto/fundo passam WCAG AA (${AA}:1) nas ${t.brands.length} marcas`)
