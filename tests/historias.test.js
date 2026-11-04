import test from 'node:test'
import assert from 'node:assert/strict'
import { construirDestacados, estaVisto } from '../src/lib/historias.js'

const ahora = Date.parse('2026-11-04T20:00:00Z')
const base = {
  ahora,
  reto: { id: 'r1', titulo: 'Rediseña un empaque', cierra_en: '2026-11-05T04:00:00Z' },
  aliados: [{ id: 'a1', tipo: 'aliado', nombre: 'Café', etiqueta: '−10 %', oferta: '10 % para miembros', es_ejemplo: true }],
  talleres: [{ id: 't1', titulo: 'Reels', categoria: 'Video', duracion: '90 min', modalidad: 'virtual', es_ejemplo: true }],
  convocatorias: [
    { id: 'c1', nombre: 'Lejana', cierre: '2027-03-01T00:00:00Z' },
    { id: 'c2', nombre: 'Cerca', cierre: '2026-11-10T00:00:00Z' },
    { id: 'c3', nombre: 'Vencida', cierre: '2026-11-01T00:00:00Z' }
  ],
  beneficios: [{ id: 'b1', tipo: 'digital', nombre: 'Adobe', etiqueta: '−60 %', oferta: 'Suite' }]
}

test('sin ganador, el reto abierto abre el primer anillo', () => {
  const a = construirDestacados(base)
  assert.equal(a[0].id, 'reto')
  assert.deepEqual(a.map((x) => x.id), ['reto', 'descuentos', 'talleres', 'cierran', 'beneficios'])
})
test('con ganador, el destacado va primero y mantiene la marca Ejemplo', () => {
  const a = construirDestacados({ ...base, ganador: { perfil_id: 'p', reto: { id: 'r0', titulo: 'Anterior' } }, perfilGanador: { id: 'p', nombre: 'Ana', es_ejemplo: true, habilidades: [] } })
  assert.equal(a[0].id, 'destacado')
  assert.equal(a[0].slides[0].ejemplo, true)
})
test('solo entran convocatorias que cierran en 21 días y no vencidas', () => {
  const a = construirDestacados(base).find((x) => x.id === 'cierran')
  assert.deepEqual(a.slides.map((s) => s.titulo), ['Cerca'])
})
test('lo de ejemplo conserva la etiqueta', () => {
  const a = construirDestacados(base)
  assert.ok(a.find((x) => x.id === 'descuentos').slides.every((s) => s.ejemplo))
  assert.ok(a.find((x) => x.id === 'talleres').slides.every((s) => s.ejemplo))
})
test('fallos de datos no rompen: listas vacías y reto cerrado', () => {
  assert.deepEqual(construirDestacados({ ahora }), [])
  const a = construirDestacados({ ...base, reto: { ...base.reto, cierra_en: '2026-11-04T10:00:00Z' }, aliados: undefined })
  assert.ok(!a.some((x) => x.id === 'reto' || x.id === 'descuentos'))
})
test('visto se invalida cuando cambia el contenido', () => {
  const [r] = construirDestacados(base)
  assert.ok(estaVisto({ reto: r.firma }, r))
  assert.ok(!estaVisto({ reto: 'otro' }, r))
})
