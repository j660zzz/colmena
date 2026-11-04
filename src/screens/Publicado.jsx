import { useColmena } from '../lib/store'
import { firstName, hace, initials } from '../lib/format'
import { quienesPueden, panalSemana, waLink, partesDe, PANAL } from '../lib/logic'
import { Icon, Hex, Ejemplo, SubHeader, Empty, Panal, useToast } from '../components/ui'
import { dividirTexto } from './Muro'

// Se abre justo después de publicar y cada vez que el autor revisa su publicación.
export default function Publicado({ postId, onBack, nav, irTab, pedirPerfil }) {
  const c = useColmena()
  const toast = useToast()
  const post = c.publicaciones.find((p) => p.id === postId)
  if (!post && c.datos.publicaciones?.estado === 'error') return <><SubHeader title="Tu publicación" onBack={onBack} /><div className="body"><h2>Tu publicación se guardó</h2><p>No pudimos actualizar el muro. No necesitas publicarla otra vez.</p><button className="btn ink" onClick={() => c.reintentar(['publicaciones'])}>Reintentar</button></div></>
  if (!post) return <><SubHeader title="Tu publicación" onBack={onBack} /><div className="body"><Empty title="Esta publicación ya no está" /></div></>

  const nueva = Date.now() - new Date(post.created_at).getTime() < 5 * 60000
  const respuestas = c.ayudas.filter((a) => a.publicacion_id === post.id)
  const yaRespondieron = new Set(respuestas.map((a) => a.perfil_id))
  const sugeridos = quienesPueden(c, post.categorias, post.autor_id).filter((m) => !yaRespondieron.has(m.id)).slice(0, 5)
  const { manos } = panalSemana(c)
  const celdas = manos.slice(0, PANAL).map((m) => initials(c.perfil(m.ayuda)?.nombre || ''))
  const [titular] = dividirTexto(post.texto)

  const escribir = (m) => pedirPerfil(null, async () => {
    if (m.es_ejemplo) { toast('Es un perfil de ejemplo: no hay a quién escribirle.'); return }
    try {
      const num = await c.contactar(m.id)
      if (num) location.href = waLink(num, `Hola ${firstName(m.nombre)}, te vi en Colmena. Publiqué esto y creo que sabes del tema: “${titular}”.`)
      else toast(`${firstName(m.nombre)} aún no agregó su WhatsApp.`)
    } catch (e) { toast(e.message, true) }
  })

  const resolver = async (perfilId, estado) => {
    try {
      await c.confirmarMano(post.id, perfilId, estado)
      if (estado === 'confirmada') toast('Ayuda confirmada. Se sumó una celda al panal.')
    } catch (e) { toast(e.message, true) }
  }

  return (
    <>
      <SubHeader title="Tu publicación" onBack={onBack} />
      <div className="body fade">
        {nueva && (
          <div className="success">
            <span className="okhex"><Icon n="check" s={26} w={2.6} /></span>
            <h2>Tu publicación está en el muro</h2>
          </div>
        )}
        <div className="mini-post">
          <span className={'pill ' + post.tipo}>{post.tipo === 'need' ? 'Necesito' : 'Ofrezco'}</span>
          <p>{post.texto}</p>
          <small>{hace(post.created_at)} · {post.categorias.join(', ')}</small>
        </div>

        <div className="sec-h"><h3>Te escribieron</h3><span className="meta">{respuestas.length}</span></div>
        {respuestas.length === 0 ? (
          <p className="soft">Todavía nadie. Cuando alguien toque “{post.tipo === 'need' ? 'Puedo ayudar' : 'Me interesa'}”, aparece aquí y te escribe por WhatsApp.</p>
        ) : (
          <div className="cards">
            {respuestas.map((a) => {
              const m = c.perfil(a.perfil_id)
              const { ayuda } = partesDe(post, a.perfil_id)
              return (
                <div key={a.perfil_id} className="row-card">
                  <button type="button" className="who" onClick={() => nav({ t: 'carnet', id: a.perfil_id })}>
                    <Hex p={m} w={40} h={44} fs={14} />
                    <span className="who-t"><b>{m?.nombre}<Ejemplo p={m} /></b><span>{hace(a.created_at)}</span></span>
                  </button>
                  {a.estado === 'pendiente' ? (
                    <div className="ask">
                      <span>¿Se concretó?</span>
                      <div className="ask-btns">
                        <button type="button" className="btn primary sm" onClick={() => resolver(a.perfil_id, 'confirmada')}>Sí</button>
                        <button type="button" className="btn ghost sm" onClick={() => resolver(a.perfil_id, 'no')}>No</button>
                      </div>
                    </div>
                  ) : a.estado === 'confirmada' ? (
                    <span className="state ok"><Icon n="check" s={15} w={2.4} />{ayuda === c.yo?.id ? 'Ayudaste' : 'Te ayudó'}</span>
                  ) : (
                    <button type="button" className="linkbtn" onClick={() => resolver(a.perfil_id, 'pendiente')}>No se dio · cambiar</button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <div className="sec-h"><h3>Saben de {post.categorias.join(', ') || 'esto'}</h3></div>
        <p className="soft">Mientras tanto, puedes escribirle a alguien que sabe del tema:</p>
        {sugeridos.length === 0 ? (
          <p className="soft">Todavía no hay miembros en esta categoría.</p>
        ) : (
          <div className="cards">
            {sugeridos.map((m) => (
              <div key={m.id} className="row-card">
                <button type="button" className="who" onClick={() => nav({ t: 'carnet', id: m.id })}>
                  <Hex p={m} w={40} h={44} fs={14} />
                  <span className="who-t"><b>{m.nombre}<Ejemplo p={m} /></b><span>{m.habilidades.slice(0, 2).join(' · ') || m.rol || m.categorias.join(' · ')}</span></span>
                </button>
                <span className="row-actions">
                  <button type="button" className="btn ink sm" onClick={() => escribir(m)}><Icon n="wa" s={16} />Escribir</button>
                  {!m.es_ejemplo && <button type="button" className="linkbtn tiny" onClick={() => resolver(m.id, 'confirmada')}>Ya me ayudó</button>}
                </span>
              </div>
            ))}
          </div>
        )}

        <section className="panal-card slim">
          <div className="panal-txt">
            <span className="k">Confirma cuando te ayuden</span>
            <p>Cuando alguien te ayude, márcalo aquí. Cada ayuda confirmada llena una celda del panal.</p>
          </div>
          <Panal celdas={celdas} size={11} />
        </section>

        <button type="button" className="btn primary full big" onClick={() => irTab('muro')}>Volver al muro</button>
      </div>
    </>
  )
}
