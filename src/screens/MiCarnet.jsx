import { useColmena } from '../lib/store'
import { carnetId, firstName, hace, mesDesde } from '../lib/format'
import { completitud, inicioSemana, panalSemana, activa } from '../lib/logic'
import { Icon, Hex, Ejemplo, Header, Empty, useToast } from '../components/ui'
import { CarnetCard } from './Registro'
import { statsDe, Insignias, Voces } from './Carnet'

export default function MiCarnet({ nav, pedirPerfil, headerRight }) {
  const c = useColmena()
  const toast = useToast()
  const yo = c.yo

  if (!yo) {
    return (
      <>
        <Header title="Mi carnet" right={headerRight} />
        <div className="body">
          <Empty icon="card" title="Aún no tienes carnet"
            action={<button type="button" className="btn primary" onClick={() => pedirPerfil(null, () => {})}>Saca tu carnet</button>}>
            Tu carnet es tu identidad en la colmena: quién eres, qué haces y las manos que has dado. Toma menos de un minuto.
          </Empty>
        </div>
      </>
    )
  }

  const s = statsDe(c, yo.id)
  const { pct, faltan } = completitud(yo)
  const desde = inicioSemana().getTime()
  const misPosts = c.publicaciones.filter((p) => p.autor_id === yo.id)
  const pediste = misPosts.filter((p) => new Date(p.created_at).getTime() >= desde).length
  const panal = panalSemana(c)
  const misCeldas = panal.manos.filter((m) => m.ayuda === yo.id).length
  const confirmar = c.pendientes.confirmar
  const calificar = c.pendientes.calificar.filter((x) => !x.yo_califique)
  const faltanCinco = Math.max(0, 5 - s.manos)

  const compartir = async () => {
    const url = `${location.origin}/?carnet=${yo.id}`
    const data = { title: `${yo.nombre} en Colmena`, text: `Mi carnet en Colmena · ${carnetId(yo.carnet)}. Aquí nadie arranca solo.`, url }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(`${data.text} ${url}`); toast('Enlace copiado') }
    } catch { /* cancelado */ }
  }
  const resolver = async (postId, perfilId, estado) => {
    try {
      await c.confirmarMano(postId, perfilId, estado)
      if (estado === 'confirmada') toast('¡Mano confirmada! Sumaste una celda al panal.')
      else if (estado === 'no') toast('Anotado. Gracias por contarnos.')
    } catch (e) { toast(e.message, true) }
  }

  return (
    <>
      <Header title="Mi carnet" sub={`Miembro desde ${mesDesde(yo.created_at)}`} right={headerRight} />
      <div className="body fade">
        <CarnetCard p={yo} numero={yo.carnet} />
        <div className="duo">
          <button type="button" className="btn ink" onClick={compartir}><Icon n="share" s={17} />Compartir mi carnet</button>
          <button type="button" className="btn ghost" onClick={() => nav({ t: 'editar' })}><Icon n="edit" s={17} />Editar</button>
        </div>

        {confirmar.map((x) => {
          const post = c.publicaciones.find((p) => p.id === x.publicacion_id)
          const quien = c.perfil(x.perfil_id)
          if (!post || !quien) return null
          return (
            <section key={x.publicacion_id + x.perfil_id} className="ink-card">
              <span className="k">¿Se dio la mano?</span>
              <div className="who"><Hex p={quien} w={36} fs={13} /><p><b>{quien.nombre}</b> te escribió por tu publicación de {post.categorias[0] || 'el muro'} {hace(x.created_at)}.</p></div>
              <div className="ask-btns">
                <button type="button" className="btn primary sm" onClick={() => resolver(post.id, quien.id, 'confirmada')}>Sí, se dio</button>
                <button type="button" className="btn outline-w sm" onClick={() => toast('Listo, te volvemos a preguntar después.')}>Todavía</button>
                <button type="button" className="linkbtn light" onClick={() => resolver(post.id, quien.id, 'no')}>No se dio</button>
              </div>
            </section>
          )
        })}

        {calificar.map((x) => {
          const otro = c.perfil(x.otro)
          if (!otro) return null
          return (
            <button key={x.publicacion_id + x.otro} type="button" className="rate-card" onClick={() => nav({ t: 'calificar', postId: x.publicacion_id, otro: x.otro })}>
              <Hex p={otro} w={36} fs={13} />
              <span><b>Califica la mano con {firstName(otro.nombre)}</b>{x.otro_califico ? <small><Icon n="lock" s={12} /> {firstName(otro.nombre)} ya te calificó. Califícalo para verlo.</small> : <small>Las dos reseñas se publican juntas.</small>}</span>
              <Icon n="right" s={18} />
            </button>
          )
        })}

        {pct < 100 && (
          <section className="card">
            <div className="sec-row"><span className="k">Tu carnet está al {pct}%</span><span className="fine"><Icon n="lock" s={12} /> Solo lo ves tú</span></div>
            <div className="prog"><i style={{ width: pct + '%' }} /></div>
            <ul className="todo">
              {faltan.slice(0, 3).map((f) => (
                <li key={f.t}><button type="button" onClick={() => nav({ t: 'editar' })}><Icon n="plus" s={15} w={2.2} />{f.t}<small>+{f.v}%</small></button></li>
              ))}
            </ul>
          </section>
        )}

        <div className="sec-h"><h3>Tu semana</h3></div>
        <div className="stats">
          <div><b>{pediste}</b><span>Publicaste</span></div>
          <div><b>{panal.manos.filter((m) => m.ayuda === yo.id).length}</b><span>Manos dadas</span></div>
          <div><b>{misCeldas}</b><span>{misCeldas === 1 ? 'Celda tuya' : 'Celdas tuyas'} en el panal</span></div>
        </div>

        {faltanCinco > 0 && (
          <section className="card next-badge">
            <span className="nb-hex"><Icon n="users" s={22} w={2} /></span>
            <div>
              <span className="k">Próxima insignia</span>
              <b>Cinco manos dadas</b>
              <div className="dots">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < s.manos ? 'on' : ''} />)}</div>
              <small>Te {faltanCinco === 1 ? 'falta 1 mano' : `faltan ${faltanCinco} manos`} para ganarla</small>
            </div>
          </section>
        )}

        <Insignias s={s} />
        <Voces id={yo.id} nav={nav} />

        <div className="sec-h"><h3>Mis publicaciones</h3><span className="meta">{misPosts.filter((p) => activa(p)).length} activas</span></div>
        {misPosts.length === 0 ? <p className="soft">Todavía no has publicado. Pide una mano o comparte lo que sabes desde el muro.</p> : (
          <div className="cards">
            {misPosts.map((p) => (
              <button key={p.id} type="button" className="row-card link" onClick={() => nav({ t: 'publicado', postId: p.id })}>
                <span className={'pill ' + p.tipo}>{p.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
                <span className="row-text">{p.texto}<small>{activa(p) ? hace(p.created_at) : 'Vencida'} · {c.ayudas.filter((a) => a.publicacion_id === p.id).length} respuestas</small></span>
                <Icon n="right" s={18} />
              </button>
            ))}
          </div>
        )}
        <Ejemplo p={yo} />
      </div>
    </>
  )
}
