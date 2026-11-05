#!/usr/bin/env node
// Genera el reporte de validación (OE3) con lectura pública de Supabase.
// Solo lee. No escribe en la base ni llama RPC de escritura.
// Uso: npm run metricas

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  calcularTodo,
  diaBogota,
  dividirDatos,
  porcentajeVisible,
  sumarDias,
  visible
} from '../src/lib/metricas.js'

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SALIDA = path.join(RAIZ, 'docs', 'validacion')
const PAGINA = 1000
const TZ = 'America/Bogota'

// ---------- Credenciales ----------

// La llave publicable ya está en src/lib/supabase.js y es pública a propósito.
// Se puede reemplazar con variables de entorno, sin copiarla en otro archivo.
async function credenciales() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY
  if (url && key) return { url: url.replace(/\/$/, ''), key }

  const texto = await readFile(path.join(RAIZ, 'src', 'lib', 'supabase.js'), 'utf8')
  const encontradaUrl = texto.match(/VITE_SUPABASE_URL\s*\|\|\s*'([^']+)'/)
  const encontradaKey = texto.match(/VITE_SUPABASE_KEY\s*\|\|\s*'([^']+)'/)
  if (!encontradaUrl || !encontradaKey) {
    throw new Error('No se encontraron la URL y la llave publicable. Define VITE_SUPABASE_URL y VITE_SUPABASE_KEY.')
  }
  return { url: encontradaUrl[1].replace(/\/$/, ''), key: encontradaKey[1] }
}

// ---------- Lectura (solo GET y la RPC de lectura de reseñas) ----------

async function pedir(url, headers, opciones = {}) {
  for (let intento = 1; intento <= 2; intento += 1) {
    try {
      const r = await fetch(url, {
        ...opciones,
        headers: { ...headers, ...(opciones.headers || {}) },
        signal: AbortSignal.timeout(30000)
      })
      if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 200)}`)
      return r
    } catch (e) {
      if (intento === 2) throw e
      await new Promise((listo) => setTimeout(listo, 800))
    }
  }
}

async function leerTabla(base, headers, tabla, columnas, orden) {
  const filas = []
  let offset = 0
  for (;;) {
    const url = `${base}/rest/v1/${tabla}?select=${encodeURIComponent(columnas)}&order=${encodeURIComponent(orden)}&limit=${PAGINA}&offset=${offset}`
    const r = await pedir(url, headers)
    const data = await r.json()
    filas.push(...data)
    offset += data.length
    if (data.length < PAGINA) break
    if (offset > 200000) throw new Error(`${tabla} devolvió demasiadas filas; revisa la paginación.`)
  }
  return filas
}

async function leerResenas(base, headers) {
  const filas = []
  let offset = 0
  for (;;) {
    const columnas = 'id,estrellas,created_at,de_id,para_id,publicacion_id'
    const url = `${base}/rest/v1/rpc/resenas_publicas?select=${encodeURIComponent(columnas)}&order=${encodeURIComponent('created_at.desc,id.desc')}&limit=${PAGINA}&offset=${offset}`
    const r = await pedir(url, headers, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: '{}'
    })
    const data = await r.json()
    filas.push(...data)
    offset += data.length
    if (data.length < PAGINA) break
    if (offset > 200000) throw new Error('resenas_publicas devolvió demasiadas filas.')
  }
  return filas
}

async function leerDatos() {
  const { url, key } = await credenciales()
  if (!/^https:\/\//.test(url)) throw new Error('La URL de Supabase debe ser https.')
  const headers = { apikey: key, Authorization: `Bearer ${key}` }

  const [perfiles, publicaciones, ayudas, meSirve, conexiones, asistencias, participantes, votos, interes, resenas] =
    await Promise.all([
      leerTabla(url, headers, 'perfiles', 'id,created_at,es_ejemplo', 'created_at.asc,id.asc'),
      leerTabla(url, headers, 'publicaciones', 'id,autor_id,tipo,categorias,es_ejemplo,created_at,resuelta_at', 'created_at.asc,id.asc'),
      leerTabla(url, headers, 'ayudas', 'publicacion_id,perfil_id,created_at,estado,resuelta_at', 'created_at.asc,publicacion_id.asc,perfil_id.asc'),
      leerTabla(url, headers, 'me_sirve', 'publicacion_id,perfil_id,created_at', 'created_at.asc,publicacion_id.asc,perfil_id.asc'),
      leerTabla(url, headers, 'conexiones', 'de_id,a_id,created_at', 'created_at.asc,de_id.asc,a_id.asc'),
      leerTabla(url, headers, 'asistencias', 'encuentro_id,perfil_id,created_at', 'created_at.asc,encuentro_id.asc,perfil_id.asc'),
      leerTabla(url, headers, 'reto_participantes', 'reto_id,perfil_id,created_at', 'created_at.asc,reto_id.asc,perfil_id.asc'),
      leerTabla(url, headers, 'reto_votos', 'reto_id,participante_id,votante_id,created_at', 'created_at.asc,reto_id.asc,participante_id.asc,votante_id.asc'),
      leerTabla(url, headers, 'taller_interes', 'taller_id,perfil_id,created_at', 'created_at.asc,taller_id.asc,perfil_id.asc'),
      leerResenas(url, headers)
    ])

  return {
    perfiles,
    publicaciones,
    ayudas,
    meSirve,
    conexiones,
    asistencias,
    participantes,
    votos,
    interes,
    resenas
  }
}

// ---------- Formato ----------

const nf = new Intl.NumberFormat('es-CO')
const nf1 = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

const fechaLarga = (dia) =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${dia}T12:00:00Z`))

