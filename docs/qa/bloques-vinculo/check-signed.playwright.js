// Ejecutar con browser_run_code_unsafe(filename). Todos los RPC se interceptan en un contexto aislado.
async (page) => {
  const origin = 'http://127.0.0.1:5174'
  const snapshot = await (await page.request.get(origin + '/mockups/rediseno-ui/data.json')).json()
  const checks = []
  const check = (name, value) => { checks.push({ name, passed: !!value }); if (!value) throw new Error(name) }
  const context = await page.context().browser().newContext({ viewport: { width: 320, height: 844 }, reducedMotion: 'reduce' })
  const p = await context.newPage()
  const profiles = snapshot.profiles.map((x, i) => ({ ...x, habilidades: [], instagram: '', color: 0, carnet: i + 1, created_at: '2026-10-29T00:00:00Z' }))
  profiles[0].nombre = 'Sara Ospina de los Emprendimientos de Diseño y Comunicación'
  const posts = snapshot.posts.map((x, i) => i ? x : { ...x, texto: (x.texto + ' ' + 'Texto de ejemplo para revisar un aporte largo. '.repeat(12)).slice(0, 500) })
  const ayudas = [{ publicacion_id: posts[0].id, perfil_id: profiles[1].id }]
  const connections = [], attendances = [], rpcs = []
  const meeting = { id: 'fixture-encuentro', numero: 1, titulo: 'Encuentro de ejemplo', fecha: null, hora_texto: 'Por confirmar', lugar: 'Por confirmar', activo: true, agenda: [] }
  let rejectPublish = true
  await context.addInitScript(({ id }) => {
    localStorage.setItem('colmena.sesion.v1', JSON.stringify({ id, clave: 'solo-fixture-local' }))
    localStorage.setItem('colmena.bienvenida.v1', '1')
  }, { id: profiles[0].id })
  await context.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url()), table = url.pathname.split('/').pop()
    if (url.pathname.includes('/rpc/')) {
      rpcs.push(table)
      const args = route.request().postDataJSON()
      if (table === 'publicar') {
        if (rejectPublish) { await route.fulfill({ status: 400, json: { message: 'Error de publicación de ejemplo', code: 'P0001' } }); return }
        posts.unshift({ id: 'fixture-post', autor_id: profiles[0].id, tipo: args.p_tipo, texto: args.p_texto, categorias: args.p_categorias, created_at: '2026-10-30T12:00:00Z' })
      }
      if (table === 'alternar_conexion') connections.push({ de_id: profiles[0].id, a_id: args.p_a })
      if (table === 'alternar_asistencia') attendances.push({ encuentro_id: meeting.id, perfil_id: profiles[0].id })
      if (table === 'actualizar_perfil') profiles[0].nombre = args.p_nombre
      await route.fulfill({ json: true }); return
    }
    const tables = { perfiles: profiles, publicaciones: posts, ayudas, conexiones: connections, asistencias: attendances, encuentros: [meeting] }
    await route.fulfill({ json: tables[table] || [] })
  })
  try {
    await p.goto(origin + '/')
    await p.getByRole('heading', { name: 'Entre todos.', exact: true }).waitFor()
    check('500 caracteres completos', (await p.locator('.post > p').first().textContent()).length === 500)
    check('Sin overflow a320', await p.locator('.body').evaluate(e => e.scrollWidth <= e.clientWidth + 1))
    await p.locator('.composer').click()
    const dialog = p.getByRole('dialog', { name: 'Publicar en el muro', exact: true })
    await dialog.waitFor()
    check('Publicar vacío deshabilitado', await dialog.getByRole('button', { name: 'Publicar', exact: true }).isDisabled())
    await p.keyboard.press('Shift+Tab')
    check('Foco contenido en diálogo', await p.locator(':focus').evaluate(e => !!e.closest('dialog')))
    await dialog.getByRole('textbox').fill('Publicación de ejemplo para probar errores.')
    await dialog.getByRole('button', { name: 'Publicar', exact: true }).click()
    await dialog.getByRole('alert').waitFor()
    check('Error accesible dentro del modal', (await dialog.getByRole('alert').textContent()).includes('Error de publicación'))
    check('Se conserva texto tras fallo', (await dialog.getByRole('textbox').inputValue()).includes('probar errores'))
    await p.screenshot({ path: 'D:/COLMENA PDG 2026-2/colmena/docs/qa/bloques-vinculo/error-publicar-fixture.png', scale: 'css' })
    rejectPublish = false
    await dialog.getByRole('button', { name: 'Publicar', exact: true }).click()
    await dialog.waitFor({ state: 'hidden' })
    check('Publicación aparece tras reintento', await p.getByText('Publicación de ejemplo para probar errores.', { exact: true }).count() === 1)
    await p.getByRole('button', { name: /persona puede interesarse/ }).click()
    const helpers = p.getByRole('dialog', { name: 'Quiénes pueden ayudarte', exact: true })
    await helpers.waitFor()
    check('Ayudante mantiene Ejemplo', await helpers.locator('.ejemplo').count() === 1)
    await p.keyboard.press('Escape')
    check('Escape cierra diálogo', !(await helpers.isVisible()))
    check('Foco regresa al disparador', await p.locator(':focus').evaluate(e => e.classList.contains('helpbtn')))
    await p.getByRole('button', { name: 'Puedo ayudar', exact: true }).first().click()
    await p.locator('.helpbtn[aria-pressed="true"]').first().waitFor()
    check('Respuesta confirmada en UI', await p.locator('.helpbtn[aria-pressed="true"]').count() === 1)
    const help = p.locator('.helpbtn[aria-pressed="true"]').first()
    await help.focus(); await p.keyboard.press('Tab'); await p.keyboard.press('Shift+Tab')
    check('Foco con dos anillos contrastados', await help.evaluate(e => { const s = getComputedStyle(e); return e.matches(':focus-visible') && s.outlineColor === 'rgb(15, 15, 13)' && s.boxShadow.includes('255, 255, 255') }))
    await p.getByRole('navigation').getByRole('button', { name: 'Miembros', exact: true }).click()
    await p.getByRole('button', { name: 'Conectar', exact: true }).first().click()
    await p.getByRole('button', { name: 'Conectado', exact: true }).waitFor()
    check('Conexión confirmada', true)
    await p.getByRole('navigation').getByRole('button', { name: 'Encuentro', exact: true }).click()
    await p.getByRole('button', { name: 'Quiero ir', exact: true }).click()
    await p.getByRole('button', { name: 'Te avisamos la fecha', exact: true }).waitFor()
    check('Asistencia confirmada y Ejemplo visible', await p.locator('.attendee-names .ejemplo').count() === 1)
    await p.getByRole('navigation').getByRole('button', { name: 'Carnet', exact: true }).click()
    await p.getByRole('button', { name: 'Editar', exact: true }).click()
    await p.getByLabel('Tu nombre *', { exact: true }).fill('Sara Ospina de ejemplo')
    await p.getByRole('button', { name: 'Guardar cambios', exact: true }).click()
    await p.getByText('Sara Ospina de ejemplo', { exact: true }).waitFor()
    check('Edición de carnet vuelve a perfil', true)
    await p.getByRole('navigation').getByRole('button', { name: 'Muro', exact: true }).click()
    await p.locator('.body').evaluate(e => e.scrollTop = e.scrollHeight)
    check('Última respuesta alcanzable sobre barra', await p.locator('.post').last().locator('.helpbtn').evaluate(e => e.getBoundingClientRect().bottom < document.querySelector('.tabbar').getBoundingClientRect().top))
    return { passed: true, checks, rpcsIntercepted: rpcs, productionWrites: 0 }
  } catch (e) { return { passed: false, checks, error: e.message, rpcsIntercepted: rpcs } }
  finally { await context.close() }
}
