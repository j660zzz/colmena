// Reglas del V0 calculadas en el cliente a partir de datos reales.
const TZ = 'America/Bogota'

// Lunes 00:00 de la semana actual en hora de Colombia
export function inicioSemana(d = new Date()) {
  const local = new Date(d.toLocaleString('en-US', { timeZone: TZ }))
  const offset = d.getTime() - local.getTime()
  const dia = (local.getDay() + 6) % 7
  const lunes = new Date(local.getFullYear(), local.getMonth(), local.getDate() - dia)
  return new Date(lunes.getTime() + offset)
}

export const activa = (p, ahora = Date.now()) => !p.vence_en || new Date(p.vence_en).getTime() > ahora

export function quedan(vence) {
  if (!vence) return null
  const ms = new Date(vence).getTime() - Date.now()
  if (ms <= 0) return 'Venció'
  const h = Math.floor(ms / 3600000)
  if (h < 1) return 'Quedan minutos'
  if (h < 24) return `Quedan ${h} h`
  const d = Math.ceil(h / 24)
  return `Quedan ${d} ${d === 1 ? 'día' : 'días'}`
}

export function cierraEn(fecha) {
  const ms = new Date(fecha).getTime() - Date.now()
  if (ms <= 0) return 'Cerrado'
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(h / 24)
  if (d >= 1) return `Cierra en ${d}d ${h % 24}h`
  if (h >= 1) return `Cierra en ${h} h`
  return 'Cierra en minutos'
}

// Quién da la mano en una respuesta: en "Necesito" ayuda quien respondió; en "Ofrezco", el autor.
export function partesDe(post, respondio) {
  return post.tipo === 'need' ? { ayuda: respondio, recibe: post.autor_id } : { ayuda: post.autor_id, recibe: respondio }
}

export function manosConfirmadas(c) {
  return c.ayudas.filter((a) => a.estado === 'confirmada').map((a) => {
    const post = c.publicaciones.find((p) => p.id === a.publicacion_id)
    return post ? { ...a, post, ...partesDe(post, a.perfil_id) } : null
  }).filter(Boolean)
}

export const PANAL = 19

// Las manos de ejemplo siempre cuentan (para mostrar cómo se ve el panal) y se reportan aparte.
export function panalSemana(c) {
  const desde = inicioSemana().getTime()
  const manos = manosConfirmadas(c)
    .filter((m) => m.post.es_ejemplo || new Date(m.resuelta_at || m.created_at).getTime() >= desde)
    .sort((a, b) => (a.post.es_ejemplo - b.post.es_ejemplo) || (new Date(b.resuelta_at) - new Date(a.resuelta_at)))
  const ejemplos = Math.min(manos.filter((m) => m.post.es_ejemplo).length, PANAL)
  return { manos, llenas: Math.min(manos.length, PANAL), ejemplos, total: PANAL }
}

// Cuántos de una lista de perfiles son de ejemplo
export const cuantosEjemplo = (c, ids) => ids.filter((id) => c.perfil(id)?.es_ejemplo).length

export function manosDadas(c, id) {
  return manosConfirmadas(c).filter((m) => m.ayuda === id).length
}

// Personas cuyos "Necesito" activos caen en las categorías del perfil
export function quienesTeNecesitan(c, yo) {
  if (!yo?.categorias?.length) return []
  const autores = new Set()
  c.publicaciones.forEach((p) => {
    if (p.tipo !== 'need' || p.es_ejemplo || p.autor_id === yo.id || !activa(p)) return
    if (p.categorias.some((x) => yo.categorias.includes(x))) autores.add(p.autor_id)
  })
  return [...autores]
}

// Miembros que saben de las categorías de una publicación
export function quienesPueden(c, cats, excluir) {
  return c.perfiles
    .filter((m) => m.id !== excluir && m.categorias.some((x) => cats.includes(x)))
    .sort((a, b) => (a.es_ejemplo - b.es_ejemplo) || (manosDadas(c, b.id) - manosDadas(c, a.id)))
}

export function tendencias(c) {
  const desde = Date.now() - 7 * 86400000
  const n = {}
  c.publicaciones.forEach((p) => {
    if (p.es_ejemplo || new Date(p.created_at).getTime() < desde) return
    p.categorias.forEach((x) => { n[x] = (n[x] || 0) + 1 })
  })
  return Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 3)
}

export function activoSemana(c, id) {
  const desde = Date.now() - 7 * 86400000
  return c.publicaciones.some((p) => p.autor_id === id && new Date(p.created_at).getTime() > desde)
    || c.ayudas.some((a) => a.perfil_id === id && new Date(a.created_at).getTime() > desde)
}

// Qué tan completo está un carnet (lo ve solo el dueño)
export function completitud(p) {
  const pasos = [
    { ok: !!p.nombre, v: 20, t: 'Tu nombre' },
    { ok: p.categorias?.length > 0, v: 20, t: 'Elige en qué te mueves' },
    { ok: !!p.tiene_whatsapp, v: 15, t: 'Agrega tu WhatsApp' },
    { ok: !!p.rol, v: 15, t: 'Cuenta qué haces' },
    { ok: !!p.marca, v: 15, t: 'Agrega tu marca' },
    { ok: p.habilidades?.length > 0, v: 15, t: 'Escribe lo que sabes hacer' }
  ]
  return { pct: pasos.reduce((s, x) => s + (x.ok ? x.v : 0), 0), faltan: pasos.filter((x) => !x.ok) }
}

export function semanaDelMes(d = new Date()) {
  const dia = Number(d.toLocaleString('en-US', { timeZone: TZ, day: 'numeric' }))
  return Math.min(3, Math.ceil(dia / 7))
}

export const waLink = (num, texto) => `https://wa.me/${num}${texto ? '?text=' + encodeURIComponent(texto) : ''}`