const ahoraTexto = () =>
  new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: TZ }).format(new Date())

function etiquetaSemana(lunes) {
  const domingo = sumarDias(lunes, 6)
  const [ya, ma, da] = lunes.split('-').map(Number)
  const [yb, mb, db] = domingo.split('-').map(Number)
  if (ya === yb && ma === mb) return `${da}–${db} ${MESES[ma - 1]} ${ya}`
  return `${da} ${MESES[ma - 1]} – ${db} ${MESES[mb - 1]} ${yb}`
}

const celda = (valor, ejemplo) => {
  const v = visible(valor, { ejemplo })
  if (v === null || v === undefined) return '—'
  return typeof v === 'number' ? nf.format(v) : v
}

const pctCelda = (valor) => {
  if (valor === null || valor === undefined) return '—'
  if (typeof valor === 'string') return valor
  return `${nf1.format(valor)} %`
}

const horasCelda = (horas, medidas, ejemplo) => {
  if (horas === null || horas === undefined) return '—'
  if (!ejemplo && medidas < 3) return 'menos de 3'
  if (horas < 1) return `${Math.round(horas * 60)} min`
  return `${nf1.format(horas)} h`
}

const estrellasCelda = (promedio, resenas, ejemplo) => {
  if (promedio === null || promedio === undefined) return '—'
  if (!ejemplo && resenas < 3) return 'menos de 3'
  return `${nf1.format(promedio)} / 5`
}

const tabla = (encabezados, filas, alineacion = []) => {
  const separador = encabezados.map((_, i) => (alineacion[i] === 'd' ? '---:' : '---'))
  return [
    `| ${encabezados.join(' | ')} |`,
    `| ${separador.join(' | ')} |`,
    ...filas.map((f) => `| ${f.join(' | ')} |`)
  ].join('\n')
}

const limpiar = (texto) => String(texto).replace(/\|/g, '\\|').replace(/\n/g, ' ')

// ---------- Secciones ----------

