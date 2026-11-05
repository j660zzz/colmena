// Cálculos puros de las métricas de validación (OE3).
// No lee de la red ni del navegador: recibe filas y devuelve números.
// Las definiciones están en docs/validacion/metricas.md.

export const TZ = 'America/Bogota'
export const MIN_GRUPO = 3

const lista = (x) => (Array.isArray(x) ? x : [])
const DIA = 86400000
const formatoPartes = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

// Día calendario en hora de Colombia como 'AAAA-MM-DD'.
// Si ya llega un día, se devuelve igual (no se reinterpreta como UTC).
export function diaBogota(fecha) {
  if (fecha === null || fecha === undefined || fecha === '') return null
  if (typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha
  const d = fecha instanceof Date ? fecha : new Date(fecha)
  if (Number.isNaN(d.getTime())) return null
  const p = formatoPartes.formatToParts(d)
  const valor = (tipo) => p.find((x) => x.type === tipo)?.value
  return `${valor('year')}-${valor('month')}-${valor('day')}`
}

export function sumarDias(dia, n) {
  const [y, m, d] = dia.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

export function diasEntre(desde, hasta) {
  return Math.round((Date.parse(`${hasta}T12:00:00Z`) - Date.parse(`${desde}T12:00:00Z`)) / DIA)
}

export function rangoDias(desde, hasta) {
  const dias = []
  for (let dia = desde; dia <= hasta && dias.length < 1000; dia = sumarDias(dia, 1)) dias.push(dia)
  return dias
}

// Lunes de la semana de una fecha, en hora de Colombia, como 'AAAA-MM-DD'.
export function semanaBogota(fecha) {
  const dia = diaBogota(fecha)
  if (!dia) return null
  const [y, m, d] = dia.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1, d))
  t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7))
  return t.toISOString().slice(0, 10)
}

// ---------- Separar reales de ejemplo ----------

export function dividirDatos(crudo = {}) {
  const perfiles = lista(crudo.perfiles)
  const publicaciones = lista(crudo.publicaciones)
  const ayudas = lista(crudo.ayudas)
  const meSirve = lista(crudo.meSirve)
  const conexiones = lista(crudo.conexiones)
  const asistencias = lista(crudo.asistencias)
  const participantes = lista(crudo.participantes)
  const votos = lista(crudo.votos)
  const interes = lista(crudo.interes)
  const resenas = lista(crudo.resenas)

  const perfilEjemplo = new Set(perfiles.filter((p) => p.es_ejemplo).map((p) => p.id))
  const postEjemplo = new Set(
    publicaciones
      .filter((p) => p.es_ejemplo || perfilEjemplo.has(p.autor_id))
      .map((p) => p.id)
  )

  const anotado = {
    perfiles: perfiles.map((p) => ({ ...p, _ejemplo: !!p.es_ejemplo })),
    publicaciones: publicaciones.map((p) => ({
      ...p,
      _ejemplo: !!p.es_ejemplo || perfilEjemplo.has(p.autor_id)
    })),
    ayudas: ayudas.map((a) => ({
      ...a,
      _ejemplo: postEjemplo.has(a.publicacion_id) || perfilEjemplo.has(a.perfil_id)
    })),
    meSirve: meSirve.map((x) => ({
      ...x,
      _ejemplo: postEjemplo.has(x.publicacion_id) || perfilEjemplo.has(x.perfil_id)
    })),
    conexiones: conexiones.map((x) => ({
      ...x,
      _ejemplo: perfilEjemplo.has(x.de_id) || perfilEjemplo.has(x.a_id)
    })),
    asistencias: asistencias.map((x) => ({ ...x, _ejemplo: perfilEjemplo.has(x.perfil_id) })),
    participantes: participantes.map((x) => ({ ...x, _ejemplo: perfilEjemplo.has(x.perfil_id) })),
    votos: votos.map((x) => ({
      ...x,
      _ejemplo: perfilEjemplo.has(x.votante_id) || perfilEjemplo.has(x.participante_id)
    })),
    interes: interes.map((x) => ({ ...x, _ejemplo: perfilEjemplo.has(x.perfil_id) })),
    resenas: resenas.map((x) => ({
      ...x,
      _ejemplo:
        perfilEjemplo.has(x.de_id) ||
        perfilEjemplo.has(x.para_id) ||
        postEjemplo.has(x.publicacion_id)
    }))
  }

  const separar = (ejemplo) =>
    Object.fromEntries(
      Object.entries(anotado).map(([k, filas]) => [k, filas.filter((x) => !!x._ejemplo === ejemplo)])
    )

  return { todos: anotado, reales: separar(false), ejemplo: separar(true) }
}

