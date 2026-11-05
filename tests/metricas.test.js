import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calcularTodo,
  diaBogota,
  dividirDatos,
  mediana,
  metricasDe,
  porcentajeVisible,
  semanaBogota,
  visible
} from '../src/lib/metricas.js'

const AHORA = Date.parse('2026-11-20T17:00:00Z')

const P = (id, created_at, es_ejemplo = false) => ({ id, created_at, es_ejemplo })
const POST = (id, autor_id, tipo, created_at, extra = {}) => ({
  id,
  autor_id,
  tipo,
  created_at,
  categorias: [],
  es_ejemplo: false,
  resuelta_at: null,
  ...extra
})
const AYUDA = (publicacion_id, perfil_id, created_at, estado = 'confirmada', resuelta_at = created_at) => ({
  publicacion_id,
  perfil_id,
  created_at,
  estado,
  resuelta_at: estado === 'confirmada' ? resuelta_at : null
})
const reales = (datos) => dividirDatos(datos).reales

test('cero datos: todo en cero y sin promedios inventados', () => {
  const r = calcularTodo(reales({}), { ahora: AHORA })
  assert.equal(r.total.carnets, 0)
  assert.equal(r.total.publicacionesTotal, 0)
  assert.equal(r.total.ayudasConfirmadas, 0)
  assert.equal(r.total.medianaPrimeraRespuestaHoras, null)
  assert.equal(r.total.estrellasPromedio, null)
  assert.deepEqual(r.categorias, [])
  assert.equal(r.activacion.length, 0)
  assert.equal(r.retencion.length, 0)
})

test('solo datos de ejemplo: reales queda vacío', () => {
  const datos = {
    perfiles: [P('e1', '2026-10-05T15:00:00Z', true)],
    publicaciones: [POST('ep1', 'e1', 'need', '2026-10-06T15:00:00Z', { es_ejemplo: true })]
  }
  const { reales: r, ejemplo } = dividirDatos(datos)
  assert.equal(r.perfiles.length, 0)
  assert.equal(calcularTodo(r, { ahora: AHORA }).total.carnets, 0)
  assert.equal(calcularTodo(ejemplo, { ahora: AHORA }).total.carnets, 1)
  assert.equal(calcularTodo(ejemplo, { ahora: AHORA }).total.publicacionesNeed, 1)
})

test('mezcla: una ayuda con perfil de ejemplo no contamina lo real', () => {
  const datos = {
    perfiles: [
      P('r1', '2026-10-05T15:00:00Z'),
      P('r2', '2026-10-05T16:00:00Z'),
      P('r3', '2026-10-05T17:00:00Z'),
      P('e1', '2026-10-05T18:00:00Z', true)
    ],
    publicaciones: [
      POST('rp1', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('ep1', 'e1', 'need', '2026-10-06T16:00:00Z', { es_ejemplo: true })
    ],
    ayudas: [
      AYUDA('rp1', 'e1', '2026-10-07T15:00:00Z'),
      AYUDA('ep1', 'r2', '2026-10-07T16:00:00Z')
    ]
  }
  const { reales: r, ejemplo } = dividirDatos(datos)
  assert.equal(r.publicaciones.length, 1)
  assert.equal(r.ayudas.length, 0)
  assert.equal(ejemplo.ayudas.length, 2)
  assert.equal(metricasDe(r, { desde: '2026-10-01', hasta: '2026-10-31' }).publicacionesConRespuesta, 0)
})

test('mezcla: una reseña sobre una publicación de ejemplo no cuenta como real', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z'), P('r2', '2026-10-05T15:00:00Z'), P('e1', '2026-10-05T15:00:00Z', true)],
    publicaciones: [
      POST('rp1', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('ep1', 'e1', 'need', '2026-10-06T16:00:00Z', { es_ejemplo: true })
    ],
    resenas: [
      { id: 'x1', de_id: 'r1', para_id: 'r2', publicacion_id: 'ep1', estrellas: 5, created_at: '2026-10-08T15:00:00Z' },
      { id: 'x2', de_id: 'r1', para_id: 'r2', publicacion_id: 'rp1', estrellas: 4, created_at: '2026-10-09T15:00:00Z' }
    ]
  }
  const { reales: r, ejemplo } = dividirDatos(datos)
  assert.equal(r.resenas.length, 1)
  assert.equal(ejemplo.resenas.length, 1)
  assert.equal(metricasDe(r, { desde: '2026-10-05', hasta: '2026-10-11' }).resenas, 1)
})