function resumenCifras(res, ejemplo) {
  const t = res.total
  return [
    `- **Carnets creados:** ${celda(t.carnets, ejemplo)}`,
    `- **Publicaciones:** ${celda(t.publicacionesTotal, ejemplo)} (${celda(t.publicacionesNeed, ejemplo)} necesito, ${celda(t.publicacionesOffer, ejemplo)} ofrezco)`,
    `- **Publicaciones con respuesta:** ${pctCelda(porcentajeVisible(t.publicacionesConRespuesta, t.publicacionesTotal, { ejemplo }))}`,
    `- **Ayudas confirmadas:** ${celda(t.ayudasConfirmadas, ejemplo)}`,
    `- **Miembros que dieron o recibieron ayuda:** ${celda(t.miembrosAyuda, ejemplo)}`,
    `- **Miembros activos:** ${celda(t.miembrosActivos, ejemplo)}`
  ].join('\n')
}

function bloqueActivacion(res, ejemplo, h) {
  const filas = res.activacion.map((c) => [
    etiquetaSemana(c.semana),
    celda(c.carnets, ejemplo),
    celda(c.maduros, ejemplo),
    celda(c.publicaron, ejemplo),
    pctCelda(porcentajeVisible(c.publicaron, c.maduros, { ejemplo }))
  ])
  const maduros = res.activacion.reduce((n, c) => n + c.maduros, 0)
  const publicaron = res.activacion.reduce((n, c) => n + c.publicaron, 0)
  filas.push([
    '**Total**',
    `**${celda(res.total.carnets, ejemplo)}**`,
    `**${celda(maduros, ejemplo)}**`,
    `**${celda(publicaron, ejemplo)}**`,
    `**${pctCelda(porcentajeVisible(publicaron, maduros, { ejemplo }))}**`
  ])

  return [
    `${h} Activación`,
    '',
    '¿Está entrando gente nueva y llega a publicar? Un carnet cuenta como activado si publica algo en sus primeros 7 días.',
    '',
    res.activacion.length
      ? tabla(
          ['Semana', 'Carnets', 'Con 7 días cumplidos', 'Publicaron en 7 días', '%'],
          filas,
          [undefined, 'd', 'd', 'd', 'd']
        )
      : 'Sin carnets en el periodo.',
    ''
  ].join('\n')
}

function bloqueMuro(res, ejemplo, h) {
  const t = res.total
  const volumen = res.semanas.map((s) => [
    etiquetaSemana(s.semana),
    celda(s.metricas.publicacionesNeed, ejemplo),
    celda(s.metricas.publicacionesOffer, ejemplo),
    celda(s.metricas.publicacionesTotal, ejemplo)
  ])
  volumen.push([
    '**Total**',
    `**${celda(t.publicacionesNeed, ejemplo)}**`,
    `**${celda(t.publicacionesOffer, ejemplo)}**`,
    `**${celda(t.publicacionesTotal, ejemplo)}**`
  ])

  const respuestas = res.semanas.map((s) => {
    const m = s.metricas
    return [
      etiquetaSemana(s.semana),
      celda(m.publicacionesConRespuesta, ejemplo),
      pctCelda(porcentajeVisible(m.publicacionesConRespuesta, m.publicacionesTotal, { ejemplo })),
      celda(m.publicacionesResueltas, ejemplo),
      pctCelda(porcentajeVisible(m.publicacionesResueltas, m.publicacionesTotal, { ejemplo })),
      horasCelda(m.medianaPrimeraRespuestaHoras, m.respuestasMedidas, ejemplo)
    ]
  })
  respuestas.push([
    '**Total**',
    `**${celda(t.publicacionesConRespuesta, ejemplo)}**`,
    `**${pctCelda(porcentajeVisible(t.publicacionesConRespuesta, t.publicacionesTotal, { ejemplo }))}**`,
    `**${celda(t.publicacionesResueltas, ejemplo)}**`,
    `**${pctCelda(porcentajeVisible(t.publicacionesResueltas, t.publicacionesTotal, { ejemplo }))}**`,
    `**${horasCelda(t.medianaPrimeraRespuestaHoras, t.respuestasMedidas, ejemplo)}**`
  ])

  const categorias = res.categorias.map((c) => [
    limpiar(c.categoria),
    celda(c.publicaciones, ejemplo),
    celda(c.conRespuesta, ejemplo),
    pctCelda(porcentajeVisible(c.conRespuesta, c.publicaciones, { ejemplo }))
  ])

  return [
    `${h} Muro`,
    '',
    'Publicaciones por semana, cuántas reciben respuesta y cuánto tardan. Una respuesta es una ayuda registrada, aunque no se haya confirmado.',
    '',
    tabla(['Semana', 'Necesito', 'Ofrezco', 'Total'], volumen, [undefined, 'd', 'd', 'd']),
    '',
    tabla(
      ['Semana', 'Con respuesta', '%', 'Resueltas', '%', 'Mediana 1.ª respuesta'],
      respuestas,
      [undefined, 'd', 'd', 'd', 'd', 'd']
    ),
    '',
    categorias.length
      ? `**Por categoría**\n\n${tabla(
          ['Categoría', 'Publicaciones', 'Con respuesta', '%'],
          categorias,
          [undefined, 'd', 'd', 'd']
        )}`
      : 'Sin publicaciones por categoría en el periodo.',
    '',
    'Una publicación puede aparecer en varias categorías, así que la suma de la tabla no da el total del Muro.',
    ''
  ].join('\n')
}

