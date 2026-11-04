// Prueba real de punta a punta contra producción (Supabase) en la versión de prueba.
// Uso: node docs/qa/prueba-real/escrituras-reales.playwright.js <carpeta-capturas>  (cambia APP si la URL de prueba es otra)
// Crea dos carnets de prueba y al final los borra desde la app (borrar_perfil borra en cascada).
const { chromium, devices } = require('playwright')
const OUT = process.argv[2]
const APP = 'https://deploy-preview-6--colmena-dcv.netlify.app/'
const res = []
const ok = (paso, cond, extra = '') => { res.push(`${cond ? 'OK  ' : 'FALLA'} ${paso}${extra ? ' · ' + extra : ''}`) }
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function telefono(browser, dev) {
  const ctx = await browser.newContext({ ...devices[dev], locale: 'es-CO', timezoneId: 'America/Bogota' })
  const wa = []
  await ctx.route(/https:\/\/(wa\.me|api\.whatsapp\.com)\/.*/, (r) => { wa.push(r.request().url()); r.fulfill({ status: 200, contentType: 'text/html', body: '<p>WhatsApp (interceptado en la prueba)</p>' }) })
  // La barra de Netlify de las versiones de prueba tapa los botones de abajo en el celular (no existe en producción)
  await ctx.addInitScript(() => {
    const quitar = () => document.querySelectorAll('[data-netlify-deploy-id]').forEach((e) => e.remove())
    new MutationObserver(quitar).observe(document, { childList: true, subtree: true })
  })
  const p = await ctx.newPage()
  p.on('dialog', (d) => d.accept())
  const errs = []; p.on('pageerror', (e) => errs.push(e.message))
  return { ctx, p, wa, errs }
}
const alApp = async (t) => { await t.p.goto(APP); await t.p.waitForSelector('.body, .intro', { timeout: 20000 }); await espera(800) }
const tab = (t, l) => t.p.locator('nav').getByRole('button', { name: l }).click()
const foto = (t, n) => t.p.screenshot({ path: `${OUT}/${n}.png` })

async function crearCarnet(t, nombre, wa, cat, hab, desdeIntro) {
  if (desdeIntro) {
    for (let k = 0; k < 3; k++) { await t.p.locator('.intro-foot .btn').first().click(); await espera(500) }
    await t.p.locator('.intro-foot').getByRole('button', { name: 'Crear carnet' }).click()
  } else {
    await t.p.getByRole('button', { name: 'Crear carnet' }).first().click()
  }
  await t.p.fill('#r-nombre', nombre); await t.p.fill('#r-marca', 'Prueba técnica'); await t.p.fill('#r-rol', 'Prueba de Colmena')
  await t.p.getByRole('button', { name: 'Siguiente' }).click()
  await t.p.fill('#r-wa', wa); await t.p.locator('.consent input').check(); await t.p.getByRole('button', { name: 'Siguiente' }).click()
  await t.p.getByRole('button', { name: cat, exact: true }).click()
  await t.p.getByRole('button', { name: hab }).click()
  await t.p.getByRole('button', { name: 'Crear carnet' }).last().click()
  await t.p.waitForSelector('.listo', { timeout: 15000 })
}