// ---------- Piezas de cálculo ----------

export function mediana(valores) {
  const limpios = valores.filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
  if (!limpios.length) return null
  const mitad = Math.floor(limpios.length / 2)
  return limpios.length % 2 ? limpios[mitad] : (limpios[mitad - 1] + limpios[mitad]) / 2
}

// Quién da la mano: en "Necesito" ayuda quien respondió; en "Ofrezco", el autor.
export function partesDe(publicacion, perfilResponde) {
  return publicacion.tipo === 'need'
    ? { ayuda: perfilResponde, recibe: publicacion.autor_id }
    : { ayuda: publicacion.autor_id, recibe: perfilResponde }
}

export const clavePareja = (a, b) => (String(a) < String(b) ? `${a}|${b}` : `${b}|${a}`)

// Historial de contacto registrado entre cada pareja (ayudas y conexiones).
function historialParejas(d) {
  const mapa = new Map()
  const postPorId = new Map(d.publicaciones.map((p) => [p.id, p]))
  const add = (a, b, fecha) => {
    if (!a || !b) return
    const ms = Date.parse(fecha)
    if (!Number.isFinite(ms)) return
    const k = clavePareja(a, b)
    if (!mapa.has(k)) mapa.set(k, [])
    mapa.get(k).push(ms)
  }
  d.ayudas.forEach((a) => {
    const post = postPorId.get(a.publicacion_id)
    if (!post) return
    const { ayuda, recibe } = partesDe(post, a.perfil_id)
    add(ayuda, recibe, a.created_at)
  })
  d.conexiones.forEach((c) => add(c.de_id, c.a_id, c.created_at))
  return mapa
}

// Personas distintas con al menos una acción de la lista de retención.
export function accionesPorPerfil(d) {
  const mapa = new Map()
  const postPorId = new Map(d.publicaciones.map((p) => [p.id, p]))
  const add = (id, fecha) => {
    if (!id || !fecha) return
    const ms = Date.parse(fecha)
    if (!Number.isFinite(ms)) return
    if (!mapa.has(id)) mapa.set(id, [])
    mapa.get(id).push(ms)
  }
  d.publicaciones.forEach((p) => add(p.autor_id, p.created_at))
  d.ayudas.forEach((a) => add(a.perfil_id, a.created_at))
  d.ayudas.forEach((a) => {
    if (a.estado !== 'confirmada' || !a.resuelta_at) return
    const post = postPorId.get(a.publicacion_id)
    if (post) add(post.autor_id, a.resuelta_at)
  })
  d.meSirve.forEach((x) => add(x.perfil_id, x.created_at))
  d.conexiones.forEach((x) => {
    add(x.de_id, x.created_at)
    add(x.a_id, x.created_at)
  })
  d.asistencias.forEach((x) => add(x.perfil_id, x.created_at))
  d.participantes.forEach((x) => add(x.perfil_id, x.created_at))
  d.votos.forEach((x) => add(x.votante_id, x.created_at))
  d.interes.forEach((x) => add(x.perfil_id, x.created_at))
  d.resenas.forEach((x) => add(x.de_id, x.created_at))
  return mapa
}

const distintos = (filas, campo) => new Set(filas.map((x) => x[campo]).filter(Boolean)).size