function bloqueConexion(res, ejemplo, h) {
  const t = res.total
  const filas = res.semanas.map((s) => {
    const m = s.metricas
    return [
      etiquetaSemana(s.semana),
      celda(m.ayudasConfirmadas, ejemplo),
      celda(m.ayudasNuevas, ejemplo),
      pctCelda(porcentajeVisible(m.ayudasNuevas, m.ayudasConfirmadas, { ejemplo })),
      celda(m.miembrosDieron, ejemplo),
      celda(m.miembrosRecibieron, ejemplo),
      celda(m.miembrosAyuda, ejemplo)
    ]
  })
  filas.push([
    '**Total**',
    `**${celda(t.ayudasConfirmadas, ejemplo)}**`,
    `**${celda(t.ayudasNuevas, ejemplo)}**`,
    `**${pctCelda(porcentajeVisible(t.ayudasNuevas, t.ayudasConfirmadas, { ejemplo }))}**`,
    `**${celda(t.miembrosDieron, ejemplo)}**`,
    `**${celda(t.miembrosRecibieron, ejemplo)}**`,
    `**${celda(t.miembrosAyuda, ejemplo)}**`
  ])

  return [
    `${h} Conexión real`,
    '',
    'Ayudas confirmadas por el autor de la publicación. “Sin contacto previo” cuenta las parejas que no tenían otra ayuda ni una conexión registrada antes en Colmena.',
    '',
    tabla(
      ['Semana', 'Ayudas confirmadas', 'Sin contacto previo', '%', 'Dieron', 'Recibieron', 'Distintos'],
      filas,
      [undefined, 'd', 'd', 'd', 'd', 'd', 'd']
    ),
    '',
    '“Sin contacto previo” es una inferencia, no una certeza: si las dos personas ya se conocían por fuera de la app, el dato no lo puede saber.',
    ''
  ].join('\n')
}

function bloqueComunidad(res, ejemplo, h) {
  const t = res.total
  const filas = res.semanas.map((s) => {
    const m = s.metricas
    return [
      etiquetaSemana(s.semana),
      celda(m.conexiones, ejemplo),
      celda(m.asistentes, ejemplo),
      celda(m.interesTalleres, ejemplo),
      celda(m.participantesReto, ejemplo),
      celda(m.votosReto, ejemplo)
    ]
  })
  filas.push([
    '**Total**',
    `**${celda(t.conexiones, ejemplo)}**`,
    `**${celda(t.asistentes, ejemplo)}**`,
    `**${celda(t.interesTalleres, ejemplo)}**`,
    `**${celda(t.participantesReto, ejemplo)}**`,
    `**${celda(t.votosReto, ejemplo)}**`
  ])

  return [
    `${h} Comunidad`,
    '',
    'Las otras formas de participar: conexiones, encuentro, talleres y reto. Los asistentes son inscritos en la app, no asistencia verificada al evento.',
    '',
    tabla(
      ['Semana', 'Conexiones', 'Asistentes al encuentro', 'Interesados en talleres', 'Participantes del reto', 'Votos del reto'],
      filas,
      [undefined, 'd', 'd', 'd', 'd', 'd']
    ),
    ''
  ].join('\n')
}