;(async () => {
  const b = await chromium.launch()
  const A = await telefono(b, 'iPhone 13')
  const B = await telefono(b, 'Pixel 7')
  try {
    // A: bienvenida → crear carnet desde la bienvenida
    await alApp(A)
    ok('A ve la bienvenida', await A.p.locator('.intro').count() === 1)
    await crearCarnet(A, 'Prueba QA Ana', '300 000 0101', 'Diseño', 'Packaging', true)
    ok('A crea su carnet', await A.p.getByText('Tu carnet').first().count() > 0)
    ok('A: carnet listo muestra su habilidad', (await A.p.locator('.listo .carnet-skills span').allTextContents()).includes('Packaging'))
    await foto(A, '01-A-carnet-listo')
    await A.p.getByRole('button', { name: 'Ir al muro' }).click(); await espera(600)

    // A: publicar
    await A.p.locator('.composer').click(); await espera(500)
    await A.p.fill('#dx', 'Prueba técnica de Colmena. Se borra en unos minutos.')
    await A.p.locator('dialog[open]').getByRole('button', { name: 'Diseño', exact: true }).click()
    await A.p.locator('dialog[open]').getByRole('button', { name: '24 h' }).click()
    await A.p.locator('dialog[open]').getByRole('button', { name: 'Publicar en el muro' }).click()
    await espera(2500)
    ok('A publica en el muro', await A.p.getByText('Prueba técnica de Colmena').count() > 0)
    await foto(A, '02-A-publicado')

    // B: crear carnet desde la cabecera
    await B.ctx.addInitScript(() => localStorage.setItem('colmena.intro.v1', '1'))
    await alApp(B)
    await crearCarnet(B, 'Prueba QA Beto', '300 000 0102', 'Diseño', 'Tipografía', false)
    ok('B crea su carnet', true)
    await B.p.getByRole('button', { name: 'Ir al muro' }).click(); await espera(1500)

    // B: Útil y Puedo ayudar en la publicación de A
    const post = B.p.locator('article.post', { hasText: 'Prueba técnica de Colmena' })
    ok('B ve la publicación de A', await post.count() === 1)
    await post.locator('.sirve').click(); await espera(1500)
    ok('B marca Útil', (await post.locator('.sirve').getAttribute('aria-pressed')) === 'true')
    await post.getByRole('button', { name: /Puedo ayudar/ }).click(); await espera(3000)
    const wa1 = B.wa[B.wa.length - 1] || ''
    ok('Puedo ayudar abre WhatsApp de A con mensaje', wa1.includes('573000000101') && decodeURIComponent(wa1).includes('puedo ayudarte'), wa1.slice(0, 60))

    // B: carnet de A → Pídele ayuda con Packaging
    await alApp(B); await tab(B, 'Miembros'); await espera(800)
    await B.p.locator('.member2', { hasText: 'Prueba QA Ana' }).click(); await espera(800)
    ok('B ve el carnet de A con su habilidad', (await B.p.locator('.carnet-skills span').allTextContents()).includes('Packaging'))
    await foto(B, '03-B-carnet-de-A')
    await B.p.locator('.pide button', { hasText: 'Packaging' }).click(); await espera(3000)
    const wa2 = B.wa[B.wa.length - 1] || ''
    ok('Pídele ayuda abre WhatsApp con la habilidad', decodeURIComponent(wa2).includes('ayuda con packaging'), decodeURIComponent(wa2).slice(0, 90))

    // B: inscribirse al encuentro
    await alApp(B); await tab(B, 'Encuentro'); await espera(800)
    await B.p.getByRole('button', { name: 'Quiero ir' }).first().click(); await espera(2000)
    ok('B se inscribe al encuentro', await B.p.getByRole('button', { name: /Inscrito/ }).count() > 0)

    // A: confirmar la ayuda y calificar
    await alApp(A); await tab(A, 'Carnet'); await espera(2500)
    const conf = A.p.locator('.ink-card', { hasText: 'Prueba QA Beto' })
    ok('A ve "¿Se concretó la ayuda?"', await conf.count() > 0)
    await foto(A, '04-A-confirmar')
    await conf.getByRole('button', { name: 'Sí' }).click(); await espera(3000)
    const cal = A.p.locator('.rate-card', { hasText: 'Prueba' })
    ok('A recibe la tarjeta para calificar', await cal.count() > 0)
    await cal.first().click(); await espera(800)
    await A.p.getByRole('radio', { name: '5 de 5' }).click()
    await A.p.getByRole('button', { name: 'Buena comunicación' }).click()
    await A.p.getByRole('button', { name: /Publicar mi reseña|Publicar y ver/ }).click(); await espera(2500)
    ok('A publica su reseña', await A.p.locator('.success').count() > 0)

    // B: calificar a A y ver la reseña revelada
    await alApp(B); await tab(B, 'Carnet'); await espera(2500)
    const calB = B.p.locator('.rate-card', { hasText: 'Prueba' })
    ok('B recibe la tarjeta para calificar', await calB.count() > 0)
    await calB.first().click(); await espera(800)
    await B.p.getByRole('radio', { name: '5 de 5' }).click()
    await B.p.getByRole('button', { name: /Publicar y ver|Publicar mi reseña/ }).click(); await espera(2500)
    ok('B ve la reseña de A al publicar la suya', await B.p.getByText(/Esto dijo/).count() > 0)
    await foto(B, '05-B-resena-revelada')
    await B.p.getByRole('button', { name: 'Volver a mi carnet' }).click(); await espera(1500)
    const cardB = await B.p.locator('.carnet-datos').textContent().catch(() => '')
    ok('El carnet de B cuenta la ayuda dada', /1 ayuda dada/.test(cardB || ''), cardB)
    await B.p.evaluate(() => document.querySelector('.body').scrollTo(0, 1400)); await espera(600)
    ok('B gana la insignia Primera ayuda', await B.p.locator('.badge.on', { hasText: 'Primera ayuda' }).count() > 0)
    await foto(B, '06-B-insignias')
  } catch (e) {
    res.push('ERROR ' + e.message.split('\n').slice(0, 2).join(' | '))
    await A.p.screenshot({ path: `${OUT}/error-A.png` }).catch(() => {}); await B.p.screenshot({ path: `${OUT}/error-B.png` }).catch(() => {})
  } finally {
    // Limpieza: borrar ambos carnets desde la app (borra publicaciones, ayudas, reseñas, asistencias en cascada)
    for (const [n, t] of [['A', A], ['B', B]]) {
      try {
        await alApp(t)
        if (await t.p.evaluate(() => !!localStorage.getItem('colmena.sesion.v1'))) {
          await tab(t, 'Carnet'); await espera(800)
          await t.p.getByRole('button', { name: 'Editar' }).first().click(); await espera(800)
          await t.p.getByRole('button', { name: 'Borrar mi perfil y mis datos' }).click(); await espera(2500)
          ok(`Limpieza: ${n} borra su carnet`, !(await t.p.evaluate(() => localStorage.getItem('colmena.sesion.v1'))))
        }
      } catch (e) { res.push(`ERROR limpieza ${n}: ` + e.message.split('\n')[0]) }
    }
    res.push('errores JS A: ' + JSON.stringify(A.errs) + ' · B: ' + JSON.stringify(B.errs))
    console.log(res.join('\n'))
    await b.close()
  }
})()
