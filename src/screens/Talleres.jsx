import { useState } from 'react'
import { useColmena } from '../lib/store'
import { firstName } from '../lib/format'
import { Icon, Hex, Ejemplo, Sheet, useToast } from '../components/ui'
import { CobroInsignia } from '../components/Cobro'

// Talleres prácticos dictados entre miembros. Los de muestra (es_ejemplo) se marcan "Ejemplo".
// "Me interesa" ayuda a decidir qué taller programar primero.
const ICONO = { Video: 'spark', 'Web e IA': 'bulb', Foto: 'ig', Redes: 'wall', Ventas: 'trend' }

export default function Talleres({ pedirPerfil }) {
  const c = useColmena()
  const [abierto, setAbierto] = useState(null)
  const [dictar, setDictar] = useState(false)
  if (!c.talleres.length) return null
  return (
    <section className="talleres" aria-label="Talleres">
      <div className="sec-h"><h3>Talleres</h3><button type="button" className="ver" onClick={() => setDictar(true)}>Dicta uno</button></div>
      <p className="soft">Aprende lo que tu emprendimiento necesita, con otros miembros. Toca Me interesa para ayudarnos a elegir qué taller programar.</p>
      <div className="tall-pista">
        {c.talleres.map((t, i) => <TallerCard key={t.id} t={t} i={i} onClick={() => setAbierto(t)} pedirPerfil={pedirPerfil} />)}
      </div>
      <Sheet open={!!abierto} onClose={() => setAbierto(null)} label="Detalle del taller">
        {abierto && <Detalle t={abierto} pedirPerfil={pedirPerfil} />}
      </Sheet>
      <Sheet open={dictar} onClose={() => setDictar(false)} label="Dictar un taller">
        {dictar && <Dictar onListo={() => setDictar(false)} />}
      </Sheet>
    </section>
  )
}

function useInteres(t, pedirPerfil) {
  const c = useColmena()
  const toast = useToast()
  const gente = c.interes.filter((x) => x.taller_id === t.id).map((x) => c.perfil(x.perfil_id)).filter(Boolean)
  const yo = c.yo && gente.some((p) => p.id === c.yo.id)
  const alternar = () => pedirPerfil('Necesitas un carnet para apuntarte a un taller.', async () => {
    try { const on = await c.alternarInteresTaller(t.id); toast(on ? 'Te avisamos cuando tenga fecha.' : 'Quitamos tu interés en este taller.') } catch (e) { toast(e.message, true) }
  })
  return { gente, yo, alternar }
}

function TallerCard({ t, i, onClick, pedirPerfil }) {
  const c = useColmena()
  const { gente, yo, alternar } = useInteres(t, pedirPerfil)
  const dicta = c.perfil(t.dicta_id)
  return (
    <article className={'tall-card' + (i % 3 === 0 ? ' ink' : '')}>
      <button type="button" className="tall-abrir" onClick={onClick}>
        <span className="tall-top">
          <span className="tall-ic"><Icon n={ICONO[t.categoria] || 'bulb'} s={18} /></span>
          <span className="tall-cat">{t.categoria}</span>
          {t.es_ejemplo && <span className="ejemplo">Ejemplo</span>}
        </span>
        <b className="tall-t">{t.titulo}</b>
        <span className="tall-meta">{t.modalidad === 'virtual' ? 'Virtual' : 'Presencial'} · {t.duracion}{t.cuando ? ` · ${t.cuando}` : ''}</span>
        <span className="tall-dicta">{dicta ? <><Hex p={dicta} w={20} fs={8} />Con {firstName(dicta.nombre)}</> : t.dicta_texto || 'Por confirmar'}</span>
      </button>
      <div className="tall-foot">
        {gente.length > 0 && <span className="stack">{gente.slice(0, 3).map((p) => <Hex key={p.id} p={p} w={22} fs={8} />)}</span>}
        <button type="button" className={'accion' + (yo ? ' hecho' : '')} aria-pressed={!!yo} onClick={alternar}>{yo ? <><Icon n="check" s={15} w={2.4} />Te interesa</> : 'Me interesa'}</button>
      </div>
    </article>
  )
}