function bloqueRetencion(res, ejemplo, h) {
  const t = res.total
  const activos = res.semanas.map((s) => [
    etiquetaSemana(s.semana),
    celda(s.metricas.miembrosActivos, ejemplo)
  ])
  activos.push(['**Total (personas distintas)**', `**${celda(t.miembrosActivos, ejemplo)}**`])

  const cohortes = res.retencion.map((c) => [
    etiquetaSemana(c.semana),
    celda(c.carnets, ejemplo),
    pctCelda(porcentajeVisible(c.semanas[1].activos, c.semanas[1].base, { ejemplo })),
    pctCelda(porcentajeVisible(c.semanas[2].activos, c.semanas[2].base, { ejemplo })),
    pctCelda(porcentajeVisible(c.semanas[4].activos, c.semanas[4].base, { ejemplo }))
  ])
  const bases = [1, 2, 4].map((n) => res.retencion.reduce((suma, c) => suma + c.semanas[n].base, 0))
  const activosN = [1, 2, 4].map((n) => res.retencion.reduce((suma, c) => suma + c.semanas[n].activos, 0))
  cohortes.push([
    '**Total**',
    `**${celda(t.carnets, ejemplo)}**`,
    `**${pctCelda(porcentajeVisible(activosN[0], bases[0], { ejemplo }))}**`,
    `**${pctCelda(porcentajeVisible(activosN[1], bases[1], { ejemplo }))}**`,
    `**${pctCelda(porcentajeVisible(activosN[2], bases[2], { ejemplo }))}**`
  ])

  return [
    `${h} Retención`,
    '',
    'Miembros que hicieron al menos una acción en la semana (publicar, responder, confirmar, marcar útil, conectar, inscribirse, participar, votar, interesarse por un taller o calificar). Crear el carnet no cuenta como acción.',
    '',
    tabla(['Semana', 'Miembros activos'], activos, [undefined, 'd']),
    '',
    '**Retención por cohorte de registro**',
    '',
    'El porcentaje se calcula sobre quienes ya cumplieron la ventana de 7 días. Un guion significa que todavía no se puede medir.',
    '',
    tabla(['Semana de registro', 'Carnets', 'Semana 1', 'Semana 2', 'Semana 4'], cohortes, [undefined, 'd', 'd', 'd', 'd']),
    ''
  ].join('\n')
}

function bloqueCalidad(res, ejemplo, h) {
  const t = res.total
  const filas = res.semanas.map((s) => [
    etiquetaSemana(s.semana),
    celda(s.metricas.resenas, ejemplo),
    estrellasCelda(s.metricas.estrellasPromedio, s.metricas.resenas, ejemplo)
  ])
  filas.push([
    '**Total**',
    `**${celda(t.resenas, ejemplo)}**`,
    `**${estrellasCelda(t.estrellasPromedio, t.resenas, ejemplo)}**`
  ])

  return [
    `${h} Calidad`,
    '',
    'Reseñas visibles de la RPC `resenas_publicas()` y promedio de estrellas. No se incluyen comentarios ni chips.',
    '',
    tabla(['Semana', 'Reseñas visibles', 'Promedio'], filas, [undefined, 'd', 'd']),
    '',
    'Una reseña se hace visible cuando las dos partes calificaron o cuando pasaron 7 días, así que el promedio puede cambiar después.',
    ''
  ].join('\n')
}