test('publicaciones sin respuesta: 0 % y mediana nula', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z'), P('r2', '2026-10-05T16:00:00Z')],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('p2', 'r2', 'offer', '2026-10-07T15:00:00Z')
    ]
  }
  const m = metricasDe(reales(datos), { desde: '2026-10-05', hasta: '2026-10-11' })
  assert.equal(m.publicacionesConRespuesta, 0)
  assert.equal(m.respuestasMedidas, 0)
  assert.equal(m.medianaPrimeraRespuestaHoras, null)
})

test('una ayuda confirmada tarde cuenta en la semana en que se confirmó', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z'), P('r2', '2026-10-05T16:00:00Z')],
    publicaciones: [POST('p1', 'r1', 'need', '2026-10-26T15:00:00Z')],
    ayudas: [AYUDA('p1', 'r2', '2026-10-27T15:00:00Z', 'confirmada', '2026-11-03T15:00:00Z')]
  }
  const r = calcularTodo(reales(datos), { ahora: AHORA })
  const semana1 = r.semanas.find((s) => s.semana === '2026-10-26')
  const semana2 = r.semanas.find((s) => s.semana === '2026-11-02')
  assert.equal(semana1.metricas.ayudasConfirmadas, 0)
  assert.equal(semana2.metricas.ayudasConfirmadas, 1)
  assert.equal(r.total.ayudasConfirmadas, 1)
})

test('la semana cambia a las 00:00 de Colombia, no a la medianoche UTC', () => {
  assert.equal(diaBogota('2026-11-02T04:59:59Z'), '2026-11-01')
  assert.equal(diaBogota(null), null)
  assert.equal(diaBogota(undefined), null)
  assert.equal(diaBogota(''), null)
  assert.equal(semanaBogota('2026-11-02T04:59:59Z'), '2026-10-26')
  assert.equal(diaBogota('2026-11-02T05:00:00Z'), '2026-11-02')
  assert.equal(semanaBogota('2026-11-02T05:00:00Z'), '2026-11-02')

  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z')],
    publicaciones: [
      POST('domingo', 'r1', 'need', '2026-11-02T04:30:00Z'),
      POST('lunes', 'r1', 'offer', '2026-11-02T05:30:00Z')
    ]
  }
  const m1 = metricasDe(reales(datos), { desde: '2026-10-26', hasta: '2026-11-01' })
  const m2 = metricasDe(reales(datos), { desde: '2026-11-02', hasta: '2026-11-08' })
  assert.equal(m1.publicacionesTotal, 1)
  assert.equal(m2.publicacionesTotal, 1)
})

test('activación: % que publica en los primeros 7 días por cohorte', () => {
  const datos = {
    perfiles: [
      P('r1', '2026-10-05T15:00:00Z'),
      P('r2', '2026-10-06T15:00:00Z'),
      P('r3', '2026-10-07T15:00:00Z')
    ],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('p2', 'r2', 'offer', '2026-10-10T15:00:00Z'),
      POST('p3', 'r3', 'need', '2026-10-15T15:00:00Z')
    ]
  }
  const r = calcularTodo(reales(datos), { ahora: AHORA })
  const cohorte = r.activacion.find((c) => c.semana === '2026-10-05')
  assert.equal(cohorte.carnets, 3)
  assert.equal(cohorte.maduros, 3)
  assert.equal(cohorte.publicaron, 2)
  assert.ok(Math.abs(cohorte.pct - 66.6667) < 0.01)
})

