const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const origin = process.env.COLMENA_QA_ORIGIN || 'http://127.0.0.1:4174'
const folder = path.join(__dirname, '../docs/home-destacados')
;(async () => {
  const browser = await chromium.launch({
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
  const checks = []
  const errors = []
  let intercepted = 0
  const check = (name, value) => {
    assert(value, name)
    checks.push(name)
    console.log('PASS', name)
  }
  try {
    for (const closed of [false, true]) {
      const c = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        reducedMotion: 'reduce',
        serviceWorkers: 'block',
      })
      await c.route('**/rest/v1/rpc/**', (r) => {
        intercepted++
        const name = new URL(r.request().url()).pathname.split('/').pop()
        return r.fulfill(
          name === 'resenas_publicas'
            ? { json: [] }
            : name === 'mis_pendientes'
              ? { json: { confirmar: [], calificar: [] } }
              : name === 'mi_cuenta'
                ? { json: null }
                : { status: 400, json: { message: 'RPC interceptada' } },
        )
      })
      await c.route('https://www.google.com/**', (r) => r.abort())
      await c.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
      const p = await c.newPage()
      p.on('pageerror', (e) => errors.push(e.message))
      await p.clock.install({
        time: new Date(
          closed ? '2026-11-05T05:01:00Z' : '2026-11-04T20:00:00Z',
        ),
      })
      await p.goto(origin)
      const hero = p.getByRole('region', { name: 'Destacado de la semana' })
      await hero.waitFor()
      await p.waitForTimeout(700)
      if (!closed) {
        check(
          'Anuncio antes del cierre',
          (await hero
            .getByRole('button', { name: /Participar en el reto/ })
            .count()) === 1,
        )
        check(
          'Sin ganador antes del cierre',
          (await hero.getByText('Tinta Viva', { exact: true }).count()) === 0,
        )
      } else {
        await hero.getByText('Tinta Viva', { exact: true }).waitFor()
        check('Ganador tras cierre: Valentina/Tinta Viva', true)
        check(
          'Ganador de ejemplo explícito',
          (await hero.getByText('Ejemplo', { exact: true }).count()) === 1,
        )
      }
      check(
        'Un solo carrusel de novedades',
        (await p
          .getByRole('region', { name: 'Esta semana', exact: true })
          .count()) === 1,
      )
      const allies = p.getByRole('region', {
        name: 'Descuentos con tu carnet',
        exact: true,
      })
      check(
        'Tres aliados identificados de ejemplo',
        (await allies.getByText('Ejemplo', { exact: true }).count()) === 3,
      )
      check('Sin la palabra DCV en el inicio', !/\bDCV\b/.test(await p.locator('.body').innerText()))
      check('Invitación para que un negocio se sume', (await allies.getByRole('button', { name: /¿Tienes un negocio\?/ }).count()) === 1)
      // Destacados: anillos y visor
      const fila = p.getByRole('navigation', { name: 'Destacados', exact: true })
      const nAnillos = await fila.getByRole('button').count()
      check('Fila de destacados con anillos (' + nAnillos + ')', nAnillos >= 4)
      await fila.getByRole('button').first().click()
      const visor = p.locator('dialog.visor')
      await visor.waitFor()
      check('Visor abre con foco dentro', await visor.evaluate((d) => d.contains(document.activeElement) && d.open))
      const barras = await visor.locator('.visor-prog i').count()
      check('Una barra de progreso por pantalla (' + barras + ')', barras >= 1)
      const t0 = await visor.locator('h2').first().innerText()
      await p.waitForTimeout(8000)
      check('Con movimiento reducido no avanza solo', (await visor.locator('h2').first().innerText()) === t0)
      await visor.press('ArrowRight')
      await visor.press('ArrowLeft')
      await p.keyboard.press('Escape')
      await p.waitForFunction(() => !document.querySelector('dialog.visor'))
      check('Escape cierra el visor', true)
      await p.waitForTimeout(300)
      check('Anillo visto se marca', (await fila.locator('.dest-item.visto').count()) >= 1)
      check('Visto queda guardado en localStorage', await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('colmena.destacados.vistos.v1') || '{}')).length >= 1))
      check(
        'No se intercala el carrusel viejo',
        (await p.locator('.movimiento').count()) === 0,
      )
      await allies.getByRole('button').first().click()
      const dialog = p.getByRole('dialog', { name: 'Detalle del aliado' })
      await dialog.waitFor()
      check(
        'Descuento abre su detalle y conserva Mostrar mi carnet',
        (await dialog
          .getByRole('button', { name: 'Mostrar mi carnet', exact: true })
          .count()) === 1,
      )
      await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click()
      if (closed) {
        await hero
          .getByRole('button', { name: 'Ver carnet', exact: true })
          .click()
        await p.locator('.home-carnet-premio').waitFor()
        check('Insignia activa en carnet', true)
        await p.locator('.home-insignia').waitFor()
        check('Premio presente en historial', true)
        await p.screenshot({
          path: path.join(folder, 'despues-carnet-ganador.png'),
        })
        await p.getByRole('button', { name: 'Volver', exact: true }).click()
      }
      const navigation = p.getByRole('navigation', {
        name: 'Navegación principal',
      })
      await navigation
        .getByRole('button', { name: 'Beneficios', exact: true })
        .click()
      await p
        .getByRole('heading', { name: 'Descuentos con tu carnet', exact: true })
        .waitFor()
      const order = await p.locator('.body').innerText()
      check(
        'Aliados antes de categorías digitales',
        order.indexOf('Descuentos con tu carnet') <
          order.indexOf('Para empezar tu emprendimiento'),
      )
      await c.close()
    }
    check('Sin errores JS en home y carnet', errors.length === 0)
    fs.writeFileSync(
      path.join(folder, 'resultados-home.json'),
      JSON.stringify(
        {
          date: new Date().toISOString(),
          passed: checks,
          errors,
          interceptedRpc: intercepted,
          productionWrites: 0,
        },
        null,
        2,
      ),
    )
  } finally {
    await browser.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