function secciones(res, ejemplo, h) {
  return [
    resumenCifras(res, ejemplo),
    '',
    bloqueActivacion(res, ejemplo, `${h}`),
    bloqueMuro(res, ejemplo, `${h}`),
    bloqueConexion(res, ejemplo, `${h}`),
    bloqueComunidad(res, ejemplo, `${h}`),
    bloqueRetencion(res, ejemplo, `${h}`),
    bloqueCalidad(res, ejemplo, `${h}`)
  ].join('\n')
}

// ---------- Reporte ----------

function reporte({ real, ejemplo, sinReales, hayEjemplo, hoy }) {
  const lineas = []
  lineas.push('# Reporte de validación de Colmena')
  lineas.push('')
  lineas.push(`**Generado:** ${ahoraTexto()}`)
  lineas.push(`**Periodo:** ${sinReales ? 'sin datos reales todavía' : `${fechaLarga(real.periodo.desde)} – ${fechaLarga(real.periodo.hasta)}`}`)
  lineas.push('**Semana:** lunes a domingo, hora de Colombia (`America/Bogota`).')
  lineas.push('**Fuente:** Supabase, solo lectura con la llave publicable. El script no escribe ni llama funciones de escritura.')
  lineas.push('')
  lineas.push('**Cómo leer:** los datos reales y la muestra de ejemplo van separados y nunca se suman. Si un grupo tiene menos de 3 personas, la cifra dice `menos de 3`. Un guion (`—`) significa que la métrica no aplica o que todavía no hay tiempo suficiente para medirla.')
  lineas.push('')
  lineas.push('Las definiciones completas están en [metricas.md](metricas.md).')

  lineas.push('')
  lineas.push('## Datos reales')
  lineas.push('')
  if (sinReales) {
    if (hayEjemplo) {
      lineas.push(
        `**Todavía no hay datos reales.** La base tiene ${nf.format(ejemplo.total.carnets)} carnets y ${nf.format(
          ejemplo.total.publicacionesTotal
        )} publicaciones, todos marcados como ejemplo. No hay nada real que medir todavía, así que no se muestran tablas en cero que parezcan resultados.`
      )
    } else {
      lineas.push(
        '**Todavía no hay datos, ni reales ni de ejemplo.** Cuando entre el piloto, este reporte se llena solo. Por ahora no se muestran tablas en cero que parezcan resultados.'
      )
    }
    lineas.push('')
    lineas.push('Estas son las tablas que aparecerán:')
    lineas.push('')
    lineas.push(
      tabla(
        ['Bloque', 'Qué medirá'],
        [
          ['Activación', 'Carnets por semana y % que publica en sus primeros 7 días'],
          ['Muro', 'Publicaciones, respuestas, resueltas y categorías'],
          ['Conexión real', 'Ayudas confirmadas y personas que dieron o recibieron'],
          ['Comunidad', 'Conexiones, encuentro, talleres y reto'],
          ['Retención', 'Miembros activos y cohortes de las semanas 1, 2 y 4'],
          ['Calidad', 'Reseñas visibles y promedio de estrellas']
        ]
      )
    )
  } else {
    lineas.push(secciones(real, false, '###'))
  }

  lineas.push('')
  lineas.push('## Muestra de ejemplo')
  lineas.push('')
  if (hayEjemplo) {
    lineas.push(
      'Estos son los datos de muestra que ya tiene la app. Son personajes ficticios (`es_ejemplo = true`) y no cuentan para la validación. Sirven para revisar que las cuentas y las tablas funcionen.'
    )
    lineas.push('')
    lineas.push(secciones(ejemplo, true, '###'))
  } else {
    lineas.push('La base no tiene datos de ejemplo en este momento.')
  }

  lineas.push('')
  lineas.push('## Qué no se puede medir todavía')
  lineas.push('')
  lineas.push(
    'Hoy no hay forma de medir visitas, abandono del registro, instalaciones de la PWA ni clics a WhatsApp: no hay registro de eventos y el repo no usa herramientas de rastreo de terceros. La propuesta para medirlo, con su SQL sin aplicar, está en [metricas.md](metricas.md), sección 8. Tampoco se puede verificar la asistencia real al encuentro: la app solo guarda la inscripción.'
  )
  lineas.push('')
  lineas.push('## Archivos de esta corrida')
  lineas.push('')
  lineas.push(`- \`reporte-${hoy}.md\`: este documento.`)
  lineas.push(`- \`reporte-${hoy}.csv\`: una fila por día y métrica, separado por punto y coma, con decimales con coma y UTF-8, para Excel o Google Sheets.`)
  lineas.push('')

  return lineas.join('\n')
}

