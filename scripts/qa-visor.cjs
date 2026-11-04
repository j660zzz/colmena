// Visor de destacados con movimiento normal: avance solo, pausa al mantener, toques, deslizar y Escape.
// Uso: COLMENA_CHROMIUM=... node scripts/qa-visor.cjs  (con `npm run preview -- --port 4174` activo)
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const origin = process.env.COLMENA_QA_ORIGIN || 'http://127.0.0.1:4174'
;(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.COLMENA_CHROMIUM || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'],
    ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {})
  })
  const ok = (n, v) => { assert(v, n); console.log('PASS', n) }
  const c = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })
  await c.route('**/rest/v1/rpc/**', (r) => r.fulfill({ status: 400, json: { message: 'RPC interceptada' } }))
  await c.route('https://www.google.com/**', (r) => r.abort())
  await c.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
  const p = await c.newPage()
  const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  await p.goto(origin)
  const fila = p.getByRole('navigation', { name: 'Destacados', exact: true })
  await fila.waitFor()
  const abrir = async () => { await fila.getByRole('button', { name: /Descuentos/ }).click(); await p.locator('dialog.visor').waitFor() }
  const titulo = () => p.locator('dialog.visor h2').first().innerText()
  await abrir()
  const t0 = await titulo()
  await p.waitForTimeout(6800)
  const t1 = await titulo()
  ok('Avanza solo a la siguiente pantalla', t1 !== t0)
  const caja = await p.locator('dialog.visor .visor-pista').boundingBox()
  // Mantener presionado pausa
  await p.mouse.move(caja.x + 200, caja.y + 300); await p.mouse.down()
  await p.waitForTimeout(7500)
  ok('Mantener presionado pausa', (await titulo()) === t1)
  await p.mouse.up()
  // Tocar a la derecha adelanta y a la izquierda vuelve
  await p.mouse.click(caja.x + 360, caja.y + 300)
  const t2 = await titulo()
  ok('Tocar a la derecha adelanta', t2 !== t1)
  await p.mouse.click(caja.x + 20, caja.y + 300)
  ok('Tocar a la izquierda vuelve', (await titulo()) === t1)
  ok('Foco dentro del diálogo', await p.evaluate(() => document.querySelector('dialog.visor').contains(document.activeElement)))
  // Deslizar hacia abajo cierra
  await p.mouse.move(caja.x + 200, caja.y + 100); await p.mouse.down(); await p.mouse.move(caja.x + 200, caja.y + 400, { steps: 6 }); await p.mouse.up()
  await p.waitForFunction(() => !document.querySelector('dialog.visor'))
  ok('Deslizar hacia abajo cierra', true)
  await abrir()
  await p.keyboard.press('Escape')
  await p.waitForFunction(() => !document.querySelector('dialog.visor'))
  ok('Escape cierra', true)
  // Un fallo de almacenamiento no bloquea el contenido
  await c.addInitScript(() => { Storage.prototype.setItem = () => { throw new Error('bloqueado') } })
  const q = await c.newPage()
  q.on('pageerror', (e) => errores.push(e.message))
  await q.goto(origin)
  await q.getByRole('navigation', { name: 'Destacados', exact: true }).getByRole('button').first().click()
  await q.locator('dialog.visor').waitFor()
  ok('Sin almacenamiento el visor igual abre', true)
  ok('Sin errores JS', errores.length === 0)
  await browser.close()
})().catch((e) => { console.error(e); process.exit(1) })
