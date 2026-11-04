import { useEffect, useRef, useState } from 'react'
import { useColmena } from '../lib/store'
import { carnetId } from '../lib/format'
import { normal } from '../lib/logic'
import { Icon, Hex, Ejemplo, Sheet, Empty, Comb, useToast } from '../components/ui'

const fecha = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const CATS_B = ['Diseño', 'Web', 'Productividad', 'Audio y video', 'Equipos']
const TITULO = {
  'Diseño': 'Para diseñar',
  Web: 'Para lanzar tu marca en internet',
  Productividad: 'Para organizarte',
  'Audio y video': 'Para el día a día',
  Equipos: 'Para equiparte'
}
const ICONO_CAT = { 'Diseño': 'spark', Web: 'link', Productividad: 'note', 'Audio y video': 'clock', Equipos: 'bag' }
// Los primeros destacados son los que más le sirven a un emprendimiento de diseño
const PRIMERO = ['Suite de Adobe', 'Dominio web gratis', 'Framer', 'Microsoft 365']
const rango = (b) => { const k = PRIMERO.indexOf(b.nombre); return k < 0 ? 99 : k }

// Guardados y activados: solo en este dispositivo
const K_MIOS = 'colmena.beneficios.v1'
function leerMios() {
  try { const x = JSON.parse(localStorage.getItem(K_MIOS) || '{}'); return { guardados: x.guardados || [], activados: x.activados || [] } } catch { return { guardados: [], activados: [] } }
}
function useMios() {
  const [mios, setMios] = useState(leerMios)
  const alternar = (lista, id) => setMios((m) => {
    const n = { ...m, [lista]: m[lista].includes(id) ? m[lista].filter((x) => x !== id) : [...m[lista], id] }
    try { localStorage.setItem(K_MIOS, JSON.stringify(n)) } catch { /* sin almacenamiento */ }
    return n
  })
  return [mios, alternar]
}