test('activación: cohorte con menos de 7 días todavía no tiene porcentaje', () => {
  const datos = { perfiles: [P('r1', '2026-11-03T15:00:00Z')] }
  const r = calcularTodo(reales(datos), { ahora: Date.parse('2026-11-05T17:00:00Z') })
  const cohorte = r.activacion.find((c) => c.semana === '2026-11-02')
  assert.equal(cohorte.carnets, 1)
  assert.equal(cohorte.maduros, 0)
  assert.equal(cohorte.pct, null)
})

test('retención: semanas 1, 2 y 4 desde el registro', () => {
  const datos = {
    perfiles: [
      P('r1', '2026-10-05T15:00:00Z'),
      P('r2', '2026-10-05T15:00:00Z'),
      P('r3', '2026-10-05T15:00:00Z')
    ],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-13T15:00:00Z'), // +8 días: semana 1
      POST('p2', 'r2', 'offer', '2026-11-03T15:00:00Z') // +29 días: semana 4
    ]
  }
  const r = calcularTodo(reales(datos), { ahora: AHORA })
  const cohorte = r.retencion.find((c) => c.semana === '2026-10-05')
  assert.equal(cohorte.carnets, 3)
  assert.equal(cohorte.semanas[1].base, 3)
  assert.equal(cohorte.semanas[1].activos, 1)
  assert.ok(Math.abs(cohorte.semanas[1].pct - 33.3333) < 0.01)
  assert.equal(cohorte.semanas[2].activos, 0)
  assert.equal(cohorte.semanas[4].activos, 1)
})

test('retención: ventana sin cerrar no se calcula', () => {
  const datos = { perfiles: [P('r1', '2026-11-10T15:00:00Z')] }
  const r = calcularTodo(reales(datos), { ahora: Date.parse('2026-11-12T17:00:00Z') })
  const cohorte = r.retencion.find((c) => c.semana === '2026-11-09')
  assert.equal(cohorte.semanas[1].base, 0)
  assert.equal(cohorte.semanas[1].pct, null)
})

test('mediana: impar, par y sin datos', () => {
  assert.equal(mediana([1, 3, 10]), 3)
  assert.equal(mediana([2, 4]), 3)
  assert.equal(mediana([]), null)
  assert.equal(mediana([5]), 5)
})

test('tiempo mediano hasta la primera respuesta en horas', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z'), P('r2', '2026-10-05T15:00:00Z')],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('p2', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('p3', 'r1', 'need', '2026-10-06T15:00:00Z')
    ],
    ayudas: [
      AYUDA('p1', 'r2', '2026-10-06T16:00:00Z'),
      AYUDA('p2', 'r2', '2026-10-06T18:00:00Z'),
      AYUDA('p3', 'r2', '2026-10-07T01:00:00Z')
    ]
  }
  const m = metricasDe(reales(datos), { desde: '2026-10-05', hasta: '2026-10-11' })
  assert.equal(m.medianaPrimeraRespuestaHoras, 3)
  assert.equal(m.respuestasMedidas, 3)
})

test('ayudas nuevas: no cuenta si ya había ayuda o conexión entre la pareja', () => {
  const datos = {
    perfiles: [
      P('r1', '2026-10-05T15:00:00Z'),
      P('r2', '2026-10-05T15:00:00Z'),
      P('r3', '2026-10-05T15:00:00Z'),
      P('r4', '2026-10-05T15:00:00Z')
    ],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-05T15:00:00Z'),
      POST('p2', 'r1', 'need', '2026-10-12T15:00:00Z'),
      POST('p3', 'r3', 'offer', '2026-10-19T15:00:00Z')
    ],
    ayudas: [
      AYUDA('p1', 'r2', '2026-10-06T15:00:00Z'),
      AYUDA('p2', 'r2', '2026-10-13T15:00:00Z'),
      AYUDA('p3', 'r4', '2026-10-20T15:00:00Z')
    ],
    conexiones: [{ de_id: 'r3', a_id: 'r4', created_at: '2026-10-18T15:00:00Z' }]
  }
  const m = metricasDe(reales(datos), { desde: '2026-10-05', hasta: '2026-10-25' })
  assert.equal(m.ayudasConfirmadas, 3)
  assert.equal(m.ayudasNuevas, 1)
})

