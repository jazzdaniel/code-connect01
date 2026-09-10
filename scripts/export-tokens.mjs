/**
 * Lê src/tokens/tokens.ts (compilado por tsc) e emite scripts/figma-tokens.json:
 * a lista achatada de tokens no formato que o script de Figma Variables consome.
 *
 * Rodar: npm run tokens:export
 * Isto garante que Figma e código NUNCA divergem — a fonte é o mesmo arquivo.
 */
import { writeFileSync, mkdtempSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

const out = mkdtempSync(join(tmpdir(), 'tokens-'))
execSync(`npx tsc src/tokens/tokens.ts --outDir ${out} --module esnext --target es2020 --moduleResolution bundler`, {
  stdio: 'inherit',
})
const t = await import(pathToFileURL(join(out, 'tokens.js')).href)

/** nome da Figma Variable -> nome da CSS custom property (tokens.css) */
const cssVar = (figmaName) => {
  if (figmaName.startsWith('font/line-height/')) return `--line-height-${figmaName.split('/').pop()}`
  if (figmaName === 'font/family') return '--font-family'
  return `--${figmaName.replace(/\//g, '-')}`
}

const tokens = []

// 1. Primitivos de cor — scopes vazios (só semânticos aparecem nos pickers)
for (const [family, ramp] of Object.entries(t.color)) {
  for (const [step, hex] of Object.entries(ramp)) {
    const name = `color/${family}/${step}`
    tokens.push({
      collection: 'Primitives',
      name,
      type: 'COLOR',
      value: hex,
      scopes: [],
      css: cssVar(name),
    })
  }
}

// 2. Semânticos de cor — aliases para os primitivos
const primitiveByHex = new Map()
for (const [family, ramp] of Object.entries(t.color)) {
  for (const [step, hex] of Object.entries(ramp)) {
    if (!primitiveByHex.has(hex)) primitiveByHex.set(hex, `color/${family}/${step}`)
  }
}
const scopesForSemantic = (name) => {
  if (name.startsWith('text/')) return ['TEXT_FILL']
  if (name.startsWith('border/')) return ['STROKE_COLOR']
  return ['FRAME_FILL', 'SHAPE_FILL']
}
for (const [name, hex] of Object.entries(t.semantic)) {
  tokens.push({
    collection: 'Color',
    name,
    type: 'COLOR',
    value: hex,
    alias: primitiveByHex.get(hex),
    scopes: scopesForSemantic(name),
    css: cssVar(name),
  })
}

// 3. Espaçamento, raio, tamanho, borda
for (const [k, v] of Object.entries(t.space)) {
  const name = `space/${k}`
  tokens.push({ collection: 'Spacing', name, type: 'FLOAT', value: v, scopes: ['GAP', 'WIDTH_HEIGHT'], css: cssVar(name) })
}
for (const [k, v] of Object.entries(t.radius)) {
  const name = `radius/${k}`
  tokens.push({ collection: 'Spacing', name, type: 'FLOAT', value: v, scopes: ['CORNER_RADIUS'], css: cssVar(name) })
}
for (const [k, v] of Object.entries(t.size)) {
  const name = `size/${k}`
  tokens.push({ collection: 'Spacing', name, type: 'FLOAT', value: v, scopes: ['WIDTH_HEIGHT'], css: cssVar(name) })
}
tokens.push({
  collection: 'Spacing',
  name: 'border/width/thin',
  type: 'FLOAT',
  value: t.border.width.thin,
  scopes: ['STROKE_FLOAT'],
  css: '--border-width-thin',
})

// 4. Tipografia
tokens.push({
  collection: 'Typography',
  name: 'font/family',
  type: 'STRING',
  value: t.font.family,
  scopes: ['FONT_FAMILY'],
  css: cssVar('font/family'),
})
for (const [k, v] of Object.entries(t.font.size)) {
  const name = `font/size/${k}`
  tokens.push({ collection: 'Typography', name, type: 'FLOAT', value: v, scopes: ['FONT_SIZE'], css: cssVar(name) })
}
for (const [k, v] of Object.entries(t.font.lineHeight)) {
  const name = `font/line-height/${k}`
  tokens.push({ collection: 'Typography', name, type: 'FLOAT', value: v, scopes: ['LINE_HEIGHT'], css: cssVar(name) })
}
// Peso: no código é numérico (400/500/600); no Figma é FONT_STYLE (string).
// Guardamos os dois lados para que a paridade seja auditável.
const figmaStyleForWeight = { regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold' }
for (const [k, v] of Object.entries(t.font.weight)) {
  const name = `font/weight/${k}`
  tokens.push({
    collection: 'Typography',
    name,
    type: 'STRING',
    value: figmaStyleForWeight[k],
    cssValue: String(v),
    scopes: ['FONT_STYLE'],
    css: cssVar(name),
  })
}

writeFileSync('scripts/figma-tokens.json', JSON.stringify(tokens, null, 2) + '\n')
console.log(`${tokens.length} tokens -> scripts/figma-tokens.json`)
