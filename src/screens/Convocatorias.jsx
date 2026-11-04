import { useState } from 'react'
import { useColmena } from '../lib/store'
import { cierraEn } from '../lib/logic'
import { Icon, Sheet, useToast } from '../components/ui'

// Ferias, eventos y convocatorias reales en Cali (tabla convocatorias, revisada cada mes).
// Se oculta lo que ya cerró o ya pasó.
const TIPO = { convocatoria: 'Convocatoria', evento: 'Evento', feria: 'Feria' }
const ICONO = { convocatoria: 'note', evento: 'cal', feria: 'bag' }
const dia = (f) => new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', timeZone: 'America/Bogota' }).replace('.', '')
const diaLargo = (f) => new Date(f + (f.length === 10 ? 'T12:00:00-05:00' : '')).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'America/Bogota' })
const finDe = (x) => x.cierre ? new Date(x.cierre).getTime() : x.fecha ? new Date(x.fecha + 'T23:59:59-05:00').getTime() : Infinity

export function vigentes(lista, ahora = Date.now()) {
  return lista.filter((x) => finDe(x) > ahora).sort((a, b) => (finDe(a) - finDe(b)) || (a.orden - b.orden))
}

function cuando(x) {
  if (x.cierre) return { v: dia(x.cierre), t: 'Cierra el' }
  if (x.fecha) return { v: dia(x.fecha + 'T12:00:00-05:00'), t: 'Es el' }
  return { v: 'Por anunciar', t: 'Próxima fecha' }
}

export default function Convocatorias() {
  const c = useColmena()
  const [abierta, setAbierta] = useState(null)
  const [proponer, setProponer] = useState(false)
  const lista = vigentes(c.convocatorias)
  return (
    <section className="conv" aria-label="Ferias y convocatorias">
      <div className="sec-h"><h3>Ferias y convocatorias</h3><span className="meta">{lista.length} en Cali</span></div>
      <p className="soft">Lugares para vender, mostrar tu trabajo o conseguir un proyecto. Revisamos cada uno en su fuente.</p>
      {lista.length === 0 ? (
        <p className="nota">No hay ferias ni convocatorias abiertas por ahora. Revisamos la lista cada mes.</p>
      ) : (
        <div className="conv-pista">
          {lista.map((x, i) => {
            const w = cuando(x)
            const pronto = x.cierre && new Date(x.cierre).getTime() - Date.now() < 7 * 86400000
            return (
              <button key={x.id} type="button" className={'conv-card' + (i === 0 ? ' ink' : '')} onClick={() => setAbierta(x)}>
                <span className="conv-top"><span className="conv-tipo"><Icon n={ICONO[x.tipo]} s={14} />{TIPO[x.tipo]}</span>{pronto && <span className="cd">{cierraEn(x.cierre)}</span>}</span>
                <span className="conv-cuando"><small>{w.t}</small><b>{w.v}</b></span>
                <span className="conv-b">
                  <b>{x.nombre}</b>
                  <span>{x.organizador}</span>
                  {(x.pago || x.costo) && <em>{x.pago || x.costo}</em>}
                </span>
              </button>
            )
          })}
        </div>
      )}
      <button type="button" className="linkbtn" onClick={() => setProponer(true)}>¿Sabes de una feria o convocatoria? Cuéntanos</button>
      <Sheet open={!!abierta} onClose={() => setAbierta(null)} label="Detalle de la convocatoria">
        {abierta && <Detalle x={abierta} />}
      </Sheet>
      <Sheet open={proponer} onClose={() => setProponer(false)} label="Contarnos de una feria o convocatoria">
        {proponer && <Proponer onListo={() => setProponer(false)} />}
      </Sheet>
    </section>
  )
}