// ---------- CSV ----------

const CSV_METRICAS = [
  ['carnets', 'carnets_creados', 'carnets'],
  ['publicacionesNeed', 'publicaciones_necesito', 'publicaciones'],
  ['publicacionesOffer', 'publicaciones_ofrezco', 'publicaciones'],
  ['publicacionesTotal', 'publicaciones_total', 'publicaciones'],
  ['publicacionesConRespuesta', 'publicaciones_con_respuesta', 'publicaciones'],
  ['publicacionesResueltas', 'publicaciones_resueltas', 'publicaciones'],
  ['ayudasConfirmadas', 'ayudas_confirmadas', 'ayudas'],
  ['miembrosDieron', 'miembros_que_dieron_ayuda', 'personas'],
  ['miembrosRecibieron', 'miembros_que_recibieron_ayuda', 'personas'],
  ['miembrosAyuda', 'miembros_en_ayudas_confirmadas', 'personas'],
  ['ayudasNuevas', 'ayudas_sin_contacto_previo', 'ayudas'],
  ['conexiones', 'conexiones', 'conexiones'],
  ['asistentes', 'asistentes_encuentro', 'personas'],
  ['interesTalleres', 'interesados_talleres', 'personas'],
  ['participantesReto', 'participantes_reto', 'personas'],
  ['votosReto', 'votos_reto', 'votos'],
  ['miembrosActivos', 'miembros_activos', 'personas'],
  ['resenas', 'resenas_visibles', 'resenas']
]