test('miembros distintos que dieron y recibieron, en need y offer', () => {
  const datos = {
    perfiles: [
      P('r1', '2026-10-05T15:00:00Z'),
      P('r2', '2026-10-05T15:00:00Z'),
      P('r3', '2026-10-05T15:00:00Z'),
      P('r4', '2026-10-05T15:00:00Z')
    ],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-05T15:00:00Z'),
      POST('p2', 'r3', 'offer', '2026-10-05T15:00:00Z')
    ],
    ayudas: [AYUDA('p1', 'r2', '2026-10-06T15:00:00Z'), AYUDA('p2', 'r4', '2026-10-06T16:00:00Z')]
  }
  const m = metricasDe(reales(datos), { desde: '2026-10-05', hasta: '2026-10-11' })
  assert.equal(m.miembrosDieron, 2)
  assert.equal(m.miembrosRecibieron, 2)
  assert.equal(m.miembrosAyuda, 4)
})

test('categorías: una publicación cuenta en cada categoría y las respuestas se cruzan', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z'), P('r2', '2026-10-05T15:00:00Z')],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-06T15:00:00Z', { categorias: ['Marca', 'Diseño'] }),
      POST('p2', 'r1', 'offer', '2026-10-07T15:00:00Z', { categorias: ['Marca'] })
    ],
    ayudas: [AYUDA('p1', 'r2', '2026-10-07T15:00:00Z')]
  }
  const cats = calcularTodo(reales(datos), { ahora: AHORA }).categorias
  const marca = cats.find((c) => c.categoria === 'Marca')
  const diseno = cats.find((c) => c.categoria === 'Diseño')
  assert.equal(marca.publicaciones, 2)
  assert.equal(marca.conRespuesta, 1)
  assert.equal(diseno.publicaciones, 1)
  assert.equal(diseno.conRespuesta, 1)
})

test('conexiones: la misma pareja en dos direcciones cuenta una vez', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z'), P('r2', '2026-10-05T15:00:00Z')],
    conexiones: [
      { de_id: 'r1', a_id: 'r2', created_at: '2026-10-06T15:00:00Z' },
      { de_id: 'r2', a_id: 'r1', created_at: '2026-10-07T15:00:00Z' }
    ]
  }
  const m = metricasDe(reales(datos), { desde: '2026-10-05', hasta: '2026-10-11' })
  assert.equal(m.conexiones, 1)
})

test('privacidad: los grupos de menos de 3 no muestran su cifra', () => {
  assert.equal(visible(2), 'menos de 3')
  assert.equal(visible(1), 'menos de 3')
  assert.equal(visible(0), 0)
  assert.equal(visible(3), 3)
  assert.equal(visible(2, { ejemplo: true }), 2)
  assert.equal(porcentajeVisible(1, 2), 'menos de 3')
  assert.equal(porcentajeVisible(1, 2, { ejemplo: true }), 50)
  assert.equal(porcentajeVisible(1, 4), 'menos de 3')
  assert.equal(porcentajeVisible(2, 4), 'menos de 3')
  assert.equal(porcentajeVisible(0, 4), 0)
  assert.equal(porcentajeVisible(3, 4), 75)
  assert.equal(porcentajeVisible(0, 0), null)
})

test('calcularTodo: totales y semanas usan el mismo corte de zona horaria', () => {
  const datos = {
    perfiles: [P('r1', '2026-10-05T15:00:00Z')],
    publicaciones: [
      POST('p1', 'r1', 'need', '2026-10-06T15:00:00Z'),
      POST('p2', 'r1', 'offer', '2026-10-07T15:00:00Z')
    ]
  }
  const r = calcularTodo(reales(datos), { ahora: AHORA })
  const suma = r.semanas.reduce((n, s) => n + s.metricas.publicacionesTotal, 0)
  assert.equal(suma, r.total.publicacionesTotal)
  assert.equal(r.total.publicacionesNeed, 1)
  assert.equal(r.total.publicacionesOffer, 1)
})
