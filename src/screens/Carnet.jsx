import { useColmena } from '../lib/store'
import { BADGES } from '../data/contenido'
import { firstName, igUrl, hace, mesDesde } from '../lib/format'
import { manosDadas, completitud, waLink, activa } from '../lib/logic'
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
      <div className="sec-h"><h3>Reseñas</h3><span className="meta">{lista.length}</span></div>
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
      <p className="fine">Solo pueden dejar reseña las personas que trabajaron juntas. Se publican cuando ambas califican.</p>
    </>
  )
}

const INTERCAMBIO = {
  dinero: { t: 'Cobra en dinero', d: 'Trabaja por un precio acordado.' },
  trueque: { t: 'Prefiere intercambio', d: 'Cambia su trabajo por el de otro miembro.' },
  ambos: { t: 'Dinero o intercambio', d: 'Acepta las dos formas, según el proyecto.' }
}
const hostDe = (url) => { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url } }

export default function Carnet({ id, onBack, nav, pedirPerfil }) {
  const c = useColmena()
  const toast = useToast()
  const m = c.perfil(id)
  if (!m) return <><SubHeader title="Carnet de miembro" onBack={onBack} /><div className="body"><Empty title="Este miembro ya no está" /></div></>
  const propio = c.yo && m.id === c.yo.id

  const s = statsDe(c, m.id)
  const activasDe = c.publicaciones.filter((p) => p.autor_id === m.id && activa(p))
  const compartir = async () => {
    const url = `${location.origin}/?carnet=${m.id}`
    try {
      if (navigator.share) await navigator.share({ title: `${m.nombre} en Colmena`, url })
      else { await navigator.clipboard.writeText(url); toast('Enlace copiado') }
    } catch { /* cancelado */ }
  }
  const escribir = () => pedirPerfil(`Necesitas un carnet para escribirle a ${firstName(m.nombre)}.`, async () => {
    if (m.es_ejemplo) { toast('Este perfil es de ejemplo, así que no hay a quién escribirle.'); return }
    try {
      const num = await c.contactar(m.id)
      if (num) location.href = waLink(num, `Hola ${firstName(m.nombre)}, te vi en Colmena.`)
      else if (m.instagram) location.href = igUrl(m.instagram)
      else toast(`${firstName(m.nombre)} todavía no agregó su WhatsApp.`)
    } catch (e) { toast(e.message, true) }
  })
  const inter = INTERCAMBIO[m.intercambio]

  return (
    <>
      <SubHeader title={propio ? 'Así ven tu carnet' : 'Carnet de miembro'} onBack={onBack}
        right={<button type="button" className="iconbtn" onClick={compartir} aria-label="Compartir carnet"><Icon n="share" s={20} /></button>} />
      <div className={'body fade' + (propio ? '' : ' with-sticky')}>
        {propio && (
          <div className="vista-propia">
            <p>Esta es la vista que tienen otros miembros de tu carnet.</p>
            <button type="button" className="btn ink sm" onClick={() => nav({ t: 'editar' })}><Icon n="edit" s={15} />Editar</button>
          </div>
        )}
        <CarnetCard p={m} numero={m.carnet} />

        <div className="perfil-meta">
          <span className={'disp ' + (m.disponible ? 'on' : 'off')}><i />{m.disponible ? 'Disponible para proyectos' : 'Sin cupo por ahora'}</span>
          <span className="desde">Miembro desde {mesDesde(m.created_at)}</span>
        </div>

        <div className="stats">
          <div><b>{s.manos}</b><span>{s.manos === 1 ? 'Ayuda dada' : 'Ayudas dadas'}</span></div>
          <div><b className="rating">{s.promedio ? <><Icon n="star" s={18} w={2} />{s.promedio.toFixed(1)}</> : '—'}</b><span>{s.resenas ? `${s.resenas} ${s.resenas === 1 ? 'reseña' : 'reseñas'}` : 'Sin reseñas'}</span></div>
          <div><b>{activasDe.length}</b><span>{activasDe.length === 1 ? 'Publicación activa' : 'Publicaciones activas'}</span></div>
        </div>
        {m.es_ejemplo && <p className="nota">Este es un perfil de ejemplo para mostrar cómo funciona Colmena. No es una persona real.</p>}

        {(m.bio || propio) && (
          <section className="perfil-sec">
            <h3>{propio ? 'Sobre ti' : `Sobre ${firstName(m.nombre)}`}</h3>
            {m.bio ? <p className="bio">{m.bio}</p> : <p className="soft">Cuenta en dos líneas qué haces y para quién. Lo agregas en Editar.</p>}
          </section>
        )}

        {(m.habilidades.length > 0 || m.categorias.length > 0) && (
          <section className="perfil-sec">
            <h3>Lo que ofrece</h3>
            {m.habilidades.length > 0 && <div className="post-tags">{m.habilidades.map((x) => <span key={x} className="tag strong">{x}</span>)}</div>}
            {m.categorias.length > 0 && <p className="cats-line">Categorías: {m.categorias.join(' · ')}</p>}
          </section>
        )}

        {inter && (
          <section className="perfil-sec">
            <h3>Cómo trabaja</h3>
            <div className="inter" role="list">
              {Object.keys(INTERCAMBIO).map((k) => (
                <span key={k} role="listitem" className={k === m.intercambio ? 'on' : ''}>{k === 'dinero' ? 'Dinero' : k === 'trueque' ? 'Intercambio' : 'Ambos'}</span>
              ))}
            </div>
            <p className="soft"><b>{inter.t}.</b> {inter.d}</p>
          </section>
        )}

        {(m.portafolio || m.instagram || m.es_ejemplo) && (
          <section className="perfil-sec">
            <h3>Portafolio</h3>
            {m.portafolio && (
              <a className="link-card" href={m.portafolio} target="_blank" rel="noopener noreferrer">
                <span className="lc-ic"><Icon n="link" s={18} /></span>
                <span className="lc-t"><b>Ver portafolio</b><small>{hostDe(m.portafolio)}</small></span>
                <Icon n="ext" s={16} />
              </a>
            )}
            {m.instagram && (
              <a className="link-card" href={igUrl(m.instagram)} target="_blank" rel="noopener noreferrer">
                <span className="lc-ic"><Icon n="ig" s={18} /></span>
                <span className="lc-t"><b>@{m.instagram}</b><small>Instagram</small></span>
                <Icon n="ext" s={16} />
              </a>
            )}
            {m.es_ejemplo && !m.portafolio && !m.instagram && (
              <p className="soft">En un perfil real, aquí aparecen sus links de Behance, Instagram o Google Drive.</p>
            )}
          </section>
        )}

        {activasDe.length > 0 && (
          <section className="perfil-sec">
            <h3>Publicaciones activas</h3>
            <div className="cards">
              {activasDe.map((p) => (
                <div key={p.id} className="mini-post">
                  <span className={'pill ' + p.tipo}>{p.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
                  <p>{p.texto}</p>
                  <small>{hace(p.created_at)}{p.categorias.length ? ` · ${p.categorias.join(', ')}` : ''}</small>
                </div>
              ))}
            </div>
          </section>
        )}

        {s.manos === 0 && s.resenas === 0 && !m.es_ejemplo && !propio && (
          <div className="nuevo"><Icon n="spark" s={18} /><p><b>{firstName(m.nombre)} es nuevo en Colmena.</b></p></div>
        )}

        <Insignias s={s} />
        <Voces id={m.id} nav={nav} />

        {!propio && (
          <div className="contact-card">
            <Icon n="wa" s={22} />
            <div>
              <span className="k">WhatsApp</span>
              {m.es_ejemplo
                ? <b>Perfil de ejemplo</b>
                : c.yo
                  ? <b>{m.tiene_whatsapp ? 'Disponible para miembros' : 'No lo ha agregado'}</b>
                  : <b className="mono"><Icon n="lock" s={14} /> +57 3•• ••• ••••</b>}
              <span>{m.es_ejemplo
                ? 'Con un miembro real, este botón abre WhatsApp con un mensaje listo. El número solo lo ven otros miembros.'
                : c.yo ? 'Al tocar Escribir se abre el chat de WhatsApp.' : 'Crea tu carnet para ver su número.'}</span>
            </div>
          </div>
        )}
      </div>
      {!propio && (
        <div className="sticky">
          <button type="button" className="btn primary full big" onClick={escribir}>
            <Icon n={c.yo ? 'wa' : 'lock'} s={18} />{c.yo ? `Escribirle a ${firstName(m.nombre)}` : 'Crear carnet para escribirle'}
          </button>
        </div>
      )}
    </>
  )
}
