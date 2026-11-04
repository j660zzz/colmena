const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('fs')
const path = require('node:path')
const origin = process.env.COLMENA_QA_ORIGIN || 'http://127.0.0.1:4174'
const folder = path.join(__dirname, '../docs/fiabilidad-flujos')
const startedAt = new Date().toISOString()
fs.mkdirSync(folder, { recursive: true })
fs.rmSync(path.join(folder, 'resultados.json'), { force: true })
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
  let passed = []
  let errors = []
  let blocked = []
  const check = (name, value) => {
    assert(value, name)
    passed.push(name)
    console.log('PASS', name)
  }
  const context = async (intro = false) => {
    const c = await b.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
    })
    await c.route('**/rest/v1/rpc/**', (r) => {
      if (r.request().url().includes('resenas_publicas')) return r.continue()
      blocked.push(new URL(r.request().url()).pathname)
      return r.fulfill({
        status: 400,
        json: { message: 'Error simulado de auditoría' },
      })
    })
    await c.route('https://www.google.com/**', (r) => r.abort())
    if (!intro)
      await c.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
    return c
  }
  const page = async (c) => {
    const p = await c.newPage()
    p.setDefaultTimeout(15000)
    p.on('pageerror', (e) => errors.push(e.message))
    return p
  }
  const nav = (p) => p.getByRole('navigation', { name: 'Navegación principal' })
  const save = async (p, name) => {
    await p.waitForTimeout(100)
    await p.screenshot({ path: `${folder}/${name}.png` })
  }
  try {
    // A delayed optional source must not hold the Muro or the local calculator hostage.
    {
      const c = await context()
      await c.route('**/rest/v1/beneficios?*', async (r) => {
        await new Promise((ok) => setTimeout(ok, 7000))
        try {
          await r.fulfill({ status: 503, json: { message: 'slow' } })
        } catch {}
      })
      const p = await page(c)
      const inicio = Date.now()
      await p.goto(origin)
      await p.locator('article.post').first().waitFor({ timeout: 4000 })
      check('Muro disponible con Beneficios pendiente', true)
      await nav(p)
        .getByRole('button', { name: 'Beneficios', exact: true })
        .click()
      await p
        .getByRole('button', { name: /Abrir calculadora/ })
        .waitFor({ timeout: 1000 })
      check('Calculadora accesible durante carga de Beneficios', true)
      await save(p, 'despues-carga-parcial')
      await p.getByRole('button', { name: /Abrir calculadora/ }).click()
      await p.getByLabel(/Ganancia sobre el costo/).waitFor()
      check('Etiqueta precisa de ganancia', true)
      check(
        'Cálculo inicial sin cambios',
        (await p.locator('.price').innerText()).replace(/\D/g, '') ===
          '1127250',
      )
      await p.getByRole('button', { name: 'Volver', exact: true }).click()
      await p
        .getByText('No pudimos cargar estos datos', { exact: true })
        .waitFor({ timeout: 8000 })
      check(
        'Consulta lenta termina con opción de reintentar antes de 8 s',
        Date.now() - inicio < 8000,
      )
      await c.close()
    }
    // Complete backend outage: never present unknown as zero or empty.
    {
      const c = await context()
      await c.route('**/rest/v1/**', (r) => r.abort('internetdisconnected'))
      const p = await page(c)
      await p.goto(origin)
      await p
        .getByText('No pudimos cargar estos datos', { exact: true })
        .waitFor()
      check(
        'Error diferenciado de vacío',
        (await p
          .getByText('Todavía no hay publicaciones', { exact: true })
          .count()) === 0,
      )
      check(
        'Sin cifras cero no verificadas',
        (await p.getByText('personas piden ayuda', { exact: true }).count()) ===
          0,
      )
      await save(p, 'despues-error-red')
      await nav(p)
        .getByRole('button', { name: 'Beneficios', exact: true })
        .click()
      await p.getByRole('button', { name: /Abrir calculadora/ }).click()
      await p.locator('.price').waitFor()
      check('Calculadora sin conexión al backend', true)
      await c.close()
    }
    const c = await context()
    const p = await page(c)
    let profiles = []
    p.on('response', async (r) => {
      if (new URL(r.url()).pathname === '/rest/v1/perfiles')
        profiles = await r.json().catch(() => profiles)
    })
    await p.goto(origin)
    await p.locator('article.post').first().waitFor()
    await nav(p).getByRole('button', { name: 'Miembros', exact: true }).click()
    await p.getByRole('searchbox').fill('Sara')
    await p.locator('.member2').first().click()
    await p.getByRole('button', { name: 'Volver', exact: true }).click()
    check(
      'Búsqueda conservada al volver',
      (await p.getByRole('searchbox').inputValue()) === 'Sara',
    )
    await save(p, 'despues-busqueda')
    await p.getByRole('searchbox').fill('')
    await p.locator('.member2').last().scrollIntoViewIfNeeded()
    const scrollAntes = await p.locator('.body').evaluate((e) => e.scrollTop)
    await p.locator('.member2').last().click()
    await p.getByRole('button', { name: 'Volver', exact: true }).click()
    const scrollDespues = await p.locator('.body').evaluate((e) => e.scrollTop)
    check(
      'Posición de lectura conservada al volver',
      scrollAntes > 0 && Math.abs(scrollAntes - scrollDespues) < 2,
    )
    await nav(p).getByRole('button', { name: 'Muro', exact: true }).click()
    await p.getByRole('button', { name: 'Crear carnet', exact: true }).click()
    await p.getByLabel('Nombre *', { exact: true }).fill('Auditoría local')
    await p.getByRole('button', { name: 'Siguiente', exact: true }).click()
    await p.getByLabel('WhatsApp *', { exact: true }).fill('3105550142')
    await p.getByRole('checkbox').check()
    await p.getByRole('button', { name: 'Siguiente', exact: true }).click()
    await p.goBack()
    await p.getByText('Paso 2 de 3 · Contacto', { exact: true }).waitFor()
    check('Atrás del navegador retrocede un paso', true)
    check(
      'Contacto conservado',
      (await p.getByLabel('WhatsApp *', { exact: true }).inputValue()) ===
        '310 555 0142',
    )
    await save(p, 'despues-atras-registro')
    await p.reload()
    await p.getByRole('button', { name: 'Crear carnet', exact: true }).click()
    check(
      'Registro conservado tras recarga',
      (await p.getByLabel('WhatsApp *', { exact: true }).inputValue()) ===
        '310 555 0142',
    )
    const sara = profiles.find((x) => x.es_ejemplo && x.nombre.includes('Sara'))
    await p.evaluate((id) => {
      localStorage.setItem(
        'colmena.sesion.v1',
        JSON.stringify({ id, clave: 'audit-local-invalid' }),
      )
    }, sara.id)
    await p.goto(origin)
    await p.locator('article.post').first().waitFor()
    await p
      .getByRole('button', {
        name: '¿Qué necesitas o qué ofreces?',
        exact: true,
      })
      .click()
    let d = p.getByRole('dialog', { name: 'Publicar en el muro', exact: true })
    await d.getByRole('textbox').fill('Borrador local conservado.')
    await d.getByRole('button', { name: 'Marca', exact: true }).click()
    await d.getByRole('button', { name: 'Cerrar', exact: true }).click()
    await p
      .getByRole('button', {
        name: '¿Qué necesitas o qué ofreces?',
        exact: true,
      })
      .click()
    check(
      'Borrador conservado al cerrar',
      (await d.getByRole('textbox').inputValue()) ===
        'Borrador local conservado.',
    )
    check(
      'Categorías conservadas',
      (await d
        .getByRole('button', { name: 'Marca', exact: true })
        .getAttribute('aria-pressed')) === 'true',
    )
    await save(p, 'despues-borrador')
    await p.goBack()
    check(
      'Atrás cierra el composer',
      (await d.count()) === 0 || !(await d.isVisible()),
    )
    await p.reload()
    await p
      .getByRole('button', {
        name: '¿Qué necesitas o qué ofreces?',
        exact: true,
      })
      .click()
    d = p.getByRole('dialog', { name: 'Publicar en el muro', exact: true })
    check(
      'Borrador conservado tras recarga',
      (await d.getByRole('textbox').inputValue()) ===
        'Borrador local conservado.',
    )
    await d.getByRole('button', { name: 'Cerrar', exact: true }).click()
    // Sharing is observed locally: no message or external navigation.
    const own = p
      .locator('article.post')
      .filter({
        has: p.getByRole('button', { name: 'Borrar publicación', exact: true }),
      })
      .first()
    await own.waitFor()
    await p.evaluate(() => {
      window.open = (url) => {
        window.__shared = url
        return null
      }
    })
    await own.getByRole('button', { name: 'Compartir', exact: true }).click()
    const shared = await p.evaluate(() => window.__shared)
    const text = new URL(shared).searchParams.get('text')
    const link = text.match(/https?:\/\/[^\s]+\/\?publicacion=\S+/)?.[0]
    check('Enlace apunta a la publicación', !!link)
    const detail = await page(c)
    await detail.goto(link)
    await detail
      .getByRole('heading', { name: 'Publicación', exact: true })
      .waitFor()
    await detail.locator('article.post').waitFor()
    check('Enlace compartido abre la tarjeta', true)
    await detail.reload()
    await detail.locator('article.post').waitFor()
    check('Enlace compartido resiste recarga', true)
    await detail.close()
    const title = await own.locator('.post-lead').innerText()
    p.on('dialog', (d) => d.accept())
    await own
      .getByRole('button', { name: 'Borrar publicación', exact: true })
      .click()
    await p.locator('.toast.on').waitFor()
    check(
      'Publicación permanece si falla el borrado',
      (await p.getByText(title, { exact: true }).count()) === 1,
    )
    await save(p, 'despues-borrado-fallido')
    await c.route('**/rest/v1/rpc/publicar', (r) => {
      blocked.push('/rest/v1/rpc/publicar')
      return r.fulfill({ json: '00000000-0000-4000-8000-000000000001' })
    })
    await c.route('**/rest/v1/publicaciones?*', (r) =>
      r.fulfill({ status: 503, json: { message: 'lectura fallida simulada' } }),
    )
    await p
      .getByRole('button', {
        name: '¿Qué necesitas o qué ofreces?',
        exact: true,
      })
      .click()
    d = p.getByRole('dialog', { name: 'Publicar en el muro', exact: true })
    await d.getByRole('button', { name: 'Publicar', exact: true }).click()
    await p
      .getByRole('heading', { name: 'Tu publicación se guardó', exact: true })
      .waitFor()
    check('Guardado confirmado no se presenta como envío fallido', true)
    check(
      'Borrador se limpia tras publicación confirmada',
      await p.evaluate(
        () =>
          !Object.keys(sessionStorage).some(
            (k) =>
              k.startsWith('colmena.borrador.publicacion.') &&
              sessionStorage.getItem(k).includes('Borrador local conservado'),
          ),
      ),
    )
    await save(p, 'despues-guardado-confirmado')
    await c.close()
    {
      const c = await context(true)
      const p = await page(c)
      await p.goto(origin)
      const intro = p.getByRole('dialog', { name: 'Bienvenida a Colmena' })
      await intro.waitFor()
      for (let i = 0; i < 8; i++) {
        await p.keyboard.press('Tab')
        check(
          `Foco dentro de bienvenida ${i + 1}`,
          await p.locator(':focus').evaluate((e) => !!e.closest('.intro')),
        )
      }
      await intro
        .getByRole('button', { name: 'Siguiente', exact: true })
        .click()
      const before = await p.locator('.demo2-dice').innerText()
      await p.waitForTimeout(4500)
      check(
        'Demo estática con movimiento reducido',
        (await p.locator('.demo2-dice').innerText()) === before,
      )
      await save(p, 'despues-movimiento-reducido')
      await intro.getByRole('button', { name: 'Saltar', exact: true }).click()
      await nav(p)
        .getByRole('button', { name: 'Beneficios', exact: true })
        .click()
      await p.getByRole('button', { name: /Abrir calculadora/ }).waitFor()
      const targets = await p
        .locator('.sec-h .ver,button.chip,.bchips button')
        .evaluateAll((es) =>
          es
            .filter((e) => e.checkVisibility())
            .map((e) => {
              let r = e.getBoundingClientRect()
              return { label: e.textContent, h: r.height, w: r.width }
            }),
        )
      check(
        'Objetivos táctiles revisados de 44 px',
        targets.every((x) => x.h >= 44 && x.w >= 44),
      )
      await save(p, 'despues-beneficios')
      await c.close()
    }
    {
      const c = await context()
      await c.addInitScript(() =>
        sessionStorage.setItem(
          'colmena.borrador.registro.v1',
          JSON.stringify({
            paso: 3,
            acepto: true,
            f: {
              nombre: 'Prueba local',
              marca: '',
              rol: '',
              whatsapp: '310 555 0142',
              instagram: '',
              categorias: ['Marca'],
              habilidades: ['Identidad'],
            },
          }),
        ),
      )
      const p = await page(c)
      await p.goto(origin)
      await p.locator('article.post').first().waitFor()
      await p.getByRole('button', { name: 'Crear carnet', exact: true }).click()
      await p.getByText('Paso 3 de 3 · Lo que haces', { exact: true }).waitFor()
      await c.route('**/rest/v1/perfiles?*', (r) =>
        r.fulfill({
          status: 503,
          json: { message: 'lectura fallida simulada' },
        }),
      )
      await c.route('**/rest/v1/rpc/crear_perfil', (r) => {
        blocked.push('/rest/v1/rpc/crear_perfil')
        return r.fulfill({
          json: {
            id: '00000000-0000-4000-8000-000000000002',
            clave: 'solo-fixture-local',
            carnet: 9999,
          },
        })
      })
      await p.getByRole('button', { name: 'Crear carnet', exact: true }).click()
      await p
        .getByRole('heading', { name: 'Tu carnet se creó', exact: true })
        .waitFor()
      check(
        'Carnet confirmado se conserva si falla lectura posterior',
        await p.evaluate(
          () =>
            JSON.parse(localStorage.getItem('colmena.sesion.v1')).id ===
            '00000000-0000-4000-8000-000000000002',
        ),
      )
      await c.close()
    }
    check('Sin errores de JavaScript', errors.length === 0)
    fs.writeFileSync(
      `${folder}/resultados.json`,
      JSON.stringify(
        {
          startedAt,
          passed,
          errors,
          productionWrites: 0,
          interceptedRpc: blocked,
        },
        null,
        2,
      ),
    )
    console.log('TOTAL', passed.length)
  } finally {
    await b.close()
  }
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
