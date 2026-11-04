const { chromium } = require('playwright')
const path = require('node:path')
const folder = path.join(__dirname, '../docs/home-destacados')
const origin = process.env.COLMENA_QA_ORIGIN || 'http://127.0.0.1:4174'
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
  const phase = process.env.PHASE || 'despues'
  for (const member of [false, true])
    for (const after of [false, true]) {
      const c = await b.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      })
      await c.route('**/rest/v1/rpc/**', (r) =>
        r.fulfill({
          status: 400,
          json: { message: 'RPC interceptada para QA' },
        }),
      )
      await c.route('https://www.google.com/**', (r) => r.abort())
      await c.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
      const p = await c.newPage()
      await p.clock.install({
        time: new Date(after ? '2026-11-05T05:01:00Z' : '2026-11-04T20:00:00Z'),
      })
      let profiles = []
      p.on('response', async (r) => {
        if (new URL(r.url()).pathname === '/rest/v1/perfiles')
          profiles = await r.json().catch(() => profiles)
      })
      await p.goto(origin)
      await p.locator('article.post').first().waitFor()
      if (member) {
        await p.evaluate(
          (id) =>
            localStorage.setItem(
              'colmena.sesion.v1',
              JSON.stringify({ id, clave: 'solo-qa-ficticia' }),
            ),
          profiles.find((x) => x.es_ejemplo).id,
        )
        await p.reload()
        await p.locator('article.post').first().waitFor()
      }
      await p.waitForTimeout(1200)
      await p.locator('.toast.on').waitFor({ state: 'hidden', timeout: 6000 })
      const name = `${phase}-${member ? 'miembro' : 'visitante'}-${after ? 'cerrado' : 'abierto'}`
      await p.screenshot({ path: `${folder}/${name}.png` })
      await p.locator('.body').evaluate((e) => (e.scrollTop = 400))
      await p.screenshot({ path: `${folder}/${name}-vitrinas.png` })
      // Visor de destacados (primer anillo) y vitrina intercalada entre publicaciones
      if (phase !== 'antes' && phase !== 'antes-pr') {
        const fila = p.getByRole('navigation', { name: 'Destacados', exact: true })
        await p.locator('.body').evaluate((e) => (e.scrollTop = 0))
        await fila.getByRole('button').first().click()
        await p.locator('dialog.visor').waitFor()
        await p.waitForTimeout(400)
        await p.screenshot({ path: `${folder}/${name}-visor.png` })
        if (!member && !after) {
          await p.keyboard.press('ArrowRight')
          await p.waitForTimeout(300)
          await p.screenshot({ path: `${folder}/${phase}-visor-reto.png` })
          await p.keyboard.press('Escape')
          await fila.getByRole('button', { name: /Descuentos/ }).click()
          await p.waitForTimeout(400)
          await p.screenshot({ path: `${folder}/${phase}-visor-descuento.png` })
        }
        await p.keyboard.press('Escape')
        await p.locator('dialog.visor').waitFor({ state: 'detached' })
        await p.locator('.home-semana').scrollIntoViewIfNeeded()
        await p.waitForTimeout(300)
        await p.screenshot({ path: `${folder}/${name}-intercalada.png` })
      }
      if (!member && !after) {
        await p
          .getByRole('navigation', { name: 'Navegación principal' })
          .getByRole('button', { name: 'Beneficios', exact: true })
          .click()
        await p.waitForTimeout(700)
        await p.screenshot({ path: `${folder}/${phase}-beneficios.png` })
      }
      await c.close()
    }
  await b.close()
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
