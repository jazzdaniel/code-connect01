/**
 * Compila src/tokens/tokens.ts e importa o resultado, para os outros scripts
 * lerem os tokens do MESMO arquivo que a aplicação usa (sem duplicar valores).
 */
import { mkdtempSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function loadTokens() {
  const out = mkdtempSync(join(tmpdir(), 'tokens-'))
  execSync(
    `npx tsc src/tokens/tokens.ts --outDir ${out} --module esnext --target es2020 --moduleResolution bundler`,
    { stdio: ['ignore', 'ignore', 'inherit'] },
  )
  return import(pathToFileURL(join(out, 'tokens.js')).href)
}

/** nome da Figma Variable -> nome da CSS custom property */
export const cssVar = (figmaName) => {
  if (figmaName.startsWith('font/line-height/')) return `--line-height-${figmaName.split('/').pop()}`
  if (figmaName === 'font/family') return '--font-family'
  return `--${figmaName.replace(/\//g, '-')}`
}

/** achata os tokens no formato consumido pelo Figma e pelos verificadores */
export function flatten(t) {
  const rows = []

  // primitivos: 1 valor, scopes vazios (invisíveis nos pickers)
  for (const [family, ramp] of Object.entries(t.color)) {
    for (const [step, hex] of Object.entries(ramp)) {
      const name = `color/${family}/${step}`
      rows.push({ collection: 'Primitives', name, type: 'COLOR', value: hex, scopes: [], css: cssVar(name) })
    }
  }

  // semânticos: um valor POR MODO (marca), cada um alias de um primitivo
  const primByHex = new Map()
  for (const [family, ramp] of Object.entries(t.color)) {
    for (const [step, hex] of Object.entries(ramp)) {
      if (!primByHex.has(hex)) primByHex.set(hex, `color/${family}/${step}`)
    }
  }
  const scopesFor = (name) =>
    name.startsWith('text/') ? ['TEXT_FILL']
      : name.startsWith('border/') ? ['STROKE_COLOR']
      : ['FRAME_FILL', 'SHAPE_FILL']

  const semanticNames = Object.keys(t.semantic[t.brands[0]])
  for (const name of semanticNames) {
    const valuesByMode = {}
    const aliasByMode = {}
    for (const brand of t.brands) {
      const hex = t.semantic[brand][name]
      valuesByMode[brand] = hex
      aliasByMode[brand] = primByHex.get(hex)
      if (!aliasByMode[brand]) throw new Error(`semântico ${name}/${brand}: ${hex} não é um primitivo`)
    }
    rows.push({
      collection: 'Color', name, type: 'COLOR',
      valuesByMode, aliasByMode, scopes: scopesFor(name), css: cssVar(name),
    })
  }

  for (const [k, v] of Object.entries(t.space))
    rows.push({ collection: 'Spacing', name: `space/${k}`, type: 'FLOAT', value: v, scopes: ['GAP', 'WIDTH_HEIGHT'], css: cssVar(`space/${k}`) })
  for (const [k, v] of Object.entries(t.radius))
    rows.push({ collection: 'Spacing', name: `radius/${k}`, type: 'FLOAT', value: v, scopes: ['CORNER_RADIUS'], css: cssVar(`radius/${k}`) })
  for (const [k, v] of Object.entries(t.size))
    rows.push({ collection: 'Spacing', name: `size/${k}`, type: 'FLOAT', value: v, scopes: ['WIDTH_HEIGHT'], css: cssVar(`size/${k}`) })
  rows.push({ collection: 'Spacing', name: 'border/width/thin', type: 'FLOAT', value: t.border.width.thin, scopes: ['STROKE_FLOAT'], css: '--border-width-thin' })

  rows.push({ collection: 'Typography', name: 'font/family', type: 'STRING', value: t.font.family, scopes: ['FONT_FAMILY'], css: '--font-family' })
  for (const [k, v] of Object.entries(t.font.size))
    rows.push({ collection: 'Typography', name: `font/size/${k}`, type: 'FLOAT', value: v, scopes: ['FONT_SIZE'], css: cssVar(`font/size/${k}`) })
  for (const [k, v] of Object.entries(t.font.lineHeight))
    rows.push({ collection: 'Typography', name: `font/line-height/${k}`, type: 'FLOAT', value: v, scopes: ['LINE_HEIGHT'], css: cssVar(`font/line-height/${k}`) })
  const figmaStyle = { regular: 'Regular', medium: 'Medium', semibold: 'Semi Bold' }
  for (const [k, v] of Object.entries(t.font.weight))
    rows.push({ collection: 'Typography', name: `font/weight/${k}`, type: 'STRING', value: figmaStyle[k], cssValue: String(v), scopes: ['FONT_STYLE'], css: cssVar(`font/weight/${k}`) })

  return rows
}