// Beneficios como tienda: destacados, colecciones por categoría, filtros y buscador
export function SeccionBeneficios({ pedirPerfil, nav }) {
  const c = useColmena()
  const [abierto, setAbierto] = useState(null)
  const [proponer, setProponer] = useState(false)
  const [filtro, setFiltro] = useState('todo')
  const [q, setQ] = useState('')
  const [mios, alternarMio] = useMios()
  const arriba = useRef(null)

  const digitales = c.beneficios.filter((b) => b.tipo === 'digital')
  const aliados = c.beneficios.filter((b) => b.tipo === 'aliado')
  const reales = aliados.filter((b) => !b.es_ejemplo).length
  const destacados = digitales.filter((b) => b.destacado).sort((x, y) => rango(x) - rango(y))
  const nGratis = digitales.filter((b) => b.gratis).length
  const cats = CATS_B.filter((k) => digitales.some((b) => b.categoria === k))

  const t = normal(q.trim())
  const coincide = (b) => !t || normal([b.nombre, b.oferta, b.categoria, b.detalle].join(' ')).includes(t)
  const lista = c.beneficios.filter((b) => coincide(b) && (
    filtro === 'todo' ? true
      : filtro === 'gratis' ? b.gratis
      : filtro === 'guardados' ? mios.guardados.includes(b.id)
      : filtro === 'aliados' ? b.tipo === 'aliado'
      : b.tipo === 'digital' && b.categoria === filtro))
  const tienda = filtro === 'todo' && !t
  const elegir = (f) => { setFiltro(f); arriba.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const filtros = [['todo', 'Todo'], ...(mios.guardados.length ? [['guardados', `Guardados ${mios.guardados.length}`]] : []), ['gratis', 'Gratis'], ...cats.map((k) => [k, k]), ['aliados', 'Aliados en Cali']]
  const tile = (b, i) => (
    <Tile key={b.id} b={b} i={i} onClick={() => setAbierto(b)} sinValor={filtro === 'gratis'}
      guardado={mios.guardados.includes(b.id)} activado={mios.activados.includes(b.id)} />
  )

  return (
    <>
      <header className="ptitle">
        <h1>Beneficios</h1>
        {digitales.length > 0 && <p className="sub"><b>{nGratis} gratis</b> y {digitales.length - nGratis} con descuento con tu correo Javeriana</p>}
      </header>

      <div className="ben-filtros" ref={arriba}>
        <div className="search">
          <Icon n="search" s={19} />
          <input type="search" placeholder="Busca Adobe, Spotify, dominio…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar beneficios" />
          {q && <button type="button" className="iconbtn" aria-label="Limpiar búsqueda" onClick={() => setQ('')}><Icon n="x" s={18} /></button>}
        </div>
        <div className="bchips" role="tablist" aria-label="Filtrar beneficios">
          {filtros.map(([k, txt]) => (
            <button key={k} type="button" role="tab" aria-selected={filtro === k} onClick={() => elegir(k)}>{txt}</button>
          ))}
        </div>
      </div>

      {tienda ? (
        <>
          {destacados.length > 0 && (
            <div className="bdest-pista">
              {destacados.map((b, i) => (
                <button key={b.id} type="button" className={'bdest ' + (i % 2 ? 'polen' : 'ink')} onClick={() => setAbierto(b)}>
                  <Comb className="bdest-comb" viewBox="0 0 120 120" r={16} w={150} h={150} x0={0} y0={0} stroke="currentColor" sw={1.5} />
                  <span className="bdest-top"><span className="k">{b.categoria}</span><b className="bdest-et">{b.etiqueta || 'Beneficio'}</b></span>
                  <span className="bdest-n">{b.nombre}</span>
                  <span className="bdest-o">{b.oferta}</span>
                  <span className="go">Cómo obtenerlo <Icon n="right" s={15} w={2.2} /></span>
                </button>
              ))}
            </div>
          )}

          {cats.map((k) => {
            const fila = digitales.filter((b) => b.categoria === k)
            return (
              <section key={k} className="bfila">
                <div className="sec-h"><h3>{TITULO[k] || k}</h3><button type="button" className="ver" onClick={() => elegir(k)}>Ver {fila.length}</button></div>
                <div className="bfila-pista">{fila.map(tile)}</div>
              </section>
            )
          })}

          <section className="bfila">
            <div className="sec-h"><h3>Aliados en Cali</h3><span className="meta">{reales ? `${reales} ${reales === 1 ? 'negocio' : 'negocios'}` : 'Muy pronto'}</span></div>
            <p className="soft">Negocios que dan descuento a los miembros de Colmena. Muestras tu carnet y listo.</p>
            <div className="bfila-pista">{aliados.map(tile)}</div>
          </section>
        </>
      ) : lista.length === 0 ? (
        <Empty title="No encontramos ese beneficio">Prueba con otra palabra o mira todas las categorías.</Empty>
      ) : (
        <>
          <p className="fine">{lista.length} {lista.length === 1 ? 'beneficio' : 'beneficios'}{filtro !== 'todo' && cats.includes(filtro) ? ` en ${filtro}` : ''}</p>
          <div className="bgrid">{lista.map(tile)}</div>
        </>
      )}

      <button type="button" className="sumate" onClick={() => setProponer(true)}>
        <Icon n="spark" s={18} />
        <span><b>¿Tienes un negocio o conoces uno?</b><small>Propón un descuento para los miembros de Colmena.</small></span>
        <Icon n="right" s={18} />
      </button>
      <p className="fine center">Revisamos cada beneficio en su página oficial. Los precios y condiciones los pone cada marca y pueden cambiar.</p>

      <Sheet open={!!abierto} onClose={() => setAbierto(null)} label="Detalle del beneficio">
        {abierto && (
          <Detalle b={abierto} mios={mios} alternar={alternarMio}
            onCarnet={() => { setAbierto(null); pedirPerfil('Necesitas un carnet para usar los descuentos de aliados.', () => nav({ t: 'mostrar' })) }} />
        )}
      </Sheet>
      <Sheet open={proponer} onClose={() => setProponer(false)} label="Proponer un beneficio">
        {proponer && <Proponer onListo={() => setProponer(false)} />}
      </Sheet>
    </>
  )
}

// La portada es el valor del beneficio (GRATIS, −45 %, 1 AÑO…), no una letra
function Tile({ b, i = 0, onClick, sinValor = false, guardado = false, activado = false }) {
  const aliado = b.tipo === 'aliado'
  const valor = sinValor ? b.oferta : (b.etiqueta || b.oferta)
  const largo = valor.length > 10
  const tono = i % 2 ? 'blanco' : 'ink'
  return (
    <button type="button" className={'btile ' + tono + (aliado ? ' aliado' : '')} onClick={onClick}>
      <span className="btile-cov">
        <span className="btile-ic"><Icon n={aliado ? 'pin' : ICONO_CAT[b.categoria] || 'seal'} s={18} /></span>
        {(guardado || activado) && (
          <span className={'btile-mio' + (activado ? ' ok' : '')} aria-label={activado ? 'Ya lo activaste' : 'Guardado'}>
            <Icon n={activado ? 'check' : 'star'} s={14} w={2.4} />
          </span>
        )}
        <b className={'btile-v' + (largo ? ' largo' : '') + (sinValor ? ' oferta' : '')}>{valor}</b>
      </span>
      <span className="btile-b">
        <b>{b.nombre}</b>
        {!sinValor && <span className="btile-o">{b.oferta}</span>}
        {(aliado || b.para_todos) && (
          <span className="btile-f">{aliado ? <>{b.zona || b.categoria}{b.es_ejemplo && <Ejemplo p={b} />}</> : 'Gratis para todos'}</span>
        )}
      </span>
    </button>
  )
}

function Detalle({ b, onCarnet, mios, alternar }) {
  const guardado = mios.guardados.includes(b.id)
  const activado = mios.activados.includes(b.id)
  return (
    <div className="ben-det">
      <div className="ben-det-top">
        <span className="tag">{b.tipo === 'digital' ? b.categoria : `Aliado · ${b.categoria}`}</span>
        {b.para_todos && <span className="tag">Gratis para todos</span>}
      </div>
      {b.etiqueta && <b className="ben-det-et">{b.etiqueta}</b>}
      <h2>{b.nombre}{b.es_ejemplo && <Ejemplo p={b} />}</h2>
      <p className="ben-oferta">{b.oferta}</p>
      {b.detalle && <p>{b.detalle}</p>}
      {b.como.length > 0 && (
        <>
          <h3>Cómo obtenerlo</h3>
          <ol className="ben-pasos">{b.como.map((x, i) => <li key={i}><i>{i + 1}</i><span>{x}</span></li>)}</ol>
        </>
      )}
      {b.requisito && <p className="soft"><b>Requisito:</b> {b.requisito}</p>}
      <div className="ben-mio">
        <button type="button" aria-pressed={guardado} onClick={() => alternar('guardados', b.id)}><Icon n="star" s={17} w={guardado ? 2.4 : 1.8} />{guardado ? 'Guardado' : 'Guardar'}</button>
        {b.tipo === 'digital' && <button type="button" className="ok" aria-pressed={activado} onClick={() => alternar('activados', b.id)}><Icon n="check" s={17} w={2.4} />{activado ? 'Ya lo activé' : 'Marcar como activado'}</button>}
      </div>
      {b.es_ejemplo && <p className="nota">Este aliado es de ejemplo para mostrar cómo funciona. No es un negocio real.</p>}
      {b.tipo === 'aliado'
        ? <button type="button" className="btn primary full big" onClick={onCarnet}><Icon n="card" s={18} />Mostrar mi carnet</button>
        : b.link && <a className="btn primary full big" href={b.link} target="_blank" rel="noopener noreferrer">Ir a la página oficial <Icon n="ext" s={16} /></a>}
      {b.verificado_en && (
        <p className="fine center">Revisado el {fecha(b.verificado_en)}. Los precios pueden cambiar.{b.fuente && <> <a href={b.fuente} target="_blank" rel="noopener noreferrer">Ver fuente</a></>}</p>
      )}
    </div>
  )
}

// El carnet en pantalla completa, con la hora corriendo para que se vea que no es una captura
export function CarnetParaMostrar() {
  const c = useColmena()
  const [ahora, setAhora] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setAhora(new Date()), 1000); return () => clearInterval(t) }, [])
  const yo = c.yo
  if (!yo) return null
  return (
    <div className="mostrar">
      <span className="k">Carnet de Colmena</span>
      <Hex p={yo} w={88} h={100} fs={30} />
      <h2>{yo.nombre}</h2>
      <p className="mono">{carnetId(yo.carnet)}</p>
      <div className="reloj">
        <span className="vivo"><i />Activo ahora</span>
        <b className="mono">{ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</b>
        <span>{ahora.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>
      <p className="soft center">Muéstrale esta pantalla a quien te atiende. La hora en vivo confirma que no es una captura.</p>
    </div>
  )
}

function Proponer({ onListo }) {
  const c = useColmena()
  const toast = useToast()
  const [f, setF] = useState({ negocio: '', contacto: '', propuesta: '' })
  const [enviando, setEnviando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.negocio.trim().length >= 2 && f.contacto.trim().length >= 5 && f.propuesta.trim().length >= 5
  const enviar = async (e) => {
    e.preventDefault(); if (!ok) return
    setEnviando(true)
    try { await c.proponerBeneficio(f.negocio, f.contacto, f.propuesta); toast('Recibido. Te contactamos pronto.'); onListo() }
    catch (x) { toast(x.message, true) } finally { setEnviando(false) }
  }
  return (
    <form className="ben-det" onSubmit={enviar}>
      <h2>Propón un beneficio</h2>
      <p className="soft">Si tienes un negocio, o conoces uno que quiera apoyar a estudiantes que emprenden, cuéntanos. Revisamos cada propuesta antes de publicarla.</p>
      <div className="field"><label htmlFor="pb-n">Negocio *</label><div className="inp"><input id="pb-n" maxLength={80} value={f.negocio} onChange={set('negocio')} placeholder="Nombre del negocio" /></div></div>
      <div className="field"><label htmlFor="pb-c">Contacto *</label><div className="inp"><input id="pb-c" maxLength={80} value={f.contacto} onChange={set('contacto')} placeholder="WhatsApp, Instagram o correo" /></div></div>
      <div className="field"><label htmlFor="pb-p">¿Qué beneficio ofrecería? *</label><div className="ta"><textarea id="pb-p" maxLength={400} value={f.propuesta} onChange={set('propuesta')} placeholder="Ej: 10 % en impresiones para miembros con carnet" /></div></div>
      <button type="submit" className="btn primary full big" disabled={!ok || enviando}>{enviando ? 'Enviando…' : 'Enviar propuesta'}</button>
    </form>
  )
}
