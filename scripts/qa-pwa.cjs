const path = require('node:path')
const origin = process.env.COLMENA_QA_ORIGIN || 'http://127.0.0.1:4174'
const folder = path.join(__dirname, '../docs/fiabilidad-flujos')
const { chromium } = require('playwright')
const fs = require('fs')
const assert = require('node:assert/strict')
fs.mkdirSync(folder, { recursive: true })
fs.rmSync(path.join(folder, 'pwa-resultados.json'), { force: true })
;(async () => {
  const b = await chromium.launch({
    executablePath: process.env.COLMENA_CHROMIUM || '/usr/bin/chromium',
    headless: true,
    ...(process.env.HTTPS_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY,
            bypass: '127.0.0.1,localhost',
          },
        }
      : {}),
    args: ['--no-sandbox'],
  })
  const c = await b.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  })
  const p = await c.newPage()
  const results = []
  let writes = 0
  const check = (name, ok) => {
    assert(ok, name)
    results.push(name)
    console.log('PASS', name)
  }
  await c.route('**/rest/v1/rpc/**', (r) => {
    if (r.request().url().includes('resenas_publicas')) return r.continue()
    writes++
    return r.abort()
  })
  await c.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
  try {
    await p.goto(origin)
    await p.locator('article.post').first().waitFor()
    await p.evaluate(() => navigator.serviceWorker.ready)
    await p.reload()
    await p.locator('article.post').first().waitFor()
    check(
      'PWA controlada por service worker',
      await p.evaluate(() => !!navigator.serviceWorker.controller),
    )
    let requests = 0
    p.on('request', (r) => {
      if (r.url().includes('/rest/v1/')) requests++
    })
    await p.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'))
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await p.waitForTimeout(250)
    check('No recarga datos frescos al volver al primer plano', requests === 0)
    await p.getByRole('button', { name: 'Crear carnet', exact: true }).click()
    await p.getByLabel('Nombre *', { exact: true }).fill('Borrador local PWA')
    await p.evaluate(() =>
      navigator.serviceWorker.dispatchEvent(new Event('controllerchange')),
    )
    await p
      .getByText('Hay una nueva versión. Recarga cuando termines de editar.', {
        exact: true,
      })
      .waitFor()
    check(
      'Una actualización no interrumpe el formulario',
      (await p.getByLabel('Nombre *', { exact: true }).inputValue()) ===
        'Borrador local PWA',
    )
    await c.setOffline(true)
    const t = Date.now()
    await p.goto(origin)
    await p
      .getByText('No pudimos cargar estos datos', { exact: true })
      .waitFor({ timeout: 10000 })
    check(
      'Error de conexión disponible antes de 8 segundos',
      Date.now() - t < 8000,
    )
    const nav = p.getByRole('navigation', { name: 'Navegación principal' })
    await nav.getByRole('button', { name: 'Beneficios', exact: true }).click()
    await p.getByRole('button', { name: /Abrir calculadora/ }).click()
    await p.locator('.price').waitFor()
    check('Chunk de calculadora disponible sin conexión', true)
    await p.getByLabel('Horas de trabajo', { exact: true }).fill('0')
    check(
      'Calculadora funciona sin conexión',
      (await p.locator('.price').innerText()).replace(/\D/g, '') === '465750',
    )
    await p.screenshot({
      path: path.join(folder, 'despues-calculadora-offline.png'),
    })
    fs.writeFileSync(
      path.join(folder, 'pwa-resultados.json'),
      JSON.stringify(
        {
          runAt: new Date().toISOString(),
          passed: results,
          productionWrites: 0,
          interceptedRpc: writes,
        },
        null,
        2,
      ),
    )
  } finally {
    await b.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