// Métricas de un periodo cerrado (día, semana o todo el histórico).
export function metricasDe(d, { desde, hasta, ahora = Date.now() } = {}) {
  const en = (fecha) => {
    const dia = diaBogota(fecha)
    return !!dia && dia >= desde && dia <= hasta
  }

  const postPorId = new Map(d.publicaciones.map((p) => [p.id, p]))

  // Respuestas por publicación (pueden llegar después del periodo).
  const respuestasPorPost = new Map()
  d.ayudas.forEach((a) => {
    const ms = Date.parse(a.created_at)
    if (!Number.isFinite(ms)) return
    if (!respuestasPorPost.has(a.publicacion_id)) respuestasPorPost.set(a.publicacion_id, [])
    respuestasPorPost.get(a.publicacion_id).push(ms)
  })

  const perfiles = d.perfiles.filter((p) => en(p.created_at))
  const publicaciones = d.publicaciones.filter((p) => en(p.created_at))
  const ayudas = d.ayudas.filter((a) => en(a.created_at))
  const confirmadas = d.ayudas.filter((a) => a.estado === 'confirmada' && en(a.resuelta_at || a.created_at))
  const meSirve = d.meSirve.filter((x) => en(x.created_at))
  const conexionesPeriodo = d.conexiones.filter((x) => en(x.created_at))
  const asistencias = d.asistencias.filter((x) => en(x.created_at))
  const participantes = d.participantes.filter((x) => en(x.created_at))
  const votos = d.votos.filter((x) => en(x.created_at))
  const interes = d.interes.filter((x) => en(x.created_at))
  const resenas = d.resenas.filter((x) => en(x.created_at))

  const conRespuesta = publicaciones.filter((p) => {
    const primera = Math.min(...(respuestasPorPost.get(p.id) || [Infinity]))
    return Number.isFinite(primera) && primera >= Date.parse(p.created_at)
  })
  const tiempos = conRespuesta
    .map((p) => (Math.min(...respuestasPorPost.get(p.id)) - Date.parse(p.created_at)) / 3600000)
    .filter((h) => Number.isFinite(h) && h >= 0)

  // Ayudas confirmadas: quién dio, quién recibió y si ya había contacto registrado.
  const dieron = new Set()
  const recibieron = new Set()
  const historial = historialParejas(d)
  let nuevas = 0
  confirmadas.forEach((a) => {
    const post = postPorId.get(a.publicacion_id)
    if (!post) return
    const { ayuda, recibe } = partesDe(post, a.perfil_id)
    if (!ayuda || !recibe) return
    dieron.add(ayuda)
    recibieron.add(recibe)
    const previos = historial.get(clavePareja(ayuda, recibe)) || []
    if (!previos.some((ms) => ms < Date.parse(a.created_at))) nuevas += 1
  })

  // Personas con alguna acción en el periodo.
  const activos = new Set()
  const sumarActivo = (id) => {
    if (id) activos.add(id)
  }
  publicaciones.forEach((p) => sumarActivo(p.autor_id))
  ayudas.forEach((a) => sumarActivo(a.perfil_id))
  confirmadas.forEach((a) => {
    const post = postPorId.get(a.publicacion_id)
    if (post) sumarActivo(post.autor_id)
  })
  meSirve.forEach((x) => sumarActivo(x.perfil_id))
  conexionesPeriodo.forEach((x) => {
    sumarActivo(x.de_id)
    sumarActivo(x.a_id)
  })
  asistencias.forEach((x) => sumarActivo(x.perfil_id))
  participantes.forEach((x) => sumarActivo(x.perfil_id))
  votos.forEach((x) => sumarActivo(x.votante_id))
  interes.forEach((x) => sumarActivo(x.perfil_id))
  resenas.forEach((x) => sumarActivo(x.de_id))

  const estrellas = resenas.map((r) => Number(r.estrellas)).filter((n) => Number.isFinite(n))
  const promedio = estrellas.length ? estrellas.reduce((a, b) => a + b, 0) / estrellas.length : null

  return {
    carnets: perfiles.length,
    publicacionesNeed: publicaciones.filter((p) => p.tipo === 'need').length,
    publicacionesOffer: publicaciones.filter((p) => p.tipo === 'offer').length,
    publicacionesTotal: publicaciones.length,
    publicacionesConRespuesta: conRespuesta.length,
    respuestasMedidas: tiempos.length,
    medianaPrimeraRespuestaHoras: mediana(tiempos),
    publicacionesResueltas: publicaciones.filter((p) => !!p.resuelta_at).length,
    ayudasConfirmadas: confirmadas.length,
    miembrosDieron: dieron.size,
    miembrosRecibieron: recibieron.size,
    miembrosAyuda: new Set([...dieron, ...recibieron]).size,
    ayudasNuevas: nuevas,
    conexiones: new Set(conexionesPeriodo.map((c) => clavePareja(c.de_id, c.a_id))).size,
    asistentes: distintos(asistencias, 'perfil_id'),
    interesTalleres: distintos(interes, 'perfil_id'),
    participantesReto: distintos(participantes, 'perfil_id'),
    votosReto: votos.length,
    miembrosActivos: activos.size,
    resenas: estrellas.length,
    estrellasPromedio: promedio
  }
}

