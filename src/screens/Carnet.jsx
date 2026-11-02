import { useColmena } from '../lib/store'
import { BADGES } from '../data/contenido'
import { firstName, igUrl, hace } from '../lib/format'
import { manosDadas, completitud, waLink } from '../lib/logic'
import { Icon, Hex, Ejemplo, SubHeader, Empty, Stars, useToast } from '../components/ui'
import { CarnetCard } from './Registro'

export function statsDe(c, id) {
  const p = c.perfil(id)
  const recibidas = c.resenas.filter((r) => r.para_id === id)
  return {
    publicaciones: c.publicaciones.filter((x) => x.autor_id === id).length,
    manos: manosDadas(c, id),
    encuentros: c.asistencias.filter((x) => x.perfil_id === id).length,
    retos: c.participantes.filter((x) => x.perfil_id === id).length,
    resenas: recibidas.length,
    promedio: recibidas.length ? recibidas.reduce((s, r) => s + r.estrellas, 0) / recibidas.length : null,
    completo: !!p && completitud(p).pct === 100
  }
}

export function Insignias({ s }) {
  const ganadas = BADGES.filter((b) => b.ok(s))
  return (
    <>
      <div className="sec-h"><h3>Insignias</h3><span className="meta">{ganadas.length} de {BADGES.length}</span></div>
      <div className="prog"><i style={{ width: Math.round(ganadas.length / BADGES.length * 100) + '%' }} /></div>
      <div className="badges">
        {BADGES.map((b) => {
          const on = b.ok(s)
          return (
            <div key={b.n} className={'badge ' + (on ? 'on' : 'off')}>
              <div className="h"><Icon n={on ? b.k : 'lock'} s={20} w={on ? 2 : 1.6} /></div>
              <small>{b.n}</small>
            </div>
          )
        })}
      </div>
    </>
  )
}

export function Voces({ id, nav }) {
  const c = useColmena()
  const lista = c.resenas.filter((r) => r.para_id === id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  if (!lista.length) return null
  return (
    <>
      <div className="sec-h"><h3>Voces de la colmena</h3><span className="meta">{lista.length}</span></div>
      <div className="cards">
        {lista.map((r) => {
          const de = c.perfil(r.de_id)
          return (
            <div key={r.id} className="voz">
              <Stars n={r.estrellas} />
              {r.comentario && <p>“{r.comentario}”</p>}
              {r.chips.length > 0 && <div className="post-tags">{r.chips.map((x) => <span key={x} className="tag">{x}</span>)}</div>}
              <button type="button" className="who" onClick={() => de && nav({ t: 'carnet', id: de.id })}>
                <Hex p={de} w={26} fs={10} /><span className="who-t"><b>{de?.nombre || 'Miembro'}<Ejemplo p={de} /></b><span>{hace(r.created_at)}</span></span>
              </button>
            </div>
          )
        })}
      </div>
      <p className="fine">Reseñas verificadas: salen de manos confirmadas y se publican cuando las dos partes califican.</p>
    </>
  )
}

export default function Carnet({ id, onBack, nav, pedirPerfil }) {
  const c = useColmena()
  const toast = useToast()
  const m = c.perfil(id)
  if (!m) return <><SubHeader title="Carnet de miembro" onBack={onBack} /><div className="body"><Empty title="Este miembro ya no está" /></div></>
  if (c.yo && m.id === c.yo.id) return <><SubHeader title="Carnet de miembro" onBack={onBack} /><div className="body"><Empty icon="card" title="Este es tu carnet">Míralo completo en la pestaña Carnet.</Empty></div></>

  const s = statsDe(c, m.id)
  const compartir = async () => {
    const url = `${location.origin}/?carnet=${m.id}`
    try {
      if (navigator.share) await navigator.share({ title: `${m.nombre} en Colmena`, url })
      else { await navigator.clipboard.writeText(url); toast('Enlace copiado') }
    } catch { /* cancelado */ }
  }
  const escribir = () => pedirPerfil(`Saca tu carnet para escribirle a ${firstName(m.nombre)}.`, async () => {
    if (m.es_ejemplo) { toast('Es un perfil de ejemplo: no hay a quién escribirle.'); return }
    try {
      const num = await c.contactar(m.id)
      if (num) location.href = waLink(num, `Hola ${firstName(m.nombre)}, te vi en Colmena.`)
      else if (m.instagram) location.href = igUrl(m.instagram)
      else toast(`${firstName(m.nombre)} aún no agregó su WhatsApp.`)
    } catch (e) { toast(e.message, true) }
  })

  return (
    <>
      <SubHeader title="Carnet de miembro" onBack={onBack}
        right={<button type="button" className="iconbtn" onClick={compartir} aria-label="Compartir carnet"><Icon n="share" s={20} /></button>} />
      <div className="body fade with-sticky">
        <CarnetCard p={m} numero={m.carnet} />
        <div className="stats">
          <div><b>{s.manos}</b><span>Manos dadas</span></div>
          <div><b>{s.publicaciones}</b><span>{s.publicaciones === 1 ? 'Publicación' : 'Publicaciones'}</span></div>
          <div><b>{s.promedio ? s.promedio.toFixed(1) : '—'}</b><span>{s.resenas ? `${s.resenas} ${s.resenas === 1 ? 'reseña' : 'reseñas'}` : 'Sin reseñas'}</span></div>
        </div>
        {m.es_ejemplo && <p className="nota">Este es un perfil de ejemplo para mostrar cómo funciona la colmena. No corresponde a una persona real.</p>}

        {(m.habilidades.length > 0 || m.categorias.length > 0) && (
          <>
            <div className="sec-h"><h3>Lo que comparte</h3></div>
            <div className="post-tags">{[...m.categorias, ...m.habilidades].map((x) => <span key={x} className="tag">{x}</span>)}</div>
          </>
        )}
        {s.manos === 0 && s.resenas === 0 && !m.es_ejemplo && (
          <div className="nuevo"><Icon n="spark" s={18} /><p><b>{firstName(m.nombre)} es nuevo en la colmena.</b> Sé su primera mano.</p></div>
        )}

        <Insignias s={s} />
        <Voces id={m.id} nav={nav} />

        <div className="contact-card">
          <Icon n="wa" s={22} />
          <div>
            <span className="k">WhatsApp</span>
            {m.es_ejemplo
              ? <b>Perfil de ejemplo</b>
              : c.yo
                ? <b>{m.tiene_whatsapp ? 'Disponible para miembros' : 'Aún no lo agrega'}</b>
                : <b className="mono"><Icon n="lock" s={14} /> +57 3•• ••• ••••</b>}
            <span>{m.es_ejemplo
              ? 'Con un miembro real, este botón abre WhatsApp con un mensaje listo. Solo lo ven quienes tienen carnet.'
              : c.yo ? `Toca escribir y te lleva al chat con ${firstName(m.nombre)}.` : 'Saca tu carnet para ver su número y escribirle.'}</span>
          </div>
        </div>
      </div>
      <div className="sticky">
        <button type="button" className="btn primary full big" onClick={escribir}>
          <Icon n={c.yo ? 'wa' : 'lock'} s={18} />{c.yo ? `Escribirle a ${firstName(m.nombre)}` : `Saca tu carnet y escríbele a ${firstName(m.nombre)}`}
        </button>
      </div>
    </>
  )
}

