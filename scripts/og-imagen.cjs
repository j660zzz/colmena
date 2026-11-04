// Genera public/og-colmena.png (1200 × 630), la imagen de vista previa al compartir el link.
// Marca v2.0: fondo Polen plano, símbolo y textos en Tinta. Todo centrado para que el recorte
// cuadrado de WhatsApp conserve el símbolo, el nombre y la frase.
// Uso: COLMENA_CHROMIUM=... node scripts/og-imagen.cjs
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')
const svg = fs.readFileSync(path.join(__dirname, '../public/logo-celda.svg'), 'utf8')
const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@600&family=Space+Grotesk:wght@700&display=block" rel="stylesheet">
<style>
  html, body { margin: 0; }
  body { width: 1200px; height: 630px; background: #FFF200; color: #0F0F0D; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0; }
  .simbolo { width: 150px; height: 168px; margin-bottom: 28px; }
  .simbolo svg { width: 100%; height: 100%; display: block; }
  h1 { margin: 0; font: 700 128px/1 'Space Grotesk', sans-serif; letter-spacing: -.05em; }
  p { margin: 22px 0 0; font: 600 38px/1.2 'Hanken Grotesk', sans-serif; letter-spacing: -.01em; }
</style></head><body>
  <div class="simbolo">${svg}</div>
  <h1>Colmena</h1>
  <p>Tu comunidad para emprender</p>
</body></html>`
;(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.COLMENA_CHROMIUM || '/usr/bin/chromium', args: ['--no-sandbox'],
    ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY } } : {})
  })
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  const salida = path.join(__dirname, '../public/og-colmena.png')
  await page.screenshot({ path: salida })
  await browser.close()
  console.log(salida, fs.statSync(salida).size, 'bytes')
})().catch((e) => { console.error(e); process.exit(1) })
