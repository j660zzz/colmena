// Genera los íconos de la PWA a partir de la celda abierta de Colmena
import sharp from 'sharp'
import { writeFileSync } from 'node:fs'

function hexPts(cx, cy, r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (60 * i - 90) * Math.PI / 180
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
  })
}
// Celda abierta: anillo hexagonal sin la arista superior derecha (la apertura = conexión) + núcleo ámbar
function celda(cx, cy, r, stroke, sw) {
  const p = hexPts(cx, cy, r)            // 0 arriba, 1 sup-der, 2 inf-der, 3 abajo, 4 inf-izq, 5 sup-izq
  const orden = [1, 2, 3, 4, 5, 0]       // se omite el tramo 0→1
  const d = orden.map((i, k) => (k ? 'L' : 'M') + p[i][0].toFixed(1) + ' ' + p[i][1].toFixed(1)).join(' ')
  const core = hexPts(cx, cy, r * 0.36).map((q) => q.map((n) => n.toFixed(1)).join(',')).join(' ')
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"/>
<polygon points="${core}" fill="#F5A623"/>`
}
const icono = (size, pad) => {
  const r = size * (0.5 - pad) * 0.62
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
<rect width="${size}" height="${size}" fill="#17140F"/>
${celda(size / 2, size / 2, r, '#F7F3EB', r * 0.2)}
</svg>`
}
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#17140F"/>${celda(32, 32, 19, '#F7F3EB', 4.2)}</svg>`
writeFileSync('public/favicon.svg', favicon)
writeFileSync('public/logo-celda.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${celda(32, 32, 26, '#17140F', 5.5)}</svg>`)

const out = [['icon-192.png', 192, 0.08], ['icon-512.png', 512, 0.08], ['icon-maskable-512.png', 512, 0.18], ['apple-touch-icon.png', 180, 0.1]]
for (const [name, size, pad] of out) {
  await sharp(Buffer.from(icono(size, pad))).png().toFile('public/' + name)
}
console.log('íconos listos')
