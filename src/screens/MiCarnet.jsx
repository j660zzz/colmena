import { useColmena } from '../lib/store'
import { carnetId, firstName, hace, mesDesde } from '../lib/format'
import { completitud, inicioSemana, panalSemana, activa } from '../lib/logic'
import { Icon, Hex, Ejemplo, Header, Titulo, useToast } from '../components/ui'
import { CarnetCard } from './Registro'
import { NivelCard } from '../components/Nivel'
import { statsDe, Insignias, Voces } from './Carnet'

export default function MiCarnet({ nav, pedirPerfil, headerRight }) {
  const c = useColmena()
  const toast = useToast()
  const yo = c.yo

  if (!yo) {
    return (
      <>
        <Header right={headerRight} />
        <div className="body">
          <Titulo title="Mi carnet" />
          <div className="carnet-preview">
            <CarnetCard p={{}} nota="Vista previa" estado="Por crear" />
          </div>
          <div className="preview-t">
            <b>Así se verá tu carnet.</b>
            <p>Es tu tarjeta de presentación en Colmena. Sin correo ni contraseña.</p>
          </div>
          <ul className="para-que">
            <li><i><Icon n="users" s={16} /></i><span><b>Te encuentran por lo que sabes</b>Apareces en Miembros con tus habilidades.</span></li>
            <li><i><Icon n="wa" s={16} /></i><span><b>Te escriben directo</b>Quien necesita lo que haces te escribe por WhatsApp.</span></li>
            <li><i><Icon n="seal" s={16} /></i><span><b>Usas los descuentos</b>Lo muestras en los negocios aliados de Cali.</span></li>
          </ul>
          <button type="button" className="btn primary full big" onClick={() => pedirPerfil(null, () => {})}>Crear mi carnet</button>
          <p className="fine center">Toma menos de un minuto.</p>
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

  const compartir = async () => {
    const url = `${location.origin}/?carnet=${yo.id}`
    const data = { title: `${yo.nombre} en Colmena`, text: `Este es mi carnet en Colmena, la red de emprendedores de DCV · ${carnetId(yo.carnet)}`, url }
    try {
      if (navigator.share) await navigator.share(data)
      else { await navigator.clipboard.writeText(`${data.text} ${url}`); toast('Enlace copiado') }
    } catch { /* cancelado */ }
  }
  const resolver = async (postId, perfilId, estado) => {
    try {
      await c.confirmarMano(postId, perfilId, estado)
      if (estado === 'confirmada') toast('Ayuda confirmada. Se sumó una celda al panal.')
      else if (estado === 'no') toast('Listo, quedó registrado')
    } catch (e) { toast(e.message, true) }
  }

  return (
    <>
      <Header right={headerRight} />
      <div className="body fade">
        <Titulo title="Mi carnet" sub={`Miembro desde ${mesDesde(yo.created_at)}`} />
        <CarnetCard p={yo} numero={yo.carnet} />
        <div className="duo">
          <button type="button" className="btn ink" onClick={compartir}><Icon n="share" s={17} />Compartir mi carnet</button>
          <button type="button" className="btn ghost" onClick={() => nav({ t: 'editar' })}><Icon n="edit" s={17} />Editar</button>
        </div>
        <button type="button" className="linkbtn center-self" onClick={() => nav({ t: 'carnet', id: yo.id })}>Ver mi carnet como lo ven otros →</button>

        <NivelCard id={yo.id} />

        {confirmar.map((x) => {
          const post = c.publicaciones.find((p) => p.id === x.publicacion_id)
          const quien = c.perfil(x.perfil_id)
          if (!post || !quien) return null
          return (
            <section key={x.publicacion_id + x.perfil_id} className="ink-card">
              <span className="k">¿Se concretó la ayuda?</span>
              <div className="who"><Hex p={quien} w={36} fs={13} /><p><b>{quien.nombre}</b> te escribió por tu publicación de {post.categorias[0] || 'el muro'} {hace(x.created_at)}.</p></div>
              <div className="ask-btns">
                <button type="button" className="btn primary sm" onClick={() => resolver(post.id, quien.id, 'confirmada')}>Sí</button>
                <button type="button" className="btn outline-w sm" onClick={() => toast('Te volvemos a preguntar más adelante')}>Todavía</button>
                <button type="button" className="linkbtn light" onClick={() => resolver(post.id, quien.id, 'no')}>No</button>
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
              <span><b>Califica tu experiencia con {firstName(otro.nombre)}</b>{x.otro_califico ? <small><Icon n="lock" s={12} /> {firstName(otro.nombre)} ya te calificó. Califica para ver su reseña.</small> : <small>Las dos reseñas se publican juntas.</small>}</span>
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
          <div><b>{panal.manos.filter((m) => m.ayuda === yo.id).length}</b><span>Ayudas dadas</span></div>
          <div><b>{misCeldas}</b><span>{misCeldas === 1 ? 'Celda aportada' : 'Celdas aportadas'}</span></div>
        </div>

        <Insignias s={s} propio />
        <Voces id={yo.id} nav={nav} />

        <div className="sec-h"><h3>Mis publicaciones</h3><span className="meta">{(() => { const k = misPosts.filter((p) => activa(p)).length; return `${k} ${k === 1 ? 'activa' : 'activas'}` })()}</span></div>
        {misPosts.length === 0 ? <p className="soft">Todavía no has publicado nada.</p> : (
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
