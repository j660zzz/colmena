import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ganadores, destacadoActual } from '../src/lib/destacados.js'
const cierre = '2026-11-05T04:59:00Z',
  fin = Date.parse(cierre)
const reto = { id: 'r1', numero: 1, cierra_en: cierre, activo: false }
const participantes = [
  {
    reto_id: 'r1',
    perfil_id: 'a',
    link: 'https://ejemplo.test/a',
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    reto_id: 'r1',
    perfil_id: 'b',
    link: 'https://ejemplo.test/b',
    created_at: '2026-11-02T00:00:00Z',
  },
]
const voto = (id, quien, fecha = cierre) => ({
  reto_id: 'r1',
  participante_id: id,
  votante_id: quien,
  created_at: fecha,
})
test('no hay destacado antes del cierre', () =>
  assert.equal(
    destacadoActual([reto], participantes, [voto('a', 'x')], fin - 1),
    null,
  ))
test('cuenta votos hasta el instante de cierre inclusive y exige link', () =>
  assert.equal(
    destacadoActual(
      [reto],
      [...participantes, { ...participantes[0], perfil_id: 'c', link: '' }],
      [voto('a', 'x'), voto('b', 'y', '2026-11-05T05:00:00Z'), voto('c', 'z')],
      fin,
    ).perfil_id,
    'a',
  ))
test('desempata por participación más temprana', () =>
  assert.equal(
    destacadoActual(
      [reto],
      participantes,
      [voto('a', 'x'), voto('b', 'y')],
      fin,
    ).perfil_id,
    'a',
  ))
test('sin votos válidos no hay premio', () =>
  assert.equal(
    destacadoActual([reto], participantes, [voto('a', 'a')], fin),
    null,
  ))
test('no cuentan duplicados del mismo votante', () =>
  assert.equal(
    ganadores([reto], participantes, [voto('a', 'x'), voto('a', 'x')], fin)[0]
      .utiles,
    1,
  ))
test('participación posterior al cierre no puede ganar', () =>
  assert.equal(
    destacadoActual(
      [reto],
      [{ ...participantes[0], created_at: '2026-11-05T05:00:00Z' }],
      [voto('a', 'x')],
      fin,
    ),
    null,
  ))
test('vence exactamente a los siete días, historial permanece', () => {
  assert.equal(
    destacadoActual(
      [reto],
      participantes,
      [voto('a', 'x')],
      fin + 7 * 86400000,
    ),
    null,
  )
  assert.equal(
    ganadores([reto], participantes, [voto('a', 'x')], fin + 7 * 86400000)
      .length,
    1,
  )
})
test('un cierre nuevo sin ganador no rescata al anterior', () =>
  assert.equal(
    destacadoActual(
      [reto, { id: 'r2', numero: 2, cierra_en: '2026-11-06T00:00:00Z' }],
      participantes,
      [voto('a', 'x')],
      Date.parse('2026-11-06T00:00:00Z'),
    ),
    null,
  ))