export function porCategoria(d, { desde, hasta } = {}) {
  const en = (fecha) => {
    const dia = diaBogota(fecha)
    return !!dia && dia >= desde && dia <= hasta
  }
  const publicaciones = d.publicaciones.filter((p) => en(p.created_at))
  const conRespuesta = new Set(d.ayudas.map((a) => a.publicacion_id))
  const mapa = new Map()
  publicaciones.forEach((p) => {
    const cats = Array.isArray(p.categorias) ? p.categorias : []
    cats.filter(Boolean).forEach((categoria) => {
      const fila = mapa.get(categoria) || { categoria, publicaciones: 0, conRespuesta: 0 }
      fila.publicaciones += 1
      if (conRespuesta.has(p.id)) fila.conRespuesta += 1
      mapa.set(categoria, fila)
    })
  })
  return [...mapa.values()].sort(
    (a, b) => b.publicaciones - a.publicaciones || a.categoria.localeCompare(b.categoria, 'es')
  )
}

// Carnets de cada semana y cuántos publicaron en sus primeros 7 días.
export function activacionPorCohorte(d, { ahora = Date.now(), desde, hasta } = {}) {
  const porSemana = new Map()
  d.perfiles.forEach((p) => {
    const semana = semanaBogota(p.created_at)
    if (!semana) return
    if (semana < semanaBogota(desde) || semana > semanaBogota(hasta)) return
    if (!porSemana.has(semana)) porSemana.set(semana, [])
    porSemana.get(semana).push(p)
  })

  const pubs = new Map()
  d.publicaciones.forEach((p) => {
    if (!p.autor_id) return
    if (!pubs.has(p.autor_id)) pubs.set(p.autor_id, [])
    const ms = Date.parse(p.created_at)
    if (Number.isFinite(ms)) pubs.get(p.autor_id).push(ms)
  })

  return [...porSemana.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([semana, perfiles]) => {
      const maduros = perfiles.filter((p) => Date.parse(p.created_at) + 7 * DIA <= ahora)
      const publicaron = maduros.filter((p) => {
        const inicio = Date.parse(p.created_at)
        return (pubs.get(p.id) || []).some((ms) => ms >= inicio && ms < inicio + 7 * DIA)
      })
      return {
        semana,
        carnets: perfiles.length,
        maduros: maduros.length,
        publicaron: publicaron.length,
        pct: maduros.length ? (publicaron.length / maduros.length) * 100 : null
      }
    })
}

