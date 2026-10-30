// Íconos v2.0: rasterización del SVG oficial, sin reinterpretar la celda.
import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const publicFile = (name) => new URL('../public/' + name, import.meta.url)
const symbol = readFileSync(publicFile('logo-celda.svg'), 'utf8').trim()

function icon(size, rounded = false) {
  // 58% del lado en altura; se conserva la proporción 84:94 del viewBox oficial.
  const height = size * 0.58
  const width = height * 84 / 94
  const placed = symbol.replace('<svg ', `<svg x="${(size - width) / 2}" y="${(size - height) / 2}" width="${width}" height="${height}" `)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${rounded ? size * 0.23 : 0}" fill="#FFF200"/>${placed}</svg>`
}

writeFileSync(publicFile('favicon.svg'), icon(64, true))
for (const [name, size] of [['icon-192.png', 192], ['icon-512.png', 512], ['icon-maskable-512.png', 512], ['apple-touch-icon.png', 180]]) {
  await sharp(Buffer.from(icon(size))).png().toFile(fileURLToPath(publicFile(name)))
}
console.log('Íconos v2.0 generados desde el SVG oficial.')
