import { useEffect, useState } from 'react'
import { useColmena } from '../lib/store'
import { carnetId } from '../lib/format'
import { Icon, Hex, Ejemplo, Sheet, useToast } from '../components/ui'

const fecha = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
const inicial = (n) => n.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ ]/g, '').split(' ').filter(Boolean).slice(0, 2).map((x) => x[0]).join('').toUpperCase()

// Bloque de beneficios: los digitales que ya tienes por ser estudiante y los aliados en Cali
export function SeccionBeneficios({ pedirPerfil, nav }) {
  const c = useColmena()
  const [abierto, setAbierto] = useState(null)
  const [proponer, setProponer] = useState(false)
  const digitales = c.beneficios.filter((b) => b.tipo === 'digital')
  const aliados = c.beneficios.filter((b) => b.tipo === 'aliado')
  const reales = aliados.filter((b) => !b.es_ejemplo).length

  return (
    <>
      <section className="ben-hero">
        <span className="k">Con tu correo Javeriana</span>
        <h3>Ya tienes {digitales.length} beneficios que quizás no estás usando</h3>
        <p>Software y suscripciones gratis o con descuento por ser estudiante. Revisamos cada uno en su página oficial.</p>
      </section>

      <div className="ben-list">
        {digitales.map((b) => (
          <button key={b.id} type="button" className="ben" onClick={() => setAbierto(b)}>
            <span className="ben-ic">{inicial(b.nombre)}</span>
            <span className="ben-t"><b>{b.nombre}</b><span>{b.oferta}</span></span>
            <Icon n="right" s={18} />
          </button>
        ))}
      </div>

      <div className="sec-h"><h3>Aliados en Cali</h3><span className="meta">{reales ? `${reales} ${reales === 1 ? 'negocio' : 'negocios'}` : 'Muy pronto'}</span></div>
      <p className="soft">Negocios que dan descuento a los miembros de Colmena. Muestras tu carnet y listo.</p>
      <div className="aliados">
        {aliados.map((b) => (
          <button key={b.id} type="button" className="aliado" onClick={() => setAbierto(b)}>
            <span className="al-top"><span className="tag">{b.categoria}</span>{b.es_ejemplo && <Ejemplo p={b} />}</span>
            <b>{b.oferta}</b>
            <span className="al-n">{b.nombre}{b.zona ? ` · ${b.zona}` : ''}</span>
          </button>
        ))}
      </div>
      <button type="button" className="sumate" onClick={() => setProponer(true)}>
        <Icon n="spark" s={18} />
        <span><b>¿Tienes un negocio o conoces uno?</b><small>Propón un descuento para los miembros de Colmena.</small></span>
        <Icon n="right" s={18} />
      </button>

      <Sheet open={!!abierto} onClose={() => setAbierto(null)} label="Detalle del beneficio">
        {abierto && (
          <Detalle b={abierto} onCarnet={() => { setAbierto(null); pedirPerfil('Necesitas un carnet para usar los descuentos de aliados.', () => nav({ t: 'mostrar' })) }} />
        )}
      </Sheet>
      <Sheet open={proponer} onClose={() => setProponer(false)} label="Proponer un beneficio">
        {proponer && <Proponer onListo={() => setProponer(false)} />}
      </Sheet>
    </>
  )
}

function Detalle({ b, onCarnet }) {
  return (
    <div className="ben-det">
      <span className="tag">{b.tipo === 'digital' ? b.categoria : `Aliado · ${b.categoria}`}</span>
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