function Detalle({ x }) {
  return (
    <div className="ben-det">
      <div className="ben-det-top"><span className="tag">{TIPO[x.tipo]}</span>{x.costo && <span className="tag">{x.costo}</span>}</div>
      <h2>{x.nombre}</h2>
      <p className="ben-oferta">{x.resumen}</p>
      <ul className="conv-datos">
        {x.cierre && <li><Icon n="hour" s={16} /><span><b>Cierra:</b> {diaLargo(x.cierre)}, 11:59 p.m.</span></li>}
        {x.fecha && <li><Icon n="cal" s={16} /><span><b>Fecha:</b> {diaLargo(x.fecha)}{x.hora_texto ? ` · ${x.hora_texto}` : ''}</span></li>}
        {!x.cierre && !x.fecha && <li><Icon n="cal" s={16} /><span>La próxima fecha todavía no está publicada.</span></li>}
        {x.lugar && <li><Icon n="pin" s={16} /><span>{x.lugar}</span></li>}
        {x.pago && <li><Icon n="cash" s={16} /><span><b>Presupuesto:</b> {x.pago}</span></li>}
        <li><Icon n="users" s={16} /><span>{x.organizador}</span></li>
      </ul>
      {x.detalle && <p>{x.detalle}</p>}
      {x.como.length > 0 && (
        <>
          <h3>Cómo participar</h3>
          <ol className="ben-pasos">{x.como.map((p, i) => <li key={i}><i>{i + 1}</i><span>{p}</span></li>)}</ol>
        </>
      )}
      {x.requisito && <p className="soft"><b>Requisitos:</b> {x.requisito}</p>}
      {x.link && <a className="btn primary full big" href={x.link} target="_blank" rel="noopener noreferrer">Ir a la página oficial <Icon n="ext" s={16} /></a>}
      <p className="fine center">Revisado el {diaLargo(x.verificado_en)}. Las condiciones las pone cada organizador.{x.fuente && <> <a href={x.fuente} target="_blank" rel="noopener noreferrer">Ver fuente</a></>}</p>
    </div>
  )
}

// Usa el mismo buzón que las propuestas de beneficios (solicitudes_beneficio), marcado como convocatoria
function Proponer({ onListo }) {
  const c = useColmena()
  const toast = useToast()
  const [f, setF] = useState({ nombre: '', link: '', contacto: '' })
  const [enviando, setEnviando] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const ok = f.nombre.trim().length >= 3 && f.link.trim().length >= 5
  const enviar = async (e) => {
    e.preventDefault(); if (!ok) return
    setEnviando(true)
    try {
      await c.proponerBeneficio(`[Convocatoria] ${f.nombre.trim()}`, f.contacto.trim() || 'Sin contacto', `Link o fuente: ${f.link.trim()}`)
      toast('Recibido. Lo revisamos antes de publicarlo.'); onListo()
    } catch (x) { toast(x.message, true) } finally { setEnviando(false) }
  }
  return (
    <form className="ben-det" onSubmit={enviar}>
      <h2>Cuéntanos de una feria o convocatoria</h2>
      <p className="soft">Revisamos la fuente antes de publicarla.</p>
      <div className="field"><label htmlFor="pc-n">¿Cuál es? *</label><div className="inp"><input id="pc-n" maxLength={80} value={f.nombre} onChange={set('nombre')} placeholder="Ej: Feria navideña del barrio Granada" /></div></div>
      <div className="field"><label htmlFor="pc-l">Link o dónde la viste *</label><div className="inp"><input id="pc-l" maxLength={200} value={f.link} onChange={set('link')} placeholder="https://" /></div></div>
      <div className="field"><label htmlFor="pc-c">Tu contacto <small>(opcional)</small></label><div className="inp"><input id="pc-c" maxLength={80} value={f.contacto} onChange={set('contacto')} placeholder="WhatsApp o Instagram" /></div></div>
      <button type="submit" className="btn primary full big" disabled={!ok || enviando}>{enviando ? 'Enviando…' : 'Enviar'}</button>
    </form>
  )
}
