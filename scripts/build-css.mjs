/**
 * tokens.ts -> src/tokens/tokens.css  (GERADO — não editar à mão)
 *
 * Primitivos vão no :root. Semânticos saem em um bloco por marca, o que faz
 * `[data-brand='rose']` no HTML ser o equivalente do modo "Rose" no Figma.
 *
 * Rodar: npm run tokens:css
 */
import { writeFileSync } from 'node:fs'
import { loadTokens, flatten, cssVar } from './load-tokens.mjs'

const t = await loadTokens()
const rows = flatten(t)

const decl = (name, value) => `  ${name}: ${value};`
const out = []

out.push('/*')
out.push(' * GERADO por scripts/build-css.mjs a partir de src/tokens/tokens.ts.')
out.push(' * Não editar à mão — rode `npm run tokens:css`.')
out.push(' *')
out.push(' * Os blocos [data-brand] correspondem 1:1 aos modos da collection "Color"')
out.push(' * no Figma. Mesmos nomes, mesmos valores.')
out.push(' */')
out.push(':root {')

const group = (label, filter) => {
  const items = rows.filter(filter)
  if (!items.length) return
  out.push(`  /* ${label} */`)
  for (const r of items) {
    const value = r.type === 'FLOAT' ? `${r.value}px` : r.cssValue ?? r.value
    out.push(decl(r.css, value))
  }
  out.push('')
}

// primitivos, agrupados por família na ordem em que aparecem em tokens.ts
for (const family of Object.keys(t.color)) {
  group(`color/${family}`, (r) => r.collection === 'Primitives' && r.name.startsWith(`color/${family}/`))
}
group('space', (r) => r.name.startsWith('space/'))
group('radius', (r) => r.name.startsWith('radius/'))
group('size', (r) => r.name.startsWith('size/'))
group('typography', (r) => r.collection === 'Typography')
group('border', (r) => r.name === 'border/width/thin')

// família tipográfica com fallbacks (só no CSS; o Figma usa só "Inter")
const fam = rows.find((r) => r.name === 'font/family')
out[out.findIndex((l) => l.startsWith(`  ${fam.css}:`))] = decl(
  fam.css,
  `${fam.value}, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
)

out.push('}')
out.push('')

// semânticos: um bloco por marca
const semantics = rows.filter((r) => r.collection === 'Color')
t.brands.forEach((brand, i) => {
  const attr = `[data-brand='${t.brandAttr(brand)}']`
  const selector = brand === t.defaultBrand ? `:root,\n${attr}` : attr
  out.push(`/* ── marca ${brand}${brand === t.defaultBrand ? ' (padrão)' : ''} — modo "${brand}" no Figma ── */`)
  out.push(`${selector} {`)
  for (const r of semantics) {
    const hex = r.valuesByMode[brand]
    const alias = r.aliasByMode[brand]
    out.push(decl(r.css, `var(${cssVar(alias)})`) + ` /* ${hex} */`)
  }
  out.push('}')
  if (i < t.brands.length - 1) out.push('')
})

writeFileSync('src/tokens/tokens.css', out.join('\n') + '\n')
console.log(`src/tokens/tokens.css gerado — ${rows.length} tokens, ${t.brands.length} marcas (${t.brands.join(', ')})`)