function campoCsv(valor) {
  const texto = String(valor ?? '')
  return /[;"\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto
}

function valorCsv(clave, m, ejemplo) {
  if (clave === 'medianaPrimeraRespuestaHoras') {
    if (m.medianaPrimeraRespuestaHoras === null) return ''
    if (!ejemplo && m.respuestasMedidas < 3) return 'menos de 3'
    return nf1.format(m.medianaPrimeraRespuestaHoras).replace(/\./g, ',')
  }
  if (clave === 'estrellasPromedio') {
    if (m.estrellasPromedio === null) return ''
    if (!ejemplo && m.resenas < 3) return 'menos de 3'
    return nf1.format(m.estrellasPromedio).replace(/\./g, ',')
  }
  const v = visible(m[clave], { ejemplo })
  if (v === null || v === undefined) return ''
  if (typeof v === 'number') {
    return Number.isInteger(v) ? String(v) : nf1.format(v).replace(/\./g, ',')
  }
  return v
}

function csv({ real, ejemplo, sinReales, hayEjemplo, hoy }) {
  const filas = [['fecha', 'ambito', 'metrica', 'valor', 'unidad', 'nota'].join(';')]

  const agregar = (ambito, datos, esEjemplo) => {
    datos.dias.forEach(({ dia, metricas }) => {
      CSV_METRICAS.forEach(([clave, nombre, unidad]) => {
        filas.push([dia, ambito, nombre, valorCsv(clave, metricas, esEjemplo), unidad, ''].map(campoCsv).join(';'))
      })
      filas.push([dia, ambito, 'tiempo_mediano_primera_respuesta_horas', valorCsv('medianaPrimeraRespuestaHoras', metricas, esEjemplo), 'horas', ''].map(campoCsv).join(';'))
      filas.push([dia, ambito, 'promedio_estrellas', valorCsv('estrellasPromedio', metricas, esEjemplo), 'estrellas', ''].map(campoCsv).join(';'))
    })
  }

  if (sinReales) {
    filas.push([hoy, 'real', 'sin_datos_reales', '', 'aviso', 'Todavía no hay datos reales'].map(campoCsv).join(';'))
  } else {
    agregar('real', real, false)
  }
  if (hayEjemplo) agregar('ejemplo', ejemplo, true)
  else filas.push([hoy, 'ejemplo', 'sin_datos_de_ejemplo', '', 'aviso', 'No hay datos de ejemplo'].map(campoCsv).join(';'))

  return `\uFEFF${filas.join('\n')}\n`
}

// ---------- Privacidad ----------

function revisarPrivacidad(texto) {
  const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  const correo = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
  if (uuid.test(texto)) throw new Error('El reporte contiene un identificador tipo UUID; no se puede publicar.')
  if (correo.test(texto)) throw new Error('El reporte contiene un correo; no se puede publicar.')
}

// ---------- Principal ----------

async function main() {
  console.log('Leyendo datos de Supabase (solo lectura)...')
  const crudo = await leerDatos()
  console.log(
    `Filas leídas: ${crudo.perfiles.length} perfiles, ${crudo.publicaciones.length} publicaciones, ${crudo.ayudas.length} ayudas, ${crudo.resenas.length} reseñas visibles.`
  )
  const resultado = await generar({ crudo })
  if (resultado.sinReales) console.log('Aviso: todavía no hay datos reales; el reporte lo dice en la primera sección.')
  console.log(`Reporte: ${path.relative(RAIZ, resultado.archivoMd)}`)
  console.log(`CSV: ${path.relative(RAIZ, resultado.archivoCsv)}`)
}

// Se puede llamar con datos ya cargados (pruebas) o dejar que main() los lea de Supabase.
export async function generar({ crudo, ahora = Date.now(), salida = SALIDA } = {}) {
  const { reales, ejemplo } = dividirDatos(crudo)
  const real = calcularTodo(reales, { ahora })
  const muestra = calcularTodo(ejemplo, { ahora })
  const sinReales = real.total.carnets === 0 && real.total.publicacionesTotal === 0
  const hayEjemplo =
    muestra.total.carnets > 0 ||
    muestra.total.publicacionesTotal > 0 ||
    muestra.total.ayudasConfirmadas > 0 ||
    muestra.total.conexiones > 0 ||
    muestra.total.asistentes > 0 ||
    muestra.total.interesTalleres > 0 ||
    muestra.total.participantesReto > 0 ||
    muestra.total.votosReto > 0 ||
    muestra.total.resenas > 0 ||
    muestra.total.miembrosActivos > 0
  const hoy = diaBogota(ahora)

  const textoMd = reporte({ real, ejemplo: muestra, sinReales, hayEjemplo, hoy })
  const textoCsv = csv({ real, ejemplo: muestra, sinReales, hayEjemplo, hoy })
  revisarPrivacidad(textoMd)
  revisarPrivacidad(textoCsv)

  await mkdir(salida, { recursive: true })
  const archivoMd = path.join(salida, `reporte-${hoy}.md`)
  const archivoCsv = path.join(salida, `reporte-${hoy}.csv`)
  await writeFile(archivoMd, `${textoMd}\n`, 'utf8')
  await writeFile(archivoCsv, textoCsv, 'utf8')

  return { archivoMd, archivoCsv, sinReales, real, ejemplo: muestra }
}

const ejecutadoDirecto = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (ejecutadoDirecto) {
  main().catch((e) => {
    console.error(`No se pudo generar el reporte: ${e.message}`)
    process.exit(1)
  })
}