// Retención por cohorte: semanas 1, 2 y 4 desde el registro.
export function retencionPorCohorte(d, { ahora = Date.now(), desde, hasta } = {}) {
  const acciones = accionesPorPerfil(d)
  const porSemana = new Map()
  d.perfiles.forEach((p) => {
    const semana = semanaBogota(p.created_at)
    if (!semana) return
    if (semana < semanaBogota(desde) || semana > semanaBogota(hasta)) return
    if (!porSemana.has(semana)) porSemana.set(semana, [])
    porSemana.get(semana).push(p)
  })

  return [...porSemana.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([semana, perfiles]) => {
      const semanas = {}
      ;[1, 2, 4].forEach((n) => {
        const base = perfiles.filter((p) => Date.parse(p.created_at) + 7 * (n + 1) * DIA <= ahora)
        const activos = base.filter((p) => {
          const inicio = Date.parse(p.created_at) + 7 * n * DIA
          return (acciones.get(p.id) || []).some((ms) => ms >= inicio && ms < inicio + 7 * DIA)
        })
        semanas[n] = {
          base: base.length,
          activos: activos.length,
          pct: base.length ? (activos.length / base.length) * 100 : null
        }
      })
      return { semana, carnets: perfiles.length, semanas }
    })
}

// Cálculo completo de un conjunto (reales o de ejemplo).
export function calcularTodo(d, { ahora = Date.now(), desde, hasta } = {}) {
  const hoy = diaBogota(ahora)
  const fechas = []
  const sumar = (fecha) => {
    const dia = diaBogota(fecha)
    if (dia) fechas.push(dia)
  }
  d.perfiles.forEach((p) => sumar(p.created_at))
  d.publicaciones.forEach((p) => sumar(p.created_at))
  d.ayudas.forEach((a) => {
    sumar(a.created_at)
    sumar(a.resuelta_at)
  })
  d.meSirve.forEach((x) => sumar(x.created_at))
  d.conexiones.forEach((x) => sumar(x.created_at))
  d.asistencias.forEach((x) => sumar(x.created_at))
  d.participantes.forEach((x) => sumar(x.created_at))
  d.votos.forEach((x) => sumar(x.created_at))
  d.interes.forEach((x) => sumar(x.created_at))
  d.resenas.forEach((x) => sumar(x.created_at))

  fechas.sort()
  const primera = fechas.length ? fechas[0] : hoy
  const inicio = desde || (primera < hoy ? primera : hoy)
  const fin = hasta || hoy

  const semanas = []
  for (let lunes = semanaBogota(inicio); lunes <= fin; lunes = sumarDias(lunes, 7)) {
    const domingo = sumarDias(lunes, 6)
    semanas.push({
      semana: lunes,
      metricas: metricasDe(d, {
        desde: lunes < inicio ? inicio : lunes,
        hasta: domingo > fin ? fin : domingo,
        ahora
      })
    })
  }

  // El CSV diario se limita a un año para que el archivo no crezca sin control.
  const inicioDias = diasEntre(inicio, fin) > 365 ? sumarDias(fin, -365) : inicio
  const dias = rangoDias(inicioDias, fin).map((dia) => ({
    dia,
    metricas: metricasDe(d, { desde: dia, hasta: dia, ahora })
  }))

  return {
    periodo: { desde: inicio, hasta: fin, hoy },
    total: metricasDe(d, { desde: inicio, hasta: fin, ahora }),
    semanas,
    dias,
    categorias: porCategoria(d, { desde: inicio, hasta: fin }),
    activacion: activacionPorCohorte(d, { ahora, desde: inicio, hasta: fin }),
    retencion: retencionPorCohorte(d, { ahora, desde: inicio, hasta: fin })
  }
}

// ---------- Privacidad ----------

// Un conteo de 1 o 2 personas no se muestra en datos reales.
export function visible(valor, { ejemplo = false, minimo = MIN_GRUPO } = {}) {
  if (valor === null || valor === undefined) return null
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return valor
  if (ejemplo || valor === 0 || valor >= minimo) return valor
  return `menos de ${minimo}`
}

// Un porcentaje con denominador menor que el mínimo, o con 1 o 2 casos en el
// numerador, tampoco se muestra: la cifra dejaría ver un grupo pequeño.
export function porcentajeVisible(numerador, denominador, { ejemplo = false, minimo = MIN_GRUPO } = {}) {
  if (!denominador) return null
  if (!ejemplo && (denominador < minimo || (numerador > 0 && numerador < minimo))) return `menos de ${minimo}`
  return (numerador / denominador) * 100
}
