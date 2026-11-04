// Destacados del inicio: anillos con pantallas cortas armadas solo con datos reales de la base.
// Esta función es pura (no lee ni escribe nada) para poder probarla sin navegador.
const DIA = 86400000
const CIERRE_CERCANO = 21 * DIA

const lista = (v) => (Array.isArray(v) ? v : [])
const hasta = (x) => (x.cierre ? Date.parse(x.cierre) : Infinity)

export function construirDestacados({ ahora = Date.now(), ganador = null, perfilGanador = null, reto = null, aliados = [], talleres = [], convocatorias = [], beneficios = [], participantes = 0 } = {}) {
  const anillos = []
  const abierto = !!reto && Date.parse(reto.cierra_en) > ahora

  // 1. Destacado de la semana y reto
  const retoSlide = abierto ? [{
    id: `reto-${reto.id}`, k: 'reto', oscura: false,
    kicker: 'Reto de la semana', titulo: reto.titulo, valor: null,
    texto: participantes > 0 ? `${participantes} ${participantes === 1 ? 'participa' : 'participan'}. El perfil ganador aparece 7 días en el inicio.` : 'Nadie participa todavía. El perfil ganador aparece 7 días en el inicio.',
    cierra: reto.cierra_en, cta: { texto: 'Participar', ir: { tipo: 'tab', tab: 'encuentro', ancla: 'enc-reto' } }
  }] : []
  if (ganador && perfilGanador) {
    anillos.push({
      id: 'destacado', nombre: 'Destacado', icono: 'star',
      slides: [{
        id: `ganador-${ganador.perfil_id}-${ganador.reto.id}`, k: 'ganador', oscura: true, ejemplo: !!perfilGanador.es_ejemplo,
        kicker: 'Destacado de la semana', titulo: perfilGanador.marca || perfilGanador.nombre, subtitulo: perfilGanador.nombre,
        texto: lista(perfilGanador.habilidades).slice(0, 3).join(' · ') || perfilGanador.rol || '',
        nota: `Ganó el reto: ${ganador.reto.titulo}`, perfil: perfilGanador,
        cta: { texto: 'Ver carnet', ir: { tipo: 'nav', pantalla: { t: 'carnet', id: perfilGanador.id } } }
      }, ...retoSlide]
    })
  } else if (retoSlide.length) {
    anillos.push({ id: 'reto', nombre: 'Reto', icono: 'spark', slides: retoSlide })
  }

  // 2. Descuentos de aliados
  const ali = lista(aliados).filter((b) => b.tipo === 'aliado')
  if (ali.length) {
    anillos.push({
      id: 'descuentos', nombre: 'Descuentos', icono: 'card',
      slides: ali.map((b) => ({
        id: `aliado-${b.id}`, k: 'aliado', oscura: false, ejemplo: !!b.es_ejemplo,
        kicker: [b.categoria, b.zona].filter(Boolean).join(' · '), titulo: b.nombre, valor: b.etiqueta || b.oferta,
        texto: b.oferta, cta: { texto: 'Mostrar mi carnet', ir: { tipo: 'mostrar' } }
      }))
    })
  }

  // 3. Talleres
  const tal = lista(talleres).slice(0, 3)
  if (tal.length) {
    anillos.push({
      id: 'talleres', nombre: 'Talleres', icono: 'bulb',
      slides: tal.map((t) => ({
        id: `taller-${t.id}`, k: 'taller', oscura: false, ejemplo: !!t.es_ejemplo,
        kicker: `Taller · ${t.categoria}`, titulo: t.titulo, texto: t.resumen || '',
        nota: [t.duracion, t.modalidad === 'virtual' ? 'Virtual' : 'Presencial'].filter(Boolean).join(' · '),
        cta: { texto: 'Ver talleres', ir: { tipo: 'tab', tab: 'encuentro', ancla: 'enc-talleres' } }
      }))
    })
  }

  // 4. Convocatorias con cierre cercano (las que ya cerraron no entran)
  const conv = lista(convocatorias)
    .filter((x) => x.cierre && hasta(x) > ahora && hasta(x) - ahora <= CIERRE_CERCANO)
    .sort((a, b) => hasta(a) - hasta(b)).slice(0, 4)
  if (conv.length) {
    anillos.push({
      id: 'cierran', nombre: 'Cierran pronto', icono: 'hour',
      slides: conv.map((x) => ({
        id: `conv-${x.id}`, k: 'conv', oscura: true,
        kicker: x.tipo === 'feria' ? 'Feria' : x.tipo === 'evento' ? 'Evento' : 'Convocatoria', titulo: x.nombre,
        texto: x.organizador || '', nota: x.pago || x.costo || '', cierra: x.cierre,
        cta: { texto: 'Ver convocatoria', ir: { tipo: 'tab', tab: 'encuentro', ancla: 'enc-ferias' } }
      }))
    })
  }

  // 5. Beneficios que más sirven (la lista llega ya ordenada por la pantalla de Beneficios)
  const ben = lista(beneficios).filter((b) => b.tipo === 'digital').slice(0, 4)
  if (ben.length) {
    anillos.push({
      id: 'beneficios', nombre: 'Gratis', icono: 'gift',
      slides: ben.map((b) => ({
        id: `ben-${b.id}`, k: 'beneficio', oscura: false, ejemplo: !!b.es_ejemplo,
        kicker: b.categoria || 'Beneficio', titulo: b.nombre, valor: b.etiqueta || (b.gratis ? 'Gratis' : ''),
        texto: b.oferta, cta: { texto: 'Ver beneficios', ir: { tipo: 'tab', tab: 'herramientas' } }
      }))
    })
  }

  return anillos.map((a) => ({ ...a, firma: a.slides.map((s) => s.id).join('|') }))
}

// Visto / no visto: solo en este navegador. Si cambia el contenido del anillo, vuelve a salir como nuevo.
const K = 'colmena.destacados.vistos.v1'
export function leerVistos() {
  try { const x = JSON.parse(localStorage.getItem(K) || '{}'); return x && typeof x === 'object' ? x : {} } catch { return {} }
}
export function marcarVisto(anillo) {
  const x = leerVistos()
  x[anillo.id] = anillo.firma
  try { localStorage.setItem(K, JSON.stringify(x)) } catch { /* sin almacenamiento: no se bloquea nada */ }
  return x
}
export const estaVisto = (vistos, anillo) => vistos[anillo.id] === anillo.firma
