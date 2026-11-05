// Proyectos del carnet: sección en un carnet de ejemplo, detalle, editor y formulario.
// Todas las RPC se interceptan (nunca se escribe en la base). Uso: COLMENA_CHROMIUM=... node scripts/qa-proyectos.cjs
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const origin = process.env.COLMENA_QA_ORIGIN || 'http://127.0.0.1:4174'
;(async () => {
  const b = await chromium.launch({ executablePath: process.env.COLMENA_CHROMIUM || '/usr/bin/chromium', headless: true, args: ['--no-sandbox'],
    ...(process.env.HTTPS_PROXY ? { proxy: { server: process.env.HTTPS_PROXY, bypass: '127.0.0.1,localhost' } } : {}) })
  const ok = (n, v) => { assert(v, n); console.log('PASS', n) }
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block', reducedMotion: 'reduce' })
  const llamadas = []
  await c.route('**/rest/v1/rpc/**', (r) => {
    const n = new URL(r.request().url()).pathname.split('/').pop()
    llamadas.push({ n, body: r.request().postDataJSON?.() })
    if (n === 'resenas_publicas') return r.fulfill({ json: [] })
    if (n === 'mis_pendientes') return r.fulfill({ json: { confirmar: [], calificar: [] } })
    if (n === 'guardar_proyecto') return r.fulfill({ status: 400, json: { message: 'Puedes mostrar hasta 4 proyectos. Borra uno para agregar otro.' } })
    return r.fulfill({ status: 400, json: { message: 'RPC interceptada' } })
  })
  await c.route('https://www.google.com/**', (r) => r.abort())
  await c.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
  const p = await c.newPage(); const errores = []
  p.on('pageerror', (e) => errores.push(e.message))
  let perfiles = []
  p.on('response', async (r) => { if (new URL(r.url()).pathname === '/rest/v1/perfiles') perfiles = await r.json().catch(() => perfiles) })
  await p.goto(origin); await p.locator('article.post').first().waitFor()
  const ej = perfiles.find((x) => x.es_ejemplo)
  await p.goto(`${origin}/?carnet=${ej.id}`)
  const sec = p.locator('.proyectos-sec'); await sec.waitFor()
  const n = await sec.locator('.proy-card').count()
  ok(`Carnet de ejemplo muestra proyectos (${n})`, n >= 1 && n <= 4)
  ok('Proyectos de ejemplo llevan la etiqueta Ejemplo', (await sec.getByText('Ejemplo', { exact: true }).count()) >= 1)
  ok('Cada proyecto tiene portada generada', (await sec.locator('.proy-card .portada .celda').count()) === n)
  await sec.locator('.proy-card').first().click()
  const det = p.getByRole('dialog', { name: 'Detalle del proyecto' }); await det.waitFor()
  ok('El detalle abre con título y portada grande', (await det.locator('h2').count()) === 1 && (await det.locator('.portada.grande').count()) === 1)
  ok('Proyecto de ejemplo no envía a sitios externos', (await det.locator('a[href^="http"]').count()) === 0)
  await p.keyboard.press('Escape')
  // Miembro ficticio: editor
  await p.evaluate((id) => localStorage.setItem('colmena.sesion.v1', JSON.stringify({ id, clave: 'solo-qa' })), ej.id)
  await p.goto(origin); await p.locator('article.post').first().waitFor()
  await p.getByRole('navigation', { name: 'Navegación principal' }).getByRole('button', { name: 'Carnet', exact: true }).click()
  await p.getByRole('button', { name: /Editar/ }).first().click()
  const ed = p.locator('.proy-editor'); await ed.waitFor()
  ok('Editor muestra el conteo de proyectos', /\d de 4/.test(await ed.locator('.meta').innerText()))
  ok('Editor no está dentro del formulario del perfil', (await p.locator('form .proy-editor').count()) === 0)
  if (await ed.getByRole('button', { name: 'Agregar proyecto' }).count()) {
    await ed.getByRole('button', { name: 'Agregar proyecto' }).click()
    const f = p.getByRole('dialog', { name: 'Agregar proyecto' }); await f.waitFor()
    const btn = f.getByRole('button', { name: 'Guardar proyecto' })
    ok('Guardar desactivado sin nombre', await btn.isDisabled())
    await f.locator('#pr-t').fill('Proyecto de prueba QA')
    await f.locator('#pr-a').fill('20')
    ok('Año inválido avisa y desactiva', (await f.getByText('Escribe un año de 4 cifras.').count()) === 1 && await btn.isDisabled())
    await f.locator('#pr-a').fill('2026')
    await btn.click()
    await f.locator('.err').waitFor()
    const llamada = llamadas.find((x) => x.n === 'guardar_proyecto')
    ok('Envía guardar_proyecto con los datos (interceptado)', llamada && llamada.body.p_titulo === 'Proyecto de prueba QA' && llamada.body.p_anio === 2026)
    ok('Muestra el error del servidor en el formulario', /hasta 4 proyectos/.test(await f.locator('.err').innerText()))
  }
  ok('Sin errores JS', errores.length === 0)
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