function Detalle({ t, pedirPerfil }) {
  const c = useColmena()
  const { gente, yo, alternar } = useInteres(t, pedirPerfil)
  const dicta = c.perfil(t.dicta_id)
  const ej = gente.filter((p) => p.es_ejemplo).length
  return (
    <div className="ben-det">
      <div className="ben-det-top"><span className="tag">{t.categoria}</span><span className="tag">{t.modalidad === 'virtual' ? 'Virtual' : 'Presencial'}</span>{t.es_ejemplo && <span className="ejemplo">Ejemplo</span>}</div>
      <h2>{t.titulo}</h2>
      <p className="ben-oferta">{t.resumen}</p>
      <ul className="conv-datos">
        <li><Icon n="clock" s={16} /><span>{t.duracion}{t.cuando ? ` · ${t.cuando}, fecha por confirmar` : ''}</span></li>
        <li><Icon n="users" s={16} /><span>{dicta ? <>Lo dicta <b>{dicta.nombre}</b>{dicta.rol ? `, ${dicta.rol.toLowerCase()}` : ''}</> : t.dicta_texto || 'Por confirmar'}</span></li>
        {t.llevar && <li><Icon n="bag" s={16} /><span><b>Lleva:</b> {t.llevar}</span></li>}
      </ul>
      {t.aprendes.length > 0 && (
        <>
          <h3>Qué vas a aprender</h3>
          <ol className="ben-pasos">{t.aprendes.map((x, i) => <li key={i}><i>{i + 1}</i><span>{x}</span></li>)}</ol>
        </>
      )}
      {dicta?.intercambio && <p className="soft">Cómo trabaja quien lo dicta: <CobroInsignia modo={dicta.intercambio} /></p>}
      {gente.length > 0 && <p className="fine">{gente.length} {gente.length === 1 ? 'persona quiere' : 'personas quieren'} este taller{ej ? ` (${ej} de ejemplo)` : ''}.</p>}
      {t.es_ejemplo && <p className="nota">Es un taller de ejemplo para mostrar cómo funciona. Tu interés sí cuenta para decidir qué talleres programar.</p>}
      <button type="button" className={'btn full big ' + (yo ? 'ghost' : 'primary')} onClick={alternar}>{yo ? <><Icon n="check" s={18} w={2.4} />Te interesa</> : 'Me interesa'}</button>
    </div>
  )
}

// Propuestas de talleres: van al mismo buzón de propuestas, marcadas como taller
function Dictar({ onListo }) {
  const c = useColmena()
  const toast = useToast()
  const [f, setF] = useState({ tema: '', contacto: '' })
  const [enviando, setEnviando] = useState(false)
  const ok = f.tema.trim().length >= 5
  const enviar = async (e) => {
    e.preventDefault(); if (!ok) return
    setEnviando(true)
    try {
      await c.proponerBeneficio(`[Taller] ${f.tema.trim().slice(0, 70)}`, f.contacto.trim() || (c.yo ? `Carnet ${c.yo.carnet}` : 'Sin contacto'), f.tema.trim())
      toast('Recibido. Te escribimos para ponerle fecha.'); onListo()
    } catch (x) { toast(x.message, true) } finally { setEnviando(false) }
  }
  return (
    <form className="ben-det" onSubmit={enviar}>
      <h2>Dicta un taller</h2>
      <p className="soft">Si sabes hacer algo que a otros les sirve, enséñalo en 45 a 90 minutos. Explicar lo que sabes también te sirve a ti.</p>
      <div className="field"><label htmlFor="dt-t">¿Qué enseñarías? *</label><div className="ta"><textarea id="dt-t" maxLength={300} value={f.tema} onChange={(e) => setF({ ...f, tema: e.target.value })} placeholder="Ej: cómo hago el empaque de mis productos con poco presupuesto" /></div></div>
      <div className="field"><label htmlFor="dt-c">Tu WhatsApp o Instagram <small>(opcional)</small></label><div className="inp"><input id="dt-c" maxLength={80} value={f.contacto} onChange={(e) => setF({ ...f, contacto: e.target.value })} /></div></div>
      <button type="submit" className="btn primary full big" disabled={!ok || enviando}>{enviando ? 'Enviando…' : 'Enviar propuesta'}</button>
    </form>
  )
}

// Quiénes van al encuentro y a qué se dedican: a quién vas a conocer
export function QuienesVan({ nav }) {
  const c = useColmena()
  const e = c.encuentro
  if (!e) return null
  const van = c.asistencias.filter((a) => a.encuentro_id === e.id).map((a) => c.perfil(a.perfil_id)).filter(Boolean)
  if (!van.length) return null
  return (
    <section className="van" aria-label="Quiénes van">
      <div className="sec-h"><h3>A quién vas a conocer</h3></div>
      <div className="van-pista">
        {van.map((p) => (
          <button key={p.id} type="button" className="van-card" onClick={() => nav({ t: 'carnet', id: p.id })}>
            <Hex p={p} w={40} h={44} fs={14} />
            <b>{firstName(p.nombre)}<Ejemplo p={p} /></b>
            <span>{p.marca || p.rol || 'Miembro'}</span>
            {(p.habilidades[0] || p.categorias[0]) && <em>{p.habilidades[0] || p.categorias[0]}</em>}
          </button>
        ))}
      </div>
    </section>
  )
}
